import React, { useState } from 'react';
import { CitizenRequestRecord, InfrastructureCategory, NavModule } from '../types/platform';
import { DISTRICT_HOTSPOTS, INFRASTRUCTURE_CATEGORIES } from '../data/nationalData';
import { CitizenSubTab } from './CitizenRequestsView';
import {
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  ThumbsUp,
  Check,
  Users,
  MapPin,
} from 'lucide-react';

interface PublicUpdatesHelpViewProps {
  mode: 'public-updates' | 'citizen-help';
  onNavigate: (module: NavModule) => void;
  onOpenCitizenTab?: (tab: CitizenSubTab) => void;
  requests?: CitizenRequestRecord[];
  onSupportRequest?: (req: CitizenRequestRecord) => void;
}

export const PublicUpdatesHelpView: React.FC<PublicUpdatesHelpViewProps> = ({
  mode,
  onNavigate,
  onOpenCitizenTab,
  requests = [],
  onSupportRequest,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [supportedDistrictIds, setSupportedDistrictIds] = useState<Record<string, boolean>>({});

  const goToTab = (tab: CitizenSubTab) => {
    if (onOpenCitizenTab) {
      onOpenCitizenTab(tab);
    } else {
      onNavigate('citizen-requests');
    }
  };

  if (mode === 'citizen-help') {
    return (
      <div className="space-y-8 pb-12">
        <div className="border-b border-slate-200 pb-5">
          <div className="text-xs font-semibold text-blue-700">
            👤 Citizen Portal · Help & Public Charter
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Citizen Help, Privacy Guarantee & Request Guide
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            How to submit local infrastructure needs in English, Marathi, or Hindi, support community requests, and track public action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {[
            {
              step: '01. Submit or Endorse Community Requests',
              title: 'Plain-Text Submission & +1 Community Support',
              desc: 'Write your village or ward infrastructure issue in everyday English, Marathi, or Hindi—or add your +1 endorsement to an existing community request cluster in your block.',
            },
            {
              step: '02. Transparent Status Lifecycle',
              title: '6-Stage Public Request Tracking',
              desc: 'Track your Request ID from Submitted → AI Analysed → Department Assigned → Under Review → Action Initiated → Resolved.',
            },
            {
              step: '03. Strict Citizen Data Privacy',
              title: 'Zero Personal Data Exposure',
              desc: 'Citizens only see their own request details and anonymized community cluster counts. Personal identifiers are never publicly exposed.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-2"
            >
              <div className="font-mono font-bold text-blue-700">{item.step}</div>
              <h2 className="text-base font-bold text-slate-900">{item.title}</h2>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Frequently Asked Questions (Citizen Access)</span>
          </div>
          <div className="divide-y divide-slate-200/80 space-y-3">
            <div className="pt-3">
              <div className="font-bold text-slate-900">
                Why can’t I view National Analytics or Government Budget Simulation?
              </div>
              <p className="text-slate-600 mt-1">
                As a Citizen user, your portal is streamlined for submitting local infrastructure
                issues, supporting community requests, tracking your own requests, and viewing public civic updates. Operational
                dashboards are restricted to authorized District, Department, State, and National
                officers.
              </p>
            </div>
            <div className="pt-3">
              <div className="font-bold text-slate-900">
                How does a Community Request get higher priority?
              </div>
              <p className="text-slate-600 mt-1">
                When multiple citizens in nearby villages report or endorse (+1 Support) the same underlying issue (for
                example, lack of a 24x7 Primary Health Centre in Ambegaon block), the platform
                clusters those reports so District and Department Officers can sanction a facility.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => goToTab('submit')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Submit a Citizen Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => goToTab('community')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Browse Community Requests</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredHotspots = DISTRICT_HOTSPOTS.filter((d) =>
    selectedSector === 'All' ? true : d.mainIssue === selectedSector
  ).slice(0, 6);

  const filteredCommunityRequests = requests.filter((r) =>
    selectedSector === 'All' ? true : r.category === (selectedSector as InfrastructureCategory)
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-700">
            👤 Citizen Information · Public Updates & Community Requests
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Public Infrastructure Updates & Community Issues
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            View publicly shareable status bulletins, support local community requests (+1), or submit a new development request.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            aria-label="Filter Public Bulletins by Sector"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-medium"
          >
            <option value="All">All Sectors</option>
            {INFRASTRUCTURE_CATEGORIES.slice(0, 6).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => goToTab('community')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
          >
            Community Requests Hub
          </button>

          <button
            type="button"
            onClick={() => goToTab('submit')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
          >
            + Submit New Request
          </button>
        </div>
      </div>

      {/* Section 1: Active Community Requests that Citizens Can Support */}
      {filteredCommunityRequests.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Community Requests Open for Citizen Endorsement ({filteredCommunityRequests.length})
              </h2>
              <p className="text-slate-500">
                Endorse an existing community request to boost its regional cluster count or track its 6-stage departmental review.
              </p>
            </div>
            <button
              type="button"
              onClick={() => goToTab('community')}
              className="text-blue-700 font-semibold hover:underline cursor-pointer shrink-0"
            >
              Open Full Community Feed →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCommunityRequests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700">
                      {req.id} · {req.category}
                    </span>
                    <span className="font-semibold text-emerald-700">{req.status}</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {req.extractedIssue}
                  </div>
                  <div className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {req.villageOrCity}, {req.district}, {req.state}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pt-1">
                    “{req.translatedMeaning}”
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <span className="font-mono text-slate-600">
                    <strong>{req.similarRequestsCount}</strong> community reports
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSupportRequest && onSupportRequest(req)}
                      className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        req.supportedByUser
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {req.supportedByUser ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Supported</span>
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>+1 Support</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToTab('status')}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-slate-700 font-semibold cursor-pointer"
                    >
                      Track
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Publicly Shareable Works Bulletins */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          District Public Infrastructure Bulletins ({filteredHotspots.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {filteredHotspots.map((d) => {
            const isSupported = Boolean(supportedDistrictIds[d.id]);
            const count = d.requestCount + (isSupported ? 1 : 0);
            return (
              <div
                key={d.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-slate-900">
                      {d.district}, {d.state}
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Public Bulletin</span>
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {d.mainIssue} Sector: {d.specificProblem}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {count.toLocaleString()} community reports grouped across local villages.
                    Current public status: Under active departmental review for facility expansion.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>Estimated Beneficiaries: {d.populationFormatted}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSupportedDistrictIds((prev) => ({ ...prev, [d.id]: true }))
                      }
                      className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        isSupported
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isSupported ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Endorsed (+1)</span>
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="w-3 h-3" />
                          <span>Endorse Bulletin</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => goToTab('submit')}
                      className="text-blue-700 font-semibold hover:underline cursor-pointer"
                    >
                      Report in Area →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-3 text-xs text-slate-700">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>
          <strong>Citizen Data Privacy Notice:</strong> Only aggregated community issue summaries
          and public project bulletins are shown here. Individual citizen details are protected.
        </span>
      </div>
    </div>
  );
};
