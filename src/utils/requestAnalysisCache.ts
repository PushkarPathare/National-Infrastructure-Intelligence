import { CitizenRequestRecord, GeminiStructuredAnalysis } from '../types/platform';

export interface CachedRequestAnalysisEntry {
  requestId: string;
  contentKey?: string;
  structured: GeminiStructuredAnalysis;
  raw: Record<string, unknown>;
  cachedAt: string;
}

const REQUEST_ID_CACHE_STORAGE_KEY = 'bharat_gemini_request_id_cache_v1';

// Primary in-memory Map keyed by requestId (e.g., "REQ-MH-92831")
const analysisByRequestIdCache = new Map<string, CachedRequestAnalysisEntry>();

// Secondary lookup Map keyed by normalized form content signature to link draft edits to the same cached analysis
const analysisByContentKeyCache = new Map<string, CachedRequestAnalysisEntry>();

// Preserves the most recently submitted citizen request across view navigation
let lastSubmittedRequestCache: CitizenRequestRecord | null = null;

function hydrateCacheFromStorage(): void {
  if (analysisByRequestIdCache.size > 0) return;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = window.sessionStorage.getItem(REQUEST_ID_CACHE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, CachedRequestAnalysisEntry>;
        if (parsed && typeof parsed === 'object') {
          Object.values(parsed).forEach((entry) => {
            if (entry && entry.requestId && entry.structured) {
              analysisByRequestIdCache.set(entry.requestId, entry);
              if (entry.contentKey) {
                analysisByContentKeyCache.set(entry.contentKey, entry);
              }
            }
          });
        }
      }
    }
  } catch {
    // Ignore storage read errors
  }
}

function persistCacheToStorage(): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const serialized: Record<string, CachedRequestAnalysisEntry> = {};
      analysisByRequestIdCache.forEach((value, key) => {
        serialized[key] = value;
      });
      window.sessionStorage.setItem(REQUEST_ID_CACHE_STORAGE_KEY, JSON.stringify(serialized));
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function getCachedAnalysisByRequestId(
  requestId: string | undefined | null
): CachedRequestAnalysisEntry | undefined {
  if (!requestId) return undefined;
  hydrateCacheFromStorage();
  return analysisByRequestIdCache.get(requestId);
}

export function getCachedAnalysisByContentKey(
  contentKey: string | undefined | null
): CachedRequestAnalysisEntry | undefined {
  if (!contentKey) return undefined;
  hydrateCacheFromStorage();
  return analysisByContentKeyCache.get(contentKey);
}

export function setCachedAnalysisByRequestId(
  requestId: string,
  structured: GeminiStructuredAnalysis,
  raw: Record<string, unknown>,
  contentKey?: string
): CachedRequestAnalysisEntry {
  hydrateCacheFromStorage();
  const entry: CachedRequestAnalysisEntry = {
    requestId,
    contentKey,
    structured,
    raw,
    cachedAt: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
  analysisByRequestIdCache.set(requestId, entry);
  if (contentKey) {
    analysisByContentKeyCache.set(contentKey, entry);
  }
  persistCacheToStorage();
  return entry;
}

export function seedInitialRequestsCache(requests: CitizenRequestRecord[]): void {
  hydrateCacheFromStorage();
  requests.forEach((req) => {
    if (!req.id || analysisByRequestIdCache.has(req.id)) return;
    if (req.analyzedByGemini) {
      const structured: GeminiStructuredAnalysis = req.geminiAnalysis || {
        language: req.detectedLanguage,
        originalText: req.citizenText,
        normalizedIssue: req.extractedIssue || req.translatedMeaning,
        category: req.category,
        subcategory: req.subcategory,
        location: `${req.district}, ${req.state}`,
        urgency: req.urgency,
        summary: req.aiSummary || req.translatedMeaning,
        infrastructureType: req.infrastructureType || req.subcategory,
        confidence: req.confidence || '0.92',
        reasoning:
          req.aiReasoning ||
          `Analyzed by Google Gemini and mapped to ${req.category} (${req.infrastructureType || req.subcategory}) in ${req.district}.`,
      };
      analysisByRequestIdCache.set(req.id, {
        requestId: req.id,
        structured,
        raw: { ...structured, analyzedByGemini: true },
        cachedAt: 'Pre-indexed',
      });
    }
  });
}

export function getLastSubmittedRequestCache(): CitizenRequestRecord | null {
  return lastSubmittedRequestCache;
}

export function setLastSubmittedRequestCache(record: CitizenRequestRecord | null): void {
  lastSubmittedRequestCache = record;
}
