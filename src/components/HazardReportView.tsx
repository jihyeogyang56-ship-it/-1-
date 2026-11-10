import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  MapPin,
  Calendar,
  User,
  ArrowUpRight,
  CheckCircle,
  ExternalLink,
  Image,
} from 'lucide-react';
import { HazardReport, UserProfile } from '../types/radiation';

interface HazardReportViewProps {
  reports: HazardReport[];
  currentUser: UserProfile;
  onOpenNewHazard: () => void;
  onPromoteToInspection: (hazard: HazardReport) => void;
  onCloseHazard: (hazardId: string) => void;
}

export const HazardReportView: React.FC<HazardReportViewProps> = ({
  reports,
  currentUser,
  onOpenNewHazard,
  onPromoteToInspection,
  onCloseHazard,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              방사선 안전 위험 요소 자율 신고함
            </h2>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              상시 접수
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            정기 점검 외에도 일상 업무 중 방사선관계종사자가 발견한 위험 요소를 자발적으로 신고하고, 관리자가 검토하여 정식 조치 항목으로 연계합니다.
          </p>
        </div>

        <button
          onClick={onOpenNewHazard}
          className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>위험 요소 자율 신고서 작성</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((report) => {
          const isPending = report.status === '접수 대기';
          const isLinked = report.status === '정식 조치 연계됨';

          return (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image if available */}
                {report.imageUrl && (
                  <div
                    onClick={() => setSelectedImage(report.imageUrl || null)}
                    className="relative w-full h-40 bg-slate-100 cursor-pointer group overflow-hidden"
                  >
                    <img
                      src={report.imageUrl}
                      alt="현장 사진"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Image className="w-4 h-4" /> 크게 보기
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  {/* Status & Code */}
                  <div className="flex items-center justify-between text-2xs">
                    <span className="font-mono font-bold text-slate-500">
                      {report.reportCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold border ${
                        isPending
                          ? 'bg-amber-500/15 text-amber-300 border-amber-600/30'
                          : isLinked
                          ? 'bg-teal-500/15 text-teal-300 border-teal-600/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  {/* Location & Title */}
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{report.location}</span>
                    </div>
                    {report.equipment && (
                      <div className="text-2xs text-teal-700 font-semibold mt-0.5">
                        관련 기기: {report.equipment}
                      </div>
                    )}
                  </div>

                  {/* Problem Description */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 leading-relaxed">
                    {report.description}
                  </div>

                  {/* Reporter metadata */}
                  <div className="flex items-center justify-between text-2xs text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>신고자: {report.reporter} ({report.reporterDept})</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{report.discoveryDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                {isPending ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onPromoteToInspection(report)}
                      className="flex-1 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>정식 조치 항목으로 등록</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onCloseHazard(report.id)}
                      className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                      title="단순 안내 또는 자체 종결"
                    >
                      자체 종결
                    </button>
                  </>
                ) : isLinked ? (
                  <div className="w-full text-center text-xs font-semibold text-teal-800 flex items-center justify-center gap-1.5 py-1">
                    <CheckCircle className="w-4 h-4 text-teal-600" /> 정식 점검 조치 항목으로 연계 관리 중
                  </div>
                ) : (
                  <div className="w-full text-center text-xs text-slate-500 py-1">
                    검토 완료 (자체 종결)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Modal Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-xl overflow-hidden p-2">
            <img
              src={selectedImage}
              alt="현장 원본 사진"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="text-center text-xs text-slate-500 py-2">
              클릭하면 닫힙니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
