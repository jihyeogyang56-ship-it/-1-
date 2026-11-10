import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Printer,
  Download,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  History,
  ShieldCheck,
  User,
} from 'lucide-react';
import { InspectionItem, UserProfile } from '../types/radiation';
import { CURRENT_SYSTEM_DATE, getStatusStyle } from '../utils/statusHelpers';

interface HistoryReportViewProps {
  items: InspectionItem[];
  currentUser: UserProfile;
}

export const HistoryReportView: React.FC<HistoryReportViewProps> = ({
  items,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'ongoing'>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === 'completed' && item.status !== '최종 완료') return false;
      if (statusFilter === 'ongoing' && item.status === '최종 완료') return false;
      if (dateFilter && !item.inspectionDate.startsWith(dateFilter)) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.itemCode.toLowerCase().includes(q) ||
          item.assignee.toLowerCase().includes(q) ||
          item.locationOrEquipment.toLowerCase().includes(q) ||
          (item.actionDetail && item.actionDetail.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, statusFilter, dateFilter, searchTerm]);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      '관리번호',
      '점검항목명',
      '점검일자',
      '장비및장소',
      '부서',
      '담당자',
      '조치기한',
      '우선순위',
      '진행상태',
      '조치내용',
      '조치완료일',
      '관리자검토의견',
    ];

    const rows = filteredItems.map((item) => [
      `"${item.itemCode}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.inspectionDate}"`,
      `"${item.locationOrEquipment.replace(/"/g, '""')}"`,
      `"${item.department}"`,
      `"${item.assignee}"`,
      `"${item.dueDate}"`,
      `"${item.priority}"`,
      `"${item.status}"`,
      `"${(item.actionDetail || '').replace(/"/g, '""')}"`,
      `"${item.actionCompletedDate || ''}"`,
      `"${(item.adminReviewNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `방사선안전점검_조치결과대장_${CURRENT_SYSTEM_DATE}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* View Header (Screen only) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              점검 및 조치 이력 관리 & 법정 보고서
            </h2>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              규정 감사 대응
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            원내 진단용 방사선 안전관리 점검 후속 조치의 전수 감사 로그를 검색하고, 공식 보고서 양식으로 출력하거나 CSV로 보관합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV 대장 다운로드</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>공식 서식 인쇄 / PDF</span>
          </button>
        </div>
      </div>

      {/* Screen Filter Bar */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="항목명, 관리번호, 조치 내용, 담당자 검색..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                전체 ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                완료 항목만 ({items.filter((i) => i.status === '최종 완료').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ongoing')}
                className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                  statusFilter === 'ongoing'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                진행 / 미조치 ({items.filter((i) => i.status !== '최종 완료').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Data Table */}
      <div className="no-print bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">
            점검 및 후속조치 상세 이력 ({filteredItems.length}건)
          </span>
          <span className="text-2xs font-mono text-slate-500">최근 업데이트: {CURRENT_SYSTEM_DATE}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 font-mono whitespace-nowrap min-w-[95px]">관리코드</th>
                <th className="py-2.5 px-4 min-w-[220px]">점검 항목명</th>
                <th className="py-2.5 px-4 min-w-[170px]">관련 장소 / 장비</th>
                <th className="py-2.5 px-4 whitespace-nowrap min-w-[110px]">담당자</th>
                <th className="py-2.5 px-4 font-mono whitespace-nowrap min-w-[115px]">조치 기한</th>
                <th className="py-2.5 px-4 whitespace-nowrap min-w-[95px]">진행 상태</th>
                <th className="py-2.5 px-4 min-w-[280px]">조치 내용 및 최종 완료 의견</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item) => {
                const statusStyle = getStatusStyle(item.status);

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-2xs font-bold text-slate-600 whitespace-nowrap">
                      {item.itemCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                      <div className="text-2xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="truncate max-w-[180px]">{item.locationOrEquipment}</div>
                      <div className="text-2xs text-slate-400">{item.department}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                      {item.assignee}
                    </td>
                    <td className="py-3 px-4 font-mono text-2xs text-slate-600 whitespace-nowrap">
                      {item.dueDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-2xs font-bold border ${statusStyle.bg} ${statusStyle.border}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.actionDetail ? (
                        <div className="text-2xs text-slate-800">
                          <strong>[조치]</strong> {item.actionDetail}
                          {item.actionCompletedDate && (
                            <span className="text-slate-400 font-mono ml-1">
                              ({item.actionCompletedDate})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-2xs text-slate-400">조치 미등록</span>
                      )}
                      {item.adminReviewNotes && (
                        <div className="text-2xs text-emerald-700 mt-0.5">
                          <strong>[승인의견]</strong> {item.adminReviewNotes}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Printable Hospital Report Section (Visible only when printing or previewed) */}
      <div className="print-only print-page p-8 text-black bg-white font-sans text-xs">
        {/* Document Header */}
        <div className="text-center pb-6 border-b-2 border-black">
          <div className="text-sm font-semibold tracking-widest text-slate-600">
            [의료법 시행규칙 제38조 관련 서식]
          </div>
          <h1 className="text-2xl font-bold mt-2 tracking-tight">
            진단용 방사선 안전관리 점검 결과 및 조치 대장
          </h1>
          <div className="mt-2 text-xs font-medium">
            의료기관명: 서울대형병원 · 안전관리책임자: 강태석 (영상의학과 전문의) · 보고일자: {CURRENT_SYSTEM_DATE}
          </div>
        </div>

        {/* Approval Stamp Box */}
        <div className="flex justify-end my-4">
          <table className="border-collapse border border-black text-center text-2xs w-64">
            <tbody>
              <tr>
                <td rowSpan={2} className="border border-black bg-slate-100 font-bold w-12 py-2">
                  결<br />재
                </td>
                <td className="border border-black font-semibold py-1">담 당</td>
                <td className="border border-black font-semibold py-1">안전관리책임자</td>
                <td className="border border-black font-semibold py-1">병원장</td>
              </tr>
              <tr className="h-14">
                <td className="border border-black align-bottom pb-1 font-mono text-[10px]">김영호 (인)</td>
                <td className="border border-black align-bottom pb-1 font-mono text-[10px]">강태석 (인)</td>
                <td className="border border-black align-bottom pb-1 font-mono text-[10px]">(서명 / 직인)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        <div className="mb-4 p-3 border border-black bg-slate-50 text-xs">
          <strong>점검 현황 요약:</strong> 총 점검 등록 {items.length}건 / 최종 조치 완료 {items.filter((i) => i.status === '최종 완료').length}건 / 조치 진행 중 {items.filter((i) => i.status !== '최종 완료').length}건 (완료율: {Math.round((items.filter((i) => i.status === '최종 완료').length / items.length) * 100)}%)
        </div>

        {/* Table of Findings and Actions */}
        <table className="w-full border-collapse border border-black text-2xs">
          <thead>
            <tr className="bg-slate-200 border-b border-black font-bold">
              <th className="border border-black py-2 px-2 text-center w-14">번호</th>
              <th className="border border-black py-2 px-2 text-left">점검 항목명 및 지적 사항</th>
              <th className="border border-black py-2 px-2 text-left w-32">설치 장소 / 장비</th>
              <th className="border border-black py-2 px-2 text-center w-16">담당자</th>
              <th className="border border-black py-2 px-2 text-center w-20">조치 기한</th>
              <th className="border border-black py-2 px-2 text-center w-16">상태</th>
              <th className="border border-black py-2 px-2 text-left">조치 결과 및 관리자 확인 의견</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-black">
                <td className="border border-black py-2 px-2 text-center font-mono">{idx + 1}</td>
                <td className="border border-black py-2 px-2">
                  <div className="font-bold">{item.title}</div>
                  <div className="text-slate-600 mt-0.5">{item.description}</div>
                </td>
                <td className="border border-black py-2 px-2">{item.locationOrEquipment}</td>
                <td className="border border-black py-2 px-2 text-center">{item.assignee}</td>
                <td className="border border-black py-2 px-2 text-center font-mono">{item.dueDate}</td>
                <td className="border border-black py-2 px-2 text-center font-bold">{item.status}</td>
                <td className="border border-black py-2 px-2">
                  {item.actionDetail ? (
                    <div>{item.actionDetail} (완료일: {item.actionCompletedDate || '-'})</div>
                  ) : (
                    <span className="text-slate-400">조치 미완료</span>
                  )}
                  {item.adminReviewNotes && (
                    <div className="text-slate-700 mt-0.5 italic">
                      [확인의견] {item.adminReviewNotes}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Remarks */}
        <div className="mt-8 text-2xs text-slate-600 space-y-1">
          <div>※ 본 서식은 「진단용 방사선 발생장치의 안전관리에 관한 규칙」 제10조 및 제15조에 의거하여 작성된 공식 기록물입니다.</div>
          <div>※ 보존 연한: 작성일로부터 3년간 보관 의무 (의료법 시행규칙 제15조).</div>
        </div>
      </div>
    </div>
  );
};
