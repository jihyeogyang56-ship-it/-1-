import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  User,
  HeartPulse,
  BookOpen,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import { WorkerDosimetry } from '../types/radiation';
import { CURRENT_SYSTEM_DATE } from '../utils/statusHelpers';

interface DosimetryViewProps {
  workers: WorkerDosimetry[];
  onAddWorkerRecord: (record: WorkerDosimetry) => void;
}

export const DosimetryView: React.FC<DosimetryViewProps> = ({
  workers,
  onAddWorkerRecord,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // ALARA Warning group (quarter dose >= 3.0 or marked warning)
  const alaraAlertWorkers = workers.filter((w) => w.isAlaraWarning || w.deepDoseHp10 >= 3.0);

  // Department dose averages for Heatmap
  const deptDoseMap = workers.reduce((acc, w) => {
    if (!acc[w.department]) {
      acc[w.department] = { sum: 0, count: 0 };
    }
    acc[w.department].sum += w.deepDoseHp10;
    acc[w.department].count += 1;
    return acc;
  }, {} as Record<string, { sum: number; count: number }>);

  const deptHeatmap = Object.entries(deptDoseMap).map(([dept, data]) => {
    const avg = data.sum / data.count;
    return {
      dept,
      avg: Number(avg.toFixed(2)),
      count: data.count,
    };
  });

  // Calculate highest dose
  const highestWorker = workers.reduce((max, w) => (w.deepDoseHp10 > max.deepDoseHp10 ? w : max), workers[0]);

  // Modal State for New Dosimetry Entry
  const [newName, setNewName] = useState('');
  const [newWorkerId, setNewWorkerId] = useState('');
  const [newDept, setNewDept] = useState('영상의학과 일반촬영실');
  const [newRole, setNewRole] = useState('방사선사');
  const [newBadge, setNewBadge] = useState('TLD-2641-10');
  const [newDeepDose, setNewDeepDose] = useState('0.40');
  const [newShallowDose, setNewShallowDose] = useState('0.45');
  const [newHealthDate, setNewHealthDate] = useState('2026-11-20');

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newWorkerId.trim()) return;

    const deepDoseNum = parseFloat(newDeepDose) || 0;
    const isAlara = deepDoseNum >= 3.0;

    const newWorker: WorkerDosimetry = {
      id: `w-${Date.now()}`,
      workerId: newWorkerId,
      name: newName,
      department: newDept,
      role: newRole,
      dosimeterBadgeNo: newBadge,
      monitoringQuarter: '2026년 4분기',
      deepDoseHp10: deepDoseNum,
      shallowDoseHp007: parseFloat(newShallowDose) || 0,
      cumulativeYearlyDose: deepDoseNum * 2,
      fiveYearCumulativeDose: deepDoseNum * 5,
      lastHealthCheckDate: '2026-05-10',
      nextHealthCheckDueDate: newHealthDate,
      educationStatus: '이수 완료',
      educationCompletionDate: '2026-10-15',
      isAlaraWarning: isAlara,
    };

    onAddWorkerRecord(newWorker);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              종사자 피폭선량 및 ALARA 조기 경보 관제
            </h2>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              2026년 4분기 모니터링
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            원자력안전법 및 의료법에 따른 개인선량계(TLD / OSL) 판독 연동, ALARA 기준치 조기 경보 및 특수건강진단 일정을 통합 관리합니다.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>신규 판독 기록 입력</span>
        </button>
      </div>

      {/* ALARA Early Warning Banner (High Priority) */}
      {alaraAlertWorkers.length > 0 && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>ALARA(합리적 최소화) 조기 경보 대상자 {alaraAlertWorkers.length}명 감지</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            원자력안전법 법적 한도(연간 50 mSv, 분기 12.5 mSv)에 도달하기 전, 자체 설정한 분기 기준치(3.0 mSv)를 초과하였거나 초과 위험이 있는 종사자 명단입니다. 투시시간 단축, 납안경 / 납차폐막 착용 여부 재점검 및 근무조 순환 배치를 권고합니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {alaraAlertWorkers.map((w) => (
              <div
                key={w.id}
                className="p-3 bg-white border border-rose-200 rounded-lg flex items-center justify-between shadow-2xs"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{w.name} ({w.role})</span>
                    <span className="text-2xs bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono font-bold">
                      {w.workerId}
                    </span>
                  </div>
                  <div className="text-2xs text-slate-500 mt-0.5">{w.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-rose-700 tabular-nums">
                    {w.deepDoseHp10} mSv
                  </div>
                  <div className="text-[10px] text-rose-600 font-semibold">ALARA 초과 위험</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Gauge & Heatmap Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gauge Chart Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" /> 분기 누적 피폭선량 게이지
            </h3>
            <span className="text-2xs font-mono font-semibold text-slate-500">
              최고치: {highestWorker?.name}
            </span>
          </div>

          {/* Semicircle Gauge Visual (Continuous, Seamless Pastel Curve with Ample Spacing) */}
          <div className="relative w-80 h-50 mx-auto flex items-center justify-center pt-2">
            <svg viewBox="0 0 200 150" className="w-full h-full">
              {/* Continuous Background Track without Gaps */}
              <path
                d="M 25 90 A 75 75 0 0 1 175 90"
                fill="none"
                stroke="#27272a"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Seamless Value Arc (Soft Pastel Gradient/Color) */}
              {(() => {
                const dose = highestWorker ? highestWorker.deepDoseHp10 : 0;
                const fraction = Math.min(1, Math.max(0, dose / 12.5));
                const arcLength = Math.PI * 75; // 235.62
                const strokeOffset = arcLength * (1 - fraction);
                const strokeColor = dose >= 3.0 ? '#fca5a5' : dose >= 1.5 ? '#fde047' : '#86efac';

                const angleDeg = -180 + fraction * 180;
                const angleRad = (angleDeg * Math.PI) / 180;
                const needleLength = 54;
                const x2 = 100 + needleLength * Math.cos(angleRad);
                const y2 = 90 + needleLength * Math.sin(angleRad);

                return (
                  <>
                    <path
                      d="M 25 90 A 75 75 0 0 1 175 90"
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={arcLength}
                      strokeDashoffset={strokeOffset}
                    />
                    {/* Needle Indicator in Crisp White */}
                    <line
                      x1="100"
                      y1="90"
                      x2={x2}
                      y2={y2}
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="100" cy="90" r="5" fill="#ffffff" />
                  </>
                );
              })()}

              {/* Ample Spacing Below Pivot: Clean Readout in Pure White */}
              <text
                x="100"
                y="120"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="22"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {highestWorker?.deepDoseHp10.toFixed(2)}{' '}
                <tspan fontSize="13" fill="#d1d5db" fontFamily="sans-serif">
                  mSv
                </tspan>
              </text>
              <text
                x="100"
                y="136"
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="11"
              >
                분기 누적 최고 심부선량
              </text>
            </svg>
          </div>

          {/* Signal Indicator Legend (Calm palette, no color words) */}
          <div className="grid grid-cols-3 gap-2 text-center text-2xs pt-3 border-t border-neutral-800">
            <div className="p-2 bg-neutral-900 rounded">
              <div className="font-bold text-white flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 안전
              </div>
              <div className="text-[10px] text-slate-300 font-mono mt-0.5">&lt; 1.5 mSv</div>
            </div>
            <div className="p-2 bg-neutral-900 rounded">
              <div className="font-bold text-white flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 주의
              </div>
              <div className="text-[10px] text-slate-300 font-mono mt-0.5">1.5 ~ 4.9 mSv</div>
            </div>
            <div className="p-2 bg-rose-950/70 rounded border border-rose-500">
              <div className="font-bold text-rose-300 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> 초과 위험
              </div>
              <div className="text-[10px] text-rose-300 font-mono mt-0.5">&ge; 5.0 mSv</div>
            </div>
          </div>
        </div>

        {/* Department Exposure Heatmap (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white">부서별 피폭선량 분포 히트맵</h3>
              <p className="text-2xs text-slate-300 mt-0.5">
                근무 파트별 평균 피폭선량의 짙기를 시각화하여 순환 근무조 편성 근거로 활용합니다.
              </p>
            </div>
            <span className="text-2xs text-slate-300">단위: 평균 mSv</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {deptHeatmap.map((item) => {
              // High contrast projector palette: only high risk is highlighted in red, others in high contrast black/white
              const isHigh = item.avg >= 2.5;

              return (
                <div
                  key={item.dept}
                  className={`p-3.5 rounded-xl transition-all flex flex-col justify-between ${
                    isHigh
                      ? 'bg-rose-950/70 border-2 border-rose-500 text-rose-200'
                      : 'bg-neutral-900 text-white'
                  }`}
                >
                  <div className="text-xs font-bold truncate" title={item.dept}>
                    {item.dept}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-lg font-mono font-bold tabular-nums">
                      {item.avg}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isHigh
                          ? 'border border-rose-400 bg-rose-900/50 text-rose-200 font-bold'
                          : 'bg-neutral-800 text-slate-200'
                      }`}
                    >
                      {item.count}명 측정
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-2xs text-slate-600 flex items-center justify-between">
            <span>💡 <strong>인터벤션 심혈관조영실</strong>의 평균 선량이 가장 높으므로 납차폐 가림판 및 천장부유 차폐판 점검 권고</span>
          </div>
        </div>
      </div>

      {/* Integrated Worker Table: TLD / OSL + Special Health Check D-Day + Training */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              방사선관계종사자 개인선량계 판독치 및 특수건강진단 연동 대장
            </h3>
            <p className="text-xs text-slate-500">
              분기 판독 결과(심부 / 표층 선량)와 차기 특수건강진단 도래일, 법정 안전교육 이수 현황을 일괄 관리합니다.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600">
            총 종사자: {workers.length}명 등록
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 font-mono whitespace-nowrap min-w-[95px]">사번</th>
                <th className="py-2.5 px-4 whitespace-nowrap min-w-[150px]">종사자명 / 직무</th>
                <th className="py-2.5 px-4 min-w-[160px]">소속 부서</th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap min-w-[125px]">선량계 번호</th>
                <th className="py-2.5 px-4 font-mono text-right whitespace-nowrap min-w-[120px]">심부선량 Hp(10)</th>
                <th className="py-2.5 px-4 font-mono text-right whitespace-nowrap min-w-[120px]">표층선량 Hp(0.07)</th>
                <th className="py-2.5 px-4 font-mono text-right whitespace-nowrap min-w-[110px]">연간 누적</th>
                <th className="py-2.5 px-4 whitespace-nowrap min-w-[170px]">특수건강진단 도래일</th>
                <th className="py-2.5 px-4 text-center whitespace-nowrap min-w-[95px]">법정 안전교육</th>
                <th className="py-2.5 px-4 text-center whitespace-nowrap min-w-[95px]">ALARA 판정</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {workers.map((w) => {
                const isAlara = w.isAlaraWarning || w.deepDoseHp10 >= 3.0;

                // Health check D-Day calculation
                const dueTime = new Date(w.nextHealthCheckDueDate).getTime();
                const nowTime = new Date(CURRENT_SYSTEM_DATE).getTime();
                const dDay = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));

                return (
                  <tr
                    key={w.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isAlara ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-slate-500 font-medium whitespace-nowrap">
                      {w.workerId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{w.name}</span>
                        <span className="text-2xs text-slate-500">({w.role})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{w.department}</td>
                    <td className="py-3 px-4 font-mono text-2xs text-slate-600 whitespace-nowrap">
                      {w.dosimeterBadgeNo}
                    </td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          w.deepDoseHp10 >= 3.0
                            ? 'text-rose-600'
                            : w.deepDoseHp10 >= 1.5
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {w.deepDoseHp10.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">mSv</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums text-slate-600 whitespace-nowrap">
                      {w.shallowDoseHp007.toFixed(2)}
                      <span className="text-[10px] text-slate-400 ml-1">mSv</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-right tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                      {w.cumulativeYearlyDose.toFixed(2)}
                      <span className="text-[10px] text-slate-400 ml-1">mSv</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-800 text-2xs font-medium">
                          {w.nextHealthCheckDueDate}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span
                          className={`text-2xs font-bold ${
                            dDay < 0
                              ? 'text-rose-600'
                              : dDay <= 14
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {dDay < 0 ? `${Math.abs(dDay)}일 지연` : dDay === 0 ? '오늘 마감' : `D-${dDay}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {w.educationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isAlara ? (
                        <span className="inline-block px-2 py-0.5 rounded text-2xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          ⚠️ 주의보
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-2xs font-semibold text-emerald-700">
                          정상 (안전)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Worker Dosimetry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">신규 선량계 판독치 등록</h3>
            <form onSubmit={handleCreateWorker} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">성명</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">사번</label>
                  <input
                    type="text"
                    required
                    value={newWorkerId}
                    onChange={(e) => setNewWorkerId(e.target.value)}
                    placeholder="예: RAD-075"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">선량계 번호</label>
                  <input
                    type="text"
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">심부선량 Hp(10) (mSv)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newDeepDose}
                    onChange={(e) => setNewDeepDose(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">표층선량 Hp(0.07) (mSv)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newShallowDose}
                    onChange={(e) => setNewShallowDose(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">차기 특수건강진단 기한</label>
                <input
                  type="date"
                  value={newHealthDate}
                  onChange={(e) => setNewHealthDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white font-bold rounded-lg"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
