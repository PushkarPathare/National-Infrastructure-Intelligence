import React, { useState } from 'react';
import { DistrictHotspot, GapCategory } from '../../types/platform';

// ============================================================================
// 1. INTERACTIVE TIME-SERIES COMBO CHART (AREA SPLINE / GROUPED BARS / CUMULATIVE)
// ============================================================================
export interface TimeSeriesPoint {
  month: string;
  requests: number;
  resolved: number;
}

interface InteractiveTimeSeriesChartProps {
  data: TimeSeriesPoint[];
  height?: number;
  dark?: boolean;
  submittedLabel?: string;
  resolvedLabel?: string;
}

export const InteractiveTimeSeriesChart: React.FC<InteractiveTimeSeriesChartProps> = ({
  data,
  height = 290,
  dark = false,
  submittedLabel = 'Submitted Requests',
  resolvedLabel = 'Resolved Cases',
}) => {
  const [chartMode, setChartMode] = useState<'area' | 'bars' | 'rate'>('area');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 760;
  const padLeft = 54;
  const padRight = 24;
  const padTop = 28;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxVal = Math.max(
    650000,
    ...data.map((d) => Math.max(d.requests, d.resolved))
  );
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(maxVal * t));

  const getX = (idx: number) =>
    padLeft + (idx / Math.max(1, data.length - 1)) * plotW;
  const getY = (val: number) =>
    padTop + plotH - (Math.min(maxVal, Math.max(0, val)) / maxVal) * plotH;
  const getRateY = (pct: number) =>
    padTop + plotH - (Math.min(100, Math.max(0, pct)) / 100) * plotH;

  // Build smooth cubic bezier SVG path
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpy1 = p0.y;
      const cpx2 = p0.x + (p1.x - p0.x) * 0.55;
      const cpy2 = p1.y;
      d += ` C ${cpx1.toFixed(1)} ${cpy1.toFixed(1)}, ${cpx2.toFixed(1)} ${cpy2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  };

  const reqPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.requests) }));
  const resPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.resolved) }));
  const ratePoints = data.map((d, i) => ({
    x: getX(i),
    y: getRateY(Math.round((d.resolved / Math.max(1, d.requests)) * 100)),
  }));

  const reqLine = buildSmoothPath(reqPoints);
  const resLine = buildSmoothPath(resPoints);
  const rateLine = buildSmoothPath(ratePoints);

  const baselineY = padTop + plotH;
  const reqArea = `${reqLine} L ${reqPoints[reqPoints.length - 1].x.toFixed(1)} ${baselineY} L ${reqPoints[0].x.toFixed(1)} ${baselineY} Z`;
  const resArea = `${resLine} L ${resPoints[resPoints.length - 1].x.toFixed(1)} ${baselineY} L ${resPoints[0].x.toFixed(1)} ${baselineY} Z`;
  const rateArea = `${rateLine} L ${ratePoints[ratePoints.length - 1].x.toFixed(1)} ${baselineY} L ${ratePoints[0].x.toFixed(1)} ${baselineY} Z`;

  const activePoint = hoverIdx !== null ? data[hoverIdx] : data[data.length - 1];
  const activeIdx = hoverIdx !== null ? hoverIdx : data.length - 1;
  const activeRate = Math.round(
    (activePoint.resolved / Math.max(1, activePoint.requests)) * 100
  );

  const gridColor = dark ? 'rgba(148, 163, 184, 0.14)' : '#e2e8f0';
  const textColor = dark ? '#94a3b8' : '#64748b';
  const strongText = dark ? '#f8fafc' : '#0f172a';

  return (
    <div className="space-y-3">
      {/* Mode Switcher & Live Hover Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className={`flex items-center gap-4 text-xs px-3 py-1.5 rounded-lg border ${
            dark
              ? 'bg-slate-900/90 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200/80 text-slate-700'
          }`}
        >
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
            {activePoint.month}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span className="text-slate-500">{submittedLabel}:</span>
            <strong className={`font-mono tabular-nums ${dark ? 'text-white' : 'text-slate-900'}`}>
              {activePoint.requests.toLocaleString()}
            </strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-600 inline-block" />
            <span className="text-slate-500">{resolvedLabel}:</span>
            <strong className="font-mono tabular-nums text-teal-600">
              {activePoint.resolved.toLocaleString()}
            </strong>
          </span>
          <span className="hidden sm:inline font-mono tabular-nums text-emerald-600 font-semibold">
            ({activeRate}% Clearance)
          </span>
        </div>

        <div
          className={`flex items-center gap-1 p-1 rounded-lg ${
            dark ? 'bg-slate-900 border border-slate-800' : 'bg-slate-100'
          }`}
        >
          {(
            [
              { id: 'area', label: 'Spline Area' },
              { id: 'bars', label: 'Grouped Bars' },
              { id: 'rate', label: 'Clearance %' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setChartMode(m.id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                chartMode === m.id
                  ? dark
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-900 shadow-xs'
                  : dark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
          role="img"
          aria-label="Citizen Requests vs Resolved Cases Chart"
        >
          <defs>
            <linearGradient id="reqAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="resAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="rateAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {chartMode !== 'rate'
            ? yTicks.map((tickVal, idx) => {
                const y = getY(tickVal);
                return (
                  <g key={idx}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke={gridColor}
                      strokeDasharray={idx === 0 ? undefined : '4 4'}
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill={textColor}
                      fontSize="10.5"
                      fontFamily="monospace"
                    >
                      {tickVal === 0 ? '0' : `${Math.round(tickVal / 1000)}k`}
                    </text>
                  </g>
                );
              })
            : [0, 25, 50, 75, 100].map((pctVal, idx) => {
                const y = getRateY(pctVal);
                return (
                  <g key={idx}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke={gridColor}
                      strokeDasharray={idx === 0 ? undefined : '4 4'}
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill={textColor}
                      fontSize="10.5"
                      fontFamily="monospace"
                    >
                      {pctVal}%
                    </text>
                  </g>
                );
              })}

          {/* MODE 1: SPLINE AREA CHART */}
          {chartMode === 'area' && (
            <>
              <path d={reqArea} fill="url(#reqAreaGrad)" />
              <path d={resArea} fill="url(#resAreaGrad)" />
              <path
                d={reqLine}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.75"
                strokeLinecap="round"
              />
              <path
                d={resLine}
                fill="none"
                stroke="#0d9488"
                strokeWidth="2.75"
                strokeLinecap="round"
              />

              {/* Hover Crosshair Line */}
              <line
                x1={getX(activeIdx)}
                y1={padTop}
                x2={getX(activeIdx)}
                y2={baselineY}
                stroke={dark ? '#60a5fa' : '#3b82f6'}
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Data Points */}
              {data.map((d, i) => {
                const isHovered = i === activeIdx;
                return (
                  <g key={d.month}>
                    <circle
                      cx={reqPoints[i].x}
                      cy={reqPoints[i].y}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 1.5}
                    />
                    <circle
                      cx={resPoints[i].x}
                      cy={resPoints[i].y}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#0d9488"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 1.5}
                    />
                    {isHovered && (
                      <text
                        x={reqPoints[i].x}
                        y={reqPoints[i].y - 10}
                        textAnchor="middle"
                        fill={strongText}
                        fontSize="10.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {(d.requests / 1000).toFixed(0)}k
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {/* MODE 2: GROUPED BARS CHART */}
          {chartMode === 'bars' && (
            <>
              {data.map((d, i) => {
                const centerX = getX(i);
                const barW = Math.min(18, plotW / (data.length * 2.7));
                const reqY = getY(d.requests);
                const resY = getY(d.resolved);
                const isHovered = i === activeIdx;
                return (
                  <g key={d.month}>
                    {isHovered && (
                      <rect
                        x={centerX - barW - 4}
                        y={padTop}
                        width={barW * 2 + 8}
                        height={plotH}
                        fill={dark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'}
                        rx="4"
                      />
                    )}
                    <rect
                      x={centerX - barW - 1}
                      y={reqY}
                      width={barW}
                      height={Math.max(2, baselineY - reqY)}
                      fill="#2563eb"
                      rx="3"
                      opacity={isHovered ? 1 : 0.88}
                    />
                    <rect
                      x={centerX + 1}
                      y={resY}
                      width={barW}
                      height={Math.max(2, baselineY - resY)}
                      fill="#0d9488"
                      rx="3"
                      opacity={isHovered ? 1 : 0.88}
                    />
                    {isHovered && (
                      <text
                        x={centerX}
                        y={Math.min(reqY, resY) - 7}
                        textAnchor="middle"
                        fill={strongText}
                        fontSize="10"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {(d.requests / 1000).toFixed(0)}k / {(d.resolved / 1000).toFixed(0)}k
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {/* MODE 3: CLEARANCE EFFICIENCY % CURVE */}
          {chartMode === 'rate' && (
            <>
              <path d={rateArea} fill="url(#rateAreaGrad)" />
              <path
                d={rateLine}
                fill="none"
                stroke="#059669"
                strokeWidth="2.75"
                strokeLinecap="round"
              />
              {data.map((d, i) => {
                const pct = Math.round((d.resolved / Math.max(1, d.requests)) * 100);
                const isHovered = i === activeIdx;
                return (
                  <g key={d.month}>
                    <circle
                      cx={ratePoints[i].x}
                      cy={ratePoints[i].y}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#059669"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={ratePoints[i].x}
                      y={ratePoints[i].y - 9}
                      textAnchor="middle"
                      fill={isHovered ? strongText : textColor}
                      fontSize="9.5"
                      fontWeight={isHovered ? '700' : '500'}
                      fontFamily="monospace"
                    >
                      {pct}%
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* X-Axis Labels & Invisible Hover Hit Columns */}
          {data.map((d, i) => {
            const x = getX(i);
            const colW = plotW / data.length;
            const isHovered = i === activeIdx;
            return (
              <g key={d.month}>
                <text
                  x={x}
                  y={baselineY + 20}
                  textAnchor="middle"
                  fill={isHovered ? strongText : textColor}
                  fontSize="11"
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {d.month}
                </text>
                <rect
                  x={x - colW / 2}
                  y={padTop}
                  width={colW}
                  height={plotH + padBottom}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIdx(i)}
                  onClick={() => setHoverIdx(i)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// ============================================================================
// 2. INTERACTIVE DONUT CHART WITH HOVER SELECTION & CENTER CALLOUT
// ============================================================================
export interface DonutSegment {
  label: string;
  value: number;
  sharePct: number;
  color: string;
  sublabel?: string;
}

interface InteractiveDonutChartProps {
  segments: DonutSegment[];
  centerTitle: string;
  centerValue: string;
  size?: number;
}

export const InteractiveDonutChart: React.FC<InteractiveDonutChartProps> = ({
  segments,
  centerTitle,
  centerValue,
  size = 210,
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const strokeWidth = size * 0.135;
  const circumference = 2 * Math.PI * radius;

  const totalPct = segments.reduce((acc, s) => acc + s.sharePct, 0) || 100;
  let accumulatedPct = 0;

  const activeSeg = activeIdx !== null ? segments[activeIdx] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
      {/* Donut Ring SVG */}
      <div className="sm:col-span-5 flex items-center justify-center">
        <div className="relative inline-flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="select-none -rotate-90"
            role="img"
            aria-label={centerTitle}
          >
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {segments.map((seg, idx) => {
              const normalizedPct = (seg.sharePct / totalPct) * 100;
              const segLength = (normalizedPct / 100) * circumference;
              const dashArray = `${Math.max(0, segLength - 2)} ${circumference}`;
              const dashOffset = -((accumulatedPct / 100) * circumference);
              accumulatedPct += normalizedPct;
              const isHovered = activeIdx === idx;

              return (
                <circle
                  key={seg.label}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 5 : strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-150 cursor-pointer"
                  opacity={activeIdx === null || isHovered ? 1 : 0.45}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(null)}
                  onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            {activeSeg ? (
              <>
                <span className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                  {activeSeg.label}
                </span>
                <span
                  className="text-xl font-bold font-mono tabular-nums mt-0.5"
                  style={{ color: activeSeg.color }}
                >
                  {activeSeg.sharePct}%
                </span>
                <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                  {activeSeg.sublabel || activeSeg.value.toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-medium text-slate-500">{centerTitle}</span>
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                  {centerValue}
                </span>
                <span className="text-[10px] text-slate-400">Hover slice</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Legend & Quantitative Bars */}
      <div className="sm:col-span-7 space-y-2 text-xs">
        {segments.map((seg, idx) => {
          const isHovered = activeIdx === idx;
          return (
            <div
              key={seg.label}
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
              onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isHovered
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-white border-transparent hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-semibold text-slate-900 truncate">{seg.label}</span>
                </div>
                <div className="font-mono tabular-nums text-slate-700 shrink-0">
                  <strong className="text-slate-900">{seg.sharePct}%</strong>
                  {seg.sublabel ? (
                    <span className="text-slate-500 ml-1.5">({seg.sublabel})</span>
                  ) : null}
                </div>
              </div>
              <div className="mt-1.5 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, seg.sharePct * 2)}%`, backgroundColor: seg.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 3. CALIBRATED HORIZONTAL BAR & LOLLIPOP BENCHMARK CHART
// ============================================================================
export interface CalibratedBarItem {
  id: string;
  label: string;
  badge?: string;
  value: number;
  maxValue: number;
  formattedValue: string;
  secondaryLabel?: string;
  secondaryValue?: number; // e.g. Gap Score 0-100
  color: string;
}

interface CalibratedHorizontalBarChartProps {
  items: CalibratedBarItem[];
  benchmarkValue?: number;
  benchmarkLabel?: string;
  selectedId?: string;
  onSelectItem?: (id: string) => void;
}

export const CalibratedHorizontalBarChart: React.FC<CalibratedHorizontalBarChartProps> = ({
  items,
  benchmarkValue,
  benchmarkLabel = 'National Avg',
  selectedId,
  onSelectItem,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const computedMax = Math.max(
    items[0]?.maxValue || 0,
    ...items.map((i) => i.value),
    100
  );
  const benchmarkPct =
    benchmarkValue !== undefined
      ? Math.min(96, Math.max(4, Math.round((benchmarkValue / computedMax) * 100)))
      : null;

  return (
    <div className="space-y-3">
      {/* X-Axis Scale Header + Non-Overlapping Benchmark Legend */}
      <div className="space-y-1.5">
        {benchmarkPct !== null && benchmarkValue !== undefined && (
          <div className="flex items-center justify-between text-[11px] bg-amber-50/80 border border-amber-200/80 rounded-lg px-3 py-1.5 text-amber-900">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-600 inline-block" />
              <span className="font-semibold">{benchmarkLabel}:</span>
              <span className="font-mono font-bold tabular-nums">
                {benchmarkValue.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-700">
              Dashed vertical marker on each bar track
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400 px-2.5 border-b border-slate-100 pb-1.5">
          <span>0</span>
          <span>{Math.round(computedMax * 0.25).toLocaleString()}</span>
          <span>{Math.round(computedMax * 0.5).toLocaleString()}</span>
          <span>{Math.round(computedMax * 0.75).toLocaleString()}</span>
          <span>{computedMax.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => {
          const widthPct = Math.min(100, Math.max(4, (item.value / computedMax) * 100));
          const isHovered = hoveredId === item.id;
          const isSelected = selectedId === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectItem && onSelectItem(item.id)}
              className={`p-2.5 rounded-lg border transition-all ${
                onSelectItem ? 'cursor-pointer' : ''
              } ${
                isSelected
                  ? 'bg-blue-50/40 border-blue-600 ring-1 ring-blue-600/20'
                  : isHovered
                  ? 'bg-slate-50 border-blue-300 shadow-2xs'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] font-semibold text-slate-400 w-5 shrink-0 tabular-nums">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <span className="font-bold text-slate-900 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                      · {item.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono tabular-nums text-xs shrink-0">
                  {item.secondaryLabel && (
                    <span className="text-[11px] text-slate-500 hidden md:inline">
                      {item.secondaryLabel}
                    </span>
                  )}
                  <span className="font-bold text-slate-900">{item.formattedValue}</span>
                </div>
              </div>

              {/* Calibrated Bar Track with Grid Sub-ticks & Precise Benchmark Marker */}
              <div className="relative w-full h-3.5 bg-slate-100 rounded-md overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
                  <div className="border-r border-slate-200/70" />
                  <div className="border-r border-slate-200/70" />
                  <div className="border-r border-slate-200/70" />
                  <div />
                </div>
                <div
                  className="h-full rounded-md transition-all duration-300 relative"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: item.color,
                  }}
                />
                {benchmarkPct !== null && (
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-amber-600 z-10 pointer-events-none"
                    style={{ left: `${benchmarkPct}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 4. SIGNATURE DEMAND HOTSPOTS GRAPH SUITE (QUADRANT MATRIX / GROUPED COLUMNS / DEFICIT BARS)
// ============================================================================
interface SignatureQuadrantScatterChartProps {
  districts: DistrictHotspot[];
  selectedDistrictId: string;
  onSelectDistrict: (districtId: string) => void;
  activeViewMode?: 'demand' | 'gaps' | 'investment' | 'combined';
  compact?: boolean;
}

export const SignatureQuadrantScatterChart: React.FC<SignatureQuadrantScatterChartProps> = ({
  districts,
  selectedDistrictId,
  onSelectDistrict,
  activeViewMode = 'combined',
  compact = false,
}) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictHotspot | null>(null);
  const [chartType, setChartType] = useState<'quadrant' | 'columns' | 'diverging'>('quadrant');
  const [quadrantFilter, setQuadrantFilter] = useState<
    'all' | 'unmet' | 'active' | 'existing' | 'low'
  >('all');

  const width = 860;
  const height = compact ? 440 : 510;
  const padLeft = 64;
  const padRight = 28;
  const padTop = 24;
  const padBottom = 50;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const midX = padLeft + plotW / 2; // Corresponds to ₹55 Cr on [5..105] scale
  const midY = padTop + plotH / 2; // Corresponds to Demand Index 60 on [20..100] scale

  const getBubbleColor = (gap: DistrictHotspot['infrastructureGapLevel']) => {
    if (gap === 'Critical') return '#dc2626';
    if (gap === 'High') return '#d97706';
    if (gap === 'Moderate') return '#2563eb';
    return '#0d9488';
  };

  const matchesQuadrant = (d: DistrictHotspot) => {
    if (quadrantFilter === 'all') return true;
    const highDemand = d.demandIndex >= 60;
    const highInv = d.investmentCr >= 55;
    if (quadrantFilter === 'unmet') return highDemand && !highInv;
    if (quadrantFilter === 'active') return highDemand && highInv;
    if (quadrantFilter === 'existing') return !highDemand && highInv;
    return !highDemand && !highInv;
  };

  // Safe inner coordinate mapping so bubbles never collide with quadrant banners or axes
  const getPlotX = (invCr: number) => {
    const clamped = Math.min(100, Math.max(10, invCr));
    return padLeft + ((clamped - 5) / 100) * plotW;
  };

  const getPlotY = (demandIdx: number) => {
    const topSafe = padTop + 46;
    const bottomSafe = padTop + plotH - 42;
    const safeH = bottomSafe - topSafe;
    const clamped = Math.min(98, Math.max(22, demandIdx));
    return topSafe + ((100 - clamped) / 80) * safeH;
  };

  // Curated label placement per district to guarantee zero label overlap
  const labelPlacementMap: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
    'dist-gadchiroli': 'top',
    'dist-dhubri': 'bottom',
    'dist-barmer': 'top',
    'dist-kalahandi': 'bottom',
    'dist-darbhanga': 'top',
    'dist-pune': 'right',
    'dist-kupwara': 'bottom',
    'dist-sitapur': 'top',
    'dist-raichur': 'bottom',
    'dist-ramanathapuram': 'top',
    'dist-hamirpur': 'top',
    'dist-ernakulam': 'bottom',
    'dist-indore': 'top',
    'dist-surat': 'left',
  };

  const shortName = (name: string) =>
    name
      .replace(' District', '')
      .replace(' Industrial Corridor', '')
      .replace(' Rural', '');

  const getMetricBadgeText = (d: DistrictHotspot) => {
    if (activeViewMode === 'demand') return `${(d.requestCount / 1000).toFixed(1)}k`;
    if (activeViewMode === 'gaps') return `${d.gapScore}`;
    if (activeViewMode === 'investment') return `₹${d.investmentCr}`;
    return `${d.priorityScore}`;
  };

  const plottedNodes = districts.map((d) => {
    const cx = getPlotX(d.investmentCr);
    const cy = getPlotY(d.demandIndex);
    const r = Math.max(12, Math.min(20, Math.sqrt(d.populationAffected / 330)));
    const dir = labelPlacementMap[d.id] || 'top';
    return { d, cx, cy, r, dir };
  });

  const activeHover =
    hoveredDistrict ||
    districts.find((d) => d.id === selectedDistrictId) ||
    districts[0];

  const xTicks = [15, 35, 55, 75, 95];
  const yTicks = [20, 40, 60, 80, 100];

  // Sorted districts for Grouped Columns & Diverging Views
  const sortedForColumns = [...districts].sort((a, b) => {
    if (activeViewMode === 'demand') return b.requestCount - a.requestCount;
    if (activeViewMode === 'gaps') return b.gapScore - a.gapScore;
    if (activeViewMode === 'investment') return b.investmentCr - a.investmentCr;
    return b.priorityScore - a.priorityScore;
  });

  return (
    <div className="space-y-3.5">
      {/* Top Controls: Chart Type Switcher + Quadrant Filter Pills */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
          {/* Graph Type Switcher */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-200/75 p-1 rounded-lg">
            {(
              [
                { id: 'quadrant', label: '1. Quadrant Bubble Matrix' },
                { id: 'columns', label: '2. Multi-Metric Column Graph' },
                { id: 'diverging', label: '3. Demand vs. Availability Gap' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setChartType(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  chartType === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quadrant Filter Pills (shown when Quadrant Matrix is active) */}
          {chartType === 'quadrant' ? (
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { id: 'all', label: 'All Quadrants' },
                  { id: 'unmet', label: 'Q1: Unmet Need' },
                  { id: 'active', label: 'Q2: Active Dev' },
                  { id: 'low', label: 'Q3: Low Demand' },
                  { id: 'existing', label: 'Q4: High Outlay' },
                ] as const
              ).map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuadrantFilter(q.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    quadrantFilter === q.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[11px] font-mono text-slate-500 px-2">
              Sorted by{' '}
              <strong className="text-slate-800">
                {activeViewMode === 'demand'
                  ? 'Citizen Demand Volume'
                  : activeViewMode === 'gaps'
                  ? 'Infrastructure Gap Score'
                  : activeViewMode === 'investment'
                  ? 'Existing Public Outlay (₹ Cr)'
                  : 'Composite Priority Score'}
              </strong>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* CHART TYPE 1: CALIBRATED 4-QUADRANT BUBBLE MATRIX                   */}
      {/* =================================================================== */}
      {chartType === 'quadrant' && (
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label="Citizen Demand vs Public Investment Quadrant Scatter Plot"
          >
            {/* 4 Quadrant Tinted Zones */}
            {/* Q1: Top-Left (High Demand, Low Investment) */}
            <rect
              x={padLeft}
              y={padTop}
              width={plotW / 2}
              height={plotH / 2}
              fill="#fff1f2"
              fillOpacity="0.65"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            {/* Q2: Top-Right (High Demand, High Investment) */}
            <rect
              x={midX}
              y={padTop}
              width={plotW / 2}
              height={plotH / 2}
              fill="#eff6ff"
              fillOpacity="0.65"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            {/* Q3: Bottom-Left (Low Demand, Low Investment) */}
            <rect
              x={padLeft}
              y={midY}
              width={plotW / 2}
              height={plotH / 2}
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            {/* Q4: Bottom-Right (Low Demand, High Investment) */}
            <rect
              x={midX}
              y={midY}
              width={plotW / 2}
              height={plotH / 2}
              fill="#f0fdfa"
              fillOpacity="0.7"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Coordinate Gridlines & Calibrated Tick Marks */}
            {xTicks.map((val) => {
              const x = getPlotX(val);
              const isMid = val === 55;
              return (
                <g key={`x-${val}`}>
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + plotH}
                    stroke={isMid ? '#64748b' : '#e2e8f0'}
                    strokeDasharray={isMid ? '6 4' : '3 3'}
                    strokeWidth={isMid ? '1.5' : '1'}
                  />
                  <text
                    x={x}
                    y={padTop + plotH + 18}
                    textAnchor="middle"
                    fill={isMid ? '#0f172a' : '#475569'}
                    fontSize="11"
                    fontWeight={isMid ? '700' : '500'}
                    fontFamily="monospace"
                  >
                    ₹{val} Cr
                  </text>
                </g>
              );
            })}

            {yTicks.map((val) => {
              const y = getPlotY(val);
              const isMid = val === 60;
              return (
                <g key={`y-${val}`}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={padLeft + plotW}
                    y2={y}
                    stroke={isMid ? '#64748b' : '#e2e8f0'}
                    strokeDasharray={isMid ? '6 4' : '3 3'}
                    strokeWidth={isMid ? '1.5' : '1'}
                  />
                  <text
                    x={padLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill={isMid ? '#0f172a' : '#475569'}
                    fontSize="11"
                    fontWeight={isMid ? '700' : '500'}
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Dedicated Quadrant Corner Header Strips (Outside Bubble Safe Zone) */}
            {/* Q1 Banner */}
            <rect
              x={padLeft + 8}
              y={padTop + 6}
              width={plotW / 2 - 16}
              height={22}
              rx="4"
              fill="#ffe4e6"
              stroke="#fecdd3"
            />
            <text
              x={padLeft + 16}
              y={padTop + 21}
              fill="#9f1239"
              fontSize="10"
              fontWeight="700"
            >
              Q1 · POTENTIAL UNMET NEED (High Demand · Low Investment)
            </text>

            {/* Q2 Banner */}
            <rect
              x={midX + 8}
              y={padTop + 6}
              width={plotW / 2 - 16}
              height={22}
              rx="4"
              fill="#dbeafe"
              stroke="#bfdbfe"
            />
            <text
              x={midX + 16}
              y={padTop + 21}
              fill="#1e40af"
              fontSize="10"
              fontWeight="700"
            >
              Q2 · ACTIVE DEVELOPMENT (High Demand · High Investment)
            </text>

            {/* Q3 Banner */}
            <rect
              x={padLeft + 8}
              y={padTop + plotH - 28}
              width={plotW / 2 - 16}
              height={22}
              rx="4"
              fill="#f1f5f9"
              stroke="#cbd5e1"
            />
            <text
              x={padLeft + 16}
              y={padTop + plotH - 13}
              fill="#334155"
              fontSize="10"
              fontWeight="700"
            >
              Q3 · LOWER OBSERVED DEMAND (Routine Monitoring)
            </text>

            {/* Q4 Banner */}
            <rect
              x={midX + 8}
              y={padTop + plotH - 28}
              width={plotW / 2 - 16}
              height={22}
              rx="4"
              fill="#ccfbf1"
              stroke="#99f6e4"
            />
            <text
              x={midX + 16}
              y={padTop + plotH - 13}
              fill="#115e59"
              fontSize="10"
              fontWeight="700"
            >
              Q4 · EXISTING INVESTMENT (High Investment · Baseline Met)
            </text>

            {/* Axis Titles */}
            <text
              x={midX}
              y={height - 10}
              textAnchor="middle"
              fill="#0f172a"
              fontSize="12"
              fontWeight="700"
            >
              Existing Public Investment Outlay (₹ Crore per District Sector) →
            </text>
            <text
              x={18}
              y={midY}
              textAnchor="middle"
              fill="#0f172a"
              fontSize="12"
              fontWeight="700"
              transform={`rotate(-90, 18, ${midY})`}
            >
              Citizen Demand Index (0–100) →
            </text>

            {/* Plotted District Bubbles + Pill Callout Labels */}
            {plottedNodes.map(({ d, cx, cy, r, dir }) => {
              const isSelected = d.id === selectedDistrictId;
              const isHovered = activeHover?.id === d.id;
              const visible = matchesQuadrant(d);
              const color = getBubbleColor(d.infrastructureGapLevel);
              const labelStr = shortName(d.district);
              const pillW = Math.max(64, labelStr.length * 6.5 + 16);
              const pillH = 18;

              let pillX = cx - pillW / 2;
              let pillY = cy - r - pillH - 6;
              let lineX2 = cx;
              let lineY2 = cy - r - 6;

              if (dir === 'bottom') {
                pillX = cx - pillW / 2;
                pillY = cy + r + 6;
                lineX2 = cx;
                lineY2 = cy + r + 6;
              } else if (dir === 'right') {
                pillX = cx + r + 7;
                pillY = cy - pillH / 2;
                lineX2 = cx + r + 7;
                lineY2 = cy;
              } else if (dir === 'left') {
                pillX = cx - r - pillW - 7;
                pillY = cy - pillH / 2;
                lineX2 = cx - r - 7;
                lineY2 = cy;
              }

              return (
                <g
                  key={d.id}
                  onClick={() => onSelectDistrict(d.id)}
                  onMouseEnter={() => setHoveredDistrict(d)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  className="cursor-pointer transition-opacity"
                  opacity={visible ? 1 : 0.15}
                >
                  {/* Leader tick connecting bubble to label pill */}
                  <line
                    x1={cx}
                    y1={cy}
                    x2={lineX2}
                    y2={lineY2}
                    stroke={isSelected || isHovered ? '#0f172a' : '#64748b'}
                    strokeWidth="1.2"
                  />

                  {/* Selection / Hover Halo Ring */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r + 5}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Main District Bubble */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={color}
                    fillOpacity={isSelected || isHovered ? 1 : 0.88}
                    stroke="#ffffff"
                    strokeWidth={isSelected || isHovered ? '2.5' : '2'}
                  />

                  {/* Numeric Score Inside Bubble */}
                  <text
                    x={cx}
                    y={cy + 3.5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {getMetricBadgeText(d)}
                  </text>

                  {/* Non-Overlapping Pill Callout Label */}
                  <rect
                    x={pillX}
                    y={pillY}
                    width={pillW}
                    height={pillH}
                    rx="4"
                    fill={isSelected || isHovered ? '#0f172a' : '#ffffff'}
                    stroke={isSelected || isHovered ? '#0f172a' : '#cbd5e1'}
                    strokeWidth="1"
                  />
                  <text
                    x={pillX + pillW / 2}
                    y={pillY + 12.5}
                    textAnchor="middle"
                    fill={isSelected || isHovered ? '#ffffff' : '#0f172a'}
                    fontSize="10"
                    fontWeight="700"
                  >
                    {labelStr}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Bottom Telemetry Bar inside Scatter Canvas */}
          {activeHover && (
            <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 bg-slate-50 px-3.5 py-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: getBubbleColor(activeHover.infrastructureGapLevel) }}
                />
                <strong className="text-slate-900">{activeHover.district}</strong>
                <span className="text-slate-500">({activeHover.state})</span>
                <span className="text-slate-400">·</span>
                <span className="text-blue-700 font-semibold">{activeHover.mainIssue}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums text-[11px]">
                <span>
                  Demand: <strong className="text-slate-900">{activeHover.demandIndex}/100</strong>
                </span>
                <span>
                  Outlay: <strong className="text-teal-700">₹{activeHover.investmentCr} Cr</strong>
                </span>
                <span>
                  Affected: <strong className="text-slate-900">{activeHover.populationFormatted}</strong>
                </span>
                <span>
                  Gap Score: <strong className="text-red-600">{activeHover.gapScore}/100</strong>
                </span>
                <span>
                  Priority: <strong className="text-blue-700">{activeHover.priorityScore}/100</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* CHART TYPE 2: MULTI-METRIC GROUPED COLUMN GRAPH (ALL DISTRICTS)     */}
      {/* =================================================================== */}
      {chartType === 'columns' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 pb-2.5">
            <div className="font-semibold text-slate-800">
              Side-by-Side District Comparison: Demand Index vs. Infrastructure Gap vs. Outlay (₹ Cr)
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
                <span className="text-slate-600">Demand Index (0–100)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-red-600 inline-block" />
                <span className="text-slate-600">Gap Score (0–100)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-teal-600 inline-block" />
                <span className="text-slate-600">Investment (₹ Cr)</span>
              </span>
            </div>
          </div>

          <svg
            viewBox="0 0 860 360"
            className="w-full h-auto select-none"
            role="img"
            aria-label="Multi-Metric Grouped Column Graph of Hotspot Districts"
          >
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = 280 - (tick / 100) * 230;
              return (
                <g key={tick}>
                  <line
                    x1="48"
                    y1={y}
                    x2="840"
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray={tick === 0 ? undefined : '4 4'}
                  />
                  <text
                    x="40"
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10.5"
                    fontFamily="monospace"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {sortedForColumns.map((d, idx) => {
              const slotW = (840 - 54) / sortedForColumns.length;
              const groupCenterX = 54 + idx * slotW + slotW / 2;
              const barW = Math.min(13, slotW * 0.24);
              const isSelected = d.id === selectedDistrictId;
              const isHovered = activeHover?.id === d.id;

              const demH = (d.demandIndex / 100) * 230;
              const gapH = (d.gapScore / 100) * 230;
              const invH = (Math.min(100, d.investmentCr) / 100) * 230;

              return (
                <g
                  key={d.id}
                  onClick={() => onSelectDistrict(d.id)}
                  onMouseEnter={() => setHoveredDistrict(d)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  className="cursor-pointer"
                >
                  {(isSelected || isHovered) && (
                    <rect
                      x={groupCenterX - slotW / 2 + 2}
                      y={36}
                      width={slotW - 4}
                      height={252}
                      rx="6"
                      fill={isSelected ? '#eff6ff' : '#f8fafc'}
                      stroke={isSelected ? '#3b82f6' : '#cbd5e1'}
                      strokeWidth="1"
                    />
                  )}

                  {/* Bar 1: Demand Index */}
                  <rect
                    x={groupCenterX - barW * 1.5 - 1.5}
                    y={280 - demH}
                    width={barW}
                    height={demH}
                    rx="2.5"
                    fill="#2563eb"
                  />
                  {/* Bar 2: Gap Score */}
                  <rect
                    x={groupCenterX - barW * 0.5}
                    y={280 - gapH}
                    width={barW}
                    height={gapH}
                    rx="2.5"
                    fill="#dc2626"
                  />
                  {/* Bar 3: Investment Cr */}
                  <rect
                    x={groupCenterX + barW * 0.5 + 1.5}
                    y={280 - invH}
                    width={barW}
                    height={invH}
                    rx="2.5"
                    fill="#0d9488"
                  />

                  {/* Top Priority Score Label */}
                  <text
                    x={groupCenterX}
                    y={280 - Math.max(demH, gapH, invH) - 6}
                    textAnchor="middle"
                    fill={isSelected ? '#1d4ed8' : '#0f172a'}
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    P:{d.priorityScore}
                  </text>

                  {/* District Name on X-Axis */}
                  <text
                    x={groupCenterX}
                    y={298}
                    textAnchor="end"
                    fill={isSelected ? '#0f172a' : '#334155'}
                    fontSize="10"
                    fontWeight={isSelected ? '700' : '600'}
                    transform={`rotate(-28, ${groupCenterX}, 298)`}
                  >
                    {shortName(d.district)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* CHART TYPE 3: DEMAND VS AVAILABILITY DIVERGING DEFICIT GRAPH        */}
      {/* =================================================================== */}
      {chartType === 'diverging' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 pb-2.5">
            <div className="font-semibold text-slate-800">
              Citizen Demand Index vs. Existing Infrastructure Availability (Net Deficit Span)
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span className="text-slate-600">Availability Score</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                <span className="text-slate-600">Citizen Demand Index</span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {sortedForColumns.map((d, idx) => {
              const isSelected = d.id === selectedDistrictId;
              const avail = d.availabilityScore;
              const dem = d.demandIndex;
              const leftPct = Math.min(avail, dem);
              const spanPct = Math.abs(dem - avail);

              return (
                <div
                  key={d.id}
                  onClick={() => onSelectDistrict(d.id)}
                  className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/40 border-blue-600'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400 w-5">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span className="font-bold text-slate-900">{d.district}</span>
                      <span className="text-slate-500 hidden sm:inline">· {d.mainIssue}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
                      <span className="text-emerald-700">Avail: {avail}/100</span>
                      <span className="text-red-600 font-bold">Demand: {dem}/100</span>
                      <span className="text-slate-900 font-bold">
                        Gap: {d.gapScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Dumbbell / Deficit Span Track */}
                  <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-1 bottom-1 bg-red-500/35 rounded-full"
                      style={{ left: `${leftPct}%`, width: `${spanPct}%` }}
                    />
                    <div
                      className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white -translate-x-1/2"
                      style={{ left: `${avail}%` }}
                      title={`Availability: ${avail}/100`}
                    />
                    <div
                      className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-red-600 border border-white -translate-x-1/2"
                      style={{ left: `${dem}%` }}
                      title={`Demand Index: ${dem}/100`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. MULTI-SECTOR SPIDER / RADAR GRAPH WITH DUAL-DISTRICT OVERLAY
// ============================================================================
interface MultiDistrictRadarChartProps {
  primaryDistrict: DistrictHotspot;
  compareDistrict?: DistrictHotspot;
  categories: GapCategory[];
  selectedSector?: GapCategory;
  onSelectSector?: (cat: GapCategory) => void;
}

export const MultiDistrictRadarChart: React.FC<MultiDistrictRadarChartProps> = ({
  primaryDistrict,
  compareDistrict,
  categories,
  selectedSector,
  onSelectSector,
}) => {
  const [radarMode, setRadarMode] = useState<'gap-vs-avail' | 'district-compare'>('gap-vs-avail');

  const width = 440;
  const height = 370;
  const cx = width / 2;
  const cy = height / 2 + 4;
  const maxR = 122;

  const getCoords = (idx: number, val: number) => {
    const angle = (Math.PI * 2 * idx) / categories.length - Math.PI / 2;
    const r = (Math.min(100, Math.max(0, val)) / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const buildPolygon = (vals: number[]) =>
    vals
      .map((v, idx) => {
        const pt = getCoords(idx, v);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ');

  const primaryGaps = categories.map((c) => primaryDistrict.categoryGaps[c]?.gapScore ?? 50);
  const primaryAvail = categories.map((c) => primaryDistrict.categoryGaps[c]?.availability ?? 50);
  const compareGaps = categories.map(
    (c) => (compareDistrict || primaryDistrict).categoryGaps[c]?.gapScore ?? 50
  );

  const polyPrimaryGap = buildPolygon(primaryGaps);
  const polySecondary =
    radarMode === 'gap-vs-avail' ? buildPolygon(primaryAvail) : buildPolygon(compareGaps);

  return (
    <div className="space-y-3">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setRadarMode('gap-vs-avail')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
              radarMode === 'gap-vs-avail'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gap vs. Availability
          </button>
          {compareDistrict && (
            <button
              type="button"
              onClick={() => setRadarMode('district-compare')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                radarMode === 'district-compare'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Compare vs. {compareDistrict.district.replace(' District', '')}
            </button>
          )}
        </div>
      </div>

      {/* Radar SVG */}
      <div className="flex items-center justify-center bg-slate-50/70 rounded-xl border border-slate-200/80 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[420px] h-auto select-none"
          role="img"
          aria-label="8-Sector Spider Radar Analysis"
        >
          {/* Concentric Octagon Rings */}
          {[25, 50, 75, 100].map((pct) => {
            const pts = categories
              .map((_, idx) => {
                const pt = getCoords(idx, pct);
                return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
              })
              .join(' ');
            return (
              <g key={pct}>
                <polygon
                  points={pts}
                  fill={pct === 100 ? 'rgba(255,255,255,0.6)' : 'none'}
                  stroke="#cbd5e1"
                  strokeDasharray={pct === 100 ? undefined : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={cx + 4}
                  y={cy - (pct / 100) * maxR + 10}
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  {pct}
                </text>
              </g>
            );
          })}

          {/* Axis Spokes & Exterior Labels */}
          {categories.map((cat, idx) => {
            const outer = getCoords(idx, 100);
            const labelPt = getCoords(idx, 126);
            const isSelected = selectedSector === cat;
            const gapVal = primaryDistrict.categoryGaps[cat]?.gapScore ?? 50;

            return (
              <g
                key={cat}
                onClick={() => onSelectSector && onSelectSector(cat)}
                className={onSelectSector ? 'cursor-pointer' : ''}
              >
                <line
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={isSelected ? '#2563eb' : '#cbd5e1'}
                  strokeWidth={isSelected ? '1.75' : '1'}
                />
                <text
                  x={labelPt.x}
                  y={labelPt.y - 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isSelected ? '#1d4ed8' : '#0f172a'}
                  fontSize="10"
                  fontWeight="700"
                >
                  {cat.replace(' Connectivity', '')}
                </text>
                <text
                  x={labelPt.x}
                  y={labelPt.y + 7}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  Gap {gapVal}/100
                </text>
              </g>
            );
          })}

          {/* Secondary Polygon (Availability in Teal OR Comparison District in Blue) */}
          <polygon
            points={polySecondary}
            fill={
              radarMode === 'gap-vs-avail'
                ? 'rgba(13, 148, 136, 0.20)'
                : 'rgba(37, 99, 235, 0.18)'
            }
            stroke={radarMode === 'gap-vs-avail' ? '#0d9488' : '#2563eb'}
            strokeWidth="2.2"
          />

          {/* Primary Gap Score Polygon (Crimson Red) */}
          <polygon
            points={polyPrimaryGap}
            fill="rgba(220, 38, 38, 0.22)"
            stroke="#dc2626"
            strokeWidth="2.5"
          />

          {/* Vertex Dots */}
          {categories.map((cat, idx) => {
            const p1 = getCoords(idx, primaryGaps[idx]);
            const p2 = getCoords(
              idx,
              radarMode === 'gap-vs-avail' ? primaryAvail[idx] : compareGaps[idx]
            );
            return (
              <g key={`dots-${cat}`}>
                <circle
                  cx={p2.x}
                  cy={p2.y}
                  r="3.5"
                  fill={radarMode === 'gap-vs-avail' ? '#0d9488' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
                <circle
                  cx={p1.x}
                  cy={p1.y}
                  r="4"
                  fill="#dc2626"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-5 text-xs pt-1">
        <span className="flex items-center gap-2 font-semibold text-slate-800">
          <span className="w-3 h-3 rounded-xs bg-red-600 inline-block" />
          <span>{primaryDistrict.district.replace(' District', '')} Gap Score</span>
        </span>
        <span className="flex items-center gap-2 font-semibold text-slate-800">
          <span
            className={`w-3 h-3 rounded-xs inline-block ${
              radarMode === 'gap-vs-avail' ? 'bg-teal-600' : 'bg-blue-600'
            }`}
          />
          <span>
            {radarMode === 'gap-vs-avail'
              ? 'Existing Facility Availability'
              : `${compareDistrict?.district.replace(' District', '')} Gap Score`}
          </span>
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 6. EXPLAINABLE PRIORITY SCORE WATERFALL GRAPH
// ============================================================================
interface PriorityWaterfallChartProps {
  breakdown: DistrictHotspot['scoreBreakdown'];
  totalScore: number;
  districtName: string;
}

export const PriorityWaterfallChart: React.FC<PriorityWaterfallChartProps> = ({
  breakdown,
  totalScore,
  districtName,
}) => {
  const steps = [
    { label: 'Citizen Demand', delta: breakdown.citizenDemand, color: '#2563eb' },
    { label: 'Population Impact', delta: breakdown.populationImpact, color: '#0284c7' },
    { label: 'Infra Gap', delta: breakdown.infrastructureGap, color: '#0d9488' },
    { label: 'Urgency Weight', delta: breakdown.urgency, color: '#d97706' },
    { label: '30d Trend', delta: breakdown.trend, color: '#7c3aed' },
    { label: 'Existing Inv.', delta: breakdown.existingInvestment, color: '#dc2626' },
  ];

  // Compute running cumulative start and end for each waterfall bar
  let running = 0;
  const computedBars = steps.map((s) => {
    const start = running;
    const end = running + s.delta;
    running = end;
    return { ...s, start, end };
  });

  const width = 680;
  const height = 240;
  const padLeft = 42;
  const padRight = 20;
  const padTop = 26;
  const padBottom = 42;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const maxScale = 110;

  const getY = (val: number) =>
    padTop + plotH - (Math.min(maxScale, Math.max(0, val)) / maxScale) * plotH;

  const colCount = computedBars.length + 1; // +1 for Final Total bar
  const colWidth = plotW / colCount;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-900">
          Additive Priority Score Waterfall Graph ({districtName})
        </span>
        <span className="font-mono text-slate-500">0 → 100 Scale</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label="Explainable Priority Score Waterfall Chart"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={tick === 0 ? undefined : '3 3'}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Waterfall Step Bars */}
        {computedBars.map((bar, idx) => {
          const x = padLeft + idx * colWidth + colWidth * 0.18;
          const bw = colWidth * 0.64;
          const topVal = Math.max(bar.start, bar.end);
          const bottomVal = Math.min(bar.start, bar.end);
          const yTop = getY(topVal);
          const yBottom = getY(bottomVal);
          const h = Math.max(4, yBottom - yTop);
          const nextX = padLeft + (idx + 1) * colWidth + colWidth * 0.18;

          return (
            <g key={bar.label}>
              {/* Connector line to next bar */}
              <line
                x1={x + bw}
                y1={getY(bar.end)}
                x2={nextX}
                y2={getY(bar.end)}
                stroke="#94a3b8"
                strokeDasharray="2 2"
              />
              <rect
                x={x}
                y={yTop}
                width={bw}
                height={h}
                fill={bar.color}
                rx="4"
              />
              <text
                x={x + bw / 2}
                y={yTop - 6}
                textAnchor="middle"
                fill={bar.delta >= 0 ? '#0f172a' : '#dc2626'}
                fontSize="10.5"
                fontWeight="700"
                fontFamily="monospace"
              >
                {bar.delta > 0 ? `+${bar.delta}` : bar.delta}
              </text>
              <text
                x={x + bw / 2}
                y={padTop + plotH + 18}
                textAnchor="middle"
                fill="#334155"
                fontSize="9.5"
                fontWeight="600"
              >
                {bar.label}
              </text>
            </g>
          );
        })}

        {/* Final Total Priority Score Column */}
        {(() => {
          const idx = computedBars.length;
          const x = padLeft + idx * colWidth + colWidth * 0.18;
          const bw = colWidth * 0.64;
          const yTop = getY(totalScore);
          const yBottom = getY(0);
          return (
            <g>
              <rect
                x={x}
                y={yTop}
                width={bw}
                height={Math.max(4, yBottom - yTop)}
                fill="#0f172a"
                rx="4"
              />
              <text
                x={x + bw / 2}
                y={yTop - 6}
                textAnchor="middle"
                fill="#1d4ed8"
                fontSize="11"
                fontWeight="700"
                fontFamily="monospace"
              >
                {totalScore}/100
              </text>
              <text
                x={x + bw / 2}
                y={padTop + plotH + 18}
                textAnchor="middle"
                fill="#0f172a"
                fontSize="10"
                fontWeight="700"
              >
                Final Score
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};

// ============================================================================
// 7. 5-YEAR IMPACT TRAJECTORY & DEFICIT REDUCTION CURVE (IMPACT SIMULATOR)
// ============================================================================
interface ImpactProjectionChartProps {
  beforeUnderserved: number;
  afterUnderserved: number;
  beforeDistanceKm: number;
  afterDistanceKm: number;
  investmentCr: number;
  projectCount: number;
}

export const ImpactProjectionChart: React.FC<ImpactProjectionChartProps> = ({
  beforeUnderserved,
  afterUnderserved,
  beforeDistanceKm,
  afterDistanceKm,
  investmentCr,
  projectCount,
}) => {
  // Build 5-stage implementation trajectory from Baseline -> Q2 -> Year 1 -> Year 2 -> Full Commissioning
  const stages = [
    {
      stage: 'Baseline',
      underserved: beforeUnderserved,
      distance: beforeDistanceKm,
    },
    {
      stage: '6 Months',
      underserved: Math.round(
        beforeUnderserved - (beforeUnderserved - afterUnderserved) * 0.25
      ),
      distance: Number(
        (beforeDistanceKm - (beforeDistanceKm - afterDistanceKm) * 0.25).toFixed(1)
      ),
    },
    {
      stage: 'Year 1',
      underserved: Math.round(
        beforeUnderserved - (beforeUnderserved - afterUnderserved) * 0.62
      ),
      distance: Number(
        (beforeDistanceKm - (beforeDistanceKm - afterDistanceKm) * 0.62).toFixed(1)
      ),
    },
    {
      stage: 'Year 2',
      underserved: Math.round(
        beforeUnderserved - (beforeUnderserved - afterUnderserved) * 0.88
      ),
      distance: Number(
        (beforeDistanceKm - (beforeDistanceKm - afterDistanceKm) * 0.88).toFixed(1)
      ),
    },
    {
      stage: 'Full Rollout',
      underserved: afterUnderserved,
      distance: afterDistanceKm,
    },
  ];

  const width = 680;
  const height = 230;
  const padLeft = 52;
  const padRight = 46;
  const padTop = 26;
  const padBottom = 36;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxPop = Math.max(10000, beforeUnderserved * 1.1);
  const maxDist = Math.max(10, beforeDistanceKm * 1.15);

  const getX = (i: number) => padLeft + (i / (stages.length - 1)) * plotW;
  const getPopY = (v: number) => padTop + plotH - (v / maxPop) * plotH;
  const getDistY = (v: number) => padTop + plotH - (v / maxDist) * plotH;

  const popPath = stages
    .map((s, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getPopY(s.underserved).toFixed(1)}`)
    .join(' ');
  const popArea = `${popPath} L ${getX(stages.length - 1).toFixed(1)} ${padTop + plotH} L ${getX(0).toFixed(1)} ${padTop + plotH} Z`;

  const distPath = stages
    .map((s, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getDistY(s.distance).toFixed(1)}`)
    .join(' ');

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-900">
          Projected Phased Deficit Reduction Curve ({projectCount} Units · ₹{investmentCr} Cr)
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
            <span>Underserved Population</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-teal-600 inline-block" />
            <span>Avg Access Distance (km)</span>
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label="Phased Deficit Reduction Trajectory"
      >
        <defs>
          <linearGradient id="simPopGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((t, idx) => {
          const y = padTop + plotH - t * plotH;
          const popLabel = `${Math.round((maxPop * t) / 1000)}K`;
          const distLabel = `${(maxDist * t).toFixed(0)}km`;
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={idx === 0 ? undefined : '3 3'}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                fill="#2563eb"
                fontSize="9.5"
                fontFamily="monospace"
              >
                {popLabel}
              </text>
              <text
                x={width - padRight + 8}
                y={y + 4}
                textAnchor="start"
                fill="#0d9488"
                fontSize="9.5"
                fontFamily="monospace"
              >
                {distLabel}
              </text>
            </g>
          );
        })}

        <path d={popArea} fill="url(#simPopGrad)" />
        <path d={popPath} fill="none" stroke="#2563eb" strokeWidth="2.5" />
        <path
          d={distPath}
          fill="none"
          stroke="#0d9488"
          strokeWidth="2.5"
          strokeDasharray="5 3"
        />

        {stages.map((s, i) => {
          const x = getX(i);
          const py = getPopY(s.underserved);
          const dy = getDistY(s.distance);
          return (
            <g key={s.stage}>
              <circle cx={x} cy={py} r="4" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
              <text
                x={x}
                y={py - 8}
                textAnchor="middle"
                fill="#1e3a8a"
                fontSize="9.5"
                fontWeight="700"
                fontFamily="monospace"
              >
                {(s.underserved / 1000).toFixed(0)}K
              </text>

              <circle cx={x} cy={dy} r="4" fill="#0d9488" stroke="#fff" strokeWidth="1.5" />
              <text
                x={x}
                y={dy + 14}
                textAnchor="middle"
                fill="#0f766e"
                fontSize="9.5"
                fontWeight="700"
                fontFamily="monospace"
              >
                {s.distance}km
              </text>

              <text
                x={x}
                y={padTop + plotH + 20}
                textAnchor="middle"
                fill="#334155"
                fontSize="10.5"
                fontWeight="600"
              >
                {s.stage}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
