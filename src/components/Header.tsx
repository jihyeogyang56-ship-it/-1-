import React, { useState } from 'react';
import {
  Shield,
  Bell,
  Printer,
  ChevronDown,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  Palette,
  Moon,
  Sun,
  Radio,
} from 'lucide-react';
import { UserProfile, InspectionItem } from '../types/radiation';
import { DEMO_USERS } from '../data/mockData';
import { isItemOverdue, isItemImminent } from '../utils/statusHelpers';

export type AppTheme = 'navy' | 'light' | 'emerald';

interface HeaderProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  inspectionItems: InspectionItem[];
  onOpenReportPrint: () => void;
  onResetData: () => void;
  onSelectItem: (item: InspectionItem) => void;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  inspectionItems,
  onOpenReportPrint,
  onResetData,
  onSelectItem,
  currentTheme,
  onSelectTheme,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  const overdueItems = inspectionItems.filter((i) => isItemOverdue(i.dueDate, i.status));
  const imminentItems = inspectionItems.filter((i) => isItemImminent(i.dueDate, i.status));
  const pendingReviewItems = inspectionItems.filter((i) => i.status === '관리자 확인 대기');

  const totalAlertCount = overdueItems.length + pendingReviewItems.length + imminentItems.length;

  const themeOptions = [
    {
      id: 'navy' as AppTheme,
      name: '네이비 관제센터 (Dark Cockpit)',
      desc: '의료기기 관제탑 스타일의 딥 네이비 테마',
      icon: <Moon className="w-3.5 h-3.5 text-cyan-400" />,
      colorClass: 'bg-[#0c1527] border-cyan-500/40 text-cyan-400',
    },
    {
      id: 'light' as AppTheme,
      name: '클리니컬 라이트 (Clinical Light)',
      desc: '병원 환경에 최적화된 밝고 선명한 테마',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
      colorClass: 'bg-white border-slate-300 text-slate-800',
    },
    {
      id: 'emerald' as AppTheme,
      name: '사이버 에메랄드 (Radiation Shield)',
      desc: '판독실용 고대비 방사선 안전 에메랄드 테마',
      icon: <Radio className="w-3.5 h-3.5 text-emerald-400" />,
      colorClass: 'bg-[#081713] border-emerald-500/40 text-emerald-400',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 px-4 md:px-8 flex items-center justify-between gap-4 select-none transition-colors">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
          <Shield className="w-5 h-5 text-teal-100" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap">
            병원 진단용 방사선 안전관리 시스템
          </div>
          <div className="text-2xs text-slate-500 whitespace-nowrap hidden sm:block">
            방사선 안전점검 · 후속조치 워크플로우 · ALARA 모니터링
          </div>
        </div>
      </div>

      {/* Zone 2: Quick Status Indicators / Hospital Info */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100/80 rounded-md text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium">서울대형병원 안전관리실</span>
          <span className="text-slate-400">|</span>
          <span className="font-mono text-2xs text-slate-500">기준일: 2026-11-06</span>
        </div>

        {overdueItems.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-md font-semibold text-2xs animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>기한 초과 {overdueItems.length}건 발생</span>
          </div>
        )}
      </div>

      {/* Zone 3: Interactive Controls & User Role Switcher */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Theme Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            title="화면 테마 및 배경 스타일 변경"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-teal-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Palette className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">테마 전환</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showThemeDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-1.5 text-2xs text-slate-500 font-semibold border-b border-slate-100 mb-1 flex items-center justify-between">
                <span>디스플레이 테마 선택</span>
                <Palette className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="space-y-1">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSelectTheme(opt.id);
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      currentTheme === opt.id
                        ? 'bg-teal-50 text-teal-900 font-bold border border-teal-300'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${opt.colorClass}`}>
                        {opt.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{opt.name}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">{opt.desc}</div>
                      </div>
                    </div>
                    {currentTheme === opt.id && (
                      <span className="text-[10px] text-teal-700 font-bold">적용중</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={onResetData}
          title="초기 예시 데이터로 재설정"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors hidden sm:flex items-center gap-1 text-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">데이터 초기화</span>
        </button>

        {/* Print Official Inspection Report */}
        <button
          onClick={onOpenReportPrint}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-900 bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg transition-colors whitespace-nowrap"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">점검서식 인쇄</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="알림"
          >
            <Bell className="w-4 h-4" />
            {totalAlertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                {totalAlertCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">긴급 안전 알림</span>
                <span className="text-2xs font-mono text-teal-700 font-semibold">총 {totalAlertCount}건</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {overdueItems.length === 0 && pendingReviewItems.length === 0 && imminentItems.length === 0 && (
                  <div className="text-xs text-slate-500 text-center py-4">
                    현재 긴급 조치 알림이 없습니다.
                  </div>
                )}

                {overdueItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectItem(item);
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-rose-50 hover:bg-rose-100/80 rounded-lg border border-rose-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-2xs text-rose-800 font-bold mb-0.5">
                      <span>[기한 초과 지연]</span>
                      <span className="font-mono">{item.dueDate}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-900 truncate">{item.title}</div>
                    <div className="text-2xs text-slate-600 mt-0.5">담당자: {item.assignee}</div>
                  </div>
                ))}

                {pendingReviewItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectItem(item);
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-blue-50 hover:bg-blue-100/80 rounded-lg border border-blue-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-2xs text-blue-800 font-bold mb-0.5">
                      <span>[관리자 승인 대기]</span>
                      <span>검토 요청됨</span>
                    </div>
                    <div className="text-xs font-medium text-slate-900 truncate">{item.title}</div>
                    <div className="text-2xs text-slate-600 mt-0.5">담당자: {item.assignee}</div>
                  </div>
                ))}

                {imminentItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectItem(item);
                      setShowNotifications(false);
                    }}
                    className="p-2 bg-amber-50 hover:bg-amber-100/80 rounded-lg border border-amber-200 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between text-2xs text-amber-800 font-bold mb-0.5">
                      <span>[마감 임박 D-3 이내]</span>
                      <span className="font-mono">{item.dueDate}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-900 truncate">{item.title}</div>
                    <div className="text-2xs text-slate-600 mt-0.5">담당자: {item.assignee}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown (Demonstration Feature) */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200 text-left"
          >
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white ${
              currentUser.isAdmin ? 'bg-indigo-600' : 'bg-teal-700'
            }`}>
              {currentUser.avatarInitials.slice(0, 2)}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                {currentUser.name}
                {currentUser.isAdmin && (
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1 rounded font-semibold">
                    책임자
                  </span>
                )}
              </div>
              <div className="text-2xs text-slate-500 leading-tight truncate max-w-[120px]">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Role Switch Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 text-2xs text-slate-500 font-semibold border-b border-slate-100 mb-1 flex items-center justify-between">
                <span>역할 전환 (시연용 계정 스위칭)</span>
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="space-y-1">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      currentUser.id === user.id
                        ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-2xs text-slate-500">
                        {user.role} · {user.department}
                      </div>
                    </div>
                    {user.isAdmin && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                        관리자
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
