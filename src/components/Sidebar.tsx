import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ShieldAlert,
  Activity,
  Cpu,
  Atom,
  FileCheck2,
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'inspections'
  | 'assignees'
  | 'hazards'
  | 'dosimetry'
  | 'equipment'
  | 'isotopes'
  | 'reports';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  overdueCount: number;
  pendingReviewCount: number;
  hazardPendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  overdueCount,
  pendingReviewCount,
  hazardPendingCount,
}) => {
  const navItems: {
    id: TabId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
    section?: string;
  }[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: <LayoutDashboard className="w-4 h-4" />,
      section: '관제 및 총괄',
    },
    {
      id: 'inspections',
      label: '점검 항목 관리',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 font-bold',
      section: '핵심 점검 워크플로우',
    },
    {
      id: 'assignees',
      label: '담당자별 조치 현황',
      icon: <Users className="w-4 h-4" />,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'hazards',
      label: '자율 안전 신고',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: hazardPendingCount > 0 ? hazardPendingCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'dosimetry',
      label: '종사자 피폭선량 (ALARA)',
      icon: <Activity className="w-4 h-4" />,
      section: '전문 안전 관제',
    },
    {
      id: 'equipment',
      label: '관리구역 배치도 및 QA / QC',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: 'isotopes',
      label: '방사성동위원소 (RI) 현황',
      icon: <Atom className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: '점검 이력 및 공식 보고서',
      icon: <FileCheck2 className="w-4 h-4" />,
      section: '법정 기록 및 출력',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 select-none border-r border-slate-800">
      {/* Hospital Dept Header Badge */}
      <div className="p-4 border-b border-slate-800">
        <div className="text-2xs font-semibold uppercase tracking-wider text-teal-400">
          Medical Radiation Safety Dept
        </div>
        <div className="text-xs font-bold text-white mt-0.5">
          진단용 방사선 안전관리실
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => {
          const isActive = activeTab === item.id;
          const showSection = item.section && (idx === 0 || navItems[idx - 1]?.section !== item.section);

          return (
            <React.Fragment key={item.id}>
              {showSection && (
                <div className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {item.section}
                </div>
              )}
              <button
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`font-mono text-2xs px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white font-bold' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer System Status Info */}
      <div className="p-3.5 border-t border-slate-800 text-2xs text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span>원자력안전법 준수 규격</span>
          <span className="font-mono text-teal-400">v2.6</span>
        </div>
        <div>진단용 방사선 발생장치의 안전관리에 관한 규칙 표준서식 대응</div>
      </div>
    </aside>
  );
};
