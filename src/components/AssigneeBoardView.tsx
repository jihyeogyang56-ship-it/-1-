import React from 'react';
import { Users, AlertTriangle, CheckCircle2, Clock, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { InspectionItem, UserProfile, WorkerDosimetry } from '../types/radiation';
import { DEMO_USERS } from '../data/mockData';
import {
  getStatusStyle,
  getPriorityStyle,
  isItemOverdue,
  getDaysRemainingText,
} from '../utils/statusHelpers';

interface AssigneeBoardViewProps {
  items: InspectionItem[];
  currentUser: UserProfile;
  workers?: WorkerDosimetry[];
  onSelectItem: (item: InspectionItem) => void;
  onOpenNewItem: () => void;
}

export const AssigneeBoardView: React.FC<AssigneeBoardViewProps> = ({
  items,
  currentUser,
  workers = [],
  onSelectItem,
}) => {
  // Aggregate items by each assignee in DEMO_USERS
  const assigneeStats = DEMO_USERS.map((user) => {
    const assigned = items.filter((item) =>
      item.assignee.toLowerCase().includes(user.name.split(' ')[0].toLowerCase())
    );
    const completed = assigned.filter((i) => i.status === '최종 완료').length;
    const pendingReview = assigned.filter((i) => i.status === '관리자 확인 대기').length;
    const inProgress = assigned.filter((i) => i.status === '조치 진행 중').length;
    const unaddressed = assigned.filter((i) => i.status === '미조치').length;
    const overdue = assigned.filter((i) => isItemOverdue(i.dueDate, i.status)).length;
    const rate = assigned.length > 0 ? Math.round((completed / assigned.length) * 100) : 0;

    // Associated worker dosimetry for ALARA status
    const workerRecord = workers.find(
      (w) => w.name.includes(user.name.split(' ')[0]) || user.name.includes(w.name)
    );

    return {
      user,
      assigned,
      completed,
      pendingReview,
      inProgress,
      unaddressed,
      overdue,
      rate,
      workerRecord,
    };
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          담당자별 방사선 안전조치 진행 현황
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          배정된 담당자별 업무 부하, 조치 완료율 및 기한 초과 지연 현황을 종합 점검합니다.
        </p>
      </div>

      {/* Assignee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {assigneeStats.map(({ user, assigned, completed, pendingReview, inProgress, unaddressed, overdue, rate, workerRecord }) => {
          const isCurrentUser = currentUser.id === user.id;

          return (
            <div
              key={user.id}
              className={`bg-black rounded-xl transition-all overflow-hidden shadow-md flex flex-col ${
                isCurrentUser
                  ? 'ring-2 ring-teal-500/50'
                  : ''
              }`}
            >
              {/* Card Header: ALARA on top, Department below */}
              <div className="p-4 flex items-start justify-between bg-black border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 bg-neutral-800"
                  >
                    {user.avatarInitials.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {user.name}
                      {isCurrentUser && (
                        <span className="text-[10px] bg-white text-black font-bold px-1.5 py-0.5 rounded">
                          현재 로그인
                        </span>
                      )}
                    </div>
                    {/* ALARA 기준 위치를 부서보다 위로 우선 배치 */}
                    <div className="flex items-center gap-1 text-2xs mt-0.5 whitespace-nowrap">
                      <span className="text-slate-400">ALARA 기준:</span>
                      <span
                        className={`font-bold ${
                          workerRecord?.isAlaraWarning
                            ? 'text-rose-400'
                            : 'text-white'
                        }`}
                      >
                        {workerRecord?.isAlaraWarning
                          ? `⚠️ 주의보 (${workerRecord.deepDoseHp10} mSv)`
                          : '안전 (기준치 이하)'}
                      </span>
                    </div>
                    {/* 소속 부서는 ALARA 아래에 표기 */}
                    <div className="text-2xs text-slate-300 mt-0.5 whitespace-nowrap">
                      소속: {user.department} · {user.role}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-white">
                    {assigned.length}건 배정
                  </span>
                  {overdue > 0 && (
                    <div className="text-2xs font-bold text-rose-400 flex items-center gap-0.5 justify-end mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{overdue}건 지연</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar & Mini Stats (All numbers in clean WHITE, except unaddressed in red) */}
              <div className="p-4 space-y-3 flex-1 flex flex-col bg-black">
                <div>
                  <div className="flex items-center justify-between text-2xs mb-1">
                    <span className="text-slate-300 font-medium">조치 완료율</span>
                    <span className="font-mono font-bold text-white">{rate}%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${rate}%` }}
                      className="h-full bg-white transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Sub status summary: Numbers in pure WHITE */}
                <div className="grid grid-cols-4 gap-1 text-center text-2xs py-1.5 bg-neutral-900 rounded-lg">
                  <div>
                    <div className="text-slate-400">미조치</div>
                    <div className={`font-mono font-bold ${unaddressed > 0 ? 'text-rose-400' : 'text-white'}`}>
                      {unaddressed}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">진행중</div>
                    <div className="font-mono font-bold text-white">{inProgress}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">검토대기</div>
                    <div className="font-mono font-bold text-white">{pendingReview}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">완료</div>
                    <div className="font-mono font-bold text-white">{completed}</div>
                  </div>
                </div>

                {/* Items list for this assignee */}
                <div className="space-y-2 mt-2 flex-1">
                  <div className="text-2xs font-bold text-white">배정된 점검 항목</div>
                  {assigned.length === 0 ? (
                    <div className="text-2xs text-slate-400 py-3 text-center">
                      현재 배정된 항목이 없습니다.
                    </div>
                  ) : (
                    assigned.map((item) => {
                      const isOverdue = isItemOverdue(item.dueDate, item.status);
                      const statusStyle = getStatusStyle(item.status);

                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectItem(item)}
                          className="p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer group space-y-1"
                        >
                          <div className="flex items-center justify-between text-2xs">
                            <span className="font-mono text-slate-300 group-hover:text-white">
                              {item.itemCode}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold border ${statusStyle.bg} ${statusStyle.border}`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-white line-clamp-1">
                            {item.title}
                          </div>

                          <div className="flex items-center justify-between text-2xs pt-0.5">
                            <span className="text-slate-300 font-mono">기한: {item.dueDate}</span>
                            <span
                              className={`font-semibold ${
                                isOverdue
                                  ? 'text-rose-400 font-bold'
                                  : 'text-slate-300'
                              }`}
                            >
                              {getDaysRemainingText(item.dueDate, item.status)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
