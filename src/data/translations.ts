import { InfrastructureCategory, NavModule, SupportedLanguage } from '../types/platform';

export interface PlatformTranslations {
  brandTitle: string;
  brandSubtitle: string;
  topNav: {
    home: string;
    citizenRequests: string;
    aiInsights: string;
    demandHotspots: string;
    impactSimulator: string;
  };
  searchButton: string;
  searchPlaceholder: string;
  searchTryLabel: string;
  copilotButton: string;
  sidebarGroups: {
    'Citizen Gateway': string;
    'Intelligence & Policy': string;
    'Governance & Data': string;
  };
  navModules: Record<string, string>;
  dpgBadge: string;
  dpgSub: string;
  subHeaderGridStatus: string;
  alertsLabel: string;
  markAllRead: string;
  notificationsHeader: string;
  roles: {
    Policymaker: string;
    Officer: string;
    Citizen: string;
    Administrator: string;
  };
  footerDataSources: string;
  footerPrototypeNote: string;
  home: {
    heroBadge1: string;
    heroBadge2: string;
    heroBadge3: string;
    heroTitle: string;
    heroSubtitle: string;
    btnSubmitRequest: string;
    btnExploreInsights: string;
    cap3Languages: string;
    capExplainable: string;
    capDatasets: string;
    liveTraceLabel: string;
    liveClusterTitle: string;
    citizenInputLabel: string;
    citizenInputQuote: string;
    aiClusterMatchLabel: string;
    similarRequestsValue: string;
    acrossVillagesValue: string;
    infraGapLabel: string;
    avgKmHospital: string;
    aiRecTitle: string;
    aiRecSub: string;
    btnSimulate: string;
    kpis: {
      totalRequests: string;
      statesUTs: string;
      districtsAnalyzed: string;
      activeHotspots: string;
      highPriorityAreas: string;
      citizensImpacted: string;
    };
    mapSectionBadge: string;
    mapSectionTitle: string;
    mapSectionDesc: string;
    btnOpenHotspotMatrix: string;
    btnExploreGapEngine: string;
    howItWorksBadge: string;
    howItWorksTitle: string;
    howItWorksSub: string;
    howItWorksSteps: {
      step: string;
      title: string;
      description: string;
    }[];
    storyBadge: string;
    storyTitle: string;
    btnAskCopilot: string;
    storyPipeline: {
      index: string;
      stage: string;
      detail: string;
    }[];
    techStackBadge: string;
    techStackTitle: string;
    techStackDesc: string;
    btnViewDataSources: string;
    trustBadge: string;
    trustTitle: string;
    trustDesc: string;
    trustNote: string;
    trustCards: {
      title: string;
      desc: string;
    }[];
  };
  citizenRequests: {
    badge: string;
    title: string;
    subtitle: string;
    tabSubmit: string;
    tabTrack: string;
    selectLangLabel: string;
    sampleScenariosLabel: string;
    requestInputLabel: string;
    requestInputHint: string;
    requestPlaceholder: string;
    stateLabel: string;
    districtLabel: string;
    villageLabel: string;
    categoryLabel: string;
    landmarkLabel: string;
    urgencyLabel: string;
    footerNote: string;
    btnSubmitting: string;
    btnSubmit: string;
    previewBadge: string;
    previewTitle: string;
    citizenSenderLabel: string;
    aiEngineSenderLabel: string;
    aiGreetingPrefix: string;
    aiGreetingSuffix: string;
    extractedHeader: string;
    labelCategory: string;
    labelLocation: string;
    labelIssue: string;
    labelUrgency: string;
    labelPriorityScore: string;
    labelAffectedPop: string;
    labelSimilarReqs: string;
    registeredTitle: string;
    assignedDeptLabel: string;
    statusLabel: string;
    btnInspectAI: string;
    btnTrackTimeline: string;
    btnSimulateImpact: string;
    pipelineBadge: string;
    pipelineTitle: string;
    pipelineSub: string;
    pipelineStages: string[];
    trackBadge: string;
    trackTitle: string;
    trackDesc: string;
    sampleIdsLabel: string;
    lifecycleTitle: string;
  };
  aiInsights: {
    badge: string;
    title: string;
    subtitle: string;
    btnViewRecommendations: string;
    deepInspectionBadge: string;
    deepInspectionTitle: string;
    collectiveBadge: string;
    collectiveTitle: string;
    collectiveDesc: string;
  };
  demandHotspots: {
    badge: string;
    title: string;
    subtitle: string;
    scatterBadge: string;
    scatterTitle: string;
    rankedTitle: string;
  };
  infrastructureGaps: {
    badge: string;
    title: string;
    subtitle: string;
    btnSimulateClosure: string;
    whyPrioritizedTitle: string;
  };
  recommendations: {
    badge: string;
    title: string;
    subtitle: string;
    btnViewEvidence: string;
    btnSimulateImpact: string;
    btnSendToDept: string;
    btnRoutedToDept: string;
  };
  impactSimulator: {
    badge: string;
    title: string;
    subtitle: string;
    beforeTitle: string;
    afterTitle: string;
    whyProjectTitle: string;
    btnRouteToDept: string;
  };
  departmentActions: {
    badge: string;
    title: string;
    subtitle: string;
    updateStatusLabel: string;
    assignOfficerLabel: string;
    btnEscalate: string;
  };
  analytics: {
    badge: string;
    title: string;
    subtitle: string;
  };
  dataSources: {
    badge: string;
    title: string;
    subtitle: string;
  };
  copilot: {
    badge: string;
    title: string;
    welcome: string;
    suggestedLabel: string;
    placeholder: string;
    askBtn: string;
    questions: string[];
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, PlatformTranslations> = {
  English: {
    brandTitle: 'National Infrastructure Intelligence',
    brandSubtitle: 'Turning Citizen Voices into Better Infrastructure Decisions',
    topNav: {
      home: 'Home',
      citizenRequests: 'Citizen Requests',
      aiInsights: 'AI Insights',
      demandHotspots: 'Demand Hotspots',
      impactSimulator: 'Impact Simulator',
    },
    searchButton: 'Search Intelligence…',
    searchPlaceholder: 'Search e.g. “Pune healthcare”, “Maharashtra water”, “high priority districts”…',
    searchTryLabel: 'Try:',
    copilotButton: 'Policy Copilot',
    sidebarGroups: {
      'Citizen Gateway': 'Citizen Gateway',
      'Intelligence & Policy': 'Intelligence & Policy',
      'Governance & Data': 'Governance & Data',
    },
    navModules: {
      home: '01. Home',
      'citizen-requests': '02. Citizen Requests',
      'ai-insights': '03. AI Insights',
      'demand-hotspots': '04. Demand Hotspots',
      'infrastructure-gaps': '05. Infrastructure Gaps',
      recommendations: '06. Recommendations',
      'impact-simulator': '07. Impact Simulator',
      'department-actions': '08. Officer / Dept Actions',
      analytics: '09. Analytics',
      'data-sources': '10. Data Sources',
    },
    dpgBadge: 'Digital Public Good',
    dpgSub: 'Explainable AI · Open Schema · English, Marathi & Hindi',
    subHeaderGridStatus: '● National Infrastructure Intelligence Grid',
    alertsLabel: 'Alerts',
    markAllRead: 'Mark all read',
    notificationsHeader: 'National Intelligence Notifications',
    roles: {
      Policymaker: 'Role: Policymaker',
      Officer: 'Role: Nodal Officer',
      Citizen: 'Role: Citizen',
      Administrator: 'Role: Administrator',
    },
    footerDataSources: 'Data Sources & Architecture',
    footerPrototypeNote: 'Hackathon Prototype (Simulated Datasets)',
    home: {
      heroBadge1: 'Digital Public Infrastructure Prototype',
      heroBadge2: 'Multilingual AI Policy Intelligence',
      heroBadge3: 'National Scale',
      heroTitle: 'Turning Citizen Voices into Better Infrastructure Decisions',
      heroSubtitle:
        'An AI-powered platform that transforms citizen development requests in English, Marathi, and Hindi into data-driven infrastructure priorities for India. Consolidating community feedback with demographic indicators, facility availability, and public investment intelligence.',
      btnSubmitRequest: 'Submit a Request',
      btnExploreInsights: 'Explore National Insights',
      cap3Languages: '3 Languages Supported (English, Marathi & Hindi)',
      capExplainable: 'Explainable Priority Scoring',
      capDatasets: 'Simulated Public Datasets Ready for API Integration',
      liveTraceLabel: 'Live End-to-End Intelligence Trace',
      liveClusterTitle: 'Cluster #CLU-MH-HEALTH-01 · Pune District',
      citizenInputLabel: 'Citizen Input (English / Marathi / Hindi Text)',
      citizenInputQuote:
        '“There is no proper healthcare facility near our village and we need to travel very far for treatment.”',
      aiClusterMatchLabel: 'AI Cluster Match',
      similarRequestsValue: '387 Similar Requests',
      acrossVillagesValue: 'Across 42 nearby villages',
      infraGapLabel: 'Infrastructure Gap',
      avgKmHospital: 'Avg 17.4 km to hospital',
      aiRecTitle: 'AI Recommendation: Community Healthcare Centre',
      aiRecSub: 'Routed to Health Department · 62,000+ Estimated Beneficiaries',
      btnSimulate: 'Simulate',
      kpis: {
        totalRequests: 'Citizen Requests Aggregated',
        statesUTs: 'States & Union Territories',
        districtsAnalyzed: 'Districts Analyzed',
        activeHotspots: 'Active Demand Hotspots',
        highPriorityAreas: 'High-Priority Areas',
        citizensImpacted: 'Citizens Potentially Impacted',
      },
      mapSectionBadge: 'National Spatial Intelligence Preview',
      mapSectionTitle: 'Real-Time Demand Hotspots & Infrastructure Gaps Across India',
      mapSectionDesc:
        'Inspect regional request density, multi-sector infrastructure availability deficits, and capital investment alignment across all 36 States & Union Territories.',
      btnOpenHotspotMatrix: 'Open Hotspot Matrix',
      btnExploreGapEngine: 'Explore Gap Engine',
      howItWorksBadge: 'Core Intelligence Architecture',
      howItWorksTitle: 'How the Platform Works',
      howItWorksSub: 'End-to-end pipeline from local citizen text to explainable capital allocation',
      howItWorksSteps: [
        {
          step: '01. Collect',
          title: 'Multilingual Text & Messaging Ingestion',
          description:
            'Citizens submit local development needs in English, Marathi, and Hindi via accessible text and messaging-style interfaces without complex forms.',
        },
        {
          step: '02. Understand',
          title: 'NLP Normalization & Entity Extraction',
          description:
            'AI detects English, Marathi, or Hindi script/transliteration, normalizes meaning, extracts location landmarks, and classifies sector & urgency.',
        },
        {
          step: '03. Analyse',
          title: 'Collective Clustering & Public Data Fusion',
          description:
            'Thousands of duplicate reports are grouped into single underlying issues and combined with demographic, infrastructure, and fiscal datasets.',
        },
        {
          step: '04. Prioritize',
          title: 'Explainable Priority & Gap Scoring',
          description:
            'Transparent mathematical weights calculate an auditable 0–100 Priority Score based on demand, population impact, gap severity, and investment.',
        },
        {
          step: '05. Recommend',
          title: 'Project Routing & Impact Simulation',
          description:
            'Policymakers receive concrete infrastructure project recommendations, simulate before/after beneficiary impact, and route cases to departments.',
        },
      ],
      storyBadge: 'From Fragmented Feedback to National Action',
      storyTitle: 'The Digital Public Good Transformation Chain',
      btnAskCopilot: 'Ask Development Intelligence Copilot',
      storyPipeline: [
        { index: '01', stage: 'Millions of citizens', detail: '12.8M+ community voices across 36 States & UTs' },
        { index: '02', stage: 'Fragmented requests', detail: 'Unstructured text in English, Marathi & Hindi' },
        { index: '03', stage: 'AI understands & groups them', detail: '5,284 complaints → 1 collective infrastructure issue' },
        { index: '04', stage: 'Public data provides context', detail: 'Census, health registries & capital outlay joined' },
        { index: '05', stage: 'Infrastructure gaps become visible', detail: 'Multi-sector availability vs demand scored (0–100)' },
        { index: '06', stage: 'Demand hotspots emerge', detail: '1,284 geographic clusters ranked by severity' },
        { index: '07', stage: 'AI recommends priorities', detail: 'Explainable 88/100 Priority Score with full audit trail' },
        { index: '08', stage: 'Government departments act', detail: 'Automated routing to Health, PWD, Jal Shakti & Education' },
        { index: '09', stage: 'Impact simulated & measured', detail: 'Pre-sanction modeling of access distance & beneficiaries' },
      ],
      techStackBadge: 'National Digital Public Infrastructure Stack',
      techStackTitle: 'AI, Geospatial, Cloud & Public Data Ecosystem',
      techStackDesc:
        'Built on enterprise-grade generative AI, predictive modelling, geospatial satellite intelligence, and authoritative national open data portals.',
      btnViewDataSources: 'View Data Sources & Architecture',
      trustBadge: 'Trust, Privacy & Responsible AI Governance',
      trustTitle: 'Designed as an Auditable, Privacy-Preserving Digital Public Good',
      trustDesc:
        'The platform separates personally identifiable citizen metadata from aggregate policy intelligence. Every AI priority score is mathematically explainable and auditable by district collectors, line ministries, and citizens.',
      trustNote:
        'Note: Hackathon prototype using realistic simulated national datasets ready for production API integration.',
      trustCards: [
        {
          title: 'Data Minimization',
          desc: 'Zero PII required for demand clustering; requests are anonymized at ingestion.',
        },
        {
          title: 'Role-Based Access',
          desc: 'Granular views for Citizens, District Officers, Policymakers, and Administrators.',
        },
        {
          title: 'Secure Processing',
          desc: 'Server-side AI inference with strict schema validation and encrypted transport.',
        },
        {
          title: 'Full Audit Trail',
          desc: 'Every status change, officer assignment, and escalation is time-stamped.',
        },
        {
          title: 'Responsible AI',
          desc: 'Bias-mitigated scoring ensures remote and tribal habitations are never under-weighted.',
        },
        {
          title: 'Explainable Scoring',
          desc: 'Transparent additive formula (+Demand, +Impact, +Gap, -Existing Investment).',
        },
      ],
    },
    citizenRequests: {
      badge: 'Citizen Voice & Multilingual Ingestion Layer',
      title: 'Tell Us What Your Community Needs',
      subtitle:
        'Submit development requests in English, Marathi (मराठी), or Hindi (हिन्दी) via text. Our AI clusters similar reports across villages to elevate local needs into national priorities.',
      tabSubmit: 'Submit Community Request',
      tabTrack: 'Track Request ID',
      selectLangLabel: 'Select Language (3 Languages Supported: English, Marathi, Hindi)',
      sampleScenariosLabel: 'Click a sample request scenario to test:',
      requestInputLabel: 'Community Development Request (Text Message Input)',
      requestInputHint: 'Type in English, मराठी (Marathi), or हिन्दी (Hindi / Hinglish)',
      requestPlaceholder: 'Describe the development issue in your area…',
      stateLabel: 'State',
      districtLabel: 'District',
      villageLabel: 'City / Village / Block',
      categoryLabel: 'Category',
      landmarkLabel: 'Nearest Landmark / Locality',
      urgencyLabel: 'Community Urgency Level',
      footerNote: 'Text-only Digital Public Good gateway · Anonymized cluster indexing',
      btnSubmitting: 'Running Multilingual AI Analysis…',
      btnSubmit: 'Submit Request',
      previewBadge: 'Messaging-Style AI Extraction Preview',
      previewTitle: 'National Citizen Request Gateway',
      citizenSenderLabel: 'Citizen',
      aiEngineSenderLabel: 'National AI Intelligence Engine',
      aiGreetingPrefix: '“Thank you. We identified this as a ',
      aiGreetingSuffix: ' Infrastructure request.”',
      extractedHeader: 'Extracted Infrastructure Intelligence',
      labelCategory: 'Category: ',
      labelLocation: 'Location: ',
      labelIssue: 'Issue: ',
      labelUrgency: 'Urgency: ',
      labelPriorityScore: 'Priority Score: ',
      labelAffectedPop: 'Potentially affected population: ',
      labelSimilarReqs: 'Similar requests nearby: ',
      registeredTitle: 'Request Registered & Clustered',
      assignedDeptLabel: 'Assigned Department: ',
      statusLabel: 'Status: ',
      btnInspectAI: 'Inspect Full AI Analysis',
      btnTrackTimeline: 'Track Request Timeline',
      btnSimulateImpact: 'Simulate Project Impact',
      pipelineBadge: 'Multilingual Text AI Pipeline (English · Marathi · Hindi)',
      pipelineTitle: 'AI Understanding & Semantic Normalization Flow',
      pipelineSub: '100% Text-Based NLP Pipeline · Supports Native Devanagari & Transliterated Scripts',
      pipelineStages: [
        '01. Original Request',
        '02. Language Detection',
        '03. Translation / Normalization',
        '04. Issue Extraction',
        '05. Category',
        '06. Location',
        '07. Urgency & Score',
      ],
      trackBadge: 'Transparent Citizen Audit Trail',
      trackTitle: 'Track Development Request Status',
      trackDesc: 'Enter any Request ID (e.g., REQ-MH-92831) to inspect its live AI clustering, department assignment, and execution stage.',
      sampleIdsLabel: 'Sample Request IDs:',
      lifecycleTitle: 'End-to-End Resolution Lifecycle',
    },
    aiInsights: {
      badge: 'National Command Centre & AI Analysis Engine',
      title: 'National Development Intelligence',
      subtitle:
        'Real-time synthesis of English, Marathi, and Hindi citizen text feedback, collective clustering, and regional infrastructure gap telemetry.',
      btnViewRecommendations: 'View AI Recommendations',
      deepInspectionBadge: 'Deep Request-Level NLP Inspection',
      deepInspectionTitle: 'AI Request Analysis & Spatial Clustering',
      collectiveBadge: 'Collective Voice & Duplicate Intelligence Engine',
      collectiveTitle: 'Collective Demand Detection',
      collectiveDesc:
        'Instead of treating thousands of messages as isolated complaints, semantic clustering groups English, Marathi, and Hindi reports into unified macro-infrastructure gaps.',
    },
    demandHotspots: {
      badge: 'Geospatial Demand & Fiscal Alignment Matrix',
      title: 'Demand Hotspots',
      subtitle:
        'Identify high-priority districts where citizen demand surges ahead of existing public infrastructure availability and capital outlay.',
      scatterBadge: 'Fiscal Misalignment & Unmet Need Detector',
      scatterTitle: 'Citizen Demand vs Public Investment',
      rankedTitle: 'Ranked District Demand Hotspots',
    },
    infrastructureGaps: {
      badge: 'Multi-Sector Deficit & Explainable AI Scoring Engine',
      title: 'Infrastructure Gap Intelligence',
      subtitle:
        'Quantifying the delta between citizen demand and physical facility availability across 8 essential infrastructure sectors.',
      btnSimulateClosure: 'Simulate Gap Closure',
      whyPrioritizedTitle: 'Why is this area prioritized?',
    },
    recommendations: {
      badge: 'Policy Decision Support & Project Sanction Engine',
      title: 'AI Development Recommendations',
      subtitle:
        'High-impact infrastructure projects synthesized from clustered citizen demand, regional gap scores, and capital investment shortfalls.',
      btnViewEvidence: 'View Evidence',
      btnSimulateImpact: 'Simulate Impact',
      btnSendToDept: 'Send to Department',
      btnRoutedToDept: 'Routed to Department ✓',
    },
    impactSimulator: {
      badge: 'What-If Policy & Capital Allocation Modeling',
      title: 'Development Impact Simulator',
      subtitle:
        'Model how proposed infrastructure investments reduce citizen access distance, serve underserved populations, and resolve clustered demand before sanctioning funds.',
      beforeTitle: 'Before Simulation',
      afterTitle: 'After Simulation',
      whyProjectTitle: 'Why this project?',
      btnRouteToDept: 'Route to Department Action Panel',
    },
    departmentActions: {
      badge: 'Inter-Ministerial Routing & District Execution Console',
      title: 'Officer & Department Action Panel',
      subtitle:
        'Automated category-based routing, nodal officer assignment, priority escalation, and end-to-end audit trail tracking.',
      updateStatusLabel: 'Update Workflow Status',
      assignOfficerLabel: 'Assign Nodal Officer',
      btnEscalate: 'Escalate Priority',
    },
    analytics: {
      badge: 'Macro-Policy Telemetry & Longitudinal Trends',
      title: 'National Infrastructure Analytics',
      subtitle:
        'Longitudinal analysis of citizen demand velocity, regional gap distributions, inter-departmental workload, and resolution outcomes.',
    },
    dataSources: {
      badge: 'Digital Public Infrastructure Interoperability & Schema Catalog',
      title: 'National Data Sources & System Architecture',
      subtitle:
        'Designed as an open, modular Digital Public Good powered by Google Cloud AI, Geospatial intelligence, and official government open data registries.',
    },
    copilot: {
      badge: 'AI Policy Assistant (English · मराठी · हिन्दी)',
      title: 'Development Intelligence Copilot',
      welcome:
        'Welcome to the Development Intelligence Copilot. Ask me in English, Marathi, or Hindi about district infrastructure gaps, Maharashtra demand trends, high-demand/low-investment quadrants, or explainable priority scores.',
      suggestedLabel: 'Suggested Policy Questions:',
      placeholder: 'Ask in English, Marathi, or Hindi…',
      askBtn: 'Ask',
      questions: [
        'Which districts have the highest water infrastructure gaps?',
        'What are the biggest development demands in Maharashtra?',
        'Show areas where citizen demand is high but investment is low.',
        'Why is Pune District prioritized?',
        'What are the top infrastructure needs this month?',
      ],
    },
  },

  Marathi: {
    brandTitle: 'राष्ट्रीय पायाभूत सुविधा बुद्धिमत्ता (National Infrastructure Intelligence)',
    brandSubtitle: 'नागरिकांच्या आवाजाला उत्तम पायाभूत सुविधा निर्णयांमध्ये रूपांतरित करणे',
    topNav: {
      home: 'मुख्यपृष्ठ (Home)',
      citizenRequests: 'नागरिक विनंत्या',
      aiInsights: 'AI अंतर्दृष्टी',
      demandHotspots: 'मागणी हॉटस्पॉट्स',
      impactSimulator: 'प्रभाव सिम्युलेटर',
    },
    searchButton: 'माहिती शोधा…',
    searchPlaceholder: 'शोधा उदा. “Pune healthcare”, “Maharashtra water”, “high priority districts”…',
    searchTryLabel: 'पर्याय:',
    copilotButton: 'धोरण कोपायलट (Copilot)',
    sidebarGroups: {
      'Citizen Gateway': 'नागरिक प्रवेशद्वार',
      'Intelligence & Policy': 'बुद्धिमत्ता आणि धोरण',
      'Governance & Data': 'प्रशासन आणि डेटा',
    },
    navModules: {
      home: '01. मुख्यपृष्ठ (Home)',
      'citizen-requests': '02. नागरिक विनंत्या (Requests)',
      'ai-insights': '03. AI अंतर्दृष्टी (Insights)',
      'demand-hotspots': '04. मागणी हॉटस्पॉट्स (Hotspots)',
      'infrastructure-gaps': '05. पायाभूत सुविधा तफावत (Gaps)',
      recommendations: '06. AI शिफारसी (Recommendations)',
      'impact-simulator': '07. प्रभाव सिम्युलेटर (Simulator)',
      'department-actions': '08. अधिकारी / विभाग कार्यवाही',
      analytics: '09. विश्लेषण (Analytics)',
      'data-sources': '10. डेटा स्रोत (Data Sources)',
    },
    dpgBadge: 'डिजिटल पब्लिक गुड (DPG)',
    dpgSub: 'स्पष्टीकरणात्मक AI · मराठी, हिंदी आणि इंग्रजी समर्थन',
    subHeaderGridStatus: '● राष्ट्रीय पायाभूत सुविधा बुद्धिमत्ता ग्रीड सक्रिय',
    alertsLabel: 'सूचना (Alerts)',
    markAllRead: 'सर्व वाचल्याचे चिन्हांकित करा',
    notificationsHeader: 'राष्ट्रीय बुद्धिमत्ता सूचना',
    roles: {
      Policymaker: 'भूमिका: धोरणकर्ते (Policymaker)',
      Officer: 'भूमिका: नोडल अधिकारी (Officer)',
      Citizen: 'भूमिका: नागरिक (Citizen)',
      Administrator: 'भूमिका: प्रशासक (Admin)',
    },
    footerDataSources: 'डेटा स्रोत आणि प्रणाली रचना',
    footerPrototypeNote: 'हॅकाथॉन प्रोटोटाइप (सिम्युलेटेड राष्ट्रीय डेटासेट)',
    home: {
      heroBadge1: 'डिजिटल पब्लिक इन्फ्रास्ट्रक्चर प्रोटोटाइप',
      heroBadge2: 'बहुभाषिक AI धोरण बुद्धिमत्ता (मराठी · हिंदी · इंग्रजी)',
      heroBadge3: 'राष्ट्रीय स्तर',
      heroTitle: 'नागरिकांच्या आवाजाला उत्तम पायाभूत सुविधा निर्णयांमध्ये रूपांतरित करणे',
      heroSubtitle:
        'मराठी, हिंदी आणि इंग्रजी भाषेतील नागरिकांच्या विकास मागण्यांचे डेटा-आधारित राष्ट्रीय पायाभूत सुविधा प्राधान्यांमध्ये रूपांतर करणारे AI प्लॅटफॉर्म. लोकसंख्याशास्त्रीय डेटा, सुविधा उपलब्धता आणि सार्वजनिक गुंतवणुकीचे एकत्रित विश्लेषण.',
      btnSubmitRequest: 'विकास विनंती नोंदवा',
      btnExploreInsights: 'राष्ट्रीय अंतर्दृष्टी पहा',
      cap3Languages: '३ भाषा समर्थित (मराठी, हिंदी आणि इंग्रजी)',
      capExplainable: 'स्पष्टीकरणात्मक प्राधान्य गुण (Explainable Score)',
      capDatasets: 'शासकीय API एकीकरणासाठी सज्ज डेटासेट',
      liveTraceLabel: 'थेट एंड-टू-एंड बुद्धिमत्ता विश्लेषण',
      liveClusterTitle: 'क्लस्टर #CLU-MH-HEALTH-01 · पुणे जिल्हा',
      citizenInputLabel: 'नागरिकांचा संदेश (मराठी / हिंदी / इंग्रजी मजकूर)',
      citizenInputQuote:
        '“आमच्या गावात प्राथमिक आरोग्य केंद्र नाही, आपत्कालीन उपचारासाठी २२ किमी प्रवास करावा लागतो.”',
      aiClusterMatchLabel: 'AI क्लस्टर जुळणी',
      similarRequestsValue: '३८७ समान विनंत्या',
      acrossVillagesValue: 'जवळच्या ४२ गावांमधून',
      infraGapLabel: 'पायाभूत सुविधा तफावत',
      avgKmHospital: 'रुग्णालयाचे सरासरी अंतर १७.४ किमी',
      aiRecTitle: 'AI शिफारस: ग्रामीण सामुदायिक आरोग्य केंद्र (CHC)',
      aiRecSub: 'आरोग्य विभागाकडे वर्ग · ६२,०००+ अंदाजित लाभार्थी',
      btnSimulate: 'प्रभाव तपासा',
      kpis: {
        totalRequests: 'एकूण नागरिक विनंत्या',
        statesUTs: 'राज्ये आणि केंद्रशासित प्रदेश',
        districtsAnalyzed: 'विश्लेषित जिल्हे',
        activeHotspots: 'सक्रिय मागणी हॉटस्पॉट्स',
        highPriorityAreas: 'उच्च-प्राधान्य क्षेत्रे',
        citizensImpacted: 'संभाव्य लाभार्थी नागरिक',
      },
      mapSectionBadge: 'राष्ट्रीय भौगोलिक बुद्धिमत्ता नकाशा',
      mapSectionTitle: 'भारतातील रिअल-टाइम मागणी हॉटस्पॉट्स आणि पायाभूत सुविधा तफावत',
      mapSectionDesc:
        'सर्व ३६ राज्ये आणि केंद्रशासित प्रदेशांमधील प्रादेशिक मागणी घनता, सुविधांची कमतरता आणि भांडवली गुंतवणूक तपासा.',
      btnOpenHotspotMatrix: 'हॉटस्पॉट मॅट्रिक्स उघडा',
      btnExploreGapEngine: 'तफावत इंजिन पहा',
      howItWorksBadge: 'मुख्य कार्यप्रणाली रचना',
      howItWorksTitle: 'हे प्लॅटफॉर्म कसे कार्य करते (५ टप्पे)',
      howItWorksSub: 'स्थानिक नागरिकांच्या मजकूर संदेशापासून ते पारदर्शक निधी वाटपापर्यंतची प्रक्रिया',
      howItWorksSteps: [
        {
          step: '01. संकलन (Collect)',
          title: 'मराठी, हिंदी आणि इंग्रजी मजकूर संकलन',
          description:
            'नागरिक कोणत्याही क्लिष्ट फॉर्मशिवाय सोप्या मेसेजिंग इंटरफेसद्वारे मराठी, हिंदी किंवा इंग्रजी भाषेत आपल्या भागातील विकास गरजा नोंदवतात.',
        },
        {
          step: '02. आकलन (Understand)',
          title: 'NLP भाषांतर आणि समस्या निष्कर्षण',
          description:
            'AI स्वयंचलितपणे भाषा ओळखते, अर्थाचे प्रमाणीकरण करते, गाव/तालुका/खूण गाठते आणि क्षेत्र व निकड निश्चित करते.',
        },
        {
          step: '03. विश्लेषण (Analyse)',
          title: 'सामूहिक क्लस्टरिंग आणि शासकीय डेटा जोडणी',
          description:
            'हजारो समान तक्रारींचे एकाच मुख्य विकास समस्येत रूपांतर केले जाते आणि जनगणना, सुविधा व निधी डेटाशी जोडले जाते.',
        },
        {
          step: '04. प्राधान्यक्रम (Prioritize)',
          title: 'पारदर्शक प्राधान्य आणि तफावत गुणांकन',
          description:
            'मागणी, लोकसंख्या प्रभाव, सुविधा तफावत आणि विद्यमान गुंतवणूक यावर आधारित ०–१०० प्राधान्य गुण (Priority Score) मोजले जातात.',
        },
        {
          step: '05. शिफारस (Recommend)',
          title: 'प्रकल्प शिफारस आणि प्रभाव सिम्युलेशन',
          description:
            'धोरणकर्त्यांना ठोस विकास प्रकल्पांच्या शिफारसी मिळतात, निधी मंजूर करण्यापूर्वी प्रभाव तपासता येतो आणि संबंधित विभागाकडे पाठवता येतो.',
        },
      ],
      storyBadge: 'विखुरलेल्या तक्रारींपासून ते राष्ट्रीय कृतीपर्यंत',
      storyTitle: 'डिजिटल पब्लिक गुड परिवर्तन साखळी',
      btnAskCopilot: 'विकास बुद्धिमत्ता कोपायलटला विचारा',
      storyPipeline: [
        { index: '01', stage: 'कोटी नागरिकांचा सहभाग', detail: '३६ राज्ये व केंद्रशासित प्रदेशांमधील १२.८M+ आवाज' },
        { index: '02', stage: 'बहुभाषिक मजकूर विनंत्या', detail: 'मराठी, हिंदी आणि इंग्रजी भाषेतील संदेश' },
        { index: '03', stage: 'AI आकलन आणि गटवारी', detail: '५,२८४ तक्रारी → १ सामूहिक पायाभूत सुविधा समस्या' },
        { index: '04', stage: 'शासकीय डेटाचा संदर्भ', detail: 'जनगणना, आरोग्य नोंदी आणि भांडवली निधीची जोडणी' },
        { index: '05', stage: 'पायाभूत तफावत स्पष्ट होते', detail: 'उपलब्धता विरुद्ध मागणीचे अचूक गुणांकन (०–१००)' },
        { index: '06', stage: 'मागणी हॉटस्पॉट्सची ओळख', detail: 'तीव्रतेनुसार १,२८४ भौगोलिक क्लस्टर्सची क्रमवारी' },
        { index: '07', stage: 'AI प्रकल्प शिफारसी', detail: 'पूर्ण पुराव्यासह ८८/१०० प्राधान्य गुणांकन' },
        { index: '08', stage: 'शासकीय विभागांची तत्पर कृती', detail: 'आरोग्य, सार्वजनिक बांधकाम, जलशक्ती व शिक्षण विभागांकडे वर्ग' },
        { index: '09', stage: 'प्रभावाचे मोजमाप व सिम्युलेशन', detail: 'प्रवास अंतर व लाभार्थी संख्येचे अचूक अंदाज' },
      ],
      techStackBadge: 'राष्ट्रीय डिजिटल पब्लिक इन्फ्रास्ट्रक्चर स्टॅक',
      techStackTitle: 'AI, भू-स्थानिक, क्लाउड आणि सार्वजनिक डेटा इकोसिस्टम',
      techStackDesc:
        'जनरेटिव्ह AI, प्रेडिक्टिव्ह मॉडेलिंग, उपग्रह डेटा आणि अधिकृत शासकीय ओपन डेटा पोर्टल्सवर आधारित.',
      btnViewDataSources: 'डेटा स्रोत आणि आर्किटेक्चर पहा',
      trustBadge: 'विश्वास, गोपनीयता आणि जबाबदार AI शासन',
      trustTitle: 'पारदर्शक आणि गोपनीयता-जपणारे डिजिटल पब्लिक गुड',
      trustDesc:
        'हे प्लॅटफॉर्म नागरिकांच्या वैयक्तिक माहितीला धोरणात्मक विश्लेषणापासून वेगळे ठेवते. प्रत्येक AI प्राधान्य गुण गणितीयरित्या स्पष्ट आणि तपासणीयोग्य आहे.',
      trustNote:
        'टीप: हा हॅकाथॉन प्रोटोटाइप वास्तववादी सिम्युलेटेड राष्ट्रीय डेटासेट वापरतो आणि प्रत्यक्ष शासकीय API जोडणीसाठी सज्ज आहे.',
      trustCards: [
        {
          title: 'डेटा मिनिमायझेशन',
          desc: 'मागणी क्लस्टरिंगसाठी कोणत्याही वैयक्तिक माहितीची (PII) गरज नाही; सर्व विनंत्या अनामिक ठेवल्या जातात.',
        },
        {
          title: 'भूमिका-आधारित प्रवेश',
          desc: 'नागरिक, जिल्हा अधिकारी, धोरणकर्ते आणि प्रशासक यांच्यासाठी स्वतंत्र नियंत्रण कक्ष.',
        },
        {
          title: 'सुरक्षित AI प्रक्रिया',
          desc: 'काटेकोर स्कीमा पडताळणी आणि एनक्रिप्टेड सर्व्हर-साइड AI विश्लेषण.',
        },
        {
          title: 'पूर्ण ऑडिट ट्रेल',
          desc: 'प्रत्येक स्थिती बदल, अधिकारी नियुक्ती आणि प्राधान्य वाढीची वेळोवेळी नोंद.',
        },
        {
          title: 'जबाबदार AI (Responsible AI)',
          desc: 'दुर्गम आणि आदिवासी भागातील गरजांना योग्य प्राधान्य मिळण्यासाठी निष्पक्ष गुणांकन.',
        },
        {
          title: 'स्पष्टीकरणात्मक गुणांकन',
          desc: 'पारदर्शक सूत्र (+मागणी, +लोकसंख्या प्रभाव, +तफावत, -विद्यमान गुंतवणूक).',
        },
      ],
    },
    citizenRequests: {
      badge: 'नागरिक आवाज आणि बहुभाषिक मजकूर संकलन स्तर',
      title: 'तुमच्या गावाला किंवा परिसराला कशाची गरज आहे ते आम्हाला सांगा',
      subtitle:
        'तुमच्या पसंतीच्या भाषेत (मराठी, हिंदी किंवा इंग्रजी) मजकूर संदेशाद्वारे विकास विनंती नोंदवा. आमचे AI जवळच्या गावांमधील समान मागण्या एकत्र करून राष्ट्रीय प्राधान्य ठरवते.',
      tabSubmit: 'विकास विनंती नोंदवा',
      tabTrack: 'विनंती क्रमांक ट्रॅक करा',
      selectLangLabel: 'भाषा निवडा (३ भाषा समर्थित: इंग्रजी, मराठी, हिंदी)',
      sampleScenariosLabel: 'तपासणीसाठी नमुना विनंतीवर क्लिक करा:',
      requestInputLabel: 'सामुदायिक विकास विनंती (मजकूर संदेश / Text Input)',
      requestInputHint: 'मराठी (देवनागरी/रोमन), हिंदी किंवा इंग्रजीमध्ये टाइप करा',
      requestPlaceholder: 'तुमच्या परिसरातील विकास समस्येचे वर्णन करा…',
      stateLabel: 'राज्य (State)',
      districtLabel: 'जिल्हा (District)',
      villageLabel: 'शहर / गाव / तालुका',
      categoryLabel: 'पायाभूत सुविधा श्रेणी (Category)',
      landmarkLabel: 'जवळची खूण (Landmark)',
      urgencyLabel: 'निकडीची पातळी (Urgency)',
      footerNote: 'केवळ मजकूर-आधारित डिजिटल पब्लिक गुड गेटवे · अनामिक क्लस्टर इंडेक्सिंग',
      btnSubmitting: 'बहुभाषिक AI विश्लेषण सुरू आहे…',
      btnSubmit: 'विनंती सबमिट करा',
      previewBadge: 'मेसेजिंग-शैलीतील थेट AI निष्कर्षण पूर्वावलोकन',
      previewTitle: 'राष्ट्रीय नागरिक विनंती गेटवे',
      citizenSenderLabel: 'नागरिक',
      aiEngineSenderLabel: 'राष्ट्रीय AI बुद्धिमत्ता इंजिन',
      aiGreetingPrefix: '“धन्यवाद. आम्ही या विनंतीची ओळख ',
      aiGreetingSuffix: ' पायाभूत सुविधा मागणी म्हणून केली आहे.”',
      extractedHeader: 'निष्कर्षित पायाभूत सुविधा बुद्धिमत्ता (Extracted Intelligence)',
      labelCategory: 'श्रेणी: ',
      labelLocation: 'ठिकाण: ',
      labelIssue: 'मुख्य समस्या: ',
      labelUrgency: 'निकड: ',
      labelPriorityScore: 'प्राधान्य गुण (Priority Score): ',
      labelAffectedPop: 'संभाव्य प्रभावित लोकसंख्या: ',
      labelSimilarReqs: 'जवळपासच्या समान विनंत्या: ',
      registeredTitle: 'विनंती नोंदवली गेली आणि क्लस्टरशी जोडली गेली',
      assignedDeptLabel: 'नियुक्त विभाग: ',
      statusLabel: 'स्थिती: ',
      btnInspectAI: 'संपूर्ण AI विश्लेषण पहा',
      btnTrackTimeline: 'विनंती टाइमलाइन ट्रॅक करा',
      btnSimulateImpact: 'प्रकल्प प्रभाव सिम्युलेट करा',
      pipelineBadge: 'बहुभाषिक मजकूर AI पाइपलाइन (इंग्रजी · मराठी · हिंदी)',
      pipelineTitle: 'AI आकलन आणि अर्थ प्रमाणीकरण प्रवाह',
      pipelineSub: '१००% मजकूर-आधारित NLP पाइपलाइन · देवनागरी आणि रोमन लिपी समर्थित',
      pipelineStages: [
        '01. मूळ विनंती',
        '02. भाषा ओळख',
        '03. भाषांतर / प्रमाणीकरण',
        '04. समस्या निष्कर्षण',
        '05. श्रेणी (Category)',
        '06. ठिकाण (Location)',
        '07. निकड आणि गुण',
      ],
      trackBadge: 'पारदर्शक नागरिक ऑडिट ट्रेल',
      trackTitle: 'विकास विनंतीची सद्यस्थिती ट्रॅक करा',
      trackDesc: 'कोणताही विनंती क्रमांक (उदा. REQ-MH-92831) टाकून AI क्लस्टरिंग, विभाग नियुक्ती आणि कार्यवाहीचा टप्पा पहा.',
      sampleIdsLabel: 'नमुना विनंती क्रमांक:',
      lifecycleTitle: 'संपूर्ण निवारण जीवनचक्र (Resolution Lifecycle)',
    },
    aiInsights: {
      badge: 'राष्ट्रीय कमांड सेंटर आणि AI विश्लेषण इंजिन',
      title: 'राष्ट्रीय विकास बुद्धिमत्ता (AI Insights)',
      subtitle:
        'मराठी, हिंदी आणि इंग्रजी नागरिक प्रतिसाद, सामूहिक क्लस्टरिंग आणि प्रादेशिक पायाभूत सुविधा तफावतीचे रिअल-टाइम संकलन.',
      btnViewRecommendations: 'AI शिफारसी पहा',
      deepInspectionBadge: 'सखोल विनंती-स्तरीय NLP तपासणी',
      deepInspectionTitle: 'AI विनंती विश्लेषण आणि भौगोलिक क्लस्टरिंग',
      collectiveBadge: 'सामूहिक आवाज आणि डुप्लिकेट बुद्धिमत्ता इंजिन',
      collectiveTitle: 'सामूहिक मागणी शोध (Collective Demand Detection)',
      collectiveDesc:
        'हजारो संदेशांना स्वतंत्र तक्रारी मानण्याऐवजी, AI मराठी, हिंदी आणि इंग्रजी अहवालांना एकाच मुख्य पायाभूत सुविधा समस्येत एकत्रित करते.',
    },
    demandHotspots: {
      badge: 'भौगोलिक मागणी आणि निधी संरेखन मॅट्रिक्स',
      title: 'मागणी हॉटस्पॉट्स (Demand Hotspots)',
      subtitle:
        'ज्या जिल्ह्यांमध्ये नागरिकांची मागणी विद्यमान सुविधा आणि शासकीय गुंतवणुकीपेक्षा जास्त आहे अशा उच्च-प्राधान्य क्षेत्रांची ओळख.',
      scatterBadge: 'निधी विसंगती आणि अपूर्ण गरज शोधक',
      scatterTitle: 'नागरिक मागणी विरुद्ध सार्वजनिक गुंतवणूक',
      rankedTitle: 'क्रमवारीनुसार जिल्हा मागणी हॉटस्पॉट्स',
    },
    infrastructureGaps: {
      badge: 'बहु-क्षेत्रीय कमतरता आणि स्पष्टीकरणात्मक AI गुणांकन इंजिन',
      title: 'पायाभूत सुविधा तफावत बुद्धिमत्ता (Infrastructure Gaps)',
      subtitle:
        '८ अत्यावश्यक पायाभूत सुविधा क्षेत्रांमध्ये नागरिकांची मागणी आणि प्रत्यक्ष सुविधांची उपलब्धता यामधील अंतराचे मोजमाप.',
      btnSimulateClosure: 'तफावत निवारण सिम्युलेट करा',
      whyPrioritizedTitle: 'या क्षेत्राला प्राधान्य का दिले आहे?',
    },
    recommendations: {
      badge: 'धोरण निर्णय समर्थन आणि प्रकल्प मंजुरी इंजिन',
      title: 'AI विकास प्रकल्प शिफारसी (Recommendations)',
      subtitle:
        'सामूहिक नागरिक मागणी, प्रादेशिक तफावत गुण आणि भांडवली गुंतवणुकीच्या गरजेनुसार तयार केलेल्या उच्च-प्रभाव प्रकल्पांच्या शिफारसी.',
      btnViewEvidence: 'पुरावे पहा (View Evidence)',
      btnSimulateImpact: 'प्रभाव सिम्युलेट करा',
      btnSendToDept: 'विभागाकडे पाठवा',
      btnRoutedToDept: 'विभागाकडे वर्ग केले ✓',
    },
    impactSimulator: {
      badge: 'धोरण आणि भांडवली निधी वाटप मॉडेलिंग',
      title: 'विकास प्रभाव सिम्युलेटर (Impact Simulator)',
      subtitle:
        'निधी मंजूर करण्यापूर्वी प्रस्तावित प्रकल्पांमुळे नागरिकांचे प्रवास अंतर कसे कमी होईल आणि किती लोकसंख्येला लाभ मिळेल याचे सिम्युलेशन करा.',
      beforeTitle: 'सिम्युलेशनपूर्वी (Before Simulation)',
      afterTitle: 'सिम्युलेशननंतर (After Simulation)',
      whyProjectTitle: 'हा प्रकल्प का महत्त्वाचा आहे?',
      btnRouteToDept: 'विभाग कार्यवाही पॅनेलकडे पाठवा',
    },
    departmentActions: {
      badge: 'आंतर-विभागीय राउटिंग आणि जिल्हा अंमलबजावणी कक्ष',
      title: 'अधिकारी आणि विभाग कार्यवाही पॅनेल',
      subtitle:
        'श्रेणीनुसार स्वयंचलित विभाग वाटप, नोडल अधिकारी नियुक्ती, प्राधान्य वाढ आणि संपूर्ण ऑडिट ट्रेल ट्रॅकिंग.',
      updateStatusLabel: 'कामाची सद्यस्थिती अद्ययावत करा',
      assignOfficerLabel: 'नोडल अधिकारी नियुक्त करा',
      btnEscalate: 'प्राधान्य वाढवा (Escalate)',
    },
    analytics: {
      badge: 'धोरणात्मक टेलीमेट्री आणि दीर्घकालीन कल',
      title: 'राष्ट्रीय पायाभूत सुविधा विश्लेषण (Analytics)',
      subtitle:
        'नागरिकांच्या मागणीचा वेग, प्रादेशिक तफावत वितरण, विभागांचा कार्यभार आणि निवारण कामगिरीचे सखोल विश्लेषण.',
    },
    dataSources: {
      badge: 'डिजिटल पब्लिक इन्फ्रास्ट्रक्चर इंटरऑपरेबिलिटी आणि स्कीमा कॅटलॉग',
      title: 'राष्ट्रीय डेटा स्रोत आणि प्रणाली आर्किटेक्चर',
      subtitle:
        'Google Cloud AI, भू-स्थानिक बुद्धिमत्ता आणि अधिकृत शासकीय ओपन डेटा पोर्टल्सवर आधारित मॉड्यूलर डिजिटल पब्लिक गुड.',
    },
    copilot: {
      badge: 'AI धोरण सहाय्यक (मराठी · हिंदी · इंग्रजी)',
      title: 'विकास बुद्धिमत्ता कोपायलट (Policy Copilot)',
      welcome:
        'विकास बुद्धिमत्ता कोपायलटमध्ये आपले स्वागत आहे. मला मराठी, हिंदी किंवा इंग्रजीमध्ये जिल्ह्यांमधील पायाभूत सुविधा तफावत, महाराष्ट्रातील विकास मागण्या किंवा पुणे जिल्ह्याच्या प्राधान्य गुणांबद्दल प्रश्न विचारा.',
      suggestedLabel: 'सुचवलेले धोरणात्मक प्रश्न:',
      placeholder: 'मराठी, हिंदी किंवा इंग्रजीमध्ये प्रश्न विचारा…',
      askBtn: 'विचारा',
      questions: [
        'कोणत्या जिल्ह्यांमध्ये पाण्याच्या पायाभूत सुविधांची तफावत सर्वात जास्त आहे?',
        'महाराष्ट्रातील सर्वात मोठ्या विकास मागण्या कोणत्या आहेत?',
        'नागरिकांची मागणी जास्त पण गुंतवणूक कमी असलेले जिल्हे दाखवा.',
        'पुणे जिल्ह्याला उच्च प्राधान्य का दिले गेले आहे?',
        'या महिन्यातील सर्वोच्च पायाभूत सुविधा गरजा कोणत्या आहेत?',
      ],
    },
  },

  Hindi: {
    brandTitle: 'राष्ट्रीय अवसंरचना बुद्धिमत्ता (National Infrastructure Intelligence)',
    brandSubtitle: 'नागरिकों की आवाज़ को बेहतर बुनियादी ढाँचा निर्णयों में बदलना',
    topNav: {
      home: 'मुख्य पृष्ठ (Home)',
      citizenRequests: 'नागरिक अनुरोध',
      aiInsights: 'AI अंतर्दृष्टि',
      demandHotspots: 'माँग हॉटस्पॉट्स',
      impactSimulator: 'प्रभाव सिम्युलेटर',
    },
    searchButton: 'इंटेलिजेंस खोजें…',
    searchPlaceholder: 'खोजें जैसे “Pune healthcare”, “Maharashtra water”, “high priority districts”…',
    searchTryLabel: 'सुझाव:',
    copilotButton: 'नीति कोपायलट (Copilot)',
    sidebarGroups: {
      'Citizen Gateway': 'नागरिक प्रवेशद्वार',
      'Intelligence & Policy': 'बुद्धिमत्ता और नीति',
      'Governance & Data': 'शासन और डेटा',
    },
    navModules: {
      home: '01. मुख्य पृष्ठ (Home)',
      'citizen-requests': '02. नागरिक अनुरोध (Requests)',
      'ai-insights': '03. AI अंतर्दृष्टि (Insights)',
      'demand-hotspots': '04. माँग हॉटस्पॉट्स (Hotspots)',
      'infrastructure-gaps': '05. अवसंरचना अंतर (Gaps)',
      recommendations: '06. AI अनुशंसाएँ (Recommendations)',
      'impact-simulator': '07. प्रभाव सिम्युलेटर (Simulator)',
      'department-actions': '08. अधिकारी / विभाग कार्यवाही',
      analytics: '09. विश्लेषण (Analytics)',
      'data-sources': '10. डेटा स्रोत (Data Sources)',
    },
    dpgBadge: 'डिजिटल पब्लिक गुड (DPG)',
    dpgSub: 'व्याख्यात्मक AI · हिंदी, मराठी और अंग्रेज़ी समर्थित',
    subHeaderGridStatus: '● राष्ट्रीय अवसंरचना इंटेलिजेंस ग्रिड सक्रिय',
    alertsLabel: 'अलर्ट (Alerts)',
    markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    notificationsHeader: 'राष्ट्रीय इंटेलिजेंस सूचनाएँ',
    roles: {
      Policymaker: 'भूमिका: नीति निर्माता (Policymaker)',
      Officer: 'भूमिका: नोडल अधिकारी (Officer)',
      Citizen: 'भूमिका: नागरिक (Citizen)',
      Administrator: 'भूमिका: प्रशासक (Admin)',
    },
    footerDataSources: 'डेटा स्रोत और सिस्टम आर्किटेक्चर',
    footerPrototypeNote: 'हैकाथॉन प्रोटोटाइप (सिम्युलेटेड डेटासेट)',
    home: {
      heroBadge1: 'डिजिटल पब्लिक इन्फ्रास्ट्रक्चर प्रोटोटाइप',
      heroBadge2: 'बहुभाषी AI नीति बुद्धिमत्ता (हिंदी · मराठी · अंग्रेज़ी)',
      heroBadge3: 'राष्ट्रीय स्तर',
      heroTitle: 'नागरिकों की आवाज़ को बेहतर बुनियादी ढाँचा निर्णयों में बदलना',
      heroSubtitle:
        'एक AI-संचालित प्लेटफ़ॉर्म जो हिंदी, मराठी और अंग्रेज़ी में नागरिकों के विकास अनुरोधों को भारत के लिए डेटा-आधारित बुनियादी ढाँचा प्राथमिकताओं में बदलता है। जनसांख्यिकीय संकेतकों, सुविधा उपलब्धता और सार्वजनिक निवेश के साथ एकीकृत विश्लेषण।',
      btnSubmitRequest: 'विकास अनुरोध दर्ज करें',
      btnExploreInsights: 'राष्ट्रीय अंतर्दृष्टि देखें',
      cap3Languages: '३ भाषाएँ समर्थित (अंग्रेज़ी, मराठी और हिंदी)',
      capExplainable: 'पारदर्शी प्राथमिकता स्कोरिंग (Explainable Score)',
      capDatasets: 'सरकारी API एकीकरण के लिए तैयार डेटासेट',
      liveTraceLabel: 'लाइव एंड-टू-एंड इंटेलिजेंस ट्रेस',
      liveClusterTitle: 'क्लस्टर #CLU-MH-HEALTH-01 · पुणे ज़िला',
      citizenInputLabel: 'नागरिक संदेश (हिंदी / मराठी / अंग्रेज़ी टेक्स्ट)',
      citizenInputQuote:
        '“हमारे गाँव के पास कोई अच्छा अस्पताल नहीं है और इलाज के लिए 20 किमी दूर शहर जाना पड़ता है।”',
      aiClusterMatchLabel: 'AI क्लस्टर मिलान',
      similarRequestsValue: '३८७ समान अनुरोध',
      acrossVillagesValue: 'आसपास के ४२ गाँवों से',
      infraGapLabel: 'अवसंरचना अंतर (Gap)',
      avgKmHospital: 'अस्पताल की औसत दूरी १७.४ किमी',
      aiRecTitle: 'AI अनुशंसा: सामुदायिक स्वास्थ्य केंद्र (CHC)',
      aiRecSub: 'स्वास्थ्य विभाग को भेजा गया · ६२,०००+ अनुमानित लाभार्थी',
      btnSimulate: 'प्रभाव देखें',
      kpis: {
        totalRequests: 'कुल नागरिक अनुरोध',
        statesUTs: 'राज्य और केंद्र शासित प्रदेश',
        districtsAnalyzed: 'विश्लेषित ज़िले',
        activeHotspots: 'सक्रिय माँग हॉटस्पॉट्स',
        highPriorityAreas: 'उच्च-प्राथमिकता क्षेत्र',
        citizensImpacted: 'संभावित लाभार्थी नागरिक',
      },
      mapSectionBadge: 'राष्ट्रीय भू-स्थानिक इंटेलिजेंस मानचित्र',
      mapSectionTitle: 'भारत भर में रियल-टाइम माँग हॉटस्पॉट्स और अवसंरचना अंतर',
      mapSectionDesc:
        'सभी ३६ राज्यों और केंद्र शासित प्रदेशों में क्षेत्रीय अनुरोध घनत्व, बहु-क्षेत्रीय बुनियादी ढाँचे की कमी और पूंजी निवेश संरेखण का निरीक्षण करें।',
      btnOpenHotspotMatrix: 'हॉटस्पॉट मैट्रिक्स खोलें',
      btnExploreGapEngine: 'गैप इंजन देखें',
      howItWorksBadge: 'मुख्य इंटेलिजेंस आर्किटेक्चर',
      howItWorksTitle: 'यह प्लेटफ़ॉर्म कैसे काम करता है (५ चरण)',
      howItWorksSub: 'स्थानीय नागरिक टेक्स्ट संदेश से लेकर पारदर्शी बजट आवंटन तक की प्रक्रिया',
      howItWorksSteps: [
        {
          step: '01. संग्रह (Collect)',
          title: 'हिंदी, मराठी और अंग्रेज़ी टेक्स्ट संग्रह',
          description:
            'नागरिक बिना किसी जटिल फ़ॉर्म के सरल मैसेजिंग इंटरफ़ेस के माध्यम से हिंदी, मराठी या अंग्रेज़ी में अपनी स्थानीय विकास आवश्यकताएँ दर्ज करते हैं।',
        },
        {
          step: '02. समझ (Understand)',
          title: 'NLP अनुवाद और समस्या निष्कर्षण',
          description:
            'AI स्वतः भाषा (देवनागरी या रोमन) पहचानता है, अर्थ का मानकीकरण करता है, स्थान व लैंडमार्क निकालता है और श्रेणी व गंभीरता तय करता है।',
        },
        {
          step: '03. विश्लेषण (Analyse)',
          title: 'सामूहिक क्लस्टरिंग और सार्वजनिक डेटा संयोजन',
          description:
            'हज़ारों समान शिकायतों को एक मुख्य विकास मुद्दे में समूहित किया जाता है और जनगणना, बुनियादी ढाँचा व बजट डेटा के साथ जोड़ा जाता है।',
        },
        {
          step: '04. प्राथमिकता (Prioritize)',
          title: 'पारदर्शी प्राथमिकता और गैप स्कोरिंग',
          description:
            'माँग, जनसंख्या प्रभाव, सुविधा अंतर और मौजूदा निवेश के आधार पर ०–१०० प्राथमिकता स्कोर (Priority Score) की गणना की जाती है।',
        },
        {
          step: '05. अनुशंसा (Recommend)',
          title: 'परियोजना अनुशंसा और प्रभाव सिम्युलेशन',
          description:
            'नीति निर्माताओं को ठोस विकास परियोजनाओं की सिफारिशें मिलती हैं, बजट स्वीकृति से पहले प्रभाव का सिम्युलेशन होता है और विभागों को कार्य सौंपा जाता है।',
        },
      ],
      storyBadge: 'बिखरी हुई शिकायतों से राष्ट्रीय कार्रवाई तक',
      storyTitle: 'डिजिटल पब्लिक गुड परिवर्तन श्रृंखला',
      btnAskCopilot: 'विकास इंटेलिजेंस कोपायलट से पूछें',
      storyPipeline: [
        { index: '01', stage: 'करोड़ों नागरिकों की भागीदारी', detail: '३६ राज्यों व केंद्र शासित प्रदेशों से १२.८M+ आवाज़ें' },
        { index: '02', stage: 'बहुभाषी टेक्स्ट अनुरोध', detail: 'हिंदी, मराठी और अंग्रेज़ी में प्राप्त संदेश' },
        { index: '03', stage: 'AI समझता और समूहित करता है', detail: '५,२८४ शिकायतें → १ सामूहिक बुनियादी ढाँचा मुद्दा' },
        { index: '04', stage: 'सार्वजनिक डेटा संदर्भ देता है', detail: 'जनगणना, स्वास्थ्य रजिस्ट्री और पूंजीगत बजट का जुड़ाव' },
        { index: '05', stage: 'अवसंरचना अंतर स्पष्ट होता है', detail: 'उपलब्धता बनाम माँग का सटीक स्कोर (०–१००)' },
        { index: '06', stage: 'माँग हॉटस्पॉट उभरते हैं', detail: 'गंभीरता के आधार पर १,२८४ भौगोलिक क्लस्टरों की रैंकिंग' },
        { index: '07', stage: 'AI प्राथमिकताओं की सिफारिश करता है', detail: 'पूर्ण ऑडिट ट्रेल के साथ ८८/१०० प्राथमिकता स्कोर' },
        { index: '08', stage: 'सरकारी विभाग कार्रवाई करते हैं', detail: 'स्वास्थ्य, लोक निर्माण, जल शक्ति और शिक्षा विभाग को रूटिंग' },
        { index: '09', stage: 'प्रभाव का सिम्युलेशन और मापन', detail: 'यात्रा दूरी और लाभार्थियों की संख्या का पूर्व-आकलन' },
      ],
      techStackBadge: 'राष्ट्रीय डिजिटल पब्लिक इन्फ्रास्ट्रक्चर स्टैक',
      techStackTitle: 'AI, भू-स्थानिक, क्लाउड और सार्वजनिक डेटा इकोसिस्टम',
      techStackDesc:
        'जनरेटिव AI, प्रेडिक्टिव मॉडलिंग, सैटेलाइट इंटेलिजेंस और आधिकारिक राष्ट्रीय ओपन डेटा पोर्टल्स पर निर्मित।',
      btnViewDataSources: 'डेटा स्रोत और आर्किटेक्चर देखें',
      trustBadge: 'विश्वास, गोपनीयता और जिम्मेदार AI गवर्नेंस',
      trustTitle: 'ऑडिट करने योग्य और गोपनीयता-संरक्षित डिजिटल पब्लिक गुड',
      trustDesc:
        'यह प्लेटफ़ॉर्म नागरिकों की व्यक्तिगत पहचान को नीतिगत विश्लेषण से अलग रखता है। प्रत्येक AI प्राथमिकता स्कोर गणितीय रूप से पारदर्शी और ऑडिट करने योग्य है।',
      trustNote:
        'नोट: यह हैकाथॉन प्रोटोटाइप यथार्थवादी सिम्युलेटेड राष्ट्रीय डेटासेट का उपयोग करता है जो प्रोडक्शन API एकीकरण के लिए तैयार है।',
      trustCards: [
        {
          title: 'डेटा न्यूनीकरण (Data Minimization)',
          desc: 'माँग क्लस्टरिंग के लिए किसी व्यक्तिगत पहचान (PII) की आवश्यकता नहीं; अनुरोध अनाम रखे जाते हैं।',
        },
        {
          title: 'भूमिका-आधारित पहुँच',
          desc: 'नागरिकों, ज़िला अधिकारियों, नीति निर्माताओं और प्रशासकों के लिए अलग-अलग डैशबोर्ड।',
        },
        {
          title: 'सुरक्षित AI प्रोसेसिंग',
          desc: 'सख्त स्कीमा सत्यापन और एन्क्रिप्टेड ट्रांसपोर्ट के साथ सर्वर-साइड AI विश्लेषण।',
        },
        {
          title: 'पूर्ण ऑडिट ट्रेल',
          desc: 'प्रत्येक स्थिति परिवर्तन, अधिकारी नियुक्ति और एस्केलेशन का टाइम-स्टैम्प रिकॉर्ड।',
        },
        {
          title: 'जिम्मेदार AI (Responsible AI)',
          desc: 'निष्पक्ष स्कोरिंग सुनिश्चित करती है कि दूरदराज और आदिवासी क्षेत्रों की उपेक्षा न हो।',
        },
        {
          title: 'पारदर्शी स्कोरिंग सूत्र',
          desc: 'स्पष्ट योगात्मक सूत्र (+माँग, +जनसंख्या प्रभाव, +अंतर, -मौजूदा निवेश)।',
        },
      ],
    },
    citizenRequests: {
      badge: 'नागरिक आवाज़ और बहुभाषी टेक्स्ट संग्रह स्तर',
      title: 'हमें बताएं कि आपके समुदाय को किस विकास की आवश्यकता है',
      subtitle:
        'अपनी पसंदीदा भाषा (हिंदी, मराठी या अंग्रेज़ी) में टेक्स्ट संदेश के माध्यम से विकास अनुरोध दर्ज करें। हमारा AI गाँवों की समान रिपोर्टों को जोड़कर राष्ट्रीय प्राथमिकताएँ तय करता है।',
      tabSubmit: 'सामुदायिक अनुरोध दर्ज करें',
      tabTrack: 'अनुरोध ID ट्रैक करें',
      selectLangLabel: 'भाषा चुनें (३ भाषाएँ समर्थित: अंग्रेज़ी, मराठी, हिंदी)',
      sampleScenariosLabel: 'परीक्षण के लिए किसी नमूना अनुरोध पर क्लिक करें:',
      requestInputLabel: 'सामुदायिक विकास अनुरोध (टेक्स्ट संदेश इनपुट)',
      requestInputHint: 'हिंदी (देवनागरी या Hinglish), मराठी या अंग्रेज़ी में टाइप करें',
      requestPlaceholder: 'अपने क्षेत्र की विकास समस्या का वर्णन करें…',
      stateLabel: 'राज्य (State)',
      districtLabel: 'ज़िला (District)',
      villageLabel: 'शहर / गाँव / ब्लॉक',
      categoryLabel: 'अवसंरचना श्रेणी (Category)',
      landmarkLabel: 'पहचान चिह्न (Landmark)',
      urgencyLabel: 'सामुदायिक गंभीरता स्तर (Urgency)',
      footerNote: 'केवल टेक्स्ट-आधारित डिजिटल पब्लिक गुड गेटवे · अनाम क्लस्टर इंडेक्सिंग',
      btnSubmitting: 'बहुभाषी AI विश्लेषण चल रहा है…',
      btnSubmit: 'अनुरोध सबमिट करें',
      previewBadge: 'मैसेजिंग-शैली लाइव AI निष्कर्षण पूर्वावलोकन',
      previewTitle: 'राष्ट्रीय नागरिक अनुरोध गेटवे',
      citizenSenderLabel: 'नागरिक',
      aiEngineSenderLabel: 'राष्ट्रीय AI इंटेलिजेंस इंजन',
      aiGreetingPrefix: '“धन्यवाद। हमने इसे ',
      aiGreetingSuffix: ' बुनियादी ढाँचा अनुरोध के रूप में पहचाना है।”',
      extractedHeader: 'निष्कर्षित अवसंरचना इंटेलिजेंस (Extracted Intelligence)',
      labelCategory: 'श्रेणी: ',
      labelLocation: 'स्थान: ',
      labelIssue: 'मुख्य समस्या: ',
      labelUrgency: 'गंभीरता: ',
      labelPriorityScore: 'प्राथमिकता स्कोर: ',
      labelAffectedPop: 'संभावित प्रभावित जनसंख्या: ',
      labelSimilarReqs: 'आसपास के समान अनुरोध: ',
      registeredTitle: 'अनुरोध पंजीकृत और क्लस्टर से जोड़ा गया',
      assignedDeptLabel: 'नियुक्त विभाग: ',
      statusLabel: 'स्थिति: ',
      btnInspectAI: 'पूर्ण AI विश्लेषण देखें',
      btnTrackTimeline: 'अनुरोध टाइमलाइन ट्रैक करें',
      btnSimulateImpact: 'परियोजना प्रभाव सिम्युलेट करें',
      pipelineBadge: 'बहुभाषी टेक्स्ट AI पाइपलाइन (अंग्रेज़ी · मराठी · हिंदी)',
      pipelineTitle: 'AI समझ और अर्थ मानकीकरण प्रवाह',
      pipelineSub: '१००% टेक्स्ट-आधारित NLP पाइपलाइन · देवनागरी और रोमन लिपि समर्थित',
      pipelineStages: [
        '01. मूल अनुरोध',
        '02. भाषा पहचान',
        '03. अनुवाद / मानकीकरण',
        '04. समस्या निष्कर्षण',
        '05. श्रेणी (Category)',
        '06. स्थान (Location)',
        '07. गंभीरता और स्कोर',
      ],
      trackBadge: 'पारदर्शी नागरिक ऑडिट ट्रेल',
      trackTitle: 'विकास अनुरोध की स्थिति ट्रैक करें',
      trackDesc: 'कोई भी अनुरोध ID (जैसे REQ-MH-92831) दर्ज करके लाइव AI क्लस्टरिंग, विभाग आवंटन और प्रगति चरण देखें।',
      sampleIdsLabel: 'नमूना अनुरोध ID:',
      lifecycleTitle: 'एंड-टू-एंड समाधान जीवनचक्र (Resolution Lifecycle)',
    },
    aiInsights: {
      badge: 'राष्ट्रीय कमांड सेंटर और AI विश्लेषण इंजन',
      title: 'राष्ट्रीय विकास बुद्धिमत्ता (AI Insights)',
      subtitle:
        'हिंदी, मराठी और अंग्रेज़ी में नागरिक फीडबैक, सामूहिक क्लस्टरिंग और क्षेत्रीय बुनियादी ढाँचा अंतर का रियल-टाइम संश्लेषण।',
      btnViewRecommendations: 'AI अनुशंसाएँ देखें',
      deepInspectionBadge: 'गहन अनुरोध-स्तरीय NLP निरीक्षण',
      deepInspectionTitle: 'AI अनुरोध विश्लेषण और स्थानिक क्लस्टरिंग',
      collectiveBadge: 'सामूहिक आवाज़ और डुप्लिकेट इंटेलिजेंस इंजन',
      collectiveTitle: 'सामूहिक माँग पहचान (Collective Demand Detection)',
      collectiveDesc:
        'हज़ारों संदेशों को अलग-अलग शिकायतें मानने के बजाय, सेमैंटिक क्लस्टरिंग हिंदी, मराठी और अंग्रेज़ी रिपोर्टों को एक मुख्य बुनियादी ढाँचा अंतर में जोड़ती है।',
    },
    demandHotspots: {
      badge: 'भू-स्थानिक माँग और बजट संरेखण मैट्रिक्स',
      title: 'माँग हॉटस्पॉट्स (Demand Hotspots)',
      subtitle:
        'उन उच्च-प्राथमिकता वाले ज़िलों की पहचान करें जहाँ नागरिकों की माँग मौजूदा बुनियादी ढाँचे और बजट आवंटन से अधिक है।',
      scatterBadge: 'वित्तीय असंतुलन और अपूर्ण आवश्यकता संकेतक',
      scatterTitle: 'नागरिक माँग बनाम सार्वजनिक निवेश',
      rankedTitle: 'रैंक किए गए ज़िला माँग हॉटस्पॉट्स',
    },
    infrastructureGaps: {
      badge: 'बहु-क्षेत्रीय कमी और पारदर्शी AI स्कोरिंग इंजन',
      title: 'अवसंरचना अंतर बुद्धिमत्ता (Infrastructure Gaps)',
      subtitle:
        '८ आवश्यक बुनियादी ढाँचा क्षेत्रों में नागरिक माँग और भौतिक सुविधा उपलब्धता के बीच के अंतर का मापन।',
      btnSimulateClosure: 'अंतर समाधान सिम्युलेट करें',
      whyPrioritizedTitle: 'इस क्षेत्र को प्राथमिकता क्यों दी गई है?',
    },
    recommendations: {
      badge: 'नीति निर्णय समर्थन और परियोजना स्वीकृति इंजन',
      title: 'AI विकास परियोजना अनुशंसाएँ (Recommendations)',
      subtitle:
        'सामूहिक नागरिक माँग, क्षेत्रीय गैप स्कोर और पूंजी निवेश की कमी के आधार पर उच्च-प्रभाव वाली परियोजनाओं की सिफारिशें।',
      btnViewEvidence: 'साक्ष्य देखें (View Evidence)',
      btnSimulateImpact: 'प्रभाव सिम्युलेट करें',
      btnSendToDept: 'विभाग को भेजें',
      btnRoutedToDept: 'विभाग को भेजा गया ✓',
    },
    impactSimulator: {
      badge: 'नीति और पूंजी आवंटन मॉडलिंग',
      title: 'विकास प्रभाव सिम्युलेटर (Impact Simulator)',
      subtitle:
        'बजट स्वीकृत करने से पहले मॉडल करें कि प्रस्तावित बुनियादी ढाँचा निवेश कैसे नागरिकों की यात्रा दूरी को कम करता है और वंचित आबादी को लाभ पहुँचाता है।',
      beforeTitle: 'सिम्युलेशन से पहले (Before Simulation)',
      afterTitle: 'सिम्युलेशन के बाद (After Simulation)',
      whyProjectTitle: 'यह परियोजना क्यों आवश्यक है?',
      btnRouteToDept: 'विभाग कार्यवाही पैनल को भेजें',
    },
    departmentActions: {
      badge: 'अंतर-मंत्रालयीय रूटिंग और ज़िला निष्पादन कंसोल',
      title: 'अधिकारी और विभाग कार्यवाही पैनल',
      subtitle:
        'श्रेणी-आधारित स्वचालित रूटिंग, नोडल अधिकारी नियुक्ति, प्राथमिकता एस्केलेशन और एंड-टू-एंड ऑडिट ट्रेल ट्रैकिंग।',
      updateStatusLabel: 'कार्यप्रवाह स्थिति अपडेट करें',
      assignOfficerLabel: 'नोडल अधिकारी नियुक्त करें',
      btnEscalate: 'प्राथमिकता बढ़ाएँ (Escalate)',
    },
    analytics: {
      badge: 'मैक्रो-पॉलिसी टेलीमेट्री और दीर्घकालिक रुझान',
      title: 'राष्ट्रीय अवसंरचना विश्लेषण (Analytics)',
      subtitle:
        'नागरिक माँग की गति, क्षेत्रीय गैप वितरण, अंतर-विभागीय कार्यभार और समाधान परिणामों का विश्लेषण।',
    },
    dataSources: {
      badge: 'डिजिटल पब्लिक इन्फ्रास्ट्रक्चर इंटरऑपरेबिलिटी और स्कीमा कैटलॉग',
      title: 'राष्ट्रीय डेटा स्रोत और सिस्टम आर्किटेक्चर',
      subtitle:
        'Google Cloud AI, भू-स्थानिक बुद्धिमत्ता और आधिकारिक सरकारी ओपन डेटा पोर्टल्स द्वारा संचालित एक खुला, मॉड्यूलर डिजिटल पब्लिक गुड।',
    },
    copilot: {
      badge: 'AI नीति सहायक (हिंदी · मराठी · अंग्रेज़ी)',
      title: 'विकास बुद्धिमत्ता कोपायलट (Policy Copilot)',
      welcome:
        'विकास बुद्धिमत्ता कोपायलट में आपका स्वागत है। मुझसे हिंदी, मराठी या अंग्रेज़ी में ज़िला अवसंरचना अंतर, महाराष्ट्र की विकास माँगों या पुणे ज़िले के प्राथमिकता स्कोर के बारे में पूछें।',
      suggestedLabel: 'सुझाए गए नीतिगत प्रश्न:',
      placeholder: 'हिंदी, मराठी या अंग्रेज़ी में प्रश्न पूछें…',
      askBtn: 'पूछें',
      questions: [
        'किन ज़िलों में जल बुनियादी ढाँचे का अंतर सबसे अधिक है?',
        'महाराष्ट्र में सबसे बड़ी विकास माँगें क्या हैं?',
        'वे क्षेत्र दिखाएँ जहाँ नागरिक माँग अधिक है लेकिन निवेश कम है।',
        'पुणे ज़िले को प्राथमिकता क्यों दी गई है?',
        'इस महीने की शीर्ष बुनियादी ढाँचा आवश्यकताएँ क्या हैं?',
      ],
    },
  },
};

/**
 * Real-time client-side NLP preview helper for English, Marathi, and Hindi text inputs.
 * Ensures that typing or switching languages in CitizenRequestsView immediately updates
 * language detection, translation, extracted issue, category, and localized AI summary.
 */
export function analyzeTextRealtime(
  rawText: string,
  languageHint: SupportedLanguage,
  district: string,
  categoryHint: InfrastructureCategory,
  urgencyHint: 'Critical' | 'High' | 'Medium' | 'Low'
) {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Detect Language (strictly English, Marathi, or Hindi)
  let detectedLanguage: SupportedLanguage = languageHint;
  const hasDevanagari = /[\u0900-\u097F]/.test(text);

  // Marathi markers (Devanagari & Roman)
  const marathiMarkers = [
    'आमच्या',
    'गावात',
    'नाही',
    'आहे',
    'केंद्र',
    'पाणी',
    'रस्ता',
    'शाळा',
    'तालुक्यातील',
    'रुग्णालय',
    'प्रवास',
    'पावसाळ्यात',
    'aamchya',
    'gavat',
    'rugnalaya',
    'dawakhaana',
    'पाण्याची',
  ];
  // Hindi markers (Devanagari & Roman/Hinglish)
  const hindiMarkers = [
    'हमारे',
    'गाँव',
    'नहीं',
    'अस्पताल',
    'इलाज',
    'पानी',
    'सड़क',
    'स्कूल',
    'बिजली',
    'पुलिया',
    'hamara',
    'hamare',
    'gaon',
    'nahi',
    'achha',
    'ilaaj',
    'sadak',
    'pani',
    'bijli',
  ];

  if (marathiMarkers.some((m) => lower.includes(m))) {
    detectedLanguage = 'Marathi';
  } else if (hindiMarkers.some((m) => lower.includes(m))) {
    detectedLanguage = 'Hindi';
  } else if (hasDevanagari) {
    detectedLanguage = languageHint === 'Marathi' ? 'Marathi' : 'Hindi';
  } else if (/^[a-zA-Z0-9\s.,?!'"₹/-]+$/.test(text)) {
    detectedLanguage = 'English';
  }

  // 2. Detect Sector / Category from multilingual keywords
  let category: InfrastructureCategory = categoryHint;
  if (
    lower.includes('hospital') ||
    lower.includes('health') ||
    lower.includes('doctor') ||
    lower.includes('treatment') ||
    lower.includes('अस्पताल') ||
    lower.includes('आरोग्य') ||
    lower.includes('रुग्णालय') ||
    lower.includes('उपचार') ||
    lower.includes('इलाज') ||
    lower.includes('ilaaj')
  ) {
    category = 'Healthcare';
  } else if (
    lower.includes('water') ||
    lower.includes('pipeline') ||
    lower.includes('tanker') ||
    lower.includes('पाणी') ||
    lower.includes('पाण्याची') ||
    lower.includes('पानी') ||
    lower.includes('पेयजल') ||
    lower.includes('नळ') ||
    lower.includes('pani')
  ) {
    category = 'Water';
  } else if (
    lower.includes('road') ||
    lower.includes('bridge') ||
    lower.includes('culvert') ||
    lower.includes('highway') ||
    lower.includes('रस्ता') ||
    lower.includes('पूल') ||
    lower.includes('सड़क') ||
    lower.includes('पुलिया') ||
    lower.includes('sadak')
  ) {
    category = 'Roads';
  } else if (
    lower.includes('school') ||
    lower.includes('classroom') ||
    lower.includes('education') ||
    lower.includes('शाळा') ||
    lower.includes('शाळेत') ||
    lower.includes('वर्गखोल्या') ||
    lower.includes('स्कूल') ||
    lower.includes('विद्यालय')
  ) {
    category = 'Education';
  } else if (
    lower.includes('electric') ||
    lower.includes('power') ||
    lower.includes('transformer') ||
    lower.includes('वीज') ||
    lower.includes('बिजली') ||
    lower.includes('bijli')
  ) {
    category = 'Electricity';
  }

  // 3. Build Normalized English Meaning + Extracted Issue + Localized AI Summary
  let translatedMeaning = text;
  let extractedIssue = 'Lack of nearby healthcare facility';
  let subcategory = 'Primary & Community Healthcare Centre (PHC/CHC)';
  let assignedDepartment = 'Health Department';
  let priorityScore = 88;
  let similarRequestsCount = 387;
  let affectedPopulation = 24500;

  if (category === 'Healthcare') {
    extractedIssue = 'Lack of nearby 24x7 primary & community healthcare facility';
    subcategory = 'Primary & Community Healthcare Centre (PHC/CHC)';
    assignedDepartment = 'Health Department';
    priorityScore = 88;
    similarRequestsCount = 387;
    affectedPopulation = 24500;
    if (detectedLanguage === 'Marathi') {
      translatedMeaning =
        'There is no primary health centre in our village; citizens must travel over 20 km for emergency medical treatment.';
    } else if (detectedLanguage === 'Hindi') {
      translatedMeaning =
        'No proper hospital is available near our village and residents must travel 20 km to the town for treatment.';
    }
  } else if (category === 'Water') {
    extractedIssue = 'Acute piped drinking water scarcity & tail-end pressure drop';
    subcategory = 'Piped Drinking Water Grid (Jal Jeevan Mission)';
    assignedDepartment = 'Water Resources Department';
    priorityScore = 91;
    similarRequestsCount = 542;
    affectedPopulation = 41200;
    if (detectedLanguage === 'Marathi') {
      translatedMeaning =
        'Villages in our block lack piped clean drinking water supply, causing severe water scarcity in summer.';
    } else if (detectedLanguage === 'Hindi') {
      translatedMeaning =
        'Drinking water pipelines across our block are dry; families must walk several kilometers daily for water.';
    }
  } else if (category === 'Roads') {
    extractedIssue = 'Flood-damaged rural connecting road and submerged bridge/culvert';
    subcategory = 'All-Weather Rural Arterial Road & Culvert';
    assignedDepartment = 'Public Works Department (PWD)';
    priorityScore = 89;
    similarRequestsCount = 445;
    affectedPopulation = 36800;
    if (detectedLanguage === 'Marathi') {
      translatedMeaning =
        'During monsoon, the main rural road and bridge submerge, preventing ambulances and school buses from reaching the village.';
    } else if (detectedLanguage === 'Hindi') {
      translatedMeaning =
        'After monsoon flooding, our main block road and culvert collapsed, cutting off access to schools and hospitals.';
    }
  } else if (category === 'Education') {
    extractedIssue = 'Overcrowded secondary classrooms and missing STEM laboratory';
    subcategory = 'Secondary School Infrastructure & Labs';
    assignedDepartment = 'Education Department';
    priorityScore = 82;
    similarRequestsCount = 218;
    affectedPopulation = 19400;
    if (detectedLanguage === 'Marathi') {
      translatedMeaning =
        'The government high school in our taluka urgently requires a science laboratory and new classrooms.';
    } else if (detectedLanguage === 'Hindi') {
      translatedMeaning =
        'The local government secondary school lacks sufficient classrooms and a science laboratory for students.';
    }
  } else {
    extractedIssue = `${category} infrastructure deficit reported by community`;
    subcategory = `${category} Public Facility Upgrade`;
    assignedDepartment = `${category} Department`;
    priorityScore = 84;
    similarRequestsCount = 290;
    affectedPopulation = 28000;
    if (detectedLanguage !== 'English') {
      translatedMeaning = `Community development request in ${detectedLanguage} highlighting urgent ${category.toLowerCase()} infrastructure shortage in ${district}.`;
    }
  }

  const aiSummaryByLang: Record<SupportedLanguage, string> = {
    English: `Multiple ${category.toLowerCase()}-related citizen requests (${similarRequestsCount} clustered reports) indicate insufficient access to ${subcategory.toLowerCase()} in ${district}.`,
    Marathi: `${district} परिसरातील ${similarRequestsCount} समान नागरिक विनंत्यांवरून असे दिसून येते की या भागात '${subcategory}' ची तीव्र कमतरता असून तातडीने प्रकल्प मंजूर करण्याची गरज आहे.`,
    Hindi: `${district} क्षेत्र से प्राप्त ${similarRequestsCount} समान नागरिक अनुरोधों से पता चलता है कि यहाँ '${subcategory}' की गंभीर कमी है और तत्काल सरकारी हस्तक्षेप आवश्यक है।`,
  };

  return {
    detectedLanguage,
    translatedMeaning,
    extractedIssue,
    category,
    subcategory,
    location: district,
    urgency: urgencyHint,
    affectedPopulation,
    similarRequestsCount,
    assignedDepartment,
    priorityScore,
    aiSummary: aiSummaryByLang[languageHint] || aiSummaryByLang.English,
    suggestedAction:
      category === 'Healthcare'
        ? 'Construct Community Healthcare Centre (CHC) in high-demand rural block.'
        : category === 'Water'
        ? 'Sanction Solar Piped Drinking Water Grid & Overhead Reservoir.'
        : category === 'Roads'
        ? 'Build All-Weather Bituminous Road & High-Discharge Box Culverts.'
        : `Approve high-priority ${category} infrastructure upgrade in ${district}.`,
  };
}
