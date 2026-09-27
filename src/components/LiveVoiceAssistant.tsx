import React, { useState, useRef, useEffect } from 'react';
import { SupportedLanguage, UserRole } from '../types/platform';
import { Mic, MicOff, Volume2, Radio, PhoneOff, Sparkles, AlertCircle } from 'lucide-react';

interface LiveVoiceAssistantProps {
  activeRole: UserRole;
  scopeBadge: string;
  uiLanguage: SupportedLanguage;
}

function float32ToPcm16Base64(float32Array: Float32Array): string {
  const pcm16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768.0;
  }
  return float32;
}

export const LiveVoiceAssistant: React.FC<LiveVoiceAssistantProps> = ({
  activeRole,
  scopeBadge,
  uiLanguage,
}) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState<boolean>(false);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [modelTranscript, setModelTranscript] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const micMutedRef = useRef<boolean>(false);

  useEffect(() => {
    micMutedRef.current = micMuted;
  }, [micMuted]);

  const stopAllPlayback = () => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // Ignore already stopped source
      }
    }
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsModelSpeaking(false);
  };

  const scheduleAudioChunk = (base64Audio: string) => {
    const outCtx = outputAudioCtxRef.current;
    if (!outCtx) return;

    const float32 = base64Pcm16ToFloat32(base64Audio);
    if (float32.length === 0) return;

    const audioBuffer = outCtx.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);

    const source = outCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outCtx.destination);

    const now = outCtx.currentTime;
    if (nextStartTimeRef.current < now) {
      nextStartTimeRef.current = now;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
    activeSourcesRef.current.push(source);
    setIsModelSpeaking(true);

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0) {
        setIsModelSpeaking(false);
      }
    };
  };

  const cleanupSession = () => {
    stopAllPlayback();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, []);

  const startLiveConversation = async () => {
    cleanupSession();
    setErrorMsg(null);
    setUserTranscript('');
    setModelTranscript('');
    setStatus('connecting');

    try {
      // Output AudioContext at 24kHz for Gemini Live model output
      const outCtx = new AudioContext({ sampleRate: 24000 });
      outputAudioCtxRef.current = outCtx;
      nextStartTimeRef.current = outCtx.currentTime;

      // Input AudioContext at 16kHz for microphone capture
      const inCtx = new AudioContext({ sampleRate: 16000 });
      inputAudioCtxRef.current = inCtx;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live?role=${encodeURIComponent(
        activeRole
      )}&scope=${encodeURIComponent(scopeBadge)}&lang=${encodeURIComponent(uiLanguage)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        const source = inCtx.createMediaStreamSource(stream);
        const processor = inCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(inCtx.destination);

        processor.onaudioprocess = (e) => {
          if (micMutedRef.current) return;
          if (ws.readyState !== WebSocket.OPEN) return;
          const channelData = e.inputBuffer.getChannelData(0);
          const base64 = float32ToPcm16Base64(channelData);
          ws.send(JSON.stringify({ audio: base64 }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.status === 'connected') {
            setStatus('connected');
          }
          if (msg.audio) {
            scheduleAudioChunk(msg.audio);
          }
          if (msg.inputTranscript) {
            setUserTranscript((prev) => `${prev} ${msg.inputTranscript}`.trim());
          }
          if (msg.outputTranscript || msg.modelText) {
            const addition = msg.outputTranscript || msg.modelText || '';
            setModelTranscript((prev) => `${prev} ${addition}`.trim());
          }
          if (msg.interrupted) {
            stopAllPlayback();
          }
          if (msg.error) {
            setErrorMsg(msg.error);
            setStatus('error');
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        setErrorMsg('Live voice WebSocket connection encountered an error.');
        setStatus('error');
      };

      ws.onclose = () => {
        setStatus((prev) => (prev === 'error' ? 'error' : 'idle'));
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Microphone access is required for real-time voice conversations.';
      setErrorMsg(msg);
      setStatus('error');
      cleanupSession();
    }
  };

  const stopLiveConversation = () => {
    cleanupSession();
    setStatus('idle');
  };

  const sendVoicePrompt = (promptText: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setUserTranscript(promptText);
      setModelTranscript('');
      wsRef.current.send(JSON.stringify({ text: promptText }));
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Radio className={`w-4 h-4 ${status === 'connected' ? 'animate-pulse' : ''}`} />
          </span>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Live Voice Policy Conversation</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[10px]">
                gemini-3.8-live
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Real-time two-way audio with Gemini Live API · {activeRole}
            </div>
          </div>
        </div>

        {status === 'connected' ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMicMuted(!micMuted)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer ${
                micMuted
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
              title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {micMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{micMuted ? 'Muted' : 'Mic Live'}</span>
            </button>

            <button
              type="button"
              onClick={stopLiveConversation}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1 cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End Live</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startLiveConversation}
            disabled={status === 'connecting'}
            className="px-3.5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{status === 'connecting' ? 'Connecting Live...' : 'Start Voice Session'}</span>
          </button>
        )}
      </div>

      {status === 'connected' && (
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {isModelSpeaking
                  ? 'Gemini Live is speaking (24kHz PCM)...'
                  : 'Listening for your voice (16kHz PCM)...'}
              </span>
            </span>
            {isModelSpeaking && <Volume2 className="w-4 h-4 text-teal-300 animate-bounce" />}
          </div>

          {/* Quick Voice Briefing Prompts over Live Session */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'Brief me on Pune District healthcare gaps',
              'Summarize top water hotspots in Barmer',
              'What is our highest ROI intervention today?',
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendVoicePrompt(prompt)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {(userTranscript || modelTranscript) && (
            <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1.5 text-[11px] max-h-28 overflow-y-auto">
              {userTranscript && (
                <div className="text-slate-400">
                  <strong className="text-teal-400">You:</strong> {userTranscript}
                </div>
              )}
              {modelTranscript && (
                <div className="text-slate-200">
                  <strong className="text-blue-400">Gemini Live:</strong> {modelTranscript}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-[11px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
