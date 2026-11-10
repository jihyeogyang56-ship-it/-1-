import React, { useState, useEffect } from 'react';
import {
  Atom,
  Battery,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { Radioisotope, WasteDrum } from '../types/radiation';
import {
  calculateCurrentActivity,
  generateDecayCurvePoints,
  formatMBqWithCi,
} from '../utils/halfLife';

interface IsotopeLifecycleViewProps {
  isotopes: Radioisotope[];
  wasteDrums: WasteDrum[];
  onDischargeDrum: (drumId: string) => void;
}

export const IsotopeLifecycleView: React.FC<IsotopeLifecycleViewProps> = ({
  isotopes,
  wasteDrums,
  onDischargeDrum,
}) => {
  const [selectedIso, setSelectedIso] = useState<Radioisotope>(isotopes[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute for decay tracking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Compute live current activity for selected isotope
  const { currentActivityMBq, decayFraction, elapsedMinutes } = calculateCurrentActivity(
    selectedIso.initialActivityMBq,
    selectedIso.receivedDateTime,
    selectedIso.halfLifeMinutes,
    currentTime
  );

  // Generate decay points for SVG curve (up to 4 half-lives)
  const totalCurveTime = selectedIso.halfLifeMinutes * 4;
  const curvePoints = generateDecayCurvePoints(
    selectedIso.initialActivityMBq,
    selectedIso.halfLifeMinutes,
    totalCurveTime
  );

  // Waste drums eligible for clearance (surface dose <= 1.0)
  const eligibleDrums = wasteDrums.filter(
    (d) => d.isEligibleForDisposal && d.disposalStatus !== '자체 폐기 완료'
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              방사성동위원소(RI) 라이프사이클 및 폐기물 감쇠 관제
            </h2>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              핵의학 / 종양학 전용
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            원자력안전법에 따른 핵종별 물리적 반감기 감쇠 실시간 계산, 드럼별 포화도 모니터링 및 자체 폐기 허용치(1.0 μSv/h 이하) 적격 드럼을 관리합니다.
          </p>
        </div>

        <div className="text-right text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          현재 동기화: {currentTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Decay-in-Storage Clearance Notice (Popup Banner) */}
      {eligibleDrums.length > 0 && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>법정 자체 폐기 가능(Decay-in-Storage Clearance) 드럼 {eligibleDrums.length}건 발생</span>
            </div>
            <span className="text-2xs bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
              표면선량률 1.0 μSv/h 미만 충족
            </span>
          </div>

          <p className="text-xs text-emerald-800 leading-relaxed">
            보관소 내 단반감기 동위원소 폐기물이 법정 감쇠 기준치 이하로 떨어져 일반 의료폐기물 또는 자체 소각 / 위탁 폐기가 허용되었습니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {eligibleDrums.map((drum) => (
              <div
                key={drum.id}
                className="p-3 bg-white border border-emerald-200 rounded-lg flex items-center justify-between shadow-2xs"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span className="font-mono">{drum.drumNumber}</span>
                    <span className="text-2xs text-slate-500 font-normal">({drum.radioisotope})</span>
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5">
                    표면선량률: <strong className="text-emerald-700 font-mono">{drum.surfaceDoseRateMicroSv} μSv/h</strong> (기준 1.0 이하)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDischargeDrum(drum.id)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 자체 폐기 승인
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Split: Isotope Decay Curve & Live Calculations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Decay Curve Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-teal-600" />
                물리적 반감기 감쇠 곡선: {selectedIso.nuclide} ({selectedIso.compoundName})
              </h3>
              <div className="text-2xs text-slate-500 font-mono">
                반감기: {selectedIso.halfLifeDisplay} · 입고 후 {elapsedMinutes}분 경과
              </div>
            </div>

            {/* Isotope Selector Chips */}
            <div className="flex items-center gap-1">
              {isotopes.map((iso) => (
                <button
                  key={iso.id}
                  onClick={() => setSelectedIso(iso)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    selectedIso.id === iso.id
                      ? 'bg-slate-900 text-teal-300 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {iso.nuclide}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart for Decay (High Contrast Dark Theme with Generous Margins & No Line Overlap) */}
          <div className="relative w-full h-68 bg-black rounded-xl overflow-hidden p-4 select-none">
            {/* Subtle Grid */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <svg viewBox="0 0 430 220" className="w-full h-full">
              {/* Axes with Generous Distance from Card Edges */}
              <line x1="50" y1="28" x2="50" y2="175" stroke="#71717a" strokeWidth="1.5" />
              <line x1="50" y1="175" x2="405" y2="175" stroke="#71717a" strokeWidth="1.5" />

              {/* T half markers on X axis with plenty of breathing room */}
              {[1, 2, 3, 4].map((n) => {
                const x = 50 + (n * (340 / 4));
                return (
                  <g key={n}>
                    <line x1={x} y1="175" x2={x} y2="182" stroke="#a1a1aa" strokeWidth="1.5" />
                    <text x={x} y="196" textAnchor="middle" fill="#d4d4d8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      {n} T½
                    </text>
                  </g>
                );
              })}

              {/* Y Axis Labels with clear contrast */}
              <text x="42" y="38" textAnchor="end" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                A₀
              </text>
              <text x="42" y="106" textAnchor="end" fill="#d4d4d8" fontSize="10" fontFamily="monospace">
                50%
              </text>
              <text x="42" y="175" textAnchor="end" fill="#d4d4d8" fontSize="10" fontFamily="monospace">
                0
              </text>

              {/* Decay Path & Current Point */}
              {(() => {
                const maxActivity = selectedIso.initialActivityMBq;
                const curveYTop = 36;
                const curveYBottom = 175;
                const curveHeight = curveYBottom - curveYTop;

                const pathD = curvePoints.reduce((acc, pt, index) => {
                  const x = 50 + (pt.t / totalCurveTime) * 340;
                  const y = curveYBottom - (pt.activity / maxActivity) * curveHeight;
                  return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '');

                // Clamp current position accurately to curve endpoint
                const currentFraction = Math.min(1, Math.max(0, elapsedMinutes / totalCurveTime));
                const currentX = 50 + currentFraction * 340;
                const currentY = currentFraction >= 1
                  ? curveYBottom - (curvePoints[curvePoints.length - 1].activity / maxActivity) * curveHeight
                  : curveYBottom - (Math.max(0, currentActivityMBq) / maxActivity) * curveHeight;

                // Badge box dimensions
                const boxW = 126;
                const boxH = 26;

                // Function to get curve Y at any X fraction
                const getCurveYAtFrac = (f: number) => {
                  const actFrac = Math.pow(0.5, Math.min(4, Math.max(0, f * 4)));
                  return curveYBottom - actFrac * curveHeight;
                };

                let boxX: number;
                let boxY: number;
                let lineStartX: number;
                let lineStartY: number;
                let lineEndX: number;
                let lineEndY: number;

                if (currentFraction < 0.3) {
                  // Top-left steep region: position box to upper-right of dot with ample separation
                  boxX = Math.min(345, Math.max(125, currentX + 74));
                  boxY = Math.max(20, currentY - 20);

                  // Ensure box bottom is at least 18px above the curve at its leftmost X
                  const boxLeftX = Math.max(50, boxX - boxW / 2);
                  const curveYAtLeft = getCurveYAtFrac((boxLeftX - 50) / 340);
                  const maxAllowedBoxY = curveYAtLeft - 18 - boxH / 2;
                  if (boxY > maxAllowedBoxY) {
                    boxY = maxAllowedBoxY;
                  }
                  boxY = Math.max(18, boxY);

                  lineStartX = currentX + 9;
                  lineStartY = currentY - 6;
                  lineEndX = boxX - boxW / 2;
                  lineEndY = boxY;
                } else {
                  // Flatter right/lower region: elevate box directly above dot with generous clearance
                  boxX = Math.min(345, Math.max(125, currentX));
                  boxY = currentY - 46;

                  // Ensure box bottom is comfortably above the curve at its leftmost X
                  const boxLeftX = Math.max(50, boxX - boxW / 2);
                  const curveYAtLeft = getCurveYAtFrac((boxLeftX - 50) / 340);
                  const maxAllowedBoxY = curveYAtLeft - 18 - boxH / 2;
                  boxY = Math.max(20, Math.min(boxY, maxAllowedBoxY));

                  lineStartX = currentX;
                  lineStartY = currentY - 12;
                  lineEndX = boxX;
                  lineEndY = boxY + boxH / 2;
                }

                return (
                  <>
                    {/* Decay Curve Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#5eead4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Connecting Leader Line from Dot to Badge (generous distance, clear link) */}
                    <line
                      x1={lineStartX}
                      y1={lineStartY}
                      x2={lineEndX}
                      y2={lineEndY}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeDasharray="3,2.5"
                      opacity="0.75"
                    />
                    <circle cx={lineStartX} cy={lineStartY} r="1.5" fill="#38bdf8" />
                    <circle cx={lineEndX} cy={lineEndY} r="2" fill="#38bdf8" />

                    {/* Current Position Dot with Multi-layered Glow */}
                    <circle cx={currentX} cy={currentY} r="12" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.25" strokeDasharray="2,2" />
                    <circle cx={currentX} cy={currentY} r="8" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.65" />
                    <circle cx={currentX} cy={currentY} r="4.5" fill="#38bdf8" />

                    {/* Rectangular Box: Spaced away from dot and curve with generous breathing room */}
                    <g transform={`translate(${boxX}, ${boxY})`} className="pointer-events-none">
                      <rect
                        x={-boxW / 2}
                        y={-boxH / 2}
                        width={boxW}
                        height={boxH}
                        rx="5"
                        fill="#0c1017"
                        stroke="#38bdf8"
                        strokeWidth="1.4"
                        style={{ filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.7))' }}
                      />
                      {/* Pulse Status Indicator inside box */}
                      <circle cx={-boxW / 2 + 12} cy="0" r="3" fill="#38bdf8" />
                      <circle cx={-boxW / 2 + 12} cy="0" r="5.5" fill="#38bdf8" opacity="0.3" />

                      {/* Value Text */}
                      <text
                        x={-boxW / 2 + 22}
                        y="1"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        현재: {currentActivityMBq.toLocaleString()} MBq
                      </text>
                    </g>
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="flex items-center justify-between text-2xs text-slate-500 pt-1">
            <span>감쇠 공식: A(t) = A₀ × (0.5)^(t / T½)</span>
            <span className="font-mono text-teal-700 font-semibold">
              잔여 방사능 비율: {(decayFraction * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Live Isotope Status & Dosage Specs (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-2xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              {selectedIso.sourceType}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              {selectedIso.nuclide} · {selectedIso.compoundName}
            </h3>
            <div className="text-2xs text-slate-500 mt-0.5">{selectedIso.purpose}</div>
          </div>

          {/* Activity Comparison Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-2xs text-slate-400">입고 초기 방사능</div>
              <div className="text-sm font-bold font-mono text-slate-800 mt-1">
                {selectedIso.initialActivityMBq.toLocaleString()} MBq
              </div>
              <div className="text-[10px] text-slate-500">
                ({(selectedIso.initialActivityMBq / 37).toFixed(1)} mCi)
              </div>
            </div>

            <div className="p-3 bg-teal-50/80 rounded-lg border border-teal-200">
              <div className="text-2xs text-teal-700 font-semibold">현재 잔여 방사능 (실시간)</div>
              <div className="text-sm font-bold font-mono text-teal-900 mt-1">
                {currentActivityMBq.toLocaleString()} MBq
              </div>
              <div className="text-[10px] text-teal-700">
                ({(currentActivityMBq / 37).toFixed(2)} mCi)
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-500">보관 장소:</span>
              <span className="font-semibold text-slate-800">{selectedIso.storageLocation}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-500">입고 일시:</span>
              <span className="font-mono text-slate-800">{selectedIso.receivedDateTime.replace('T', ' ')}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-500">취급 책임자:</span>
              <span className="font-semibold text-slate-800">{selectedIso.manager}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radioactive Waste Drums Saturation Monitoring Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              방사성 폐기물 보관소 드럼(Drum)별 포화도 및 감쇠 모니터링
            </h3>
            <p className="text-xs text-slate-500">
              폐기물 드럼별 적재 포화도(%)와 표면선량률 감쇠 상태를 배터리 게이지 스타일로 추적합니다.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">총 4개 보관 드럼</span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wasteDrums.map((drum) => {
            const isFull = drum.saturationPercent >= 90;
            const isCleared = drum.disposalStatus === '자체 폐기 완료';
            const canDischarge = drum.isEligibleForDisposal && !isCleared;

            return (
              <div
                key={drum.id}
                className={`p-4 rounded-xl border transition-all ${
                  canDischarge
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-200 bg-white'
                } space-y-3 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between text-2xs mb-1">
                    <span className="font-mono font-bold text-slate-900">{drum.drumNumber}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        isCleared
                          ? 'bg-slate-100 text-slate-500'
                          : canDischarge
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {drum.disposalStatus}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-800 line-clamp-1">{drum.wasteType}</div>
                  <div className="text-2xs text-slate-500">{drum.radioisotope}</div>

                  {/* Battery Saturation Gauge */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-2xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-slate-400" /> 드럼 포화도
                      </span>
                      <span className="font-mono font-bold text-slate-800">{drum.saturationPercent}%</span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        style={{ width: `${drum.saturationPercent}%` }}
                        className={`h-full rounded-full transition-all ${
                          isFull
                            ? 'bg-rose-500'
                            : drum.saturationPercent >= 70
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Radiation Dose Rate */}
                  <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-100 text-2xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">표면선량률:</span>
                      <span
                        className={`font-mono font-bold ${
                          drum.surfaceDoseRateMicroSv <= 1.0
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {drum.surfaceDoseRateMicroSv} μSv/h
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>보관 개시:</span>
                      <span className="font-mono">{drum.storageStartDate}</span>
                    </div>
                  </div>
                </div>

                {/* Disposal Button */}
                {canDischarge && (
                  <button
                    type="button"
                    onClick={() => onDischargeDrum(drum.id)}
                    className="w-full mt-2 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 자체 폐기 처리
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
