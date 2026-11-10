import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  Send,
  RotateCcw,
  History,
  MapPin,
  Calendar,
  User,
} from 'lucide-react';
import { InspectionItem, ActionStatus, UserProfile } from '../types/radiation';
import {
  getStatusStyle,
  getPriorityStyle,
  isItemOverdue,
  isItemImminent,
  getDaysRemainingText,
  CURRENT_SYSTEM_DATE,
} from '../utils/statusHelpers';

interface ActionReviewModalProps {
  isOpen: boolean;
  item: InspectionItem | null;
  currentUser: UserProfile;
  onClose: () => void;
  onUpdateStatus: (
    itemId: string,
    newStatus: ActionStatus,
    actionDetail?: string,
    actionDate?: string,
    adminNotes?: string
  ) => void;
  onEditClick: (item: InspectionItem) => void;
  onDeleteClick: (itemId: string) => void;
}

export const ActionReviewModal: React.FC<ActionReviewModalProps> = ({
  isOpen,
  item,
  currentUser,
  onClose,
  onUpdateStatus,
  onEditClick,
  onDeleteClick,
}) => {
  if (!isOpen || !item) return null;

  const [actionDetail, setActionDetail] = useState(item.actionDetail || '');
  const [actionCompletedDate, setActionCompletedDate] = useState(
    item.actionCompletedDate || CURRENT_SYSTEM_DATE
  );
  const [adminReviewNotes, setAdminReviewNotes] = useState(item.adminReviewNotes || '');

  const isOverdue = isItemOverdue(item.dueDate, item.status);
  const isImminent = isItemImminent(item.dueDate, item.status);
  const statusStyle = getStatusStyle(item.status);
  const priorityStyle = getPriorityStyle(item.priority);

  const isAssignee = currentUser.name.includes(item.assignee.split(' ')[0]);
  const isAdmin = currentUser.isAdmin;

  // Handler: Assignee sets In Progress
  const handleSetInProgress = () => {
    onUpdateStatus(item.id, '조치 진행 중', actionDetail, undefined, undefined);
  };

  // Handler: Assignee requests review
  const handleRequestReview = () => {
    if (!actionDetail.trim()) {
      alert('조치 완료 내용을 상세히 입력한 후 검토를 요청해 주세요.');
      return;
    }
    onUpdateStatus(item.id, '관리자 확인 대기', actionDetail, actionCompletedDate, undefined);
  };

  // Handler: Admin Approves
  const handleAdminApprove = () => {
    onUpdateStatus(
      item.id,
      '최종 완료',
      actionDetail,
      actionCompletedDate,
      adminReviewNotes.trim() || '현장 점검 및 조치 결과 적합 확인 완료.'
    );
  };

  // Handler: Admin Requests Correction
  const handleAdminRequestRevision = () => {
    if (!adminReviewNotes.trim()) {
      alert('보완이 필요한 사항이나 사유를 입력해 주세요.');
      return;
    }
    onUpdateStatus(item.id, '조치 진행 중', actionDetail, undefined, adminReviewNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-teal-400 bg-slate-800 px-2 py-0.5 rounded">
              {item.itemCode}
            </span>
            <h3 className="text-base font-bold tracking-tight truncate max-w-md">{item.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Status & Deadline Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.border}`}>
                {item.status}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-md border ${priorityStyle.bg}`}>
                우선순위: {item.priority}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500">조치 기한:</span>
              <span className="font-semibold text-slate-800">{item.dueDate}</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  isOverdue
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : isImminent
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {getDaysRemainingText(item.dueDate, item.status)}
              </span>
            </div>
          </div>

          {/* Finding Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <div className="text-slate-500 mb-1 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-teal-600" /> 관련 장비 및 위치
              </div>
              <div className="font-semibold text-slate-900">{item.locationOrEquipment}</div>
              <div className="text-slate-500 mt-0.5">{item.department}</div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <div className="text-slate-500 mb-1 flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5 text-teal-600" /> 조치 담당자
              </div>
              <div className="font-semibold text-slate-900">{item.assignee}</div>
              <div className="text-slate-500 mt-0.5">{item.assigneeRole || '방사선관계종사자'}</div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <div className="text-slate-500 mb-1 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> 최초 점검일
              </div>
              <div className="font-semibold text-slate-900">{item.inspectionDate}</div>
              <div className="text-slate-500 mt-0.5">안전관리 정기점검</div>
            </div>
          </div>

          {/* Problem Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500" /> 점검 지적 및 문제 발생 내용
            </h4>
            <div className="p-3.5 bg-rose-50/40 border border-rose-200 rounded-lg text-xs leading-relaxed text-slate-800">
              {item.description}
            </div>
          </div>

          {item.notes && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-slate-600">참고 사항 / 관리자 전달 사항</h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                {item.notes}
              </div>
            </div>
          )}

          {/* Action Progress Section (담당자 조치 입력 영역) */}
          <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-teal-950 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                담당자 조치 내용 등록 및 검토 요청
              </h4>
              <span className="text-2xs text-teal-800 font-medium">
                {isAssignee ? '✅ 본인 배정 항목' : isAdmin ? '🛡️ 관리자 권한 조작 가능' : '참여자'}
              </span>
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 mb-1">
                구체적 조치 내용 및 개선 결과
              </label>
              <textarea
                rows={3}
                value={actionDetail}
                onChange={(e) => setActionDetail(e.target.value)}
                disabled={item.status === '최종 완료' && !isAdmin}
                placeholder="예: 2.0mmPb 차폐 몰딩 시공 완료, 방어벽 누설선량 재측정 결과 0.08 mSv / 주 이하 확인됨 등"
                className="w-full px-3 py-2 text-xs border border-teal-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-2xs font-semibold text-slate-700 mb-1">
                  조치 완료일 (실제 완료일자)
                </label>
                <input
                  type="date"
                  value={actionCompletedDate}
                  onChange={(e) => setActionCompletedDate(e.target.value)}
                  disabled={item.status === '최종 완료' && !isAdmin}
                  className="w-full px-3 py-2 text-xs border border-teal-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100"
                />
              </div>

              {/* Assignee Action Buttons */}
              <div className="flex items-center gap-2">
                {item.status === '미조치' && (
                  <button
                    type="button"
                    onClick={handleSetInProgress}
                    className="flex-1 px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" /> [조치 진행 중]으로 변경
                  </button>
                )}

                {item.status !== '최종 완료' && (
                  <button
                    type="button"
                    onClick={handleRequestReview}
                    className="flex-1 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> 관리자 확인 요청
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Admin Review & Approval Section */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold flex items-center gap-2 text-teal-400">
                <UserCheck className="w-4 h-4 text-teal-400" />
                안전관리책임자(관리자) 최종 검토 및 판정
              </h4>
              <span className="text-2xs text-slate-400">
                {isAdmin ? '👑 관리자 승인 권한 활성화' : '관리자 전용 판정 영역 (데모 전환 가능)'}
              </span>
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-300 mb-1">
                관리자 검토 의견 (승인 사유 또는 보완 요청 지시 내용)
              </label>
              <input
                type="text"
                value={adminReviewNotes}
                onChange={(e) => setAdminReviewNotes(e.target.value)}
                placeholder="예: 현장 실측 확인 완료, 법정 허용치 충족하여 최종 승인함 / 또는 틈새 보강 사진 추가 제출 요망"
                className="w-full px-3 py-2 text-xs border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-hidden focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {item.status !== '최종 완료' && (
                <>
                  <button
                    type="button"
                    onClick={handleAdminRequestRevision}
                    className="px-3.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/40 border border-amber-500/50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> 보완 요청 (조치 진행 중 환원)
                  </button>
                  <button
                    type="button"
                    onClick={handleAdminApprove}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 최종 완료 승인
                  </button>
                </>
              )}
              {item.status === '최종 완료' && (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 본 항목은 안전관리책임자에 의해 최종 완료 처리되었습니다.
                </div>
              )}
            </div>
          </div>

          {/* History Timeline */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" /> 점검 및 조치 이력 로그 ({item.history.length}건)
            </h4>
            <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-1">
              {item.history.map((h) => (
                <div key={h.id} className="text-xs space-y-0.5 relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white" />
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-mono text-2xs">{h.timestamp}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-800">{h.author}</span>
                    <span className="text-2xs text-slate-500">({h.role})</span>
                    <span>·</span>
                    <span className="text-teal-700 font-medium">[{h.actionType}]</span>
                  </div>
                  <div className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                    {h.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Bottom Management Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onEditClick(item);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200"
              >
                항목 정보 수정
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('이 점검 항목을 정말로 삭제하시겠습니까?')) {
                      onDeleteClick(item.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md border border-rose-200"
                >
                  항목 삭제
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
