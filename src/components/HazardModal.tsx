import React, { useState } from 'react';
import { X, ShieldAlert, Upload, Image, MapPin, Calendar, User } from 'lucide-react';
import { HazardReport, PriorityLevel, UserProfile } from '../types/radiation';
import { CURRENT_SYSTEM_DATE } from '../utils/statusHelpers';

interface HazardModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onSubmit: (report: Partial<HazardReport>) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'C-arm 케이블 마모',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: '납앞치마 미세 균열',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: '차폐벽 경고등 단선',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
  },
];

export const HazardModal: React.FC<HazardModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSubmit,
}) => {
  const [location, setLocation] = useState('');
  const [equipment, setEquipment] = useState('');
  const [discoveryDate, setDiscoveryDate] = useState(CURRENT_SYSTEM_DATE);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<PriorityLevel>('보통');
  const [imageUrl, setImageUrl] = useState('');
  const [reporter, setReporter] = useState(currentUser.name);
  const [reporterDept, setReporterDept] = useState(currentUser.department);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) {
      alert('발생 장소와 문제 내용을 입력해 주세요.');
      return;
    }

    onSubmit({
      location,
      equipment,
      discoveryDate,
      description,
      urgency,
      imageUrl,
      reporter,
      reporterDept,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-teal-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold tracking-tight">
              방사선 안전 위험 요소 자율 신고 (사내 안전 제안)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-teal-300 hover:text-white p-1 rounded-lg hover:bg-teal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro Banner */}
        <div className="px-6 py-3 bg-teal-50 border-b border-teal-100 text-xs text-teal-800">
          병원 근무 중 발견한 방사선 방어시설 미비, 장비 이상, 선량계 분실 등 안전 저해 요인을 자발적으로 등록해 주세요. 안전관리책임자가 검토 후 정식 조치로 지정합니다.
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" /> 위험 요소 발생 장소 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 본관 3층 제2수술실, 핵의학과 주사실"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                관련 장비 (해당 시)
              </label>
              <input
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="예: 이동형 C-arm, 납앞치마 걸이대"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> 발견 일자 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={discoveryDate}
                onChange={(e) => setDiscoveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">긴급도 / 심각도</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="높음">높음 (환자 / 직원 피폭 위험 즉시 우려)</option>
                <option value="보통">보통 (시설 보완 또는 부품 교체 필요)</option>
                <option value="낮음">낮음 (단순 경미 사항 및 개선 건의)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              발견된 문제 내용 (상세 기술) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="위험 요소를 구체적으로 작성해 주세요. (예: 납차폐막 바퀴 축 파손으로 기울어짐, 차폐문 도어락 센서 미작동 등)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-teal-600" /> 현장 사진 첨부
            </label>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5" /> 기기에서 사진 파일 첨부
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-2xs text-slate-400">또는 예시 사진 선택:</span>
              <div className="flex gap-1">
                {SAMPLE_PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className="px-2 py-1 text-2xs bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded text-slate-600 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {imageUrl && (
              <div className="relative mt-2 w-full h-36 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="신고 사진 미리보기"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full text-xs hover:bg-slate-900"
                  title="사진 삭제"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" /> 신고자 성명
              </label>
              <input
                type="text"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">신고자 부서</label>
              <input
                type="text"
                value={reporterDept}
                onChange={(e) => setReporterDept(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors"
            >
              위험 요소 신고 제출
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
