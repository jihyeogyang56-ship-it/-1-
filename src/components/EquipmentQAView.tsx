import React, { useState } from 'react';
import {
  Cpu,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Building,
} from 'lucide-react';
import { RadiationEquipment, QACheckItem } from '../types/radiation';
import { CURRENT_SYSTEM_DATE } from '../utils/statusHelpers';
import { RadiationZoneGrid, RadiationZoneItem } from './RadiationZoneGrid';

interface EquipmentQAViewProps {
  equipment: RadiationEquipment[];
  qaItems: QACheckItem[];
  onAddQACheck: (item: QACheckItem) => void;
  onUpdateEquipmentStatus: (
    id: string,
    status: '정상 가동' | '점검 요망' | '수리 중 / 사용중지'
  ) => void;
  onSelectZoneForAction?: (zone: RadiationZoneItem) => void;
}

export const EquipmentQAView: React.FC<EquipmentQAViewProps> = ({
  equipment,
  qaItems,
  onAddQACheck,
  onUpdateEquipmentStatus,
  onSelectZoneForAction,
}) => {
  const [viewMode, setViewMode] = useState<'zoneGrid' | 'floorMap'>('zoneGrid');
  const [selectedFloor, setSelectedFloor] = useState<'1F' | 'B1' | '3F'>('1F');
  const [selectedEq, setSelectedEq] = useState<RadiationEquipment>(equipment[0]);
  const [showAddQAModal, setShowAddQAModal] = useState(false);

  // Filter equipment for selected floor
  const floorEquipment = equipment.filter((e) => e.floor === selectedFloor);

  // New QA Form state
  const [newCheckItem, setNewCheckItem] = useState('관전압(kVp) 정확도 측정');
  const [newStandard, setNewStandard] = useState('오차 ±5% 이내');
  const [newMeasured, setNewMeasured] = useState('80.2 kVp (+0.25%)');
  const [newResult, setNewResult] = useState<'적합' | '부적합' | '주의'>('적합');
  const [newCycle, setNewCycle] = useState<'일일 점검' | '주간 점검' | '월간 정도관리'>('일일 점검');

  const handleSaveQA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;

    const newItem: QACheckItem = {
      id: `qa-${Date.now()}`,
      equipmentId: selectedEq.id,
      equipmentName: selectedEq.name,
      checkDate: CURRENT_SYSTEM_DATE,
      cycle: newCycle,
      item: newCheckItem,
      standard: newStandard,
      measuredValue: newMeasured,
      result: newResult,
      inspector: selectedEq.manager,
    };

    onAddQACheck(newItem);
    setShowAddQAModal(false);
  };

  return (
    <div className="space-y-6">
      {/* View Header with Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              방사선 관리구역 배치도 및 장치 정도관리(QA / QC) 관제탑
            </h2>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              실시간 상태 추적
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            원내 방사선관리구역 공간 배치도 오염도 매핑, 층별 기기 위치, 법정 정기 검사 및 일일 / 주간 / 월간 정도관리 체크리스트를 연동합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode('zoneGrid')}
              className={`px-3 py-1.5 font-bold rounded-md transition-all ${
                viewMode === 'zoneGrid'
                  ? 'bg-slate-900 text-teal-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              공간 배치도 (4x3 Grid)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('floorMap')}
              className={`px-3 py-1.5 font-bold rounded-md transition-all ${
                viewMode === 'floorMap'
                  ? 'bg-slate-900 text-teal-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              층별 기기 핀 매핑
            </button>
          </div>

          <button
            onClick={() => setShowAddQAModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>정도관리 기록</span>
          </button>
        </div>
      </div>

      {/* Render either RadiationZoneGrid or Floor Map */}
      {viewMode === 'zoneGrid' ? (
        <RadiationZoneGrid onSelectZoneForAction={onSelectZoneForAction} />
      ) : (
        /* Top Split: Floor Plan Map & Selected Equipment Detail */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Floor Plan Map (7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600" /> 병원 층별 장비 위치 핀 매핑
                </h3>
                <div className="text-2xs text-slate-500">핀을 클릭하면 상세 제원과 QA 이력을 확인합니다.</div>
              </div>

              {/* Floor Selector Buttons */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {(['1F', 'B1', '3F'] as const).map((floor) => (
                  <button
                    key={floor}
                    type="button"
                    onClick={() => setSelectedFloor(floor)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      selectedFloor === floor
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {floor === '1F' ? '본관 1층 (일반 / 유방)' : floor === 'B1' ? '지하 1층 (CT / 혈관)' : '본관 3층 (수술실 C-arm)'}
                  </button>
                ))}
              </div>
            </div>

          {/* Simulated Architectural Floor Blueprint Canvas */}
          <div className="relative w-full h-72 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 p-4 select-none">
            {/* Grid Lines */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Room Boundaries Mockup */}
            <div className="absolute inset-4 border border-dashed border-slate-700 rounded-lg flex flex-col justify-between p-3 pointer-events-none">
              <div className="flex justify-between text-2xs font-mono text-slate-500">
                <span>ZONE-A [영상검사구역]</span>
                <span>ZONE-B [조제 / 차폐구역]</span>
                <span>ZONE-C [판독실]</span>
              </div>
              <div className="text-center font-mono text-xs text-slate-600 font-bold tracking-widest uppercase">
                HOSPITAL RADIATION SAFETY MAPPING - {selectedFloor}
              </div>
              <div className="flex justify-between text-2xs font-mono text-slate-500">
                <span>차폐 콘크리트벽 2.0mmPb</span>
                <span>비상 유도선</span>
              </div>
            </div>

            {/* Equipment Pins */}
            {floorEquipment.map((eq) => {
              const isSelected = selectedEq?.id === eq.id;
              const statusColor =
                eq.status === '정상 가동'
                  ? 'bg-emerald-500 ring-emerald-400'
                  : eq.status === '점검 요망'
                  ? 'bg-amber-500 ring-amber-400'
                  : 'bg-rose-500 ring-rose-400';

              return (
                <div
                  key={eq.id}
                  onClick={() => setSelectedEq(eq)}
                  style={{
                    left: `${eq.mapCoordinates.x}%`,
                    top: `${eq.mapCoordinates.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform group ${
                    isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                  }`}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Glowing Pin Bubble */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg ring-4 ${statusColor} ${
                        eq.status === '점검 요망' ? 'animate-bounce' : ''
                      }`}
                    >
                      {eq.equipmentCode.split('-')[0]}
                    </div>

                    {/* Tooltip Label */}
                    <div className="mt-1 px-2 py-0.5 bg-slate-900/90 text-white rounded text-[10px] font-semibold whitespace-nowrap shadow border border-slate-700">
                      {eq.equipmentCode} · {eq.name.split(' ')[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="flex items-center justify-between text-2xs text-slate-500 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 정상 가동
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 점검 요망
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> 수리 중 / 사용중지
              </span>
            </div>
            <span className="font-mono text-slate-400">배치 장비: {floorEquipment.length}대</span>
          </div>
        </div>

        {/* Selected Equipment Information Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                {selectedEq.equipmentCode}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedEq.name}</h3>
              <div className="text-2xs text-slate-500">{selectedEq.manufacturer}</div>
            </div>

            <div className="text-right">
              <select
                value={selectedEq.status}
                onChange={(e) =>
                  onUpdateEquipmentStatus(selectedEq.id, e.target.value as any)
                }
                className={`text-2xs font-bold px-2.5 py-1 rounded-md border ${
                  selectedEq.status === '정상 가동'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : selectedEq.status === '점검 요망'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                <option value="정상 가동">정상 가동</option>
                <option value="점검 요망">점검 요망</option>
                <option value="수리 중 / 사용중지">수리 중 / 사용중지</option>
              </select>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-slate-400 text-2xs">설치 장소</div>
              <div className="font-semibold text-slate-800 mt-0.5">{selectedEq.room}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-slate-400 text-2xs">장비 관리 담당자</div>
              <div className="font-semibold text-slate-800 mt-0.5">{selectedEq.manager}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-slate-400 text-2xs">도입 설치일</div>
              <div className="font-mono text-slate-800 mt-0.5">{selectedEq.installDate}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-slate-400 text-2xs">최근 QA 정도관리</div>
              <div className="font-mono text-slate-800 mt-0.5">{selectedEq.lastQADate}</div>
            </div>
          </div>

          {/* Statutory Inspection Calendar & Penalty Warning */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>법정 정기검사 도래일 (원안위 · 질병청)</span>
            </div>

            <div className="space-y-1.5 text-2xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">원자력안전위원회 정기검사:</span>
                <span className="font-mono font-bold text-amber-900">
                  {selectedEq.nextNsscInspectionDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">질병관리청 진단방사선 검사:</span>
                <span className="font-mono font-bold text-amber-900">
                  {selectedEq.nextKdcaInspectionDate}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/60 leading-tight">
              ⚠️ 검사 기한 30일 전 관할 보건소 및 한국방사선의학재단 사전 신청 필수 (미수검 시 과태료 최대 500만원 및 사용중지 처분).
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Dense QA/QC Checklist Data Grid (Excel-like) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              방사선 발생장치 일일 · 주간 · 월간 정도관리(QA) 점검 그리드
            </h3>
            <p className="text-xs text-slate-500">
              담당 방사선사가 계측기로 측정한 장비별 관전압, 조사야, 누설선량 등 실측치 및 적합성 판정 기록입니다.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-500">
            총 {qaItems.length}건 기록
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 font-mono">점검일자</th>
                <th className="py-2.5 px-4">대상 장비명</th>
                <th className="py-2.5 px-4">점검 주기</th>
                <th className="py-2.5 px-4">세부 점검 항목</th>
                <th className="py-2.5 px-4">법정 / 기술 판정 기준</th>
                <th className="py-2.5 px-4 font-mono">실측 측정값</th>
                <th className="py-2.5 px-4 text-center">판정 결과</th>
                <th className="py-2.5 px-4">점검자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {qaItems.map((qa) => {
                const isPass = qa.result === '적합';
                const isWarn = qa.result === '주의';

                return (
                  <tr key={qa.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-2xs text-slate-500">
                      {qa.checkDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {qa.equipmentName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-2xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {qa.cycle}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {qa.item}
                    </td>
                    <td className="py-3 px-4 text-2xs text-slate-500">
                      {qa.standard}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {qa.measuredValue}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-2xs font-bold ${
                          isPass
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isWarn
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {qa.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {qa.inspector}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add QA Entry Modal */}
      {showAddQAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">정도관리(QA) 측정치 신규 기록</h3>
            <form onSubmit={handleSaveQA} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">대상 장비</label>
                <div className="p-2 bg-slate-100 rounded text-slate-800 font-bold">
                  {selectedEq.name} ({selectedEq.equipmentCode})
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">점검 주기</label>
                  <select
                    value={newCycle}
                    onChange={(e) => setNewCycle(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value="일일 점검">일일 점검</option>
                    <option value="주간 점검">주간 점검</option>
                    <option value="월간 정도관리">월간 정도관리</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">판정 결과</label>
                  <select
                    value={newResult}
                    onChange={(e) => setNewResult(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="적합">적합</option>
                    <option value="주의">주의</option>
                    <option value="부적합">부적합</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">점검 항목</label>
                <input
                  type="text"
                  required
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">판정 기준</label>
                <input
                  type="text"
                  value={newStandard}
                  onChange={(e) => setNewStandard(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">실측 측정값</label>
                <input
                  type="text"
                  required
                  value={newMeasured}
                  onChange={(e) => setNewMeasured(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddQAModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white font-bold rounded-lg"
                >
                  기록 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
