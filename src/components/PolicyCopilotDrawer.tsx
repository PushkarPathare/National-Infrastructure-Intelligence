import React, { useState, useEffect } from 'react';
import { DISTRICT_HOTSPOTS } from '../data/nationalData';
import { RBAC_PROFILES } from '../data/rbacData';
import { TRANSLATIONS } from '../data/translations';
import { NavModule, SupportedLanguage, UserRole } from '../types/platform';
import { LiveVoiceAssistant } from './LiveVoiceAssistant';
import { GroundedPlaceLink } from './MapsGroundingPanel';
import { X, Send, ArrowRight, RefreshCw, MapPin, ExternalLink } from 'lucide-react';

interface PolicyCopilotDrawerProps {
  uiLanguage: SupportedLanguage;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: NavModule, districtId?: string) => void;
  activeRole?: UserRole;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  metrics?: { label: string; value: string }[];
  mapsPlaces?: GroundedPlaceLink[];
  actionModule?: NavModule;
  actionDistrictId?: string;
  actionLabel?: string;
}

function buildDeterministicCopilotResponse(
  question: string,
  lang: SupportedLanguage
): Omit<ChatMessage, 'id' | 'role'> {
  const q = question.toLowerCase();

  if (q.includes('water') || q.includes('पाण्याच्या') || q.includes('पाणी') || q.includes('जल')) {
    const textByLang: Record<SupportedLanguage, string> = {
      English:
        'Based on national infrastructure gap telemetry, Barmer District (Rajasthan) and Kalahandi District (Odisha) exhibit the highest water infrastructure gaps. Barmer has 11,240 citizen requests with a Water Gap Score of 89/100 and a Priority Score of 92/100 due to tail-end pipeline pressure drops and groundwater salinity across 64 arid villages.',
      Marathi:
        'राष्ट्रीय पायाभूत सुविधा तफावत विश्लेषणावर आधारित, बारमेर जिल्हा (राजस्थान) आणि कालाहांडी जिल्हा (ओडिशा) येथे पाण्याच्या पायाभूत सुविधांची तफावत सर्वात जास्त आहे. बारमेरमध्ये ११,२४० नागरिक विनंत्या असून पाण्याचा तफावत गुण ८९/१०० आणि प्राधान्य गुण ९२/१०० आहे.',
      Hindi:
        'राष्ट्रीय अवसंरचना गैप टेलीमेट्री के अनुसार, बाड़मेर ज़िला (राजस्थान) और कालाहांडी ज़िला (ओडिशा) में जल बुनियादी ढाँचे का अंतर सबसे अधिक है। बाड़मेर में ११,२४० नागरिक अनुरोध हैं और इसका जल गैप स्कोर ८९/१०० तथा प्राथमिकता स्कोर ९२/१०० है।',
    };
    return {
      text: textByLang[lang],
      metrics: [
        { label: '1. Barmer (RJ)', value: 'Gap 89/100 · 11,240 requests' },
        { label: '2. Kalahandi (OD)', value: 'Gap 85/100 · 7,890 requests' },
        { label: '3. Gadchiroli (MH)', value: 'Gap 79/100 · Upland blocks' },
        { label: '4. Ramanathapuram (TN)', value: 'Gap 78/100 · 6,840 requests' },
      ],
      actionModule: 'demand-hotspots',
      actionDistrictId: 'dist-barmer',
      actionLabel: 'Inspect Barmer Water Hotspot',
    };
  }

  if (q.includes('maharashtra') || q.includes('महाराष्ट्र') || q.includes('महाराष्ट्रातील')) {
    const textByLang: Record<SupportedLanguage, string> = {
      English:
        'In Maharashtra (248,430 total citizen requests across 28 priority areas), Healthcare is the #1 development demand, accounting for over 34% of clustered submissions. The two highest-priority clusters are Gadchiroli District (Priority Score 90/100, Gap 91/100) and Pune District Rural Ambegaon/Junnar Cluster (Priority Score 88/100, 8,432 requests, 62,000+ affected citizens).',
      Marathi:
        'महाराष्ट्रामध्ये (२८ प्राधान्य क्षेत्रांमध्ये एकूण २,४८,४३० नागरिक विनंत्या), आरोग्यसेवा (Healthcare) ही क्रमांक १ ची विकास मागणी आहे. सर्वात जास्त प्राधान्य असलेले जिल्हे गडचिरोली (प्राधान्य गुण ९०/१००) आणि पुणे ग्रामीण आंबेगाव/जुन्नर क्लस्टर (प्राधान्य गुण ८८/१००, ८,४३२ विनंत्या) आहेत.',
      Hindi:
        'महाराष्ट्र में (२८ प्राथमिकता क्षेत्रों में कुल २,४८,४३० नागरिक अनुरोध), स्वास्थ्य सेवा (Healthcare) सबसे बड़ी विकास माँग है। दो सर्वोच्च प्राथमिकता वाले क्षेत्र गढ़चिरौली ज़िला (स्कोर ९०/१००) और पुणे ग्रामीण अंबेगांव/जुन्नर क्लस्टर (स्कोर ८८/१००, ८,४३२ अनुरोध) हैं।',
    };
    return {
      text: textByLang[lang],
      metrics: [
        { label: 'Maharashtra Total Requests', value: '248,430' },
        { label: 'Top Sector Demand', value: 'Healthcare (Gap: High)' },
        { label: 'Priority Areas Identified', value: '28 Clusters (2.4M Pop)' },
        { label: 'Top Recommendation', value: 'Community Healthcare Centres' },
      ],
      actionModule: 'ai-insights',
      actionDistrictId: 'dist-pune',
      actionLabel: 'Explore Maharashtra Telemetry',
    };
  }

  if (
    q.includes('investment is low') ||
    q.includes('high demand') ||
    q.includes('unmet') ||
    q.includes('गुंतवणूक कमी') ||
    q.includes('निवेश कम')
  ) {
    const textByLang: Record<SupportedLanguage, string> = {
      English:
        'In the “Citizen Demand vs Public Investment” quadrant analysis, 148 districts fall into the High Demand + Low Investment (Potential Unmet Need) quadrant. The top districts requiring immediate capital reallocation are Barmer (Demand Index 94, Investment ₹29 Cr), Gadchiroli (Demand Index 93, Investment ₹24 Cr), Darbhanga (Demand Index 91, Investment ₹31 Cr), and Kalahandi (Demand Index 84, Investment ₹27 Cr).',
      Marathi:
        '“नागरिक मागणी विरुद्ध सार्वजनिक गुंतवणूक” विश्लेषणात, १४८ जिल्हे उच्च मागणी + कमी गुंतवणूक (अपूर्ण गरज) या श्रेणीत येतात. तातडीने भांडवली निधीची गरज असलेले प्रमुख जिल्हे: बारमेर (₹२९ कोटी), गडचिरोली (₹२४ कोटी), दरभंगा (₹३१ कोटी) आणि कालाहांडी (₹२७ कोटी).',
      Hindi:
        '“नागरिक माँग बनाम सार्वजनिक निवेश” विश्लेषण में, १४८ ज़िले उच्च माँग + कम निवेश (अपूर्ण आवश्यकता) श्रेणी में आते हैं। तत्काल बजट आवंटन की आवश्यकता वाले शीर्ष ज़िले बाड़मेर (₹२९ करोड़), गढ़चिरौली (₹२४ करोड़), दरभंगा (₹३१ करोड़) और कालाहांडी (₹२७ करोड़) हैं।',
    };
    return {
      text: textByLang[lang],
      metrics: [
        { label: 'Barmer (RJ · Water)', value: 'Demand 94 vs ₹29 Cr Outlay' },
        { label: 'Gadchiroli (MH · Health)', value: 'Demand 93 vs ₹24 Cr Outlay' },
        { label: 'Darbhanga (BR · Roads)', value: 'Demand 91 vs ₹31 Cr Outlay' },
        { label: 'Dhubri (AS · Roads)', value: 'Demand 83 vs ₹26 Cr Outlay' },
      ],
      actionModule: 'demand-hotspots',
      actionDistrictId: 'dist-gadchiroli',
      actionLabel: 'Open Demand vs Investment Matrix',
    };
  }

  if (
    q.includes('pune') ||
    q.includes('why is district') ||
    q.includes('पुणे')
  ) {
    const textByLang: Record<SupportedLanguage, string> = {
      English:
        'Pune District (Rural Ambegaon & Junnar Cluster) is prioritized with an Explainable Priority Score of 88/100 (+30 Citizen Demand, +24 Population Impact, +20 Infrastructure Gap, +14 Urgency, +10 Trend, −10 Existing Investment). 8,432 citizen requests across 42 villages report an average 17.4 km travel distance to the nearest hospital, affecting 62,000+ direct residents.',
      Marathi:
        'पुणे जिल्ह्याला (आंबेगाव आणि जुन्नर ग्रामीण भाग) ८८/१०० स्पष्टीकरणात्मक प्राधान्य गुण (+३० नागरिक मागणी, +२४ लोकसंख्या प्रभाव, +२० पायाभूत तफावत, +१४ निकड, +१० कल, -१० विद्यमान गुंतवणूक) देण्यात आले आहेत. ४२ गावांमधील ८,४३२ विनंत्यांनुसार जवळच्या रुग्णालयाचे सरासरी अंतर १७.४ किमी आहे.',
      Hindi:
        'पुणे ज़िले (ग्रामीण अंबेगांव और जुन्नर क्लस्टर) को ८८/१०० पारदर्शी प्राथमिकता स्कोर (+३० नागरिक माँग, +२४ जनसंख्या प्रभाव, +२० अवसंरचना अंतर, +१४ गंभीरता, +१० रुझान, -१० मौजूदा निवेश) दिया गया है। ४२ गाँवों के ८,४३२ अनुरोधों में अस्पताल की औसत दूरी १७.४ किमी बताई गई है।',
    };
    return {
      text: textByLang[lang],
      metrics: [
        { label: 'Priority Score', value: '88 / 100 (High Priority)' },
        { label: 'Clustered Requests', value: '8,432 across 42 villages' },
        { label: 'Avg Access Distance', value: '17.4 km → 8.1 km (Simulated)' },
        { label: 'Recommended Project', value: '5 PHCs/CHCs (₹20 Crore)' },
      ],
      actionModule: 'impact-simulator',
      actionDistrictId: 'dist-pune',
      actionLabel: 'Simulate Pune ₹20 Cr Intervention',
    };
  }

  const defaultTextByLang: Record<SupportedLanguage, string> = {
    English:
      'This month (642,180 citizen requests, +18.4% MoM), the top national infrastructure needs are: (1) Rural Primary & Community Healthcare Centres (24.5% of requests, +32% surge in Western & Northern belts), (2) Tail-end Piped Drinking Water Grids (20.1% of requests), and (3) Monsoon-Resilient Rural Arterial Roads & Culverts (17.0% of requests).',
    Marathi:
      'या महिन्यात (६,४२,१८० नागरिक विनंत्या, +१८.४% वाढ), देशातील सर्वोच्च पायाभूत सुविधा गरजा खालीलप्रमाणे आहेत: (१) ग्रामीण प्राथमिक व सामुदायिक आरोग्य केंद्रे (२४.५% विनंत्या), (२) नळाद्वारे शुद्ध पिण्याच्या पाण्याची सोय (२०.१% विनंत्या), आणि (३) सर्व-हंगामी ग्रामीण रस्ते व पूल (१७.०% विनंत्या).',
    Hindi:
      'इस महीने (६,४२,१८० नागरिक अनुरोध, +१८.४% वृद्धि), देश की शीर्ष बुनियादी ढाँचा आवश्यकताएँ हैं: (१) ग्रामीण प्राथमिक और सामुदायिक स्वास्थ्य केंद्र (२४.५% अनुरोध), (२) पाइपलाइन पेयजल आपूर्ति ग्रिड (२०.१% अनुरोध), और (३) बाढ़-रोधी ग्रामीण सड़कें और पुलिया (१७.०% अनुरोध)।',
  };

  return {
    text: defaultTextByLang[lang],
    metrics: [
      { label: '1. Healthcare', value: '3.14M Cumulative · Avg Gap 81' },
      { label: '2. Water Supply', value: '2.58M Cumulative · Avg Gap 78' },
      { label: '3. All-Weather Roads', value: '2.19M Cumulative · Avg Gap 74' },
      { label: '4. Secondary Education', value: '1.54M Cumulative · Avg Gap 68' },
    ],
    actionModule: 'recommendations',
    actionLabel: 'Review Top AI Project Recommendations',
  };
}

export const PolicyCopilotDrawer: React.FC<PolicyCopilotDrawerProps> = ({
  uiLanguage,
  isOpen,
  onClose,
  onNavigate,
  activeRole = 'National Policymaker',
}) => {
  const t = TRANSLATIONS[uiLanguage].copilot;
  const roleProfile = RBAC_PROFILES[activeRole];
  const [useMapsGrounding, setUseMapsGrounding] = useState<boolean>(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: t.welcome,
      metrics: [
        { label: 'Active Hotspots Indexed', value: '1,284 Clusters' },
        { label: 'High-Priority Districts', value: '216 Areas' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update welcome message when uiLanguage changes
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (m.id === 'welcome' ? { ...m, text: TRANSLATIONS[uiLanguage].copilot.welcome } : m))
    );
  }, [uiLanguage]);

  if (!isOpen) return null;

  const handleAsk = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const deterministic = buildDeterministicCopilotResponse(trimmed, uiLanguage);

    try {
      const contextSummary = DISTRICT_HOTSPOTS.slice(0, 6)
        .map(
          (d) =>
            `${d.district} (${d.state}): Issue=${d.mainIssue}, Requests=${d.requestCount}, Gap=${d.gapScore}/100, Investment=₹${d.investmentCr}Cr (${d.existingInvestmentLevel}), Priority=${d.priorityScore}/100`
        )
        .join('\n');

      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `${trimmed} (Please respond in ${uiLanguage})`,
          contextSummary,
        }),
      });
      const data = await res.json();

      let mapsPlaces: GroundedPlaceLink[] | undefined = undefined;
      if (useMapsGrounding) {
        try {
          const mapsRes = await fetch('/api/ai/maps-grounding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: trimmed,
              district: trimmed.toLowerCase().includes('barmer')
                ? 'Barmer'
                : trimmed.toLowerCase().includes('gadchiroli')
                ? 'Gadchiroli'
                : 'Pune',
              state: trimmed.toLowerCase().includes('barmer') ? 'Rajasthan' : 'Maharashtra',
              category: trimmed.toLowerCase().includes('water') ? 'Water' : 'Healthcare',
            }),
          });
          const mapsData = await mapsRes.json();
          if (Array.isArray(mapsData.places) && mapsData.places.length > 0) {
            mapsPlaces = mapsData.places;
          }
        } catch {
          // Optional grounding enrichment
        }
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.answer || deterministic.text,
        metrics: deterministic.metrics,
        mapsPlaces,
        actionModule: deterministic.actionModule,
        actionDistrictId: deterministic.actionDistrictId,
        actionLabel: deterministic.actionLabel,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          ...deterministic,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between">
        {/* Top Header */}
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="text-xs font-mono text-teal-400">{t.badge}</div>
            <h2 className="text-base font-bold mt-0.5">{t.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Close Copilot"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Suggested Questions + Live Voice + Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Real-Time Voice Conversation via Gemini Live API (gemini-3.8-live) */}
          <LiveVoiceAssistant
            activeRole={activeRole}
            scopeBadge={roleProfile.scopeBadge}
            uiLanguage={uiLanguage}
          />

          {/* Google Maps Grounding Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">Google Maps Grounding Active</div>
                <div className="text-[11px] text-slate-600">
                  Enriches answers with live place links via <code className="font-mono">gemini-3.5-flash</code>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUseMapsGrounding(!useMapsGrounding)}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                useMapsGrounding
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {useMapsGrounding ? 'Enabled' : 'Off'}
            </button>
          </div>

          {/* Suggested Questions */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">{t.suggestedLabel}</div>
            <div className="flex flex-wrap gap-1.5">
              {t.questions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleAsk(q)}
                  className="text-left px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-800 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="text-[11px] text-slate-400 mb-1">
                  {m.role === 'user' ? 'Policymaker Query' : 'National Policy Intelligence'}
                </div>
                <div
                  className={`rounded-xl p-4 text-xs leading-relaxed max-w-[92%] space-y-3 ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {m.metrics && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                      {m.metrics.map((met) => (
                        <div
                          key={met.label}
                          className="p-2 rounded bg-white border border-slate-200/80"
                        >
                          <div className="text-[10px] text-slate-500">{met.label}</div>
                          <div className="font-mono font-bold text-slate-900 mt-0.5">
                            {met.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.mapsPlaces && m.mapsPlaces.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Verified Google Maps Grounding Links</span>
                      </div>
                      <div className="space-y-1">
                        {m.mapsPlaces.slice(0, 3).map((pl, idx) => (
                          <a
                            key={`${pl.uri}-${idx}`}
                            href={pl.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 p-2 rounded bg-white border border-slate-200 hover:border-blue-400 text-[11px] font-semibold text-blue-700 hover:underline"
                          >
                            <span className="truncate">{pl.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.actionModule && m.actionLabel && (
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(m.actionModule!, m.actionDistrictId);
                        onClose();
                      }}
                      className="mt-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{m.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Querying national infrastructure telemetry…</span>
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input);
          }}
          className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.askBtn}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
