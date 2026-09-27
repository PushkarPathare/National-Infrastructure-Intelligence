import React, { useState, useEffect } from 'react';
import {
  CitizenRequestRecord,
  CollectiveCluster,
  GeminiStructuredAnalysis,
  InfrastructureCategory,
  NavModule,
  SupportedLanguage,
  UserRole,
} from '../types/platform';
import {
  COLLECTIVE_CLUSTERS,
  INFRASTRUCTURE_CATEGORIES,
  STATES_INTELLIGENCE,
  SUPPORTED_LANGUAGES,
} from '../data/nationalData';
import { TRANSLATIONS } from '../data/translations';
import { RBAC_PROFILES } from '../data/rbacData';
import {
  getCachedAnalysisByContentKey,
  getCachedAnalysisByRequestId,
  getLastSubmittedRequestCache,
  seedInitialRequestsCache,
  setCachedAnalysisByRequestId,
  setLastSubmittedRequestCache,
} from '../utils/requestAnalysisCache';
import {
  Send,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  FileText,
  ArrowRight,
  Globe,
  Eye,
  Lock,
  Users,
  ThumbsUp,
  Search,
  Check,
  Paperclip,
  X,
  AlertCircle,
  RotateCcw,
  PlusCircle,
  Save,
  Loader2,
} from 'lucide-react';

export type CitizenSubTab = 'all' | 'submit' | 'my-requests' | 'community' | 'status';

export interface CitizenRequestFormData {
  language: SupportedLanguage;
  state: string;
  district: string;
  category: InfrastructureCategory | '';
  urgency: 'Critical' | 'High' | 'Medium' | 'Low' | '';
  landmark: string;
  text: string;
  villageOrCity: string;
}

export interface CitizenRequestFormErrors {
  state?: string;
  district?: string;
  category?: string;
  urgency?: string;
  landmark?: string;
  text?: string;
}

export type RequiredFieldKey = keyof CitizenRequestFormErrors;

export interface PersistedCitizenDraft {
  draftRequestId?: string;
  formData: CitizenRequestFormData;
  attachedFile: string | null;
  selectedScenarioIdx: number;
  isModifiedDraft: boolean;
  savedAt: string;
}

const CITIZEN_DRAFT_STORAGE_KEY = 'bharat_citizen_request_form_draft_v1';
const MIN_DESCRIPTION_CHARS = 5;
const MAX_DESCRIPTION_CHARS = 500;

const AI_PROCESSING_STEPS = [
  'Receiving request',
  'Gemini analyzing text',
  'Classifying development need',
  'Mapping request',
  'Updating intelligence',
];

function generateRequestIdForState(stateName: string): string {
  const stateCode =
    STATES_INTELLIGENCE.find((s) => s.name === stateName.trim())?.code || 'IN';
  const randomId = Math.floor(10000 + Math.random() * 89999);
  return `REQ-${stateCode}-${randomId}`;
}

let inMemoryDraftCache: PersistedCitizenDraft | null = null;

function loadDraftFromStorage(): PersistedCitizenDraft | null {
  if (inMemoryDraftCache) {
    return inMemoryDraftCache;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(CITIZEN_DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedCitizenDraft;
        if (parsed && parsed.formData && typeof parsed.formData.text === 'string') {
          inMemoryDraftCache = parsed;
          return parsed;
        }
      }
    }
  } catch {
    // Fallback to in-memory cache if localStorage is unavailable
  }
  return null;
}

function saveDraftToStorage(draft: PersistedCitizenDraft): void {
  inMemoryDraftCache = draft;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CITIZEN_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  } catch {
    // Ignore storage quota errors
  }
}

function clearDraftFromStorage(): void {
  inMemoryDraftCache = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(CITIZEN_DRAFT_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

interface CitizenRequestsViewProps {
  uiLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  requests: CitizenRequestRecord[];
  clusters?: CollectiveCluster[];
  onAddRequest: (newReq: CitizenRequestRecord) => void;
  onUpdateRequest?: (updated: CitizenRequestRecord) => void;
  onSelectRequestForAnalysis: (req: CitizenRequestRecord) => void;
  onNavigate: (module: NavModule, districtId?: string) => void;
  activeRole?: UserRole;
  initialCitizenTab?: CitizenSubTab;
}

const POPULAR_DISTRICTS_BY_STATE: Record<string, string[]> = {
  Maharashtra: [
    'Pune District',
    'Gadchiroli District',
    'Nashik District',
    'Nagpur District',
    'Thane District',
    'Satara District',
  ],
  'Uttar Pradesh': [
    'Sitapur District',
    'Lucknow District',
    'Varanasi District',
    'Gorakhpur District',
    'Prayagraj District',
  ],
  Bihar: [
    'Darbhanga District',
    'Patna District',
    'Gaya District',
    'Muzaffarpur District',
    'Purnia District',
  ],
  Rajasthan: [
    'Barmer District',
    'Jaipur District',
    'Jodhpur District',
    'Udaipur District',
    'Bikaner District',
  ],
  'Madhya Pradesh': [
    'Mandla District',
    'Bhopal District',
    'Indore District',
    'Jabalpur District',
    'Rewa District',
  ],
  Odisha: [
    'Koraput District',
    'Khordha District',
    'Cuttack District',
    'Mayurbhanj District',
    'Kalahandi District',
  ],
  Assam: [
    'Dhubri District',
    'Kamrup District',
    'Dibrugarh District',
    'Cachar District',
    'Jorhat District',
  ],
  Jharkhand: [
    'Dumka District',
    'Ranchi District',
    'Dhanbad District',
    'Hazaribagh District',
    'Palamu District',
  ],
  Chhattisgarh: [
    'Bastar District',
    'Raipur District',
    'Bilaspur District',
    'Durg District',
    'Surguja District',
  ],
  Gujarat: [
    'Kutch District',
    'Ahmedabad District',
    'Surat District',
    'Vadodara District',
    'Banaskantha District',
  ],
  Karnataka: [
    'Raichur District',
    'Bengaluru District',
    'Mysuru District',
    'Belagavi District',
    'Kalaburagi District',
  ],
  'Tamil Nadu': [
    'Ramanathapuram District',
    'Chennai District',
    'Madurai District',
    'Coimbatore District',
    'Tirunelveli District',
  ],
  'West Bengal': [
    'Sundarbans District',
    'Kolkata District',
    'Murshidabad District',
    'Bankura District',
    'Purulia District',
  ],
};

const LANDMARK_SUGGESTIONS: Record<SupportedLanguage, string[]> = {
  English: [
    'Near Primary Health Sub-Centre',
    'Near Zilla Parishad High School',
    'Near Gram Panchayat Office',
    'Near State Highway Bus Stand',
  ],
  Marathi: [
    'प्राथमिक आरोग्य उपकेंद्राजवळ',
    'जिल्हा परिषद शाळेजवळ',
    'ग्रामपंचायत कार्यालयाजवळ',
    'मुख्य एसटी बस स्थानकाजवळ',
  ],
  Hindi: [
    'प्राथमिक स्वास्थ्य उपकेंद्र के पास',
    'राजकीय उच्च विद्यालय के पास',
    'ग्राम पंचायत भवन के पास',
    'मुख्य बस स्टैंड चौराहे के पास',
  ],
};

const CATEGORY_ICONS: Record<InfrastructureCategory, string> = {
  Healthcare: '🏥',
  Water: '💧',
  Roads: '🛣️',
  Education: '🏫',
  Electricity: '⚡',
  Sanitation: '🚰',
  'Public Transport': '🚌',
  'Internet Connectivity': '📡',
  Housing: '🏘️',
  Agriculture: '🌾',
  'Waste Management': '♻️',
  Other: '🏗️',
};

const CATEGORY_LABELS: Record<SupportedLanguage, Record<InfrastructureCategory, string>> = {
  English: {
    Healthcare: 'Healthcare (Hospital / PHC)',
    Water: 'Drinking Water Supply',
    Roads: 'Roads & Bridges',
    Education: 'School & Education',
    Electricity: 'Electricity & Power',
    Sanitation: 'Sanitation & Drainage',
    'Public Transport': 'Public Transport / Bus',
    'Internet Connectivity': 'Digital & Mobile Network',
    Housing: 'Rural / Urban Housing',
    Agriculture: 'Irrigation & Agriculture',
    'Waste Management': 'Waste Management',
    Other: 'Other Community Facility',
  },
  Marathi: {
    Healthcare: 'आरोग्य सेवा (रुग्णालय / PHC)',
    Water: 'पिण्याचे पाणी पुरवठा (Water)',
    Roads: 'रस्ते आणि पूल (Roads)',
    Education: 'शाळा आणि शिक्षण (Education)',
    Electricity: 'वीज पुरवठा (Electricity)',
    Sanitation: 'स्वच्छता आणि गटार योजना',
    'Public Transport': 'सार्वजनिक वाहतूक / एसटी बस',
    'Internet Connectivity': 'इंटरनेट आणि मोबाईल नेटवर्क',
    Housing: 'ग्रामीण / शहरी घरकुल योजना',
    Agriculture: 'सिंचन आणि कृषी सुविधा',
    'Waste Management': 'कचरा व्यवस्थापन',
    Other: 'इतर सार्वजनिक सुविधा',
  },
  Hindi: {
    Healthcare: 'स्वास्थ्य सेवा (अस्पताल / PHC)',
    Water: 'पेयजल आपूर्ति (Drinking Water)',
    Roads: 'सड़क और पुलिया (Roads)',
    Education: 'स्कूल और शिक्षा (Education)',
    Electricity: 'बिजली आपूर्ति (Electricity)',
    Sanitation: 'स्वच्छता और जल निकासी',
    'Public Transport': 'सार्वजनिक परिवहन / बस सेवा',
    'Internet Connectivity': 'इंटरनेट और मोबाइल नेटवर्क',
    Housing: 'ग्रामीण / शहरी आवास',
    Agriculture: 'सिंचाई और कृषि सुविधा',
    'Waste Management': 'कचरा प्रबंधन',
    Other: 'अन्य सामुदायिक सुविधा',
  },
};

const STATE_LOCALIZED_LABELS: Record<SupportedLanguage, Record<string, string>> = {
  English: {},
  Marathi: {
    Maharashtra: 'महाराष्ट्र (Maharashtra)',
    'Uttar Pradesh': 'उत्तर प्रदेश (Uttar Pradesh)',
    Bihar: 'बिहार (Bihar)',
    Rajasthan: 'राजस्थान (Rajasthan)',
    'Madhya Pradesh': 'मध्य प्रदेश (Madhya Pradesh)',
    Odisha: 'ओडिशा (Odisha)',
    Assam: 'आसाम (Assam)',
    Jharkhand: 'झारखंड (Jharkhand)',
    Chhattisgarh: 'छत्तीसगड (Chhattisgarh)',
    Gujarat: 'गुजरात (Gujarat)',
    Karnataka: 'कर्नाटक (Karnataka)',
    'Tamil Nadu': 'तामिळनाडू (Tamil Nadu)',
    'West Bengal': 'पश्चिम बंगाल (West Bengal)',
  },
  Hindi: {
    Maharashtra: 'महाराष्ट्र (Maharashtra)',
    'Uttar Pradesh': 'उत्तर प्रदेश (Uttar Pradesh)',
    Bihar: 'बिहार (Bihar)',
    Rajasthan: 'राजस्थान (Rajasthan)',
    'Madhya Pradesh': 'मध्य प्रदेश (Madhya Pradesh)',
    Odisha: 'ओडिशा (Odisha)',
    Assam: 'असम (Assam)',
    Jharkhand: 'झारखंड (Jharkhand)',
    Chhattisgarh: 'छत्तीसगढ़ (Chhattisgarh)',
    Gujarat: 'गुजरात (Gujarat)',
    Karnataka: 'कर्नाटक (Karnataka)',
    'Tamil Nadu': 'तमिलनाडु (Tamil Nadu)',
    'West Bengal': 'पश्चिम बंगाल (West Bengal)',
  },
};

const LOCALIZED_UI = {
  English: {
    tabs: {
      all: 'Submit & Track',
      submit: '+ New Request',
      myRequests: 'My Requests',
      community: 'Community Requests',
      status: '6-Stage Status Tracker',
    },
    citizenHeaderTitle: 'Citizen Request & Community Support Portal',
    citizenHeaderSub:
      'Easily submit a community infrastructure need in your language, support nearby village requests, and track 6-stage resolution.',
    communityHeaderTitle: 'Community Requests & Regional Demand Clusters',
    statusHeaderTitle: '6-Stage Public Request Status Tracker',
    myRequestsHeaderTitle: 'My Submitted Infrastructure Requests',
    activeLangBadge: '3 Languages Supported: English · मराठी · हिन्दी',
    openFormCtaTitle: 'Have a local infrastructure issue in your village or ward?',
    openFormCtaSub:
      'Submit a new community development request in English, Marathi, or Hindi for AI clustering and departmental action.',
    openFormBtn: '+ Open Request Submission Form',
    submitAnotherBtn: '+ Submit Another Request',
    closeFormBtn: 'Close Form',
    step1Title: 'Step 1: Choose Language & Try a Quick Sample',
    step1Hint: 'Select your preferred language or click a sample scenario to auto-fill the form:',
    clearFormBtn: 'Clear Form',
    step2Title: 'Step 2: Location, Category & Landmark Details',
    step3Title: 'Step 3: Urgency & Problem Description',
    statePlaceholder: 'Select your State',
    districtPlaceholder: 'Enter or select your District (e.g. Pune District)',
    categoryPlaceholder: 'Select Infrastructure Category',
    urgencyPlaceholder: 'Select Community Urgency Level',
    villagePlaceholder: 'Enter Village, Ward, or Block (e.g., Ambegaon, Shirur)',
    landmarkPlaceholder: 'Enter nearby Landmark (e.g., Near Primary Health Sub-Centre)',
    quickDistrictLabel: 'Quick select district:',
    quickLandmarkLabel: 'Quick select landmark:',
    urgencyOptions: {
      Critical: 'Critical (Emergency)',
      High: 'High (Urgent Need)',
      Medium: 'Medium (Upgrade)',
      Low: 'Low (Routine)',
    },
    charCountSuffix: 'characters',
    charRemainingSuffix: 'remaining',
    charMinRequired: 'Min 5 characters required',
    charReady: 'Valid description length',
    draftBadgeSaved: 'Draft Auto-Saved Locally',
    draftRestoredTitle: 'Draft Restored — Your unsaved form inputs were preserved',
    draftRestoredSub:
      'Your inputs are automatically saved as a local draft when you navigate away and return before submitting.',
    draftDiscardBtn: 'Discard Draft',
    draftResumeBannerTitle: 'Unsaved Citizen Request Draft Available',
    draftResumeBannerSub: 'Your partial request inputs are saved locally. Resume editing anytime before submitting.',
    draftResumeBtn: 'Resume Draft',
    requiredBadge: 'Required',
    validBadge: 'Ready',
    fieldsCompletedLabel: 'Required fields completed',
    attachBtn: 'Attach Photo / Gram Sabha Note',
    removeBtn: 'Remove',
    validationBannerTitle: 'Please complete the required fields below before submitting:',
    errors: {
      state: 'Please select your State.',
      district: 'Please enter or select your District name (at least 2 characters).',
      category: 'Please select an infrastructure category.',
      urgency: 'Please select the community urgency level.',
      landmark: 'Please enter a nearby landmark or locality reference (at least 2 characters).',
      text: 'Please describe the infrastructure issue in your area (at least 5 characters).',
    },
    liveAiPreviewBadge: 'Instant AI Summary (Auto-Generated)',
    liveAiTargetLabel: 'Department:',
    liveAiClusterLabel: 'Similar nearby reports:',
    successBannerBadge: 'REQUEST SUBMITTED & FORM CLOSED',
    successCitizenTitle: (cat: string) =>
      `Thank you! Your ${cat} request has been registered and added to the list below.`,
    successOriginalLabel: 'Your Submitted Message',
    successNormalizedLabel: 'Public Summary & Departmental Routing',
    successStatusLabel: 'Status',
    successLocationLabel: 'Location',
    successLandmarkLabel: 'Landmark',
    successUrgencyLabel: 'Urgency',
    btnTrack6Stage: 'Track 6-Stage Progress',
    feedTitleMy: 'My Submitted Requests',
    feedTitleCommunity: 'Community Requests in Region',
    feedPrivacyBadgeCitizen: 'Citizen View',
    feedPrivacyBadgeOfficer: 'Officer View',
    feedSubCitizen:
      'Your newly submitted requests appear immediately at the top of this list with live 6-stage tracking.',
    filterAllLanguages: 'All Languages',
    filterAllCategories: 'All Categories',
    filterAllUrgency: 'All Urgency',
    emptyFeedTitle: 'No requests match the selected filters',
    emptyFeedSub: 'Click below to reset filters and view all submitted requests.',
    resetFiltersBtn: 'Show All Requests',
    cardSubmittedLabel: 'Citizen Request',
    cardSummaryLabel: 'Department & AI Summary',
    cardClusterLabel: 'Community Cluster:',
    cardSimilarReports: 'similar reports',
    cardRoutedTo: 'Routed to',
    btnSupport: '+1 Support',
    btnSupported: 'Supported',
    btnReportSimilar: 'Report Similar',
    justNowBadge: 'NEW · Just Submitted',
  },
  Marathi: {
    tabs: {
      all: 'विनंती नोंदवा आणि पहा',
      submit: '+ नवीन विनंती',
      myRequests: 'माझ्या विनंत्या',
      community: 'सामुदायिक विनंत्या',
      status: '६-टप्पे स्थिती ट्रॅकर',
    },
    citizenHeaderTitle: 'नागरिक विकास विनंती आणि सामुदायिक सहभाग पोर्टल',
    citizenHeaderSub:
      'तुमच्या भागातील रस्ते, पाणी, आरोग्य किंवा शाळेची गरज सोप्या भाषेत नोंदवा आणि ६-टप्प्यांत तिची सद्यस्थिती ट्रॅक करा.',
    communityHeaderTitle: 'सामुदायिक विनंत्या आणि प्रादेशिक मागणी गट (Clusters)',
    statusHeaderTitle: '६-टप्पे सार्वजनिक विनंती स्थिती ट्रॅकर',
    myRequestsHeaderTitle: 'मी नोंदवलेल्या विकास विनंत्या',
    activeLangBadge: '३ भाषा समर्थित: मराठी · हिन्दी · English',
    openFormCtaTitle: 'तुमच्या गावात किंवा परिसरात पायाभूत सुविधांची समस्या आहे का?',
    openFormCtaSub:
      'मराठी, हिंदी किंवा इंग्रजी भाषेत नवीन विकास विनंती नोंदवण्यासाठी खालील बटणावर क्लिक करा.',
    openFormBtn: '+ नवीन विनंती फॉर्म उघडा',
    submitAnotherBtn: '+ दुसरी विनंती नोंदवा',
    closeFormBtn: 'फॉर्म बंद करा',
    step1Title: 'टप्पा १: भाषा निवडा किंवा नमुना विनंती वापरा',
    step1Hint: 'तुमची भाषा निवडा किंवा फॉर्म आपोआप भरण्यासाठी खालील नमुन्यावर क्लिक करा:',
    clearFormBtn: 'फॉर्म रिकामा करा',
    step2Title: 'टप्पा २: राज्य, जिल्हा, श्रेणी आणि जवळची खूण',
    step3Title: 'टप्पा ३: निकडीची पातळी आणि समस्येचे वर्णन',
    statePlaceholder: 'तुमचे राज्य निवडा',
    districtPlaceholder: 'जिल्ह्याचे नाव लिहा किंवा निवडा (उदा. Pune District)',
    categoryPlaceholder: 'पायाभूत सुविधा श्रेणी निवडा',
    urgencyPlaceholder: 'निकडीची पातळी निवडा',
    villagePlaceholder: 'गाव, वॉर्ड किंवा तालुका लिहा (उदा. आंबेगाव, शिरूर)',
    landmarkPlaceholder: 'जवळची खूण लिहा (उदा. प्राथमिक आरोग्य उपकेंद्राजवळ)',
    quickDistrictLabel: 'झटपट जिल्हा निवडा:',
    quickLandmarkLabel: 'झटपट जवळची खूण निवडा:',
    urgencyOptions: {
      Critical: 'अति-तातडीचे (Critical)',
      High: 'तातडीचे (High)',
      Medium: 'मध्यम (Medium)',
      Low: 'सामान्य (Low)',
    },
    charCountSuffix: 'अक्षरे',
    charRemainingSuffix: 'शिल्लक',
    charMinRequired: 'किमान ५ अक्षरे आवश्यक',
    charReady: 'योग्य लांबीचे वर्णन',
    draftBadgeSaved: 'ड्राफ्ट स्थानिक पातळीवर सेव्ह केला',
    draftRestoredTitle: 'ड्राफ्ट पुनर्संचयित केला — तुमची अपूर्ण माहिती सुरक्षित ठेवली आहे',
    draftRestoredSub:
      'सबमिट करण्यापूर्वी तुम्ही दुसऱ्या पेजवर जाऊन परत आल्यास तुमचा फॉर्म ड्राफ्ट आपोआप सुरक्षित राहतो.',
    draftDiscardBtn: 'ड्राफ्ट हटवा',
    draftResumeBannerTitle: 'अपूर्ण नागरिक विनंती ड्राफ्ट उपलब्ध आहे',
    draftResumeBannerSub: 'तुमची माहिती स्थानिक ड्राफ्ट म्हणून सेव्ह केली आहे. कधीही पुन्हा सुरू करा.',
    draftResumeBtn: 'ड्राफ्ट सुरू करा',
    requiredBadge: 'आवश्यक',
    validBadge: 'पूर्ण',
    fieldsCompletedLabel: 'आवश्यक रकाने पूर्ण',
    attachBtn: 'ग्रामसभा ठराव / फोटो जोडा',
    removeBtn: 'काढून टाका',
    validationBannerTitle: 'कृपया विनंती सबमिट करण्यापूर्वी खालील आवश्यक माहिती भरा:',
    errors: {
      state: 'कृपया तुमचे राज्य निवडा.',
      district: 'कृपया तुमच्या जिल्ह्याचे नाव लिहा किंवा निवडा (किमान २ अक्षरे).',
      category: 'कृपया पायाभूत सुविधा श्रेणी निवडा.',
      urgency: 'कृपया निकडीची पातळी निवडा.',
      landmark: 'कृपया जवळची खूण (Landmark) लिहा (किमान २ अक्षरे).',
      text: 'कृपया तुमच्या परिसरातील समस्येचे वर्णन लिहा (किमान ५ अक्षरे).',
    },
    liveAiPreviewBadge: 'थेट AI वर्गीकरण पूर्वावलोकन (स्वयंचलित)',
    liveAiTargetLabel: 'संबंधित विभाग:',
    liveAiClusterLabel: 'जवळपासच्या समान तक्रारी:',
    successBannerBadge: 'विनंती यशस्वीरित्या नोंदवली गेली!',
    successCitizenTitle: (cat: string) =>
      `धन्यवाद! तुमची '${cat}' संदर्भातील विनंती नोंदवली गेली असून खालील यादीत समाविष्ट केली आहे.`,
    successOriginalLabel: 'तुम्ही नोंदवलेला संदेश',
    successNormalizedLabel: 'शासकीय विभाग आणि AI सारांश',
    successStatusLabel: 'सद्यस्थिती',
    successLocationLabel: 'ठिकाण',
    successLandmarkLabel: 'जवळची खूण',
    successUrgencyLabel: 'निकड',
    btnTrack6Stage: '६-टप्पे स्थिती पहा',
    feedTitleMy: 'माझ्या विनंत्या आणि सद्यस्थिती',
    feedTitleCommunity: 'परिसरातील सामुदायिक विनंत्या',
    feedPrivacyBadgeCitizen: 'नागरिक दृश्य',
    feedPrivacyBadgeOfficer: 'अधिकारी दृश्य',
    feedSubCitizen:
      'तुम्ही सबमिट केलेली नवीन विनंती तात्काळ या यादीत सर्वात वर दिसते आणि तिची ६-टप्प्यांची प्रगती पाहता येते.',
    filterAllLanguages: 'सर्व भाषा',
    filterAllCategories: 'सर्व श्रेणी',
    filterAllUrgency: 'सर्व निकड',
    emptyFeedTitle: 'निवडलेल्या फिल्टरनुसार कोणतीही विनंती आढळली नाही',
    emptyFeedSub: 'सर्व विनंत्या पाहण्यासाठी खालील बटणावर क्लिक करा.',
    resetFiltersBtn: 'सर्व विनंत्या पहा',
    cardSubmittedLabel: 'नागरिकाची विनंती',
    cardSummaryLabel: 'विभाग आणि AI सारांश',
    cardClusterLabel: 'सामुदायिक गट:',
    cardSimilarReports: 'समान विनंत्या',
    cardRoutedTo: 'वर्ग केलेला विभाग:',
    btnSupport: '+1 पाठिंबा द्या',
    btnSupported: 'पाठिंबा दिला ✓',
    btnReportSimilar: 'अशीच विनंती नोंदवा',
    justNowBadge: 'नवीन · आत्ताच नोंदवली',
  },
  Hindi: {
    tabs: {
      all: 'अनुरोध दर्ज करें और देखें',
      submit: '+ नया अनुरोध',
      myRequests: 'मेरे अनुरोध',
      community: 'सामुदायिक अनुरोध',
      status: '६-चरण स्थिति ट्रैकर',
    },
    citizenHeaderTitle: 'नागरिक विकास अनुरोध और सामुदायिक समर्थन पोर्टल',
    citizenHeaderSub:
      'अपनी भाषा में सड़क, पानी, स्वास्थ्य या स्कूल की आवश्यकता आसानी से दर्ज करें और ६ चरणों में उसकी प्रगति ट्रैक करें।',
    communityHeaderTitle: 'सामुदायिक अनुरोध और क्षेत्रीय माँग क्लस्टर',
    statusHeaderTitle: '६-चरण सार्वजनिक अनुरोध स्थिति ट्रैकर',
    myRequestsHeaderTitle: 'मेरे द्वारा दर्ज किए गए विकास अनुरोध',
    activeLangBadge: '३ भाषाएँ समर्थित: हिन्दी · मराठी · English',
    openFormCtaTitle: 'क्या आपके गाँव या वार्ड में बुनियादी ढाँचे की कोई समस्या है?',
    openFormCtaSub:
      'हिंदी, मराठी या अंग्रेज़ी में नया सामुदायिक विकास अनुरोध दर्ज करने के लिए नीचे क्लिक करें।',
    openFormBtn: '+ नया अनुरोध फ़ॉर्म खोलें',
    submitAnotherBtn: '+ एक और अनुरोध दर्ज करें',
    closeFormBtn: 'फ़ॉर्म बंद करें',
    step1Title: 'चरण १: भाषा चुनें या नमूना अनुरोध आज़माएँ',
    step1Hint: 'अपनी पसंदीदा भाषा चुनें या फ़ॉर्म स्वतः भरने के लिए किसी नमूने पर क्लिक करें:',
    clearFormBtn: 'फ़ॉर्म साफ़ करें',
    step2Title: 'चरण २: राज्य, ज़िला, श्रेणी और पहचान चिह्न (Landmark)',
    step3Title: 'चरण ३: गंभीरता स्तर और समस्या का वर्णन',
    statePlaceholder: 'अपना राज्य चुनें',
    districtPlaceholder: 'ज़िले का नाम लिखें या चुनें (जैसे Sitapur District)',
    categoryPlaceholder: 'अवसंरचना श्रेणी चुनें',
    urgencyPlaceholder: 'गंभीरता स्तर चुनें',
    villagePlaceholder: 'गाँव, वार्ड या ब्लॉक लिखें (जैसे महमूदाबाद, आंबेगाव)',
    landmarkPlaceholder: 'पास का पहचान चिह्न लिखें (जैसे प्राथमिक स्वास्थ्य उपकेंद्र के पास)',
    quickDistrictLabel: 'तुरंत ज़िला चुनें:',
    quickLandmarkLabel: 'तुरंत पहचान चिह्न चुनें:',
    urgencyOptions: {
      Critical: 'अत्यंत गंभीर (Critical)',
      High: 'उच्च प्राथमिकता (High)',
      Medium: 'मध्यम (Medium)',
      Low: 'सामान्य (Low)',
    },
    charCountSuffix: 'अक्षर',
    charRemainingSuffix: 'शेष',
    charMinRequired: 'कम से कम ५ अक्षर आवश्यक',
    charReady: 'उपयुक्त विवरण लंबाई',
    draftBadgeSaved: 'ड्राफ्ट स्थानीय रूप से सहेजा गया',
    draftRestoredTitle: 'ड्राफ्ट पुनर्स्थापित — आपके अधूरे फ़ॉर्म इनपुट सुरक्षित रखे गए हैं',
    draftRestoredSub:
      'सबमिट करने से पहले किसी अन्य पेज पर जाकर वापस आने पर आपके इनपुट स्थानीय ड्राफ्ट के रूप में सुरक्षित रहते हैं।',
    draftDiscardBtn: 'ड्राफ्ट हटाएँ',
    draftResumeBannerTitle: 'अधूरा नागरिक अनुरोध ड्राफ्ट उपलब्ध है',
    draftResumeBannerSub: 'आपके फ़ॉर्म इनपुट स्थानीय रूप से सहेजे गए हैं। सबमिट करने से पहले कभी भी जारी रखें।',
    draftResumeBtn: 'ड्राफ्ट जारी रखें',
    requiredBadge: 'आवश्यक',
    validBadge: 'पूर्ण',
    fieldsCompletedLabel: 'आवश्यक फ़ील्ड पूर्ण',
    attachBtn: 'ग्राम सभा प्रस्ताव / फ़ोटो जोड़ें',
    removeBtn: 'हटाएँ',
    validationBannerTitle: 'कृपया अपना अनुरोध सबमिट करने से पहले नीचे दिए गए आवश्यक फ़ील्ड भरें:',
    errors: {
      state: 'कृपया अपना राज्य चुनें।',
      district: 'कृपया अपने ज़िले का नाम लिखें या चुनें (कम से कम २ अक्षर)।',
      category: 'कृपया अवसंरचना श्रेणी चुनें।',
      urgency: 'कृपया सामुदायिक गंभीरता स्तर चुनें।',
      landmark: 'कृपया पास का पहचान चिह्न (Landmark) लिखें (कम से कम २ अक्षर)।',
      text: 'कृपया अपने क्षेत्र की विकास समस्या का वर्णन लिखें (कम से कम ५ अक्षर)।',
    },
    liveAiPreviewBadge: 'लाइव AI वर्गीकरण पूर्वावलोकन (स्वचालित)',
    liveAiTargetLabel: 'संबंधित विभाग:',
    liveAiClusterLabel: 'आसपास की समान रिपोर्ट:',
    successBannerBadge: 'अनुरोध सफलतापूर्वक दर्ज किया गया!',
    successCitizenTitle: (cat: string) =>
      `धन्यवाद! आपका '${cat}' संबंधी अनुरोध पंजीकृत हो गया है और नीचे सूची में जोड़ दिया गया है।`,
    successOriginalLabel: 'आपका दर्ज किया गया संदेश',
    successNormalizedLabel: 'विभाग आवंटन और AI सारांश',
    successStatusLabel: 'स्थिति',
    successLocationLabel: 'स्थान',
    successLandmarkLabel: 'पहचान चिह्न',
    successUrgencyLabel: 'गंभीरता',
    btnTrack6Stage: '६-चरण प्रगति ट्रैक करें',
    feedTitleMy: 'मेरे दर्ज किए गए अनुरोध',
    feedTitleCommunity: 'क्षेत्र के सामुदायिक अनुरोध',
    feedPrivacyBadgeCitizen: 'नागरिक दृश्य',
    feedPrivacyBadgeOfficer: 'अधिकारी दृश्य',
    feedSubCitizen:
      'आपका नया सबमिट किया गया अनुरोध तुरंत इस सूची में सबसे ऊपर दिखाई देता है।',
    filterAllLanguages: 'सभी भाषाएँ',
    filterAllCategories: 'सभी श्रेणियाँ',
    filterAllUrgency: 'सभी गंभीरता स्तर',
    emptyFeedTitle: 'चयनित फ़िल्टर से कोई अनुरोध मेल नहीं खाता',
    emptyFeedSub: 'सभी अनुरोध देखने के लिए नीचे दिए गए बटन पर क्लिक करें।',
    resetFiltersBtn: 'सभी अनुरोध दिखाएँ',
    cardSubmittedLabel: 'नागरिक का अनुरोध',
    cardSummaryLabel: 'विभाग और AI सारांश',
    cardClusterLabel: 'सामुदायिक क्लस्टर:',
    cardSimilarReports: 'समान रिपोर्ट',
    cardRoutedTo: 'आवंटित विभाग:',
    btnSupport: '+1 समर्थन करें',
    btnSupported: 'समर्थन दिया ✓',
    btnReportSimilar: 'ऐसा ही अनुरोध दर्ज करें',
    justNowBadge: 'नया · अभी दर्ज किया गया',
  },
};

export const CitizenRequestsView: React.FC<CitizenRequestsViewProps> = ({
  uiLanguage,
  onLanguageChange,
  requests,
  clusters = COLLECTIVE_CLUSTERS,
  onAddRequest,
  onUpdateRequest,
  onSelectRequestForAnalysis,
  onNavigate,
  activeRole = 'National Policymaker',
  initialCitizenTab = 'all',
}) => {
  const t = TRANSLATIONS[uiLanguage].citizenRequests;
  const loc = LOCALIZED_UI[uiLanguage] || LOCALIZED_UI.English;
  const roleProfile = RBAC_PROFILES[activeRole];
  const isCitizen = activeRole === 'Citizen';

  // Citizen sub-navigation tab: 'all' | 'submit' | 'my-requests' | 'community' | 'status'
  const [citizenTab, setCitizenTab] = useState<CitizenSubTab>(initialCitizenTab);
  // Controls whether the submission form is open; closes gracefully upon valid submission
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);
  // In 'all' / 'submit' mode for Citizen, toggle the right-hand feed between 'my' and 'community'
  const [feedScope, setFeedScope] = useState<'my' | 'community'>('my');

  useEffect(() => {
    setCitizenTab(initialCitizenTab);
    if (initialCitizenTab === 'submit' || initialCitizenTab === 'all') {
      setIsFormOpen(true);
    }
  }, [initialCitizenTab]);

  const getLangEntry = (lang: SupportedLanguage) =>
    SUPPORTED_LANGUAGES.find((l) => l.name === lang) || SUPPORTED_LANGUAGES[0];

  const buildDefaultFormData = (lang: SupportedLanguage, scenarioIdx = 0): CitizenRequestFormData => {
    const entry = SUPPORTED_LANGUAGES.find((l) => l.name === lang) || SUPPORTED_LANGUAGES[0];
    const scenario = entry.scenarios[scenarioIdx] || entry.scenarios[0];
    const defaultLandmark =
      LANDMARK_SUGGESTIONS[lang]?.[scenarioIdx % 4] ||
      LANDMARK_SUGGESTIONS[lang]?.[0] ||
      'Near Primary Health Sub-Centre';
    return {
      language: lang,
      state: scenario?.state || 'Maharashtra',
      district: scenario?.district || 'Pune District',
      category: scenario?.category || entry.sampleCategory || 'Healthcare',
      urgency: 'High',
      landmark: defaultLandmark,
      text: scenario?.text || entry.sampleRequest,
      villageOrCity: scenario?.village || 'Ambegaon Rural Cluster',
    };
  };

  // Load any persisted draft from localStorage / in-memory cache when mounting
  const [initialPersistedDraft] = useState<PersistedCitizenDraft | null>(() =>
    loadDraftFromStorage()
  );

  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(() =>
    initialPersistedDraft ? initialPersistedDraft.selectedScenarioIdx : 0
  );

  // Unified Controlled Local Component State for All Form Fields (Restored from Draft if present)
  const [formData, setFormData] = useState<CitizenRequestFormData>(() => {
    if (initialPersistedDraft?.formData) {
      return initialPersistedDraft.formData;
    }
    return buildDefaultFormData(uiLanguage, 0);
  });

  const [isDraftModified, setIsDraftModified] = useState<boolean>(() =>
    Boolean(initialPersistedDraft?.isModifiedDraft)
  );
  const [wasRestoredFromDraft, setWasRestoredFromDraft] = useState<boolean>(() =>
    Boolean(initialPersistedDraft?.isModifiedDraft)
  );
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(() =>
    initialPersistedDraft?.savedAt || null
  );

  const [formErrors, setFormErrors] = useState<CitizenRequestFormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<RequiredFieldKey, boolean>>>({});
  const [attachedFile, setAttachedFile] = useState<string | null>(() =>
    initialPersistedDraft?.attachedFile || null
  );
  const [justSubmitted, setJustSubmitted] = useState<CitizenRequestRecord | null>(() =>
    getLastSubmittedRequestCache()
  );

  // Stable Request ID for the current draft submission flow (used as primary key in client-side analysis cache)
  const [draftRequestId, setDraftRequestId] = useState<string>(() => {
    if (initialPersistedDraft?.draftRequestId) {
      return initialPersistedDraft.draftRequestId;
    }
    const defaultState = initialPersistedDraft?.formData?.state || 'Maharashtra';
    return generateRequestIdForState(defaultState);
  });

  // Seed initial requests into the client-side cache keyed by request ID
  useEffect(() => {
    seedInitialRequestsCache(requests);
  }, [requests]);

  // Real Google Gemini AI Analysis states (restored from client-side cache by request ID when navigating between views)
  const [geminiState, setGeminiState] = useState<'idle' | 'analyzing' | 'analyzed' | 'error'>(() => {
    const cachedById = getCachedAnalysisByRequestId(
      initialPersistedDraft?.draftRequestId
    );
    return cachedById ? 'analyzed' : 'idle';
  });
  const [processingStepIdx, setProcessingStepIdx] = useState<number>(0);
  const [geminiErrorMsg, setGeminiErrorMsg] = useState<string | null>(null);
  const [liveGeminiAnalysis, setLiveGeminiAnalysis] = useState<{
    requestId: string;
    cacheKey: string;
    data: Record<string, unknown>;
  } | null>(() => {
    const cachedById = getCachedAnalysisByRequestId(
      initialPersistedDraft?.draftRequestId
    );
    if (cachedById) {
      return {
        requestId: cachedById.requestId,
        cacheKey: cachedById.contentKey || '',
        data: cachedById.raw,
      };
    }
    return null;
  });

  // Automatically persist form inputs and draftRequestId as a local Draft whenever formData or attachedFile changes
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const draftPayload: PersistedCitizenDraft = {
      draftRequestId,
      formData,
      attachedFile,
      selectedScenarioIdx,
      isModifiedDraft: isDraftModified,
      savedAt: timestamp,
    };
    saveDraftToStorage(draftPayload);
    setDraftSavedAt(timestamp);
  }, [draftRequestId, formData, attachedFile, selectedScenarioIdx, isDraftModified]);

  // Synchronize form language, preset sample text, preset landmark, and active validation messages when uiLanguage changes
  // Only overwrite fields with sample scenario values if the user has NOT modified the draft (`!isDraftModified`)
  useEffect(() => {
    setFormData((prev) => {
      if (isDraftModified) {
        return {
          ...prev,
          language: uiLanguage,
        };
      }

      const allSampleTexts = SUPPORTED_LANGUAGES.flatMap((l) => [
        l.sampleRequest,
        ...l.scenarios.map((s) => s.text),
      ]);
      const allDefaultLandmarks = Object.values(LANDMARK_SUGGESTIONS).flat();
      const isUsingPresetSample = allSampleTexts.includes(prev.text.trim());
      const isUsingPresetLandmark = allDefaultLandmarks.includes(prev.landmark.trim());

      const newLangEntry = getLangEntry(uiLanguage);
      const scenarioIdx = selectedScenarioIdx >= 0 ? selectedScenarioIdx : 0;
      const newScenario = newLangEntry.scenarios[scenarioIdx] || newLangEntry.scenarios[0];
      const localizedLandmark =
        LANDMARK_SUGGESTIONS[uiLanguage]?.[scenarioIdx % 4] ||
        LANDMARK_SUGGESTIONS[uiLanguage]?.[0] ||
        prev.landmark;

      if (isUsingPresetSample && newScenario) {
        return {
          ...prev,
          language: uiLanguage,
          state: newScenario.state,
          district: newScenario.district,
          category: newScenario.category,
          landmark: isUsingPresetLandmark ? localizedLandmark : prev.landmark,
          text: newScenario.text,
          villageOrCity: newScenario.village,
        };
      }
      return {
        ...prev,
        language: uiLanguage,
        landmark: isUsingPresetLandmark ? localizedLandmark : prev.landmark,
      };
    });

    // Re-translate any active validation error messages to match the active uiLanguage
    setFormErrors((prevErrors) => {
      if (Object.keys(prevErrors).length === 0) return prevErrors;
      const errCopy = (LOCALIZED_UI[uiLanguage] || LOCALIZED_UI.English).errors;
      const updatedErrors: CitizenRequestFormErrors = {};
      if (prevErrors.state) updatedErrors.state = errCopy.state;
      if (prevErrors.district) updatedErrors.district = errCopy.district;
      if (prevErrors.category) updatedErrors.category = errCopy.category;
      if (prevErrors.urgency) updatedErrors.urgency = errCopy.urgency;
      if (prevErrors.landmark) updatedErrors.landmark = errCopy.landmark;
      if (prevErrors.text) updatedErrors.text = errCopy.text;
      return updatedErrors;
    });
  }, [uiLanguage, selectedScenarioIdx, isDraftModified]);

  // Community cluster endorsements state
  const [endorsedClusters, setEndorsedClusters] = useState<Record<string, boolean>>({});
  const [clusterToast, setClusterToast] = useState<string | null>(null);

  // Status Tracker selected request state
  const [trackedRequestId, setTrackedRequestId] = useState<string>(
    requests[0]?.id || 'REQ-MH-92831'
  );
  const [statusSearchQuery, setStatusSearchQuery] = useState<string>('');

  // Feed filter states (Initialized based on Role & Jurisdiction)
  const [filterLanguage, setFilterLanguage] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>(
    activeRole === 'Department Officer' ? 'Healthcare' : 'All'
  );
  const [filterUrgency, setFilterUrgency] = useState<string>('All');

  useEffect(() => {
    if (activeRole === 'Department Officer') {
      setFilterCategory('Healthcare');
    } else {
      setFilterCategory('All');
    }
  }, [activeRole]);

  // Validate a single required field
  const validateSingleField = (
    field: RequiredFieldKey,
    data: CitizenRequestFormData
  ): string | undefined => {
    const errCopy = (LOCALIZED_UI[uiLanguage] || LOCALIZED_UI.English).errors;
    switch (field) {
      case 'state':
        return !data.state || !data.state.trim() ? errCopy.state : undefined;
      case 'district':
        return !data.district || data.district.trim().length < 2 ? errCopy.district : undefined;
      case 'category':
        return !data.category ||
          !INFRASTRUCTURE_CATEGORIES.includes(data.category as InfrastructureCategory)
          ? errCopy.category
          : undefined;
      case 'urgency':
        return !data.urgency ||
          !(['Critical', 'High', 'Medium', 'Low'] as const).includes(
            data.urgency as 'Critical' | 'High' | 'Medium' | 'Low'
          )
          ? errCopy.urgency
          : undefined;
      case 'landmark':
        return !data.landmark || data.landmark.trim().length < 2 ? errCopy.landmark : undefined;
      case 'text':
        return !data.text || data.text.trim().length < MIN_DESCRIPTION_CHARS
          ? errCopy.text
          : undefined;
      default:
        return undefined;
    }
  };

  // Client-side validation for all required fields (state, district, category, urgency, landmark, text)
  const validateForm = (data: CitizenRequestFormData): CitizenRequestFormErrors => {
    const errors: CitizenRequestFormErrors = {};
    (['state', 'district', 'category', 'urgency', 'landmark', 'text'] as RequiredFieldKey[]).forEach(
      (field) => {
        const msg = validateSingleField(field, data);
        if (msg) {
          errors[field] = msg;
        }
      }
    );
    return errors;
  };

  // Update a single form field in local state, mark draft as modified, and re-evaluate field validation
  const updateFormField = <K extends keyof CitizenRequestFormData>(
    field: K,
    value: CitizenRequestFormData[K]
  ) => {
    setIsDraftModified(true);
    setFormData((prev) => {
      const nextData = {
        ...prev,
        [field]: value,
      };
      if (
        field in formErrors ||
        touchedFields[field as RequiredFieldKey]
      ) {
        const reqKey = field as RequiredFieldKey;
        const fieldError = validateSingleField(reqKey, nextData);
        setFormErrors((prevErr) => {
          const updated = { ...prevErr };
          if (fieldError) {
            updated[reqKey] = fieldError;
          } else {
            delete updated[reqKey];
          }
          return updated;
        });
      }
      return nextData;
    });
  };

  // Trigger validation on blur for any required field
  const handleFieldBlur = (field: RequiredFieldKey) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const fieldError = validateSingleField(field, formData);
    setFormErrors((prev) => {
      const next = { ...prev };
      if (fieldError) {
        next[field] = fieldError;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleLoadSample = (lang: SupportedLanguage, scenarioIdx = 0) => {
    const sampleData = buildDefaultFormData(lang, scenarioIdx);
    setSelectedScenarioIdx(scenarioIdx);
    setIsDraftModified(false);
    setWasRestoredFromDraft(false);
    onLanguageChange(lang);
    setFormData(sampleData);
    setFormErrors({});
    setTouchedFields({});
    setIsFormOpen(true);
  };

  const handleClearForm = () => {
    setSelectedScenarioIdx(-1);
    setIsDraftModified(false);
    setWasRestoredFromDraft(false);
    clearDraftFromStorage();
    setDraftRequestId(generateRequestIdForState('Maharashtra'));
    setFormData({
      language: uiLanguage,
      state: '',
      district: '',
      category: '',
      urgency: '',
      landmark: '',
      text: '',
      villageOrCity: '',
    });
    setAttachedFile(null);
    setFormErrors({});
    setTouchedFields({});
    setJustSubmitted(null);
    setLastSubmittedRequestCache(null);
    setLiveGeminiAnalysis(null);
    setGeminiState('idle');
  };

  const handleDiscardDraftAndResetSample = () => {
    clearDraftFromStorage();
    setIsDraftModified(false);
    setWasRestoredFromDraft(false);
    setSelectedScenarioIdx(0);
    const defaultData = buildDefaultFormData(uiLanguage, 0);
    setDraftRequestId(generateRequestIdForState(defaultData.state));
    setFormData(defaultData);
    setAttachedFile(null);
    setFormErrors({});
    setTouchedFields({});
    setLiveGeminiAnalysis(null);
    setGeminiState('idle');
  };

  const handlePrefillFromCommunityIssue = (
    category: InfrastructureCategory,
    stateName: string,
    districtName: string,
    issueSummary: string
  ) => {
    const cleanDist = districtName.replace(' District', '');
    const localizedPrefillText =
      uiLanguage === 'Marathi'
        ? `${districtName} परिसरातील सामुदायिक विनंती: ${issueSummary}. आमच्या भागातील नागरिकांसाठी तातडीने कार्यवाही करावी.`
        : uiLanguage === 'Hindi'
        ? `${districtName} क्षेत्र से सामुदायिक अनुरोध: ${issueSummary}। हमारे क्षेत्र के निवासियों के लिए तत्काल विभागीय कार्रवाई की जाए।`
        : `Community request from ${districtName}: ${issueSummary}. Residents in our locality urgently request departmental inspection and resolution.`;

    const localizedLandmark =
      uiLanguage === 'Marathi'
        ? `${cleanDist} मुख्य रस्त्याजवळ`
        : uiLanguage === 'Hindi'
        ? `${cleanDist} मुख्य सड़क के पास`
        : `Near ${cleanDist} Main Road`;

    setIsDraftModified(true);
    setFormData({
      language: uiLanguage,
      category,
      state: stateName,
      district: districtName,
      urgency: 'High',
      landmark: localizedLandmark,
      text: localizedPrefillText,
      villageOrCity: `${cleanDist} Rural Ward`,
    });
    setFormErrors({});
    setTouchedFields({});
    setIsFormOpen(true);
    setCitizenTab('submit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSupportCommunityRequest = (req: CitizenRequestRecord) => {
    if (req.supportedByUser) return;
    const updated: CitizenRequestRecord = {
      ...req,
      similarRequestsCount: req.similarRequestsCount + 1,
      supportedByUser: true,
    };
    if (onUpdateRequest) {
      onUpdateRequest(updated);
    }
    const toastMsg =
      uiLanguage === 'Marathi'
        ? `विनंती क्रमांक ${req.id} (${req.district}) ला तुमचा +1 पाठिंबा जोडला गेला! एकूण सामुदायिक विनंत्या: ${updated.similarRequestsCount}.`
        : uiLanguage === 'Hindi'
        ? `अनुरोध संख्या ${req.id} (${req.district}) को आपका +1 समर्थन जोड़ा गया! कुल सामुदायिक रिपोर्ट: ${updated.similarRequestsCount}।`
        : `Added your support (+1) to Community Request ${req.id} (${req.category} in ${req.district}). Total community reports: ${updated.similarRequestsCount}.`;

    setClusterToast(toastMsg);
    setTimeout(() => setClusterToast(null), 5000);
  };

  const handleSupportCluster = (cluster: CollectiveCluster) => {
    if (endorsedClusters[cluster.id]) return;
    setEndorsedClusters((prev) => ({ ...prev, [cluster.id]: true }));
    const toastMsg =
      uiLanguage === 'Marathi'
        ? `क्लस्टर ${cluster.id} (${cluster.district}) ला तुमचा सामुदायिक पाठिंबा जोडला गेला! एकूण अहवाल: ${(cluster.citizenReports + 1).toLocaleString()}.`
        : uiLanguage === 'Hindi'
        ? `क्लस्टर ${cluster.id} (${cluster.district}) को आपका सामुदायिक समर्थन जोड़ा गया! कुल रिपोर्ट: ${(cluster.citizenReports + 1).toLocaleString()}।`
        : `Your community endorsement was added to Cluster ${cluster.id} (${cluster.district}). Total linked reports: ${(cluster.citizenReports + 1).toLocaleString()}.`;

    setClusterToast(toastMsg);
    setTimeout(() => setClusterToast(null), 5000);
  };

  const inferAnalysisFromInput = (
    rawText: string,
    lang: SupportedLanguage,
    cat: InfrastructureCategory,
    dist: string,
    vill: string,
    selectedUrgency: 'Critical' | 'High' | 'Medium' | 'Low'
  ) => {
    const lower = rawText.toLowerCase();
    const langEntry = getLangEntry(lang);
    const matchedScenario = langEntry.scenarios.find((s) => s.text === rawText);
    const effectiveDist = dist || 'Pune District';
    const effectiveVill = vill || `${effectiveDist.replace(' District', '')} Sector`;

    let translated = rawText;
    let extracted =
      matchedScenario?.extractedIssue ||
      `${cat} infrastructure deficit in ${effectiveVill}, ${effectiveDist}`;
    let subcat = `${cat} Facility Upgrade`;
    const urgency: 'Critical' | 'High' | 'Medium' | 'Low' = selectedUrgency;
    let pop = 14500;
    let simCount = 242;
    let priority = selectedUrgency === 'Critical' ? 92 : selectedUrgency === 'High' ? 86 : 78;
    let dept = 'District Infrastructure Development Cell';

    if (matchedScenario) {
      translated = matchedScenario.englishTranslation;
    } else if (lang !== 'English' && rawText === langEntry.sampleRequest) {
      translated = langEntry.englishTranslation;
    } else if (lang !== 'English') {
      translated = `Citizens in ${effectiveVill}, ${effectiveDist} report ${selectedUrgency.toLowerCase()}-urgency ${cat.toLowerCase()} need: "${rawText}"`;
    }

    if (
      cat === 'Healthcare' ||
      lower.includes('hospital') ||
      lower.includes('रुग्णालय') ||
      lower.includes('आरोग्य') ||
      lower.includes('अस्पताल') ||
      lower.includes('doctor')
    ) {
      extracted =
        matchedScenario?.extractedIssue ||
        'Lack of 24x7 Community Health Center & emergency trauma care';
      subcat = 'Primary & Community Healthcare Centre (PHC/CHC)';
      pop = 24000;
      simCount = 388;
      priority = selectedUrgency === 'Critical' ? 93 : 89;
      dept = 'Health Department (Public Health & NHM Cell)';
    } else if (
      cat === 'Water' ||
      lower.includes('water') ||
      lower.includes('पाणी') ||
      lower.includes('पानी')
    ) {
      extracted =
        matchedScenario?.extractedIssue || 'Severe drinking water scarcity & dry handpumps';
      subcat = 'Piped Drinking Water Supply Grid (JJM)';
      pop = 31000;
      simCount = 468;
      priority = selectedUrgency === 'Critical' ? 94 : 90;
      dept = 'Water Resources (PHED & Jal Jeevan Mission)';
    } else if (
      cat === 'Roads' ||
      lower.includes('road') ||
      lower.includes('रस्ता') ||
      lower.includes('सड़क') ||
      lower.includes('bridge')
    ) {
      extracted =
        matchedScenario?.extractedIssue ||
        'Damaged rural road connectivity & flood-prone culvert';
      subcat = 'All-Weather Rural Road & Bridge';
      pop = 19500;
      simCount = 310;
      priority = selectedUrgency === 'Critical' ? 90 : 87;
      dept = 'Public Works Department (PWD)';
    } else if (
      cat === 'Education' ||
      lower.includes('school') ||
      lower.includes('college') ||
      lower.includes('शाळा') ||
      lower.includes('स्कूल')
    ) {
      extracted =
        matchedScenario?.extractedIssue ||
        'Shortage of secondary school classrooms & science labs';
      subcat = 'Secondary School Infrastructure';
      pop = 12800;
      simCount = 219;
      priority = selectedUrgency === 'Critical' ? 88 : 82;
      dept = 'Education Department (Secondary Education Directorate)';
    } else if (
      cat === 'Electricity' ||
      lower.includes('power') ||
      lower.includes('बिजली') ||
      lower.includes('वीज')
    ) {
      extracted =
        matchedScenario?.extractedIssue ||
        'Frequent feeder transformer failure & voltage drops';
      subcat = '33/11 kV Substation & Feeder Upgrade';
      pop = 22000;
      simCount = 290;
      priority = selectedUrgency === 'Critical' ? 89 : 84;
      dept = 'State Electricity Distribution Dept';
    }

    return {
      translated,
      extracted,
      subcat,
      urgency,
      pop,
      simCount,
      priority,
      dept,
    };
  };

  const activeCategory: InfrastructureCategory =
    (formData.category as InfrastructureCategory) || 'Healthcare';
  const activeUrgency: 'Critical' | 'High' | 'Medium' | 'Low' =
    (formData.urgency as 'Critical' | 'High' | 'Medium' | 'Low') || 'High';

  const livePreviewAnalysis = inferAnalysisFromInput(
    formData.text,
    uiLanguage,
    activeCategory,
    formData.district,
    formData.villageOrCity,
    activeUrgency
  );

  const buildRequestCacheKey = (data: CitizenRequestFormData) =>
    JSON.stringify({
      text: data.text.trim().toLowerCase(),
      language: uiLanguage,
      state: data.state.trim(),
      district: data.district.trim(),
      village: data.villageOrCity.trim(),
      category: data.category,
      urgency: data.urgency,
    });

  // Execute real server-side Google Gemini API analysis with 5-step processing indicator & client-side caching by request ID
  const executeGeminiAnalysis = async (
    data: CitizenRequestFormData,
    requestIdToUse: string = draftRequestId
  ): Promise<Record<string, unknown> | null> => {
    const cleanText = data.text.trim();
    if (!cleanText || cleanText.length < MIN_DESCRIPTION_CHARS) {
      setGeminiState('error');
      setGeminiErrorMsg(loc.errors.text);
      return null;
    }

    const cacheKey = buildRequestCacheKey(data);

    // 1. Check in-component state for matching requestId & content
    if (
      liveGeminiAnalysis &&
      (liveGeminiAnalysis.requestId === requestIdToUse || liveGeminiAnalysis.cacheKey === cacheKey) &&
      liveGeminiAnalysis.cacheKey === cacheKey
    ) {
      setGeminiState('analyzed');
      setGeminiErrorMsg(null);
      return liveGeminiAnalysis.data;
    }

    // 2. Check shared client-side cache by request ID first (prevents redundant API calls across view navigation)
    const cachedById = getCachedAnalysisByRequestId(requestIdToUse);
    if (cachedById && (!cachedById.contentKey || cachedById.contentKey === cacheKey)) {
      setLiveGeminiAnalysis({
        requestId: requestIdToUse,
        cacheKey,
        data: cachedById.raw,
      });
      setGeminiState('analyzed');
      setGeminiErrorMsg(null);
      return cachedById.raw;
    }

    // 3. Check shared client-side cache by content signature and bind to current requestId
    const cachedByContent = getCachedAnalysisByContentKey(cacheKey);
    if (cachedByContent) {
      setCachedAnalysisByRequestId(
        requestIdToUse,
        cachedByContent.structured,
        cachedByContent.raw,
        cacheKey
      );
      setLiveGeminiAnalysis({
        requestId: requestIdToUse,
        cacheKey,
        data: cachedByContent.raw,
      });
      setGeminiState('analyzed');
      setGeminiErrorMsg(null);
      return cachedByContent.raw;
    }

    setGeminiState('analyzing');
    setGeminiErrorMsg(null);
    setProcessingStepIdx(0);

    const stepInterval = window.setInterval(() => {
      setProcessingStepIdx((prev) => (prev < AI_PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }, 220);

    try {
      const response = await fetch('/api/ai/analyze-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: requestIdToUse,
          text: cleanText,
          language: uiLanguage,
          state: data.state.trim() || 'Maharashtra',
          district: data.district.trim() || 'Pune District',
          village: data.villageOrCity.trim() || 'Rural Block',
          category: data.category || 'Healthcare',
          urgency: data.urgency || 'High',
        }),
      });

      window.clearInterval(stepInterval);
      setProcessingStepIdx(AI_PROCESSING_STEPS.length - 1);

      let resultJson: Record<string, unknown> = {};
      try {
        resultJson = (await response.json()) as Record<string, unknown>;
      } catch {
        setGeminiState('error');
        setGeminiErrorMsg('AI analysis temporarily unavailable.');
        return null;
      }

      if (!response.ok || !resultJson || resultJson.analyzedByGemini === false) {
        setGeminiState('error');
        setGeminiErrorMsg(
          typeof resultJson?.error === 'string' && resultJson.error
            ? resultJson.error
            : 'AI analysis temporarily unavailable.'
        );
        return null;
      }

      const structuredForCache: GeminiStructuredAnalysis = {
        language: String(resultJson.language || uiLanguage),
        originalText: cleanText,
        normalizedIssue: String(resultJson.normalizedIssue || cleanText),
        category: String(resultJson.category || data.category || 'Healthcare'),
        subcategory: String(resultJson.subcategory || 'General Infrastructure'),
        location: String(resultJson.location || data.district || 'Pune District'),
        urgency: String(resultJson.urgency || data.urgency || 'High'),
        summary: String(resultJson.summary || cleanText),
        infrastructureType: String(
          resultJson.infrastructureType || resultJson.subcategory || 'Public Infrastructure'
        ),
        confidence: String(resultJson.confidence || '0.91'),
        reasoning: String(resultJson.reasoning || ''),
      };

      // Cache result by requestId so navigating between views never re-triggers the API call
      setCachedAnalysisByRequestId(requestIdToUse, structuredForCache, resultJson, cacheKey);
      setLiveGeminiAnalysis({
        requestId: requestIdToUse,
        cacheKey,
        data: resultJson,
      });
      setGeminiState('analyzed');
      return resultJson;
    } catch {
      window.clearInterval(stepInterval);
      setGeminiState('error');
      setGeminiErrorMsg('AI analysis temporarily unavailable.');
      return null;
    }
  };

  const finalizeRequestSubmission = (
    geminiData: Record<string, unknown> | null,
    isAiAnalyzed: boolean
  ) => {
    const cleanState = formData.state.trim();
    const cleanDistrict = formData.district.trim();
    const cleanCategory = formData.category as InfrastructureCategory;
    const cleanUrgency = formData.urgency as 'Critical' | 'High' | 'Medium' | 'Low';
    const cleanLandmark = formData.landmark.trim();
    const cleanText = formData.text.trim();
    const cleanVillage =
      formData.villageOrCity.trim() ||
      `${cleanDistrict.replace(' District', '')} Community Ward`;

    // Analytical Priority Model (Section 8: Existing analytics evaluate demand, population impact, infrastructure gap, investment context, and priority score)
    const analytical = inferAnalysisFromInput(
      cleanText,
      uiLanguage,
      cleanCategory,
      cleanDistrict,
      cleanVillage,
      cleanUrgency
    );

    // Validate structured Gemini fields with safe fallbacks
    const detectedLangRaw = String(geminiData?.language || geminiData?.detectedLanguage || uiLanguage);
    const validDetectedLang: SupportedLanguage =
      detectedLangRaw === 'Marathi' || detectedLangRaw === 'Hindi' || detectedLangRaw === 'English'
        ? detectedLangRaw
        : uiLanguage;

    const geminiCategoryRaw = String(geminiData?.category || cleanCategory);
    const resolvedCategory: InfrastructureCategory = INFRASTRUCTURE_CATEGORIES.includes(
      geminiCategoryRaw as InfrastructureCategory
    )
      ? (geminiCategoryRaw as InfrastructureCategory)
      : cleanCategory;

    const geminiUrgencyRaw = String(geminiData?.urgency || cleanUrgency);
    const resolvedUrgency: 'Critical' | 'High' | 'Medium' | 'Low' = (
      ['Critical', 'High', 'Medium', 'Low'] as const
    ).includes(geminiUrgencyRaw as 'Critical' | 'High' | 'Medium' | 'Low')
      ? (geminiUrgencyRaw as 'Critical' | 'High' | 'Medium' | 'Low')
      : cleanUrgency;

    const normalizedIssue =
      (isAiAnalyzed && typeof geminiData?.normalizedIssue === 'string' && geminiData.normalizedIssue.trim()) ||
      (isAiAnalyzed && typeof geminiData?.extractedIssue === 'string' && geminiData.extractedIssue.trim()) ||
      analytical.extracted;

    const summaryText =
      (isAiAnalyzed && typeof geminiData?.summary === 'string' && geminiData.summary.trim()) ||
      (isAiAnalyzed && typeof geminiData?.translatedMeaning === 'string' && geminiData.translatedMeaning.trim()) ||
      analytical.translated;

    const subcategoryText =
      (isAiAnalyzed && typeof geminiData?.subcategory === 'string' && geminiData.subcategory.trim()) ||
      analytical.subcat;

    const infrastructureTypeText =
      (isAiAnalyzed &&
        typeof geminiData?.infrastructureType === 'string' &&
        geminiData.infrastructureType.trim()) ||
      subcategoryText;

    const locationText =
      (isAiAnalyzed && typeof geminiData?.location === 'string' && geminiData.location.trim()) ||
      cleanDistrict;

    const confidenceText =
      (isAiAnalyzed && typeof geminiData?.confidence === 'string' && geminiData.confidence.trim()) ||
      (isAiAnalyzed ? '0.91' : 'N/A');

    const reasoningText =
      (isAiAnalyzed && typeof geminiData?.reasoning === 'string' && geminiData.reasoning.trim()) ||
      (isAiAnalyzed
        ? `Gemini classified this ${validDetectedLang} request under ${resolvedCategory} (${infrastructureTypeText}) and normalized the local development need for district prioritization.`
        : 'AI analysis temporarily unavailable. Request routed via standard district intake rules.');

    const structuredGeminiRecord: GeminiStructuredAnalysis | undefined = isAiAnalyzed
      ? {
          language: validDetectedLang,
          originalText: cleanText,
          normalizedIssue,
          category: resolvedCategory,
          subcategory: subcategoryText,
          location: locationText,
          urgency: resolvedUrgency,
          summary: summaryText,
          infrastructureType: infrastructureTypeText,
          confidence: confidenceText,
          reasoning: reasoningText,
        }
      : undefined;

    const stateCode =
      STATES_INTELLIGENCE.find((s) => s.name === cleanState)?.code || 'IN';
    const numericSuffix = draftRequestId.split('-')[2] || String(Math.floor(10000 + Math.random() * 89999));
    const finalizedRequestId = `REQ-${stateCode}-${numericSuffix}`;

    const newRecord: CitizenRequestRecord = {
      id: finalizedRequestId,
      citizenText: cleanText,
      detectedLanguage: validDetectedLang,
      translatedMeaning: summaryText,
      extractedIssue: normalizedIssue,
      category: resolvedCategory,
      subcategory: subcategoryText,
      infrastructureType: infrastructureTypeText,
      confidence: confidenceText,
      aiReasoning: reasoningText,
      analyzedByGemini: isAiAnalyzed,
      geminiAnalysis: structuredGeminiRecord,
      state: cleanState,
      district: cleanDistrict,
      villageOrCity: cleanVillage,
      landmark: cleanLandmark,
      urgency: resolvedUrgency,
      sentiment:
        resolvedUrgency === 'Critical' ? 'Distressed / Urgent' : 'Concerned / Constructive',
      affectedPopulation: analytical.pop,
      similarRequestsCount: analytical.simCount,
      nearbyVillagesCount: 12,
      recentSixMonthsPct: 36,
      existingInfrastructureNearby: `Nearest verified ${resolvedCategory.toLowerCase()} facility is 18.5 km away (Ref: ${cleanLandmark})`,
      priorityScore: analytical.priority,
      assignedDepartment: analytical.dept,
      assignedOfficer: `Nodal Officer, ${cleanDistrict}`,
      status: 'Under Review',
      submittedAt: 'Just now',
      isOwnRequest: true,
      aiSummary: isAiAnalyzed
        ? `${summaryText} Clustered with ${analytical.simCount} similar community requests in ${cleanDistrict} (${cleanState}).`
        : `Standard district routing in ${cleanDistrict} (${cleanState}) with ${analytical.simCount} community reports.`,
      suggestedAction: `Deploy ${infrastructureTypeText} in ${cleanVillage}, ${cleanDistrict} (${cleanLandmark}) under priority sector allocation.`,
      timeline: [
        {
          step: 'Submitted',
          timestamp: 'Just now',
          completed: true,
          detail: `Submitted in ${validDetectedLang} from ${cleanVillage}, ${cleanDistrict} (${cleanLandmark})${
            attachedFile ? ` · Attached: ${attachedFile}` : ''
          }`,
        },
        {
          step: 'AI Analysed',
          timestamp: 'Just now',
          completed: isAiAnalyzed,
          detail: isAiAnalyzed
            ? `Analyzed by Google Gemini · Classified under ${resolvedCategory} (${infrastructureTypeText}) · Confidence ${confidenceText}`
            : 'AI analysis temporarily unavailable · Standard intake classification applied',
        },
        {
          step: 'Department Assigned',
          timestamp: 'Just now',
          completed: true,
          detail: `Routed to ${analytical.dept} (${cleanDistrict})`,
        },
        {
          step: 'Under Review',
          timestamp: 'Active Now',
          completed: true,
          detail: `Clustered with ${analytical.simCount} community reports across 12 nearby villages · Priority Score ${analytical.priority}/100`,
        },
        {
          step: 'Action Initiated',
          timestamp: 'Pending field inspection',
          completed: false,
          detail: `Queued for District Collectorate & ${analytical.dept} engineering verification`,
        },
        {
          step: 'Resolved',
          timestamp: 'Target SLA: 14–21 Days',
          completed: false,
          detail: 'Public completion verification & citizen sign-off',
        },
      ],
    };

    // Store the finalized analysis result in the client-side cache keyed by the finalized Request ID
    if (isAiAnalyzed && structuredGeminiRecord) {
      setCachedAnalysisByRequestId(
        newRecord.id,
        structuredGeminiRecord,
        geminiData || { ...structuredGeminiRecord, analyzedByGemini: true },
        buildRequestCacheKey(formData)
      );
    }

    clearDraftFromStorage();
    setIsDraftModified(false);
    setWasRestoredFromDraft(false);
    setDraftSavedAt(null);
    onAddRequest(newRecord);
    onSelectRequestForAnalysis(newRecord);
    setJustSubmitted(newRecord);
    setLastSubmittedRequestCache(newRecord);
    setTrackedRequestId(newRecord.id);
    setDraftRequestId(generateRequestIdForState(cleanState));
    setAttachedFile(null);
    setFilterLanguage('All');
    setFilterCategory('All');
    setFilterUrgency('All');
    setFeedScope('my');
    setIsFormOpen(false);
    if (citizenTab === 'submit') {
      setCitizenTab('all');
    }
  };

  // Validates all fields (state, district, category, urgency, landmark, text),
  // calls Google Gemini API on the server, updates global app state via onAddRequest, and closes the form gracefully
  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Run client-side validation for all required fields before submission
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setTouchedFields({
        state: true,
        district: true,
        category: true,
        urgency: true,
        landmark: true,
        text: true,
      });
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({});
    setTouchedFields({});

    // 2. Call real server-side Google Gemini API to analyze the citizen's text request
    const geminiOutput = await executeGeminiAnalysis(formData);
    if (!geminiOutput) {
      // Do not silently pretend that the request was analyzed by AI (Section 3)
      return;
    }

    // 3. Finalize and connect Gemini output to the existing pipeline
    finalizeRequestSubmission(geminiOutput, true);
  };

  // Separate Citizen's Own Requests vs Community Requests
  const myOwnRequests = requests.filter(
    (req) => req.isOwnRequest || req.submittedAt === 'Just now'
  );

  // Newly submitted requests (submittedAt === 'Just now') ALWAYS display in the list regardless of role/jurisdiction
  const jurisdictionFilteredRequests = requests.filter((req) => {
    if (req.submittedAt === 'Just now') {
      return true;
    }
    if (activeRole === 'Citizen') {
      if (citizenTab === 'my-requests') {
        return Boolean(req.isOwnRequest);
      }
      if (citizenTab === 'community') {
        return true;
      }
      return feedScope === 'my' ? Boolean(req.isOwnRequest) : true;
    }
    if (activeRole === 'District Officer') {
      return req.district.toLowerCase().includes('pune');
    }
    if (activeRole === 'State Administrator') {
      return req.state === 'Maharashtra';
    }
    return true;
  });

  const filteredRequests = jurisdictionFilteredRequests.filter((req) => {
    const matchLang = filterLanguage === 'All' || req.detectedLanguage === filterLanguage;
    const matchCat = filterCategory === 'All' || req.category === filterCategory;
    const matchUrg = filterUrgency === 'All' || req.urgency === filterUrgency;
    return matchLang && matchCat && matchUrg;
  });

  const trackedRequest =
    requests.find(
      (r) =>
        r.id.toLowerCase() ===
        (statusSearchQuery.trim() || trackedRequestId).toLowerCase()
    ) ||
    requests.find((r) =>
      r.id.toLowerCase().includes((statusSearchQuery.trim() || trackedRequestId).toLowerCase())
    ) ||
    myOwnRequests[0] ||
    requests[0];

  const currentLangEntry = getLangEntry(uiLanguage);
  const hasValidationErrors = Object.keys(formErrors).length > 0;
  const requiredFieldsList: RequiredFieldKey[] = [
    'state',
    'district',
    'category',
    'urgency',
    'landmark',
    'text',
  ];
  const completedRequiredCount = requiredFieldsList.filter(
    (field) => !validateSingleField(field, formData)
  ).length;

  const rawTextLength = formData.text.length;
  const trimmedTextLength = formData.text.trim().length;
  const remainingChars = Math.max(0, MAX_DESCRIPTION_CHARS - rawTextLength);
  const charProgressPct = Math.min(
    100,
    Math.round((rawTextLength / MAX_DESCRIPTION_CHARS) * 100)
  );
  const isTextValidLength = trimmedTextLength >= MIN_DESCRIPTION_CHARS;

  const districtSuggestions =
    POPULAR_DISTRICTS_BY_STATE[formData.state] || [
      'Pune District',
      'Sitapur District',
      'Darbhanga District',
      'Barmer District',
    ];
  const landmarkSuggestions =
    LANDMARK_SUGGESTIONS[uiLanguage] || LANDMARK_SUGGESTIONS.English;

  const getLocalizedCategoryLabel = (cat: InfrastructureCategory) =>
    CATEGORY_LABELS[uiLanguage]?.[cat] || cat;

  const getLocalizedStateLabel = (stateName: string) =>
    STATE_LOCALIZED_LABELS[uiLanguage]?.[stateName] || stateName;

  const showFormPanel =
    isFormOpen && (!isCitizen || citizenTab === 'all' || citizenTab === 'submit');

  return (
    <div className="space-y-8 pb-12">
      {/* ROLE & JURISDICTION DATA SCOPE BANNER */}
      <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <span className="text-2xl">{roleProfile.icon}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                {roleProfile.scopeBadge}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300 font-mono">
                Privacy Tier: {roleProfile.privacyLevel.toUpperCase()}
              </span>
              {activeRole === 'District Officer' && (
                <span className="text-xs text-blue-300 font-semibold">
                  · Showing data for Pune District
                </span>
              )}
              {activeRole === 'Department Officer' && (
                <span className="text-xs text-teal-300 font-semibold">
                  · Department Filter: Healthcare (1,284 Requests)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              <strong className="text-white">{roleProfile.aiInsightCallout}</strong> —{' '}
              {roleProfile.aiInsightSubtext}
            </p>
          </div>
        </div>

        {/* Citizen Quick Sub-Navigation Tabs (Localized in Active uiLanguage) */}
        {isCitizen && (
          <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            {[
              { id: 'all', label: loc.tabs.all },
              { id: 'submit', label: loc.tabs.submit },
              { id: 'my-requests', label: `${loc.tabs.myRequests} (${myOwnRequests.length})` },
              {
                id: 'community',
                label: `${loc.tabs.community} (${requests.length + clusters.length})`,
              },
              { id: 'status', label: loc.tabs.status },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCitizenTab(tab.id as CitizenSubTab);
                  if (tab.id === 'submit' || tab.id === 'all') {
                    setIsFormOpen(true);
                  }
                  if (tab.id === 'my-requests') setFeedScope('my');
                  if (tab.id === 'community') setFeedScope('community');
                }}
                className={`px-2.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  citizenTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Toast Feedback Banner when Citizen Supports a Community Request / Cluster */}
      {clusterToast && (
        <div className="p-4 rounded-xl bg-emerald-950 text-emerald-100 border border-emerald-700 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{clusterToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setClusterToast(null)}
            className="text-emerald-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header (Fully Localized in Active uiLanguage) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-semibold text-blue-700">{t.badge}</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            {isCitizen
              ? citizenTab === 'community'
                ? loc.communityHeaderTitle
                : citizenTab === 'status'
                ? loc.statusHeaderTitle
                : citizenTab === 'my-requests'
                ? loc.myRequestsHeaderTitle
                : t.title
              : t.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isCitizen ? loc.citizenHeaderSub : t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!showFormPanel && (
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(true);
                if (isCitizen && citizenTab !== 'all' && citizenTab !== 'submit') {
                  setCitizenTab('submit');
                }
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loc.openFormBtn}</span>
            </button>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>{loc.activeLangBadge}</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB VIEW 1: DEDICATED 6-STAGE REQUEST STATUS TRACKER ('status')     */}
      {/* =================================================================== */}
      {isCitizen && citizenTab === 'status' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t.trackTitle}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t.trackDesc}</p>
              </div>

              {/* Search by Request ID */}
              <div className="flex items-center gap-2 w-full md:w-72">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={statusSearchQuery}
                    onChange={(e) => setStatusSearchQuery(e.target.value)}
                    placeholder="REQ-MH-92831"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                  />
                </div>
                {statusSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setStatusSearchQuery('')}
                    className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Selector Buttons for Citizen's Requests & Community Requests */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600">{t.sampleIdsLabel}</div>
              <div className="flex flex-wrap gap-2">
                {requests.map((r) => {
                  const isSelected = trackedRequest?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setTrackedRequestId(r.id);
                        setStatusSearchQuery('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-mono">{r.id}</span>
                      <span>·</span>
                      <span>{getLocalizedCategoryLabel(r.category)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed 6-Stage Tracker Card */}
            {trackedRequest && (
              <div className="p-6 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-teal-400">
                        {trackedRequest.id}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-blue-300 font-semibold">
                        {getLocalizedCategoryLabel(trackedRequest.category)}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300">
                        {trackedRequest.villageOrCity}, {trackedRequest.district},{' '}
                        {getLocalizedStateLabel(trackedRequest.state)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {trackedRequest.extractedIssue}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">{loc.successStatusLabel}</div>
                      <div className="text-sm font-bold text-emerald-400">
                        {trackedRequest.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Original & Normalized Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-slate-400 font-medium">
                      {loc.cardSubmittedLabel} ({trackedRequest.detectedLanguage})
                    </div>
                    <p className="text-slate-100 text-sm leading-relaxed">
                      “{trackedRequest.citizenText}”
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-teal-400 font-medium">{loc.cardSummaryLabel}</div>
                    <p className="text-slate-200 leading-relaxed">
                      “{trackedRequest.translatedMeaning}”
                    </p>
                    <p className="text-slate-400 text-[11px] pt-1">
                      {loc.cardClusterLabel}{' '}
                      <strong className="text-white font-mono">
                        {trackedRequest.similarRequestsCount} {loc.cardSimilarReports}
                      </strong>{' '}
                      · {loc.cardRoutedTo}{' '}
                      <strong className="text-teal-300">
                        {trackedRequest.assignedDepartment}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* 6-Stage Visual Lifecycle Stepper */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{t.lifecycleTitle}</span>
                    <span className="font-mono text-teal-400">
                      {trackedRequest.timeline.filter((s) => s.completed).length} /{' '}
                      {trackedRequest.timeline.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                    {trackedRequest.timeline.map((step, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                          step.completed
                            ? 'bg-emerald-950/50 border-emerald-700/70 text-emerald-100'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-teal-400">
                              0{idx + 1}
                            </span>
                            {step.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <div className="font-bold text-white">{step.step}</div>
                          <p className="text-[11px] leading-relaxed opacity-85">{step.detail}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono opacity-75">
                          {step.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB VIEW 2: COMMUNITY REQUESTS & LOCAL DEMAND CLUSTERS ('community')*/}
      {/* =================================================================== */}
      {isCitizen && citizenTab === 'community' && (
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    {loc.communityHeaderTitle} ({clusters.length})
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{loc.citizenHeaderSub}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(true);
                  setCitizenTab('submit');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {loc.tabs.submit}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
              {clusters.map((cluster) => {
                const isEndorsed = Boolean(endorsedClusters[cluster.id]);
                const totalReports = cluster.citizenReports + (isEndorsed ? 1 : 0);
                return (
                  <div
                    key={cluster.id}
                    className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-mono font-bold text-blue-700">{cluster.id}</span>
                        <span className="font-semibold text-teal-700">
                          {getLocalizedCategoryLabel(cluster.category)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {cluster.underlyingIssue}
                      </h3>
                      <div className="text-slate-600 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {cluster.district}, {getLocalizedStateLabel(cluster.state)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400">{loc.cardClusterLabel}</div>
                          <div className="text-sm font-bold font-mono text-slate-900">
                            {totalReports.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400">
                            {loc.successLocationLabel}
                          </div>
                          <div className="text-sm font-bold font-mono text-slate-900">
                            {cluster.affectedVillages} Villages
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {cluster.samplePhrases.slice(0, 2).map((sp, i) => (
                          <div
                            key={i}
                            className="p-2 rounded bg-white border border-slate-200/80 text-[11px] text-slate-700"
                          >
                            <span className="font-semibold text-blue-700">{sp.lang}: </span>
                            <span>{sp.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSupportCluster(cluster)}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            isEndorsed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isEndorsed ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{loc.btnSupported}</span>
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{loc.btnSupport}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handlePrefillFromCommunityIssue(
                              cluster.category,
                              cluster.state,
                              cluster.district.split(' ')[0] + ' District',
                              cluster.underlyingIssue
                            )
                          }
                          className="py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold transition-colors cursor-pointer"
                        >
                          {loc.btnReportSimilar}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Draft Resume Banner when User Navigates to Another Sub-Tab or Closes Form Before Submitting */}
      {!showFormPanel && !justSubmitted && (isDraftModified || trimmedTextLength > 0) && (
        <div
          data-testid="draft-resume-banner"
          className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <Save className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="font-bold text-amber-900">{loc.draftResumeBannerTitle}</div>
              <p className="text-amber-800 mt-0.5">
                {loc.draftResumeBannerSub}
                {formData.district ? ` · ${formData.district}` : ''}
                {formData.category ? ` (${getLocalizedCategoryLabel(formData.category as InfrastructureCategory).split(' (')[0]})` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(true);
                if (isCitizen && citizenTab !== 'all' && citizenTab !== 'submit') {
                  setCitizenTab('submit');
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold cursor-pointer transition-colors"
            >
              {loc.draftResumeBtn}
            </button>
            <button
              type="button"
              onClick={handleDiscardDraftAndResetSample}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold cursor-pointer transition-colors"
            >
              {loc.draftDiscardBtn}
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB VIEW 3: USER-FRIENDLY MULTILINGUAL SUBMISSION FORM & LIVE FEED  */}
      {/* =================================================================== */}
      {(!isCitizen ||
        citizenTab === 'all' ||
        citizenTab === 'submit' ||
        citizenTab === 'my-requests') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (6 Cols): Controlled Citizen Request Submission Form */}
          {showFormPanel && (
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Form Header with Draft Persistence Badge, Completion Counter & Clear/Close Actions */}
              <div className="space-y-3 border-b border-slate-200 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        {t.badge}
                      </span>
                      <span
                        data-testid="draft-status-badge"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold"
                      >
                        <Save className="w-3 h-3 text-amber-600" />
                        <span>
                          {loc.draftBadgeSaved}
                          {draftSavedAt ? ` · ${draftSavedAt}` : ''}
                        </span>
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">{t.tabSubmit}</h2>
                    <p className="text-xs text-slate-600 mt-1">{t.requestInputHint}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{loc.clearFormBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        if (citizenTab === 'submit') {
                          setCitizenTab('all');
                        }
                      }}
                      title={loc.closeFormBtn}
                      aria-label={loc.closeFormBtn}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{loc.closeFormBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Required Fields Completion Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        completedRequiredCount === 6
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {completedRequiredCount}/6
                    </span>
                    <span className="text-slate-600 font-medium">
                      {loc.fieldsCompletedLabel}
                    </span>
                  </div>
                  {isDraftModified && (
                    <button
                      type="button"
                      onClick={handleDiscardDraftAndResetSample}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                    >
                      {loc.draftDiscardBtn}
                    </button>
                  )}
                </div>
              </div>

              {/* Restored Local Draft Banner when User Navigates Away and Returns */}
              {wasRestoredFromDraft && (
                <div
                  data-testid="draft-restored-banner"
                  className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <Save className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-900">{loc.draftRestoredTitle}</div>
                      <p className="text-amber-800 text-[11px] mt-0.5">{loc.draftRestoredSub}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDiscardDraftAndResetSample}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold shrink-0 cursor-pointer transition-colors"
                  >
                    {loc.draftDiscardBtn}
                  </button>
                </div>
              )}

              {/* STEP 1: Language Selector & 1-Tap Sample Scenarios */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{loc.step1Title}</span>
                </div>
                <p className="text-xs text-slate-600">{loc.step1Hint}</p>

                {/* Prominent Language Switcher Buttons (Synchronized with active uiLanguage) */}
                <div className="grid grid-cols-3 gap-2">
                  {(['English', 'Marathi', 'Hindi'] as SupportedLanguage[]).map((lang) => {
                    const isSelectedLang = uiLanguage === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLoadSample(lang, 0)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelectedLang
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {lang === 'Marathi'
                            ? 'मराठी'
                            : lang === 'Hindi'
                            ? 'हिन्दी'
                            : 'English'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 1-Tap Sample Scenario Chips in the Active uiLanguage */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-500">
                    {t.sampleScenariosLabel}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentLangEntry.scenarios.map((scen, idx) => (
                      <button
                        key={scen.label}
                        type="button"
                        onClick={() => handleLoadSample(uiLanguage, idx)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          selectedScenarioIdx === idx
                            ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {CATEGORY_ICONS[scen.category]} {scen.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Client-Side Validation Alert Banner (Localized in Active uiLanguage) */}
              {hasValidationErrors && (
                <div
                  role="alert"
                  data-testid="form-validation-summary"
                  className="p-4 rounded-xl bg-red-50 border-2 border-red-400 text-red-950 text-xs space-y-2 shadow-2xs"
                >
                  <div className="font-bold flex items-center justify-between gap-2 text-sm text-red-900">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{loc.validationBannerTitle}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[11px]">
                      {Object.keys(formErrors).length} {loc.requiredBadge}
                    </span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-red-800 font-medium">
                    {Object.values(formErrors).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Controlled Citizen Request Submission Form (All 6 Core Fields Always Mounted & Validated) */}
              <form onSubmit={handleAddRequest} noValidate className="space-y-5 text-xs">
                {/* STEP 2: State, District, Category & Landmark */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                    {loc.step2Title}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field 1: State */}
                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        formErrors.state
                          ? 'bg-red-50/70 border-red-300'
                          : 'bg-slate-50/40 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <label
                          htmlFor="citizen-state-select"
                          className="font-bold text-slate-800 text-xs"
                        >
                          {t.stateLabel} <span className="text-red-600">*</span>
                        </label>
                        {formErrors.state ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            {loc.requiredBadge}
                          </span>
                        ) : formData.state.trim() ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {loc.validBadge}
                          </span>
                        ) : null}
                      </div>
                      <select
                        id="citizen-state-select"
                        name="state"
                        required
                        value={formData.state}
                        onBlur={() => handleFieldBlur('state')}
                        onChange={(e) => {
                          const newState = e.target.value;
                          updateFormField('state', newState);
                          const suggested = POPULAR_DISTRICTS_BY_STATE[newState]?.[0];
                          if (suggested) {
                            updateFormField('district', suggested);
                          }
                        }}
                        aria-invalid={Boolean(formErrors.state)}
                        aria-describedby={formErrors.state ? 'citizen-state-error' : undefined}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                          formErrors.state
                            ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20 focus:border-red-600'
                            : 'border-slate-300 focus:border-blue-600'
                        }`}
                      >
                        <option value="">-- {loc.statePlaceholder} --</option>
                        {STATES_INTELLIGENCE.map((s) => (
                          <option key={s.code} value={s.name}>
                            {getLocalizedStateLabel(s.name)}
                          </option>
                        ))}
                      </select>
                      {formErrors.state && (
                        <p
                          id="citizen-state-error"
                          role="alert"
                          className="text-xs text-red-700 font-semibold mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{formErrors.state}</span>
                        </p>
                      )}
                    </div>

                    {/* Field 2: District */}
                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        formErrors.district
                          ? 'bg-red-50/70 border-red-300'
                          : 'bg-slate-50/40 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <label
                          htmlFor="citizen-district-input"
                          className="font-bold text-slate-800 text-xs"
                        >
                          {t.districtLabel} <span className="text-red-600">*</span>
                        </label>
                        {formErrors.district ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            {loc.requiredBadge}
                          </span>
                        ) : formData.district.trim().length >= 2 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {loc.validBadge}
                          </span>
                        ) : null}
                      </div>
                      <input
                        id="citizen-district-input"
                        name="district"
                        type="text"
                        list="citizen-district-suggestions"
                        required
                        value={formData.district}
                        onBlur={() => handleFieldBlur('district')}
                        onChange={(e) => updateFormField('district', e.target.value)}
                        placeholder={loc.districtPlaceholder}
                        aria-invalid={Boolean(formErrors.district)}
                        aria-describedby={formErrors.district ? 'citizen-district-error' : undefined}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                          formErrors.district
                            ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20 focus:border-red-600'
                            : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      <datalist id="citizen-district-suggestions">
                        {districtSuggestions.map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                      {formErrors.district && (
                        <p
                          id="citizen-district-error"
                          role="alert"
                          className="text-xs text-red-700 font-semibold mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{formErrors.district}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick 1-Tap District Chips for the Selected State */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-500">
                      {loc.quickDistrictLabel}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {districtSuggestions.slice(0, 5).map((distName) => {
                        const isActiveDist =
                          formData.district.trim().toLowerCase() === distName.toLowerCase();
                        return (
                          <button
                            key={distName}
                            type="button"
                            onClick={() => updateFormField('district', distName)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              isActiveDist
                                ? 'bg-blue-50 text-blue-700 border-blue-400 font-semibold'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            📍 {distName.replace(' District', '')}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field 3: Category (Visual Quick-Select Buttons + Controlled Select Dropdown) */}
                  <div
                    className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                      formErrors.category
                        ? 'bg-red-50/70 border-red-300'
                        : 'bg-slate-50/40 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="citizen-category-select"
                        className="font-bold text-slate-800 block text-xs"
                      >
                        {t.categoryLabel} <span className="text-red-600">*</span>
                      </label>
                      {formErrors.category ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          {loc.requiredBadge}
                        </span>
                      ) : formData.category ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {loc.validBadge}
                        </span>
                      ) : null}
                    </div>

                    {/* Visual 1-Tap Category Cards for Top 6 Everyday Citizen Needs */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(
                        [
                          'Healthcare',
                          'Water',
                          'Roads',
                          'Education',
                          'Electricity',
                          'Sanitation',
                        ] as InfrastructureCategory[]
                      ).map((cat) => {
                        const isSelectedCat = formData.category === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => updateFormField('category', cat)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                              isSelectedCat
                                ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                                : formErrors.category
                                ? 'bg-white text-slate-800 border-red-300 hover:border-red-400'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <span className="text-base shrink-0">{CATEGORY_ICONS[cat]}</span>
                            <span className="text-xs leading-tight truncate">
                              {getLocalizedCategoryLabel(cat).split(' (')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Full Category Dropdown (Synchronized with Visual Cards) */}
                    <select
                      id="citizen-category-select"
                      name="category"
                      required
                      value={formData.category}
                      onBlur={() => handleFieldBlur('category')}
                      onChange={(e) =>
                        updateFormField(
                          'category',
                          e.target.value as InfrastructureCategory | ''
                        )
                      }
                      aria-invalid={Boolean(formErrors.category)}
                      aria-describedby={formErrors.category ? 'citizen-category-error' : undefined}
                      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                        formErrors.category
                          ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20 focus:border-red-600'
                          : 'border-slate-300 focus:border-blue-600'
                      }`}
                    >
                      <option value="">-- {loc.categoryPlaceholder} --</option>
                      {INFRASTRUCTURE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_ICONS[c]} {getLocalizedCategoryLabel(c)}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p
                        id="citizen-category-error"
                        role="alert"
                        className="text-xs text-red-700 font-semibold mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{formErrors.category}</span>
                      </p>
                    )}
                  </div>

                  {/* Field 4: Landmark & Village/Ward (Always Visible in Form) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className={`p-3 rounded-xl border transition-all ${
                        formErrors.landmark
                          ? 'bg-red-50/70 border-red-300'
                          : 'bg-slate-50/40 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <label
                          htmlFor="citizen-landmark-input"
                          className="font-bold text-slate-800 text-xs"
                        >
                          {t.landmarkLabel} <span className="text-red-600">*</span>
                        </label>
                        {formErrors.landmark ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            {loc.requiredBadge}
                          </span>
                        ) : formData.landmark.trim().length >= 2 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {loc.validBadge}
                          </span>
                        ) : null}
                      </div>
                      <input
                        id="citizen-landmark-input"
                        name="landmark"
                        type="text"
                        required
                        value={formData.landmark}
                        onBlur={() => handleFieldBlur('landmark')}
                        onChange={(e) => updateFormField('landmark', e.target.value)}
                        placeholder={loc.landmarkPlaceholder}
                        aria-invalid={Boolean(formErrors.landmark)}
                        aria-describedby={formErrors.landmark ? 'citizen-landmark-error' : undefined}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                          formErrors.landmark
                            ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20 focus:border-red-600'
                            : 'border-slate-300 focus:border-blue-600'
                        }`}
                      />
                      {formErrors.landmark && (
                        <p
                          id="citizen-landmark-error"
                          role="alert"
                          className="text-xs text-red-700 font-semibold mt-1.5 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>{formErrors.landmark}</span>
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl border bg-slate-50/40 border-slate-200/80">
                      <label
                        htmlFor="citizen-village-input"
                        className="font-bold text-slate-800 block mb-1.5 text-xs"
                      >
                        {t.villageLabel}
                      </label>
                      <input
                        id="citizen-village-input"
                        name="villageOrCity"
                        type="text"
                        value={formData.villageOrCity}
                        onChange={(e) => updateFormField('villageOrCity', e.target.value)}
                        placeholder={loc.villagePlaceholder}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick 1-Tap Landmark Chips (Localized in Active uiLanguage) */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-500">
                      {loc.quickLandmarkLabel}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {landmarkSuggestions.map((lm) => {
                        const isActiveLm =
                          formData.landmark.trim().toLowerCase() === lm.toLowerCase();
                        return (
                          <button
                            key={lm}
                            type="button"
                            onClick={() => updateFormField('landmark', lm)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              isActiveLm
                                ? 'bg-blue-50 text-blue-700 border-blue-400 font-semibold'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            📌 {lm}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* STEP 3: Urgency & Citizen Request Text (Description) */}
                <div className="space-y-4 pt-1">
                  <div className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                    {loc.step3Title}
                  </div>

                  {/* Field 5: Urgency (Controlled Select Dropdown + Quick-Select Pills) */}
                  <div
                    className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                      formErrors.urgency
                        ? 'bg-red-50/70 border-red-300'
                        : 'bg-slate-50/40 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="citizen-urgency-select"
                        className="font-bold text-slate-800 block text-xs"
                      >
                        {t.urgencyLabel} <span className="text-red-600">*</span>
                      </label>
                      {formErrors.urgency ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          {loc.requiredBadge}
                        </span>
                      ) : formData.urgency ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {loc.validBadge}
                        </span>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Critical', 'High', 'Medium', 'Low'] as const).map((urg) => {
                        const isSelectedUrg = formData.urgency === urg;
                        return (
                          <button
                            key={urg}
                            type="button"
                            onClick={() => updateFormField('urgency', urg)}
                            className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer text-center ${
                              isSelectedUrg
                                ? urg === 'Critical'
                                  ? 'bg-red-600 text-white border-red-600'
                                  : urg === 'High'
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-slate-900 text-white border-slate-900'
                                : formErrors.urgency
                                ? 'bg-white text-slate-700 border-red-300 hover:bg-red-50'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {loc.urgencyOptions[urg]}
                          </button>
                        );
                      })}
                    </div>

                    <select
                      id="citizen-urgency-select"
                      name="urgency"
                      required
                      value={formData.urgency}
                      onBlur={() => handleFieldBlur('urgency')}
                      onChange={(e) =>
                        updateFormField(
                          'urgency',
                          e.target.value as CitizenRequestFormData['urgency']
                        )
                      }
                      aria-invalid={Boolean(formErrors.urgency)}
                      aria-describedby={formErrors.urgency ? 'citizen-urgency-error' : undefined}
                      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none transition-all ${
                        formErrors.urgency
                          ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20 focus:border-red-600'
                          : 'border-slate-300 focus:border-blue-600'
                      }`}
                    >
                      <option value="">-- {loc.urgencyPlaceholder} --</option>
                      {(['Critical', 'High', 'Medium', 'Low'] as const).map((urg) => (
                        <option key={urg} value={urg}>
                          {loc.urgencyOptions[urg]}
                        </option>
                      ))}
                    </select>
                    {formErrors.urgency && (
                      <p
                        id="citizen-urgency-error"
                        role="alert"
                        className="text-xs text-red-700 font-semibold mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{formErrors.urgency}</span>
                      </p>
                    )}
                  </div>

                  {/* Field 6: Citizen Request Text (Description) with Live Character Counter */}
                  <div
                    className={`p-3 rounded-xl border space-y-2 transition-all ${
                      formErrors.text
                        ? 'bg-red-50/70 border-red-300'
                        : 'bg-slate-50/40 border-slate-200/80'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor="citizen-description-textarea"
                        className="text-xs font-bold text-slate-800"
                      >
                        {t.requestInputLabel} <span className="text-red-600">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {formErrors.text ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            {loc.requiredBadge}
                          </span>
                        ) : isTextValidLength ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {loc.validBadge}
                          </span>
                        ) : null}
                        <span
                          data-testid="textarea-char-count"
                          aria-live="polite"
                          className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold border ${
                            formErrors.text || !isTextValidLength
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : rawTextLength >= 450
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {rawTextLength} / {MAX_DESCRIPTION_CHARS} {loc.charCountSuffix}
                        </span>
                      </div>
                    </div>

                    <textarea
                      id="citizen-description-textarea"
                      name="text"
                      rows={4}
                      required
                      maxLength={MAX_DESCRIPTION_CHARS}
                      value={formData.text}
                      onBlur={() => handleFieldBlur('text')}
                      onChange={(e) => updateFormField('text', e.target.value)}
                      placeholder={t.requestPlaceholder}
                      aria-invalid={Boolean(formErrors.text)}
                      aria-describedby="citizen-description-counter-info"
                      className={`w-full rounded-xl border bg-white p-3.5 text-sm text-slate-900 leading-relaxed focus:outline-none transition-all ${
                        formErrors.text
                          ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20 focus:border-red-600'
                          : 'border-slate-300 focus:border-blue-600'
                      }`}
                    />

                    {/* Character Counter Progress Bar & Remaining Characters Footer */}
                    <div
                      id="citizen-description-counter-info"
                      className="space-y-1.5 pt-0.5"
                    >
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            formErrors.text || !isTextValidLength
                              ? 'bg-red-500'
                              : rawTextLength >= 450
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(4, charProgressPct)}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span
                          className={`font-medium ${
                            formErrors.text || !isTextValidLength
                              ? 'text-red-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {isTextValidLength ? loc.charReady : loc.charMinRequired}
                        </span>
                        <span className="font-mono text-slate-600">
                          {remainingChars} {loc.charRemainingSuffix}
                        </span>
                      </div>
                    </div>

                    {formErrors.text && (
                      <p
                        id="citizen-description-error"
                        role="alert"
                        className="text-xs text-red-700 font-semibold flex items-center gap-1 pt-0.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{formErrors.text}</span>
                      </p>
                    )}
                  </div>

                  {/* Supporting Document / Field Photo Attachment */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-between gap-2 text-slate-600">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {attachedFile ? `${attachedFile}` : t.footerNote}
                      </span>
                    </div>
                    {attachedFile ? (
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="text-[11px] font-semibold text-red-600 hover:underline shrink-0 cursor-pointer"
                      >
                        {loc.removeBtn}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setAttachedFile(
                            `${(formData.district || 'Community').replace(/\s+/g, '_')}_${activeCategory}_Photo.jpg`
                          )
                        }
                        className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:border-blue-500 text-[11px] font-semibold text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{loc.attachBtn}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Primary Submit & Gemini Analysis Button */}
                <button
                  type="submit"
                  disabled={geminiState === 'analyzing'}
                  className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  {geminiState === 'analyzing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t.btnSubmit}</span>
                    </>
                  )}
                </button>
              </form>

              {/* AI Processing Sequence State (Section 5 & Section 12) */}
              {geminiState === 'analyzing' && (
                <div
                  data-testid="gemini-processing-state"
                  className="p-4 rounded-xl bg-slate-950 text-white border border-blue-500/40 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-teal-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                      <span>Analyzing with Gemini AI...</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      Step {processingStepIdx + 1} / {AI_PROCESSING_STEPS.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
                    {AI_PROCESSING_STEPS.map((stepLabel, idx) => {
                      const isDone = idx < processingStepIdx;
                      const isCurrent = idx === processingStepIdx;
                      return (
                        <div
                          key={stepLabel}
                          className={`p-2 rounded-lg border text-[11px] flex items-center gap-1.5 transition-all ${
                            isCurrent
                              ? 'bg-blue-950/90 border-blue-400 text-white font-semibold'
                              : isDone
                              ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-400 shrink-0" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-600 shrink-0" />
                          )}
                          <span className="truncate">{stepLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Professional Fallback Error State if Gemini Request Fails (Section 3 & Section 13) */}
              {geminiState === 'error' && (
                <div
                  role="alert"
                  data-testid="gemini-error-state"
                  className="p-4 rounded-xl bg-red-950 text-red-100 border border-red-700 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{geminiErrorMsg || 'AI analysis temporarily unavailable.'}</span>
                    </div>
                  </div>
                  <p className="text-red-200/90 text-[11px] leading-relaxed">
                    The Google Gemini analysis service could not complete this request right now. You can retry Gemini AI analysis or register your request using standard district routing without AI analysis.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => executeGeminiAnalysis(formData)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-950 font-bold cursor-pointer transition-colors"
                    >
                      Retry Gemini AI Analysis
                    </button>
                    <button
                      type="button"
                      onClick={() => finalizeRequestSubmission(null, false)}
                      className="px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-red-100 border border-red-700 font-semibold cursor-pointer transition-colors"
                    >
                      Submit with Standard Routing (No AI)
                    </button>
                  </div>
                </div>
              )}

              {/* Friendly Live AI Summary Preview & On-Demand Gemini Analysis inside Form Card */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-teal-400">
                  <div className="flex items-center gap-2">
                    <span>{loc.liveAiPreviewBadge}</span>
                    {geminiState === 'analyzed' &&
                      liveGeminiAnalysis?.cacheKey === buildRequestCacheKey(formData) && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/70 font-mono text-[10px]">
                          ✓ Analyzed by Google Gemini
                        </span>
                      )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      {CATEGORY_ICONS[activeCategory]}{' '}
                      {getLocalizedCategoryLabel(activeCategory).split(' (')[0]}
                    </span>
                    <button
                      type="button"
                      disabled={geminiState === 'analyzing' || !isTextValidLength}
                      onClick={() => executeGeminiAnalysis(formData)}
                      className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>
                        {geminiState === 'analyzing'
                          ? 'Analyzing with Gemini AI...'
                          : 'Analyze with Gemini AI'}
                      </span>
                    </button>
                  </div>
                </div>

                {geminiState === 'analyzed' &&
                liveGeminiAnalysis?.cacheKey === buildRequestCacheKey(formData) ? (
                  <div className="space-y-2.5 pt-1 border-t border-slate-800">
                    {/* Multilingual Flow: Original Language -> AI Interpretation -> Standardized Development Need */}
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="text-slate-400">
                        Detected Language:{' '}
                        <strong className="text-white">
                          {String(liveGeminiAnalysis.data.language || uiLanguage)}
                        </strong>
                      </span>
                      <span className="text-slate-600">→</span>
                      <span className="text-teal-300">
                        Normalized Meaning:{' '}
                        <strong className="text-white">
                          {String(liveGeminiAnalysis.data.normalizedIssue || livePreviewAnalysis.extracted)}
                        </strong>
                      </span>
                      <span className="text-slate-600">→</span>
                      <span className="text-blue-300">
                        Category:{' '}
                        <strong className="text-white">
                          {String(liveGeminiAnalysis.data.category || activeCategory)}
                        </strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <div className="text-slate-400">Infrastructure Type</div>
                        <div className="font-semibold text-white mt-0.5">
                          {String(
                            liveGeminiAnalysis.data.infrastructureType ||
                              liveGeminiAnalysis.data.subcategory ||
                              livePreviewAnalysis.subcat
                          )}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <div className="text-slate-400">Location & Urgency</div>
                        <div className="font-semibold text-white mt-0.5">
                          {String(liveGeminiAnalysis.data.location || formData.district)} ·{' '}
                          <span className="text-amber-300">
                            {String(liveGeminiAnalysis.data.urgency || activeUrgency)}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <div className="text-slate-400">Confidence</div>
                        <div className="font-mono font-bold text-emerald-400 mt-0.5">
                          {String(liveGeminiAnalysis.data.confidence || '0.91')}
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-200 leading-snug text-[11px]">
                      <span className="text-slate-400 font-semibold">Summary: </span>
                      {String(liveGeminiAnalysis.data.summary || livePreviewAnalysis.translated)}
                    </div>
                    <div className="text-slate-300 leading-snug text-[11px]">
                      <span className="text-teal-400 font-semibold">AI Explanation: </span>
                      {String(liveGeminiAnalysis.data.reasoning || '')}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-200 leading-snug">
                    “{formData.text.trim() ? livePreviewAnalysis.translated : t.requestPlaceholder}”
                  </div>
                )}

                <div className="text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800">
                  <span>
                    {loc.liveAiTargetLabel}{' '}
                    <strong className="text-slate-200">{livePreviewAnalysis.dept}</strong>
                  </span>
                  <span className="font-mono text-teal-300">
                    {loc.liveAiClusterLabel} {livePreviewAnalysis.simCount}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT / FULL COLUMN: Graceful Post-Submission Confirmation + Live Request Feed */}
          <div className={`${showFormPanel ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-6`}>
            {/* Instant Submission Confirmation Card when Form Closes Gracefully */}
            {justSubmitted && (
              <div className="bg-emerald-950 text-white rounded-2xl p-6 border-2 border-emerald-500/60 shadow-lg space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-emerald-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-300">
                          {justSubmitted.id} · {loc.successBannerBadge}
                        </span>
                        {justSubmitted.analyzedByGemini ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-800/90 text-emerald-200 border border-emerald-600 font-mono text-[10px] font-semibold">
                            ✓ Analyzed by Google Gemini
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-900/80 text-amber-200 border border-amber-700 font-mono text-[10px]">
                            AI analysis temporarily unavailable
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold mt-0.5">
                        {loc.successCitizenTitle(
                          getLocalizedCategoryLabel(justSubmitted.category).split(' (')[0]
                        )}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{loc.submitAnotherBtn}</span>
                  </button>
                </div>

                {/* Multilingual Normalization Flow: Original Language -> AI Interpretation -> Standardized Development Need */}
                <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-800/90 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[11px]">
                      Detected Language: {justSubmitted.detectedLanguage}
                    </span>
                    <span className="text-emerald-400">→</span>
                    <span className="text-white font-medium">
                      Normalized Meaning: “{justSubmitted.extractedIssue}”
                    </span>
                    <span className="text-emerald-400">→</span>
                    <span className="px-2 py-0.5 rounded bg-teal-900 text-teal-200 font-semibold text-[11px]">
                      Category: {justSubmitted.category} ({justSubmitted.infrastructureType || justSubmitted.subcategory})
                    </span>
                  </div>
                  {justSubmitted.confidence && justSubmitted.analyzedByGemini && (
                    <span className="font-mono text-[11px] text-emerald-300">
                      Confidence: <strong className="text-white">{justSubmitted.confidence}</strong>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-900/50 border border-emerald-800">
                    <div className="text-emerald-300 font-semibold">
                      {loc.successOriginalLabel} ({justSubmitted.detectedLanguage})
                    </div>
                    <p className="text-white mt-1 font-medium leading-relaxed">
                      “{justSubmitted.citizenText}”
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-900/50 border border-emerald-800">
                    <div className="text-teal-300 font-semibold">
                      {loc.successNormalizedLabel}
                    </div>
                    <p className="text-emerald-100 mt-1 leading-relaxed">
                      “{justSubmitted.translatedMeaning}”
                    </p>
                  </div>
                </div>

                {/* Structured Gemini Output Details Grid (Section 2 & Section 7) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-800/80">
                    <div className="text-[10px] text-emerald-300 uppercase">Category</div>
                    <div className="font-bold text-white mt-0.5">{justSubmitted.category}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-800/80">
                    <div className="text-[10px] text-emerald-300 uppercase">Infrastructure Type</div>
                    <div className="font-bold text-white mt-0.5">
                      {justSubmitted.infrastructureType || justSubmitted.subcategory}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-800/80">
                    <div className="text-[10px] text-emerald-300 uppercase">Location & Urgency</div>
                    <div className="font-bold text-white mt-0.5">
                      {justSubmitted.district} · {justSubmitted.urgency}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-800/80">
                    <div className="text-[10px] text-emerald-300 uppercase">
                      Analytical Priority Score
                    </div>
                    <div className="font-mono font-bold text-teal-300 mt-0.5">
                      {justSubmitted.priorityScore} / 100
                    </div>
                  </div>
                </div>

                {justSubmitted.aiReasoning && (
                  <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-800/70 text-xs text-emerald-100 leading-relaxed">
                    <strong className="text-teal-300">AI Explanation & Reasoning: </strong>
                    {justSubmitted.aiReasoning}
                  </div>
                )}

                {/* Connected End-to-End Pipeline Navigation Strip (Section 4 & Section 11) */}
                {!isCitizen && (
                  <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-800 space-y-2 text-xs">
                    <div className="text-[11px] font-semibold text-emerald-300">
                      End-to-End Pipeline Connected — Follow This Request Across Modules:
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'ai-insights' as NavModule, label: '1. AI Insights & Cluster' },
                        { id: 'demand-hotspots' as NavModule, label: '2. Demand Hotspot' },
                        { id: 'infrastructure-gaps' as NavModule, label: '3. Gap & Priority Score' },
                        { id: 'recommendations' as NavModule, label: '4. Recommended Project' },
                        { id: 'impact-simulator' as NavModule, label: '5. Impact Simulator' },
                        { id: 'department-actions' as NavModule, label: '6. Department Action' },
                      ].map((step) => (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => {
                            onSelectRequestForAnalysis(justSubmitted);
                            onNavigate(step.id);
                          }}
                          className="px-2.5 py-1 rounded-md bg-emerald-900 hover:bg-emerald-800 text-emerald-100 border border-emerald-700 text-[11px] font-medium cursor-pointer transition-colors"
                        >
                          {step.label} →
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-emerald-200">
                    <span>
                      {loc.successStatusLabel}:{' '}
                      <strong className="text-white">{justSubmitted.status}</strong>
                    </span>
                    <span>
                      {loc.successUrgencyLabel}:{' '}
                      <strong className="text-white">
                        {loc.urgencyOptions[justSubmitted.urgency]}
                      </strong>
                    </span>
                    <span>
                      {loc.successLocationLabel}:{' '}
                      <strong className="text-white">
                        {justSubmitted.district}, {getLocalizedStateLabel(justSubmitted.state)}
                      </strong>
                    </span>
                    <span>
                      {loc.successLandmarkLabel}:{' '}
                      <strong className="text-white">{justSubmitted.landmark}</strong>
                    </span>
                  </div>
                  {isCitizen ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTrackedRequestId(justSubmitted.id);
                        setCitizenTab('status');
                      }}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>{loc.btnTrack6Stage}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRequestForAnalysis(justSubmitted);
                        onNavigate('ai-insights');
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.btnInspectAI}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Re-open Form Callout when Form is Closed and No Banner is Active */}
            {!showFormPanel && !justSubmitted && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{loc.openFormCtaTitle}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">{loc.openFormCtaSub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{loc.openFormBtn}</span>
                </button>
              </div>
            )}

            {/* Filter Bar & Request Status Feed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {isCitizen
                        ? citizenTab === 'my-requests' || feedScope === 'my'
                          ? `${loc.feedTitleMy} (${filteredRequests.length})`
                          : `${loc.feedTitleCommunity} (${filteredRequests.length})`
                        : `${t.trackTitle} (${filteredRequests.length})`}
                    </h2>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-mono text-[11px] flex items-center gap-1">
                      <Eye className="w-3 h-3 text-blue-600" />
                      {isCitizen ? loc.feedPrivacyBadgeCitizen : loc.feedPrivacyBadgeOfficer}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {isCitizen ? loc.feedSubCitizen : t.trackDesc}
                  </p>
                </div>

                {/* Scope Toggle & Filters in Active uiLanguage */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {isCitizen && (citizenTab === 'all' || citizenTab === 'submit') && (
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setFeedScope('my')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                          feedScope === 'my'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {loc.tabs.myRequests} ({myOwnRequests.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFeedScope('community')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                          feedScope === 'community'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {loc.tabs.community} ({requests.length})
                      </button>
                    </div>
                  )}

                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    aria-label="Filter by Language"
                    className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-slate-700 font-medium"
                  >
                    <option value="All">{loc.filterAllLanguages}</option>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.name} value={l.name}>
                        {l.nativeLabel}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    aria-label="Filter by Category"
                    className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-slate-700 font-medium"
                  >
                    <option value="All">{loc.filterAllCategories}</option>
                    {INFRASTRUCTURE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {getLocalizedCategoryLabel(c).split(' (')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Request Cards List */}
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2 text-xs">
                    <div className="font-bold text-slate-800 text-sm">{loc.emptyFeedTitle}</div>
                    <p className="text-slate-500">{loc.emptyFeedSub}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterLanguage('All');
                        setFilterCategory('All');
                        setFilterUrgency('All');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold cursor-pointer"
                    >
                      {loc.resetFiltersBtn}
                    </button>
                  </div>
                ) : (
                  filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        justSubmitted?.id === req.id || req.submittedAt === 'Just now'
                          ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/15'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      {/* Top Row: ID, Language, Category, Urgency, Location, Landmark, Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">{req.id}</span>
                          {req.submittedAt === 'Just now' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                              {loc.justNowBadge}
                            </span>
                          )}
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span className="font-semibold text-teal-800">
                            {CATEGORY_ICONS[req.category]}{' '}
                            {getLocalizedCategoryLabel(req.category).split(' (')[0]}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              req.urgency === 'Critical'
                                ? 'bg-red-100 text-red-800'
                                : req.urgency === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {loc.urgencyOptions[req.urgency]}
                          </span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span className="text-slate-700 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {req.district}, {getLocalizedStateLabel(req.state)}
                            {req.landmark ? ` (${req.landmark})` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              req.status === 'Resolved' ? 'text-emerald-700' : 'text-slate-900'
                            }`}
                          >
                            {loc.successStatusLabel}: {req.status}
                          </span>
                        </div>
                      </div>

                      {/* Citizen Text + AI Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-white border border-slate-200">
                          <div className="text-[11px] font-semibold text-slate-400 mb-1">
                            {loc.cardSubmittedLabel} ({req.detectedLanguage})
                          </div>
                          <p className="text-slate-900 font-medium leading-relaxed">
                            “{req.citizenText}”
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-white border border-slate-200">
                          <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-blue-700 mb-1">
                            <span>{loc.cardSummaryLabel}</span>
                            {req.analyzedByGemini && (
                              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Analyzed by Google Gemini
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 leading-relaxed">
                            “{req.translatedMeaning}”
                          </p>
                          {(req.infrastructureType || req.confidence) && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                              <span>
                                Normalized Issue:{' '}
                                <strong className="text-slate-800">{req.extractedIssue}</strong>
                              </span>
                              {req.infrastructureType && (
                                <span>
                                  Infrastructure:{' '}
                                  <strong className="text-slate-800">{req.infrastructureType}</strong>
                                </span>
                              )}
                              {req.confidence && (
                                <span className="font-mono">
                                  Confidence: <strong className="text-emerald-700">{req.confidence}</strong>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Role-Based Metadata Strip */}
                      {isCitizen ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600">
                          <div className="flex flex-wrap items-center gap-4">
                            <span>
                              {loc.cardClusterLabel}{' '}
                              <strong className="font-mono text-slate-900">
                                {req.similarRequestsCount} {loc.cardSimilarReports}
                              </strong>
                            </span>
                            <span>
                              {loc.cardRoutedTo}{' '}
                              <strong className="text-emerald-700">{req.assignedDepartment}</strong>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {!req.isOwnRequest && (
                              <button
                                type="button"
                                onClick={() => handleSupportCommunityRequest(req)}
                                className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                  req.supportedByUser
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                                }`}
                              >
                                {req.supportedByUser ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>{loc.btnSupported}</span>
                                  </>
                                ) : (
                                  <>
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>{loc.btnSupport}</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setTrackedRequestId(req.id);
                                setStatusSearchQuery('');
                                setCitizenTab('status');
                              }}
                              className="text-blue-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <span>{loc.btnTrack6Stage}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                          <div className="flex flex-wrap items-center gap-4 text-slate-600">
                            <span>
                              {loc.cardClusterLabel}{' '}
                              <strong className="font-mono text-slate-900">
                                {req.similarRequestsCount} {loc.cardSimilarReports}
                              </strong>
                            </span>
                            <span>
                              {loc.cardRoutedTo}{' '}
                              <strong className="text-slate-900">{req.assignedDepartment}</strong>
                            </span>
                            <span>
                              Priority:{' '}
                              <strong className="font-mono text-blue-700">
                                {req.priorityScore}/100
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {roleProfile.allowedModules.includes('ai-insights') ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectRequestForAnalysis(req);
                                  onNavigate('ai-insights');
                                }}
                                className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span>{t.btnInspectAI}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Compact 6-Stage Request Status Timeline Stepper */}
                      <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
                        {req.timeline.map((step, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded border ${
                              step.completed
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                                : 'bg-slate-100/70 border-slate-200 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center gap-1 font-semibold">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span className="truncate">{step.step}</span>
                            </div>
                            <div className="text-[10px] opacity-75 mt-0.5 truncate">
                              {step.timestamp}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
