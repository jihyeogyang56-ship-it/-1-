import React from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileQuestion,
  Users,
  Activity,
  ArrowRight,
  Flame,
  Cpu,
  Plus,
} from 'lucide-react';
import {
  InspectionItem,
  WorkerDosimetry,
  RadiationEquipment,
  UserProfile,
} from '../types/radiation';
import {
  isItemOverdue,
  isItemImminent,
  getStatusStyle,
  getPriorityStyle,
  getDaysRemainingText,
} from '../utils/statusHelpers';

interface DashboardViewProps {
  items: InspectionItem[];
  workers: WorkerDosimetry[];
  equipment: RadiationEquipment[];
  currentUser: UserProfile;
  onSelectItem: (item: InspectionItem) => void;
  onOpenNewItem: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  workers,
  equipment,
  currentUser,
  onSelectItem,
  onOpenNewItem,
  onNavigateTab,
}) => {
  // Compute counts
  const totalItems = items.length;
  const unaddressedCount = items.filter((i) => i.status === '미조치').length;
  const inProgressCount = items.filter((i) => i.status === '조치 진행 중').length;
  const pendingReviewCount = items.filter((i) => i.status === '관리자 확인 대기').length;
  const completedCount = items.filter((i) => i.status === '최종 완료').length;
  const overdueItems = items.filter((i) => isItemOverdue(i.dueDate, i.status));
  const imminentItems = items.filter((i) => isItemImminent(i.dueDate, i.status));

  const completionRate = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Max dose in current quarter across workers
  const maxDoseWorker = workers.reduce((max, w) => (w.deepDoseHp10 > max.deepDoseHp10 ? w : max), workers[0]);
  const alaraWarningCount = workers.filter((w) => w.isAlaraWarning).length;

  // Equipment breakdown
  const normalEq = equipment.filter((e) => e.status === '정상 가동').length;
  const warningEq = equipment.filter((e) => e.status === '점검 요망').length;
  const brokenEq = equipment.filter((e) => e.status === '수리 중 / 사용중지').length;

  // Personal assigned items for current user
  const myAssignedItems = items.filter((i) =>
    i.assignee.toLowerCase().includes(currentUser.name.split(' ')[0].toLowerCase())
  );
  const myPendingAction = myAssignedItems.filter((i) => i.status !== '최종 완료');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              방사선 안전점검 종합 관제 대시보드
            </h2>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              실시간 동기화
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            점검 지적 사항의 방치를 방지하고, 조치 기한 준수 및 최종 완료를 투명하게 추적합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('hazards')}
            className="px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-teal-700" />
            <span>위험 요소 자율 신고</span>
          </button>
          <button
            onClick={onOpenNewItem}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
            <span>점검 항목 등록</span>
          </button>
        </div>
      </div>

      {/* User Task Brief Banner (if assignee has pending tasks) */}
      {myPendingAction.length > 0 && !currentUser.isAdmin && (
        <div className="p-4 bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.slice(0, 1)}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {currentUser.name} 님에게 배정된 미완료 조치 항목이 {myPendingAction.length}건 있습니다.
              </div>
              <div className="text-2xs text-slate-600 mt-0.5">
                조치를 완료하신 후 결과를 입력하고 관리자에게 검토를 요청해 주세요.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('assignees')}
            className="px-3 py-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 hover:bg-teal-100/60 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            내 담당 항목 확인 <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Overdue Urgent Alert Banner */}
      {overdueItems.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-900">
                조치 기한 초과(지연) 항목 {overdueItems.length}건 경보
              </div>
              <div className="text-2xs text-rose-700 mt-0.5">
                안전점검 후 지정된 기한까지 조치가 완료되지 않았습니다. 우선순위 조치와 관리자 확인이 시급합니다.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inspections')}
            className="px-3 py-1.5 text-xs font-bold text-rose-800 bg-white hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors whitespace-nowrap"
          >
            초과 항목 즉시 확인
          </button>
        </div>
      )}

      {/* 6 Key Status Metrics Grid (Monochrome with Red only for Unaddressed/Overdue) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <div className="bg-black p-4 rounded-xl border border-white">
          <div className="text-2xs text-slate-300 font-medium">전체 등록 항목</div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {totalItems}
            </div>
            <span className="text-2xs text-slate-400">건</span>
          </div>
          <div className="mt-2 text-2xs text-slate-300">
            완료율 <strong className="text-white font-mono">{completionRate}%</strong>
          </div>
        </div>

        {/* Unaddressed (Important Alert: Highlighted in Red) */}
        <div className="bg-rose-950/70 p-4 rounded-xl border-2 border-rose-500">
          <div className="text-2xs text-rose-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> 미조치
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-200">
              {unaddressedCount}
            </div>
            <span className="text-2xs text-rose-300 font-bold">건</span>
          </div>
          <div className="mt-2 text-2xs text-rose-300 font-semibold">조치 착수 대기</div>
        </div>

        {/* In Progress */}
        <div className="bg-black p-4 rounded-xl border border-amber-500/30">
          <div className="text-2xs text-amber-300 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 조치 진행 중
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-200">
              {inProgressCount}
            </div>
            <span className="text-2xs text-amber-300 font-semibold">건</span>
          </div>
          <div className="mt-2 text-2xs text-slate-300">현장 개선 중</div>
        </div>

        {/* Pending Admin Review */}
        <div className="bg-black p-4 rounded-xl border border-sky-500/30">
          <div className="text-2xs text-sky-300 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> 관리자 확인 대기
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tabular-nums text-sky-200">
              {pendingReviewCount}
            </div>
            <span className="text-2xs text-sky-300 font-semibold">건</span>
          </div>
          <div className="mt-2 text-2xs text-slate-300">최종 승인 대기</div>
        </div>

        {/* Completed */}
        <div className="bg-black p-4 rounded-xl border border-emerald-500/30">
          <div className="text-2xs text-emerald-300 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 최종 완료
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-200">
              {completedCount}
            </div>
            <span className="text-2xs text-emerald-300 font-semibold">건</span>
          </div>
          <div className="mt-2 text-2xs text-slate-300">점검 종결 완료</div>
        </div>

        {/* Overdue (Important Alert: Highlighted in Red) */}
        <div className="bg-rose-950/80 p-4 rounded-xl border-2 border-rose-500">
          <div className="text-2xs text-rose-200 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> 기한 초과
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-100">
              {overdueItems.length}
            </div>
            <span className="text-2xs text-rose-300 font-bold">건 지연</span>
          </div>
          <div className="mt-2 text-2xs text-rose-300 font-bold">긴급 독촉 필요</div>
        </div>
      </div>

      {/* Progress & Specialized Gauges Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Workflow Status Bar & Progress */}
        <div className="bg-black p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 점검 후속조치 진행 현황
            </h3>
            <span className="text-2xs font-mono font-bold text-slate-200">
              <span className="text-emerald-400 font-bold">{completedCount}</span> / {totalItems} 건 완료
            </span>
          </div>

          {/* Segmented Progress Bar (Direct Hex Backgrounds to prevent CSS override) */}
          <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-700/60 gap-0.5 shadow-inner">
            {completedCount > 0 && (
              <div
                style={{
                  width: `${(completedCount / (totalItems || 1)) * 100}%`,
                  backgroundColor: '#10b981',
                }}
                className="h-full rounded-sm transition-all duration-500 shadow-xs"
                title={`최종 완료: ${completedCount}건 (${Math.round((completedCount / (totalItems || 1)) * 100)}%)`}
              />
            )}
            {pendingReviewCount > 0 && (
              <div
                style={{
                  width: `${(pendingReviewCount / (totalItems || 1)) * 100}%`,
                  backgroundColor: '#38bdf8',
                }}
                className="h-full rounded-sm transition-all duration-500 shadow-xs"
                title={`관리자 확인 대기: ${pendingReviewCount}건 (${Math.round((pendingReviewCount / (totalItems || 1)) * 100)}%)`}
              />
            )}
            {inProgressCount > 0 && (
              <div
                style={{
                  width: `${(inProgressCount / (totalItems || 1)) * 100}%`,
                  backgroundColor: '#fbbf24',
                }}
                className="h-full rounded-sm transition-all duration-500 shadow-xs"
                title={`조치 진행 중: ${inProgressCount}건 (${Math.round((inProgressCount / (totalItems || 1)) * 100)}%)`}
              />
            )}
            {unaddressedCount > 0 && (
              <div
                style={{
                  width: `${(unaddressedCount / (totalItems || 1)) * 100}%`,
                  backgroundColor: '#f43f5e',
                }}
                className="h-full rounded-sm transition-all duration-500 shadow-xs"
                title={`미조치: ${unaddressedCount}건 (${Math.round((unaddressedCount / (totalItems || 1)) * 100)}%)`}
              />
            )}
          </div>

          {/* Status Chips with matching color dots and borders */}
          <div className="grid grid-cols-4 gap-2 text-center text-2xs pt-1">
            <div className="p-1.5 bg-emerald-950/50 border border-emerald-500/60 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-xs" />
              <span className="text-emerald-300 font-bold whitespace-nowrap">완료 {completedCount}</span>
            </div>
            <div className="p-1.5 bg-sky-950/50 border border-sky-500/60 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 shadow-xs" />
              <span className="text-sky-300 font-bold whitespace-nowrap">검토 {pendingReviewCount}</span>
            </div>
            <div className="p-1.5 bg-amber-950/50 border border-amber-500/60 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-xs" />
              <span className="text-amber-300 font-bold whitespace-nowrap">진행 {inProgressCount}</span>
            </div>
            <div className="p-1.5 bg-rose-950/70 border border-rose-500 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0 shadow-xs" />
              <span className="text-rose-300 font-bold whitespace-nowrap">미조치 {unaddressedCount}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Worker Dosimetry & ALARA Quarter Gauge */}
        <div className="bg-black p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-white" /> 종사자 피폭선량 (이번 분기 최고치)
            </h3>
            <button
              onClick={() => onNavigateTab('dosimetry')}
              className="text-2xs text-slate-300 hover:text-white hover:underline flex items-center gap-0.5"
            >
              전체 모니터링 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Seamless, Continuous Pastel Gauge SVG with Clear Unobstructed Spacing */}
            <div className="relative w-40 h-28 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 140 100" className="w-full h-full select-none">
                {/* Continuous Background Pastel Track */}
                <path
                  d="M 32 48 A 38 38 0 0 1 108 48"
                  fill="none"
                  stroke="#2d3139"
                  strokeWidth="8"
                  strokeLinecap="round"
                />

                {/* Seamless Value Arc in Soft Pastel */}
                {(() => {
                  const maxDose = maxDoseWorker.deepDoseHp10;
                  const fraction = Math.min(1, Math.max(0, maxDose / 12.5));
                  const arcLength = Math.PI * 38; // 119.38
                  const strokeOffset = arcLength * (1 - fraction);
                  // Soft pastel colors: Safe pastel green, Warning pastel amber, Risk pastel coral
                  const strokeColor = maxDose >= 3.0 ? '#fca5a5' : maxDose >= 1.5 ? '#fde047' : '#86efac';

                  // Needle pointer coordinates restricted strictly to the upper semicircle (y <= 48)
                  const angleDeg = -180 + fraction * 180;
                  const angleRad = (angleDeg * Math.PI) / 180;
                  const needleRadius = 26;
                  const nx = 70 + needleRadius * Math.cos(angleRad);
                  const ny = 48 + needleRadius * Math.sin(angleRad);

                  return (
                    <>
                      <path
                        d="M 32 48 A 38 38 0 0 1 108 48"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={arcLength}
                        strokeDashoffset={strokeOffset}
                      />
                      {/* Needle Indicator in Crisp White */}
                      <line
                        x1="70"
                        y1="48"
                        x2={nx}
                        y2={ny}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="70" cy="48" r="3.5" fill="#ffffff" />
                    </>
                  );
                })()}

                {/* Scale Ticks at ends */}
                <text x="26" y="52" textAnchor="end" fill="#9ca3af" fontSize="8" fontFamily="monospace">
                  0
                </text>
                <text x="114" y="52" textAnchor="start" fill="#9ca3af" fontSize="8" fontFamily="monospace">
                  12.5
                </text>

                {/* Distinctly Spaced Numerical Value (Pure Bold White) */}
                <text
                  x="70"
                  y="73"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="20"
                  fontWeight="900"
                  fontFamily="monospace"
                >
                  {maxDoseWorker.deepDoseHp10.toFixed(2)}
                </text>

                {/* Distinctly Spaced Unit Text (Clearly separated below number) */}
                <text
                  x="70"
                  y="90"
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  mSv / 분기
                </text>
              </svg>
            </div>

            {/* ALARA on top, Department and Person below */}
            <div className="flex-1 text-xs space-y-2">
              <div className="flex items-center justify-between whitespace-nowrap">
                <span className="text-slate-300">ALARA 기준:</span>
                <span className={`font-bold ${alaraWarningCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {alaraWarningCount > 0 ? `⚠️ ${alaraWarningCount}명 주의보` : '안전 (기준치 이하)'}
                </span>
              </div>
              <div className="flex items-center justify-between whitespace-nowrap">
                <span className="text-slate-300">최고 피폭자:</span>
                <span className="font-bold text-white">{maxDoseWorker.name}</span>
              </div>
              <div className="flex items-center justify-between whitespace-nowrap">
                <span className="text-slate-300">소속 부서:</span>
                <span className="text-slate-100">{maxDoseWorker.department}</span>
              </div>
            </div>
          </div>

          {/* Clean 2-Row Footer without mid-word line wrapping */}
          <div className="pt-2.5 text-2xs border-t border-white/20 space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">법적 허용 한도:</span>
              <span className="font-mono text-white font-semibold">분기 12.5 mSv / 연간 50 mSv</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">자체 관리 기준:</span>
              <span className="font-mono text-white flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />안전
                </span>
                <span className="flex items-center gap-1 text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />주의
                </span>
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />초과 위험
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Equipment & Facilities Condition */}
        <div className="bg-black p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-white" /> 방사선 발생장치 가동 상태
            </h3>
            <button
              onClick={() => onNavigateTab('equipment')}
              className="text-2xs text-slate-300 hover:text-white hover:underline flex items-center gap-0.5"
            >
              관리구역 공간 배치도 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-neutral-900">
              <div className="text-lg font-bold font-mono text-white">{normalEq}</div>
              <div className="text-2xs text-slate-200 font-semibold mt-0.5">정상 가동</div>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-900">
              <div className="text-lg font-bold font-mono text-white">{warningEq}</div>
              <div className="text-2xs text-slate-200 font-semibold mt-0.5">점검 요망</div>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-500">
              <div className="text-lg font-bold font-mono text-rose-300">{brokenEq}</div>
              <div className="text-2xs text-rose-300 font-bold mt-0.5">사용 중지</div>
            </div>
          </div>

          <div className="text-2xs text-slate-200 bg-neutral-900 p-2 rounded flex items-center justify-between">
            <span>차기 원안위(NSSC) 검사:</span>
            <span className="font-semibold text-rose-400 font-mono">CT 1호기 (2026-11-28)</span>
          </div>
        </div>
      </div>

      {/* Main Inspection Follow-up Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              최근 점검 발견 및 미완료 조치 항목 목록
            </h3>
            <p className="text-xs text-slate-500">
              클릭하여 담당자 조치 내용 입력 또는 안전관리책임자 승인 처리를 진행하세요.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('inspections')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto"
          >
            전체 점검 항목 관리 바로가기 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 font-mono whitespace-nowrap min-w-[95px]">코드</th>
                <th className="py-2.5 px-4 min-w-[200px]">점검 항목명</th>
                <th className="py-2.5 px-4 min-w-[170px]">관련 장비 및 장소</th>
                <th className="py-2.5 px-4 whitespace-nowrap min-w-[110px]">담당자</th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap min-w-[150px]">조치 기한</th>
                <th className="py-2.5 px-4 text-center whitespace-nowrap min-w-[75px]">우선순위</th>
                <th className="py-2.5 px-4 text-center whitespace-nowrap min-w-[105px]">진행 상태</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap min-w-[85px]">조치 관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => {
                const isOverdue = isItemOverdue(item.dueDate, item.status);
                const isImminent = isItemImminent(item.dueDate, item.status);
                const statusStyle = getStatusStyle(item.status);
                const priorityStyle = getPriorityStyle(item.priority);

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-500 group-hover:text-teal-700 whitespace-nowrap">
                      {item.itemCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="line-clamp-1">{item.title}</div>
                      <div className="text-2xs text-slate-500 line-clamp-1 font-normal mt-0.5">
                        {item.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="truncate max-w-[180px]">{item.locationOrEquipment}</div>
                      <div className="text-2xs text-slate-400">{item.department}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                      {item.assignee}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-800 font-medium">{item.dueDate}</span>
                        <span className="text-slate-400 font-normal">·</span>
                        <span
                          className={`text-2xs font-semibold ${
                            isOverdue
                              ? 'text-rose-600'
                              : isImminent
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {getDaysRemainingText(item.dueDate, item.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-2xs ${priorityStyle.bg}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-2xs font-semibold border ${statusStyle.bg} ${statusStyle.border}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="px-2.5 py-1 text-2xs font-semibold text-slate-700 hover:text-teal-900 bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded transition-colors"
                      >
                        상세 / 처리
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
