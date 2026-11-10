import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, User, MapPin } from 'lucide-react';
import { InspectionItem, PriorityLevel } from '../types/radiation';
import { CURRENT_SYSTEM_DATE } from '../utils/statusHelpers';
import { DEMO_USERS } from '../data/mockData';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<InspectionItem>) => void;
  initialData?: InspectionItem | null;
  prefillFromHazard?: {
    location: string;
    equipment?: string;
    description: string;
    urgency: PriorityLevel;
  } | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  prefillFromHazard,
}) => {
  const [title, setTitle] = useState('');
  const [inspectionDate, setInspectionDate] = useState(CURRENT_SYSTEM_DATE);
  const [description, setDescription] = useState('');
  const [locationOrEquipment, setLocationOrEquipment] = useState('');
  const [department, setDepartment] = useState('영상의학과');
  const [assignee, setAssignee] = useState(DEMO_USERS[1].name);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('보통');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setInspectionDate(initialData.inspectionDate);
      setDescription(initialData.description);
      setLocationOrEquipment(initialData.locationOrEquipment);
      setDepartment(initialData.department || '영상의학과');
      setAssignee(initialData.assignee);
      setDueDate(initialData.dueDate);
      setPriority(initialData.priority);
      setNotes(initialData.notes || '');
    } else if (prefillFromHazard) {
      setTitle(`[신고조치] ${prefillFromHazard.equipment ? prefillFromHazard.equipment + ' ' : ''}안전 점검`);
      setInspectionDate(CURRENT_SYSTEM_DATE);
      setDescription(prefillFromHazard.description);
      setLocationOrEquipment(
        `${prefillFromHazard.location}${prefillFromHazard.equipment ? ` (${prefillFromHazard.equipment})` : ''}`
      );
      setDepartment('영상의학과');
      setAssignee(DEMO_USERS[1].name);
      // Default due date: 7 days from now
      const due = new Date();
      due.setDate(due.getDate() + 7);
      setDueDate(due.toISOString().split('T')[0]);
      setPriority(prefillFromHazard.urgency || '높음');
      setNotes('자율 안전 신고 내용 바탕으로 정식 점검 조치 항목으로 등록됨.');
    } else {
      // Default empty form for new inspection item
      setTitle('');
      setInspectionDate(CURRENT_SYSTEM_DATE);
      setDescription('');
      setLocationOrEquipment('');
      setDepartment('영상의학과');
      setAssignee(DEMO_USERS[1].name);
      // Default 7 days
      const due = new Date();
      due.setDate(due.getDate() + 7);
      setDueDate(due.toISOString().split('T')[0]);
      setPriority('보통');
      setNotes('');
    }
  }, [initialData, prefillFromHazard, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate) {
      alert('항목명, 문제 발생 내용, 조치 기한을 입력해 주세요.');
      return;
    }

    onSave({
      title,
      inspectionDate,
      description,
      locationOrEquipment,
      department,
      assignee,
      dueDate,
      priority,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold tracking-tight">
              {initialData ? '방사선 안전관리 점검 항목 수정' : '새 안전관리 점검 미완료 항목 등록'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {prefillFromHazard && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900">
              💡 <strong>자율 안전 신고 연계 모드</strong>: 직원이 접수한 위험 요소를 관리자가 검토하여 정식 조치 항목으로 등록합니다.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              점검 항목명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 일반촬영실 방사선 방어시설 점검"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> 점검 일자 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" /> 조치 기한 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-semibold text-rose-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> 관련 장비 또는 장소 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={locationOrEquipment}
                onChange={(e) => setLocationOrEquipment(e.target.value)}
                placeholder="예: 본관 1층 일반촬영 2호실 (납유리 차폐벽)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">소속 부서</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="영상의학과">영상의학과</option>
                <option value="핵의학과">핵의학과</option>
                <option value="수술실">본관 수술실</option>
                <option value="심혈관 인터벤션센터">심혈관 인터벤션센터</option>
                <option value="응급의료센터">응급의료센터</option>
                <option value="치과진료센터">치과진료센터</option>
                <option value="의료안전기획과">의료안전기획과</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" /> 담당자 지정 <span className="text-rose-500">*</span>
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {DEMO_USERS.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.role} - {u.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">우선순위</label>
              <div className="grid grid-cols-3 gap-2">
                {(['높음', '보통', '낮음'] as PriorityLevel[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      priority === p
                        ? p === '높음'
                          ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                          : p === '보통'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold'
                          : 'bg-slate-100 border-slate-400 text-slate-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              문제 발생 내용 (구체적 지적 사항) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="점검 과정에서 발견된 미완료 사항 또는 안전 결함 사항을 상세히 기술하세요."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">참고 사항 및 관리자 지시 메모</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: 차폐 전문업체 연락처, 임시 조치 지침, 관련 법령 조항 등"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
            >
              {initialData ? '수정 내용 저장' : '점검 항목 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
