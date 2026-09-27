import React, { useState } from 'react';
import { SupportedLanguage, UserRole } from '../types/platform';
import {
  DATA_SOURCES_CATALOG,
  SUPPORTED_LANGUAGES,
  TECHNOLOGY_STACK_PILLARS,
} from '../data/nationalData';
import { TRANSLATIONS } from '../data/translations';
import { RBAC_HIERARCHY_EXPLANATION, RBAC_PROFILES } from '../data/rbacData';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Globe,
  Lock,
  ArrowDown,
} from 'lucide-react';

interface DataSourcesViewProps {
  uiLanguage: SupportedLanguage;
  activeRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
}

const PRIVACY_GOVERNANCE_PILLARS = [
  {
    title: 'Citizen Data Anonymization',
    badge: 'DPDP Act 2023',
    description:
      'Personally identifiable information is masked before regional clustering; only aggregated demand and location signals are exposed to policymakers.',
  },
  {
    title: 'Jurisdictional Access Boundaries',
    badge: 'Strict RBAC',
    description:
      'District and Department Officers only access data scoped to their assigned administrative territory or sectoral mandate.',
  },
  {
    title: 'Explainable AI Scoring',
    badge: 'Zero Black-Box',
    description:
      'Every infrastructure priority score is backed by an auditable additive formula combining demand, population impact, and facility availability.',
  },
  {
    title: 'Immutable Governance Audit Trail',
    badge: 'Tamper-Evident',
    description:
      'All role transitions, dataset synchronizations, and project approvals are logged with user identity, role, and timestamp.',
  },
];

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({
  uiLanguage,
  activeRole = 'National Policymaker',
  onSwitchRole,
}) => {
  const t = TRANSLATIONS[uiLanguage].dataSources;
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<number>(2);

  const PIPELINE_STAGES = [
    {
      step: '01',
      title: 'Multilingual Citizen Input Layer',
      subtitle: 'Web Portal, Gram Panchayat Kiosks & Field Officers',
      detail:
        'Ingests citizen infrastructure requests in English, Marathi (मराठी), and Hindi (हिन्दी) with village/taluka geo-tagging and optional field evidence.',
      tech: 'IndicTrans2 · Unicode UTF-8 · GeoJSON Tagging',
    },
    {
      step: '02',
      title: 'NLP Semantic Extraction & Translation',
      subtitle: 'Zero-Loss Cross-Lingual Meaning Normalization',
      detail:
        'Extracts underlying infrastructure category, facility subtype, urgency level, and sentiment while translating regional expressions into canonical policy schema.',
      tech: 'MuRIL / IndicBERT · Named Entity Recognition · Urgency Classifier',
    },
    {
      step: '03',
      title: 'Geo-Spatial Demand Clustering',
      subtitle: 'Sub-District Collective Signal Aggregation',
      detail:
        'Groups semantically identical complaints within a 15 km radial catchment across neighboring villages to surface structural regional bottlenecks.',
      tech: 'H3 Spatial Indexing · Cosine Similarity Clustering · Velocity Detection',
    },
    {
      step: '04',
      title: 'Infrastructure Gap & Investment Alignment',
      subtitle: 'Cross-Verification with Official Census & PM Gati Shakti Layers',
      detail:
        'Benchmarks citizen demand index against existing facility availability (UDISE+, HMIS, JJM) and ongoing capital expenditure to compute the 0–100 Gap Score.',
      tech: 'Gap Score Formula · Capital Outlay Deductor · Explainable Waterfall',
    },
    {
      step: '05',
      title: 'Policy Recommendation & Impact Simulation',
      subtitle: 'Actionable Departmental Routing & Parametric Forecasting',
      detail:
        'Generates costed project interventions, routes cases to nodal ministries, and simulates projected gap reduction before capital sanctioning.',
      tech: 'Decision Support Matrix · Parametric Simulator · Audit Trail',
    },
  ];

  const flattenedSources = DATA_SOURCES_CATALOG.flatMap((group) =>
    group.sources.map((src) => ({
      ...src,
      category: group.category,
    }))
  );

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-xs font-semibold text-blue-700">{t.badge}</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            {t.title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>India Digital Public Goods (DPG) Compliant</span>
        </div>
      </div>

      {/* SECTION 17: ROLE-BASED ACCESS CONTROL (RBAC) VISUAL HIERARCHY */}
      <section className="bg-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
              <Lock className="w-4 h-4" />
              <span>Governance & Multi-Tier Security Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">Role-Based Access Control</h2>
            <p className="text-xs text-slate-400 mt-1">
              Visual hierarchy of data visibility, jurisdictional scope, and administrative
              permissions across the 6 institutional roles. Click any role card to preview its
              interface.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Active Role: <strong className="text-teal-400">{activeRole}</strong>
          </div>
        </div>

        {/* Visual Hierarchy Ladder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-stretch">
          {RBAC_HIERARCHY_EXPLANATION.map((item) => {
            const isCurrent = item.role === activeRole;
            const profile = RBAC_PROFILES[item.role];
            return (
              <div
                key={item.role}
                onClick={() => onSwitchRole && onSwitchRole(item.role)}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  onSwitchRole ? 'cursor-pointer' : ''
                } ${
                  isCurrent
                    ? 'bg-blue-950/90 border-blue-500 shadow-lg'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      TIER {item.level}
                    </span>
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <div className="font-bold text-sm text-white leading-snug">{item.role}</div>
                  <div className="inline-block px-2 py-0.5 rounded bg-teal-500/20 border border-teal-500/30 text-teal-300 font-mono text-[11px] font-semibold">
                    → {item.accessScope}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{profile.scopeBadge}</span>
                  {isCurrent && <span className="text-teal-400 font-bold">● ACTIVE</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Flow Summary Bar */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">
              👤 Citizen → Own Requests
            </span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">
              🏢 District Officer → District Data
            </span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">
              🏛️ Department Officer → Department Data
            </span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200">
              🌐 State Administrator → State Data
            </span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
            <span className="px-2.5 py-1 rounded bg-slate-800 text-teal-300 font-semibold">
              🇮🇳 National Policymaker → National Insights
            </span>
            <ArrowDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
            <span className="px-2.5 py-1 rounded bg-slate-800 text-amber-300">
              ⚙️ System Administrator → System Configuration
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 1: END-TO-END AI ARCHITECTURE PIPELINE */}
      <section className="bg-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
              <Cpu className="w-4 h-4" />
              <span>5-Stage National Decision Support Pipeline</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              End-to-End Multilingual AI & Policy Intelligence Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click any pipeline stage below to inspect the NLP, geospatial clustering, and gap
              scoring specifications.
            </p>
          </div>
        </div>

        {/* Interactive 5-Step Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {PIPELINE_STAGES.map((st, idx) => {
            const isSelected = selectedPipelineStage === idx;
            return (
              <div
                key={st.step}
                onClick={() => setSelectedPipelineStage(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-blue-950/80 border-blue-500 shadow-lg'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-teal-400 font-bold">STAGE {st.step}</span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200 text-[10px]">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-white leading-snug">{st.title}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{st.subtitle}</div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                  {st.tech}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Deep-Dive Box */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="text-teal-400 font-mono font-semibold">
              STAGE {PIPELINE_STAGES[selectedPipelineStage].step} SPECIFICATION:{' '}
              {PIPELINE_STAGES[selectedPipelineStage].title}
            </div>
            <p className="text-slate-200 leading-relaxed max-w-3xl">
              {PIPELINE_STAGES[selectedPipelineStage].detail}
            </p>
          </div>
          <div className="shrink-0 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
            Stack: {PIPELINE_STAGES[selectedPipelineStage].tech}
          </div>
        </div>
      </section>

      {/* SECTION 2: VERIFIED PUBLIC DATA SOURCES CATALOG */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Database className="w-4 h-4" />
              <span>Authoritative Government & Statistical Feeds</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Integrated Public Datasets & Registries
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {flattenedSources.length} Synchronized Registries
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flattenedSources.map((src) => (
            <div
              key={src.name}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                    {src.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {src.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{src.name}</h3>
                <div className="text-xs font-medium text-slate-500">{src.type}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{src.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Sync: {src.frequency}</span>
                <span className="text-slate-700 font-semibold">{src.coverage}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: 3-LANGUAGE NLP ENGINE COVERAGE & PRIVACY GUARDRAILS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3 Supported Languages Matrix */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
            <Globe className="w-4 h-4" />
            <span>Active Multilingual NLP Coverage</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            3 Official Interface & NLP Languages
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Calibrated for high-precision semantic extraction, transliteration, and district
            place-name recognition across English, Marathi, and Hindi.
          </p>

          <div className="space-y-2.5 pt-1">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div
                key={lang.name}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm">{lang.nativeLabel}</div>
                  <div className="text-slate-500 mt-0.5">
                    Script: {lang.scriptSample} · Primary Focus: {lang.sampleCategory}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
                  98.4% F1
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Data Privacy, Anonymization & Ethical AI Guardrails */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
            <Layers className="w-4 h-4" />
            <span>DPDP Act 2023 & Auditable AI Governance</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Data Privacy, Anonymization & Role Security
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {PRIVACY_GOVERNANCE_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{pillar.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                    {pillar.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {TECHNOLOGY_STACK_PILLARS.slice(0, 2).map((tech) => (
              <div
                key={tech.category}
                className="p-3 rounded-lg bg-slate-900 text-white border border-slate-800"
              >
                <div className="text-teal-400 font-semibold">{tech.category}</div>
                <div className="text-slate-300 text-[11px] mt-0.5">{tech.technologies}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
