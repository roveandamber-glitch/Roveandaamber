"use client";
import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart2, Activity, Calendar } from 'lucide-react';
import ChartMonthStatusView from './ChartMonthStatusView';

export default function LuxuryAnalyticsChart({
  points = [],
  months = [],
  title = "Revenue Trajectory Over Time",
  subtitle = "Gross sales in INR",
  badgeText = "Live Dynamic Feed",
  periodLabel = "Selected Period",
  height = 280,
  onViewMonth,
  onDownloadMonth,
  downloadingKey
}) {
  const [chartMode, setChartMode] = useState('spline'); // 'spline' | 'bars' | 'months'
  const [hoverIndex, setHoverIndex] = useState(null);

  // Normalize points strictly from database
  const data = useMemo(() => {
    return Array.isArray(points) ? points : [];
  }, [points]);

  const maxSale = useMemo(() => {
    const m = Math.max(...data.map(d => Number(d.sales || 0)), 1000);
    return Math.ceil(m / 5000) * 5000; // clean tick rounding
  }, [data]);

  const totalSales = useMemo(() => {
    return data.reduce((acc, c) => acc + Number(c.sales || 0), 0);
  }, [data]);

  const avgRunRate = useMemo(() => {
    return data.length > 0 ? Math.round(totalSales / data.length) : 0;
  }, [data, totalSales]);

  const peakPoint = useMemo(() => {
    return data.reduce((max, p) => Number(p.sales || 0) > Number(max.sales || 0) ? p : max, data[0] || {});
  }, [data]);

  // SVG Coordinates calculation
  const paddingX = 40;
  const paddingY = 25;
  const svgWidth = 800;
  const svgHeight = height;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const coords = useMemo(() => {
    if (data.length <= 1) return [];
    return data.map((d, i) => {
      const x = paddingX + (i / (data.length - 1)) * chartWidth;
      const val = Number(d.sales || 0);
      const y = paddingY + chartHeight - (val / maxSale) * chartHeight;
      return { x, y, ...d };
    });
  }, [data, maxSale, chartWidth, chartHeight, paddingX, paddingY]);

  // Build smooth cubic Bézier spline path
  const { linePath, areaPath } = useMemo(() => {
    if (coords.length < 2) return { linePath: '', areaPath: '' };

    let dLine = `M ${coords[0].x} ${coords[0].y}`;

    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      dLine += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const baselineY = paddingY + chartHeight;
    const dArea = `${dLine} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`;

    return { linePath: dLine, areaPath: dArea };
  }, [coords, paddingY, chartHeight]);

  // Y-Axis Ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
    val: Math.round(maxSale * pct),
    y: paddingY + chartHeight - pct * chartHeight
  }));

  const activePoint = hoverIndex !== null && coords[hoverIndex] ? coords[hoverIndex] : null;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#E8DFC8] shadow-[0_4px_24px_rgba(30,20,10,0.03)] overflow-hidden">
      
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#F4EFE6]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1B100A] tracking-tight m-0">
              {title}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {badgeText}
            </span>
          </div>
          <p className="text-xs text-[#6B5D50] font-light mt-0.5 m-0">
            {subtitle} for <strong className="font-medium text-[#1B100A]">{periodLabel}</strong>
          </p>
        </div>

        {/* View Mode & Metric Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:self-auto">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#F7F4EE] p-0.5 rounded-xl border border-[#E8DEC8]">
            <button
              type="button"
              onClick={() => setChartMode('spline')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartMode === 'spline'
                  ? 'bg-black text-white shadow-2xs font-bold'
                  : 'text-[#6B5D50] hover:text-black'
              }`}
              title="Continuous Spline Area Graph"
            >
              <Activity size={12} />
              <span>Trend Curve</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('bars')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartMode === 'bars'
                  ? 'bg-black text-white shadow-2xs font-bold'
                  : 'text-[#6B5D50] hover:text-black'
              }`}
              title="Volume Bar Matrix"
            >
              <BarChart2 size={12} />
              <span>Volume Bars</span>
            </button>
            {months.length > 0 && (
              <button
                type="button"
                onClick={() => setChartMode('months')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  chartMode === 'months'
                    ? 'bg-black text-white shadow-2xs font-bold'
                    : 'text-[#6B5D50] hover:text-black'
                }`}
                title="Month-Wise Orders & Financials"
              >
                <Calendar size={12} />
                <span>Month Status</span>
              </button>
            )}
          </div>

          <span className="text-xs bg-[#FAF7F2] text-[#8C6D1F] font-mono font-semibold px-3 py-1.5 rounded-xl border border-[#E8DFC8]">
            Avg: ₹{avgRunRate.toLocaleString('en-IN')}/day
          </span>
          <span className="text-xs bg-[#FAF7F2] text-[#B38728] font-mono font-bold px-3 py-1.5 rounded-xl border border-[#E8DFC8]">
            Peak: ₹{Number(peakPoint.sales || 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* SVG Analytics Graph Container / Month Status View */}
      <div className="relative w-full select-none" style={{ minHeight: height }}>
        {chartMode === 'months' ? (
          <ChartMonthStatusView
            months={months}
            onViewMonth={onViewMonth}
            onDownloadMonth={onDownloadMonth}
            downloadingKey={downloadingKey}
          />
        ) : data.length === 0 ? (
          <div className="h-60 sm:h-72 w-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <Activity size={24} className="text-[#C49A45] mb-2 opacity-50" />
            <p className="text-xs font-serif font-medium text-stone-700 m-0">
              No sales transactions recorded for this period
            </p>
            <p className="text-[11px] text-stone-400 mt-1 m-0">
              Real-time transaction analytics from database will reflect here automatically.
            </p>
          </div>
        ) : (
          <>
            {/* Floating Tooltip */}
            {activePoint && (
              <div
                className="absolute z-30 pointer-events-none transition-all duration-150 ease-out -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(activePoint.x / svgWidth) * 100}%`,
                  top: `${(activePoint.y / svgHeight) * 100 - 8}%`
                }}
              >
                <div className="bg-[#140D07]/95 backdrop-blur-md text-white rounded-xl p-2.5 shadow-2xl border border-[#DEB368]/40 text-xs min-w-[130px] space-y-1">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#ECC880] pb-1 border-b border-white/10 flex items-center justify-between">
                    <span>{activePoint.day || activePoint.date}</span>
                    {activePoint.orders !== undefined && (
                      <span className="text-stone-300 font-mono">({activePoint.orders} ord)</span>
                    )}
                  </div>
                  <div className="font-mono font-bold text-sm text-white pt-0.5">
                    ₹{Number(activePoint.sales || 0).toLocaleString('en-IN')}
                  </div>
                  {activePoint.orders > 0 && (
                    <div className="text-[10px] text-stone-400 font-mono">
                      AOV: ₹{Math.round(activePoint.sales / activePoint.orders).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SVG Viewport */}
            {chartMode === 'spline' ? (
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto overflow-visible"
                onMouseLeave={() => setHoverIndex(null)}
              >
                <defs>
                  <linearGradient id="luxuryGoldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C49A45" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#DEB368" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#ECC880" stopOpacity="0.0" />
                  </linearGradient>
                  <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Lines & Y-Axis Reference Ticks */}
                {yTicks.map((tick, i) => (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={tick.y}
                      x2={svgWidth - paddingX}
                      y2={tick.y}
                      stroke="#E8DFC9"
                      strokeWidth="0.8"
                      strokeDasharray={i === 0 ? "none" : "3 3"}
                      opacity={i === 0 ? 0.8 : 0.5}
                    />
                    <text
                      x={paddingX - 8}
                      y={tick.y + 3.5}
                      textAnchor="end"
                      fontSize="9.5"
                      fill="#9C8E7D"
                      fontFamily="monospace"
                    >
                      ₹{tick.val >= 1000 ? `${Math.round(tick.val / 1000)}k` : tick.val}
                    </text>
                  </g>
                ))}

                {/* Gradient Area Fill */}
                {areaPath && (
                  <path d={areaPath} fill="url(#luxuryGoldGradient)" />
                )}

                {/* Glowing Spline Curve */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#B8860B"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#goldGlow)"
                  />
                )}

                {/* Hover Guide Crosshair */}
                {activePoint && (
                  <line
                    x1={activePoint.x}
                    y1={paddingY}
                    x2={activePoint.x}
                    y2={paddingY + chartHeight}
                    stroke="#C49A45"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Interactive Data Points */}
                {coords.map((pt, i) => {
                  const isHovered = hoverIndex === i;
                  return (
                    <g key={i} className="cursor-pointer">
                      <rect
                        x={pt.x - 16}
                        y={paddingY}
                        width={32}
                        height={chartHeight}
                        fill="transparent"
                        onMouseEnter={() => setHoverIndex(i)}
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 3.5}
                        fill={isHovered ? '#140D07' : '#FFFFFF'}
                        stroke={isHovered ? '#ECC880' : '#B8860B'}
                        strokeWidth={isHovered ? 2.5 : 1.8}
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}
              </svg>
            ) : (
              /* Volume Bars View */
              <div className="h-64 sm:h-72 w-full flex items-end gap-1.5 sm:gap-2.5 px-2 relative pt-6">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-[#B38728] w-full" />
                  <div className="border-b border-[#B38728] w-full" />
                  <div className="border-b border-[#B38728] w-full" />
                  <div className="border-b border-[#B38728] w-full" />
                </div>

                {data.map((point, idx) => {
                  const val = Number(point.sales || 0);
                  const heightPct = maxSale > 0 ? Math.max(8, Math.round((val / maxSale) * 100)) : 8;
                  const isHovered = hoverIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-0 flex flex-col items-center group relative h-full justify-end z-10 cursor-pointer"
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseLeave={() => setHoverIndex(null)}
                    >
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[34px] rounded-t-xl transition-all duration-200 shadow-xs ${
                          isHovered
                            ? 'bg-gradient-to-t from-[#B8860B] via-[#C49A45] to-[#ECC880] scale-x-110 shadow-md'
                            : 'bg-gradient-to-t from-[#B8860B]/85 via-[#D4A64A]/90 to-[#ECC880]'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* X-Axis Timeline Labels */}
            <div className="flex justify-between text-[10px] sm:text-[11px] text-[#8C7A6B] mt-2.5 border-t border-[#E8DFC8] pt-2 font-mono">
              {data.map((point, idx) => {
                const shouldShow = data.length <= 10 || idx === 0 || idx === data.length - 1 || idx % 4 === 0;
                return (
                  <span
                    key={idx}
                    className={`truncate text-center flex-1 transition-opacity ${
                      hoverIndex === idx ? 'text-[#1C1714] font-bold' : shouldShow ? 'opacity-100' : 'opacity-0 sm:opacity-40'
                    }`}
                  >
                    {point.day || point.date}
                  </span>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
