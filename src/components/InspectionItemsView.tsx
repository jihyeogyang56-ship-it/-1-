import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { InspectionItem, ActionStatus, PriorityLevel } from '../types/radiation';
import {
  getStatusStyle,
  getPriorityStyle,
  isItemOverdue,
  isItemImminent,
  getDaysRemainingText,
} from '../utils/statusHelpers';

interface InspectionItemsViewProps {
  items: InspectionItem[];
  onSelectItem: (item: InspectionItem) => void;
  onOpenNewItem: () => void;
}

export const InspectionItemsView: React.FC<InspectionItemsViewProps> = ({
  items,
  onSelectItem,
  onOpenNewItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  // Extract distinct assignees
  const assignees = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => set.add(item.assignee));
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Overdue filter
      if (onlyOverdue && !isItemOverdue(item.dueDate, item.status)) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) {
        return false;
      }

      // Assignee filter
      if (selectedAssignee !== 'all' && item.assignee !== selectedAssignee) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchCode = item.itemCode.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchLocation = item.locationOrEquipment.toLowerCase().includes(query);
        const matchAssignee = item.assignee.toLowerCase().includes(query);

        if (!matchTitle && !matchCode && !matchDesc && !matchLocation && !matchAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [items, onlyOverdue, selectedStatus, selectedPriority, selectedAssignee, searchTerm]);

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            방사선 안전점검 미완료 항목 및 후속조치 관리
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            점검 시 발견된 문제점, 담당자 배정, 조치 기한 및 진행 상태를 전수 관리합니다.
          </p>
        </div>

        <button
          onClick={onOpenNewItem}
          className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>새 점검 항목 등록</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="항목명, 점검 코드, 관련 장비, 담당자, 문제 내용 검색..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Quick Overdue Toggle */}
          <button
            type="button"
            onClick={() => setOnlyOverdue(!onlyOverdue)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 shrink-0 ${
              onlyOverdue
                ? 'bg-rose-100 border-rose-400 text-rose-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyOverdue ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>기한 초과 건만 필터</span>
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mr-2 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> 세부 필터:
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">진행 상태 (전체)</option>
            <option value="미조치">미조치</option>
            <option value="조치 진행 중">조치 진행 중</option>
            <option value="관리자 확인 대기">관리자 확인 대기</option>
            <option value="최종 완료">최종 완료</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">우선순위 (전체)</option>
            <option value="높음">우선순위: 높음</option>
            <option value="보통">우선순위: 보통</option>
            <option value="낮음">우선순위: 낮음</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">조치 담당자 (전체)</option>
            {assignees.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {(selectedStatus !== 'all' || selectedPriority !== 'all' || selectedAssignee !== 'all' || onlyOverdue || searchTerm) && (
            <button
              onClick={() => {
                setSelectedStatus('all');
                setSelectedPriority('all');
                setSelectedAssignee('all');
                setOnlyOverdue(false);
                setSearchTerm('');
              }}
              className="text-2xs text-teal-700 hover:text-teal-900 underline font-semibold ml-auto"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          총 <span className="font-mono font-bold text-slate-900">{filteredItems.length}</span>개의 점검 항목이 조회되었습니다.
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 font-mono whitespace-nowrap min-w-[95px]">관리번호</th>
                <th className="py-2.5 px-4 min-w-[240px]">점검 항목명 / 문제 내용</th>
                <th className="py-2.5 px-4 min-w-[170px]">관련 장비 및 장소</th>
                <th className="py-2.5 px-4 whitespace-nowrap min-w-[120px]">담당자</th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap min-w-[110px]">점검일</th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap min-w-[155px]">조치 기한</th>
                <th className="py-2.5 px-4 text-center whitespace-nowrap min-w-[75px]">우선순위</th>
                <th className="py-2.5 px-4 text-center whitespace-nowrap min-w-[105px]">진행 상태</th>
                <th className="py-2.5 px-4 text-right whitespace-nowrap min-w-[85px]">상세 / 처리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    조건에 일치하는 점검 항목이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isOverdue = isItemOverdue(item.dueDate, item.status);
                  const isImminent = isItemImminent(item.dueDate, item.status);
                  const statusStyle = getStatusStyle(item.status);
                  const priorityStyle = getPriorityStyle(item.priority);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono text-2xs font-semibold text-slate-500 group-hover:text-teal-700 whitespace-nowrap">
                        {item.itemCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-teal-700 line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-2xs text-slate-500 line-clamp-1 mt-0.5 max-w-md">
                          {item.description}
                        </div>
                        {item.actionDetail && (
                          <div className="text-[11px] text-teal-800 bg-teal-50/70 p-1 rounded mt-1 line-clamp-1 border border-teal-100">
                            <strong>조치 내용:</strong> {item.actionDetail}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium max-w-[180px] truncate">{item.locationOrEquipment}</div>
                        <div className="text-2xs text-slate-400">{item.department}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        <div>{item.assignee}</div>
                        <div className="text-2xs text-slate-400">{item.assigneeRole}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-2xs text-slate-500 whitespace-nowrap">
                        {item.inspectionDate}
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{item.dueDate}</span>
                          <span className="text-slate-400">·</span>
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
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-2xs ${priorityStyle.bg}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-2xs font-bold border ${statusStyle.bg} ${statusStyle.border}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectItem(item);
                          }}
                          className="px-3 py-1 text-xs font-semibold text-teal-700 hover:text-white hover:bg-teal-600 border border-teal-300 rounded-lg transition-colors"
                        >
                          처리
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
