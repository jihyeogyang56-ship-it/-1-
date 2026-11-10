import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';

export interface RadiationZoneItem {
  id: string;
  code: string;
  titleEn: string;
  titleKo: string;
  reading: string;
  numericBq: number;
  status: 'normal' | 'warning' | 'alert' | 'critical';
  hasWarningIcon?: boolean;
  note?: string;
  leadShielding: string; // 차폐 두께
  standardLimit: string; // 법정 허용치
  lastSurveyTime: string;
}

const INITIAL_ZONES: RadiationZoneItem[] = [
  {
    id: 'zone-1',
    code: 'RI-GATE-01',
    titleEn: 'Gate',
    titleKo: '출입 감시 게이트',
    reading: '0.4 Bq',
    numericBq: 0.4,
    status: 'normal',
    leadShielding: '1.5 mmPb 납차폐 도어',
    standardLimit: '4.0 Bq 이하 (정상)',
    lastSurveyTime: '10분 전 측정',
  },
  {
    id: 'zone-2',
    code: 'RI-PAS-01',
    titleEn: 'Passage',
    titleKo: 'RI 이송 통로',
    reading: '0.5 Bq',
    numericBq: 0.5,
    status: 'normal',
    leadShielding: '2.0 mmPb 방호벽',
    standardLimit: '4.0 Bq 이하 (정상)',
    lastSurveyTime: '15분 전 측정',
  },
  {
    id: 'zone-3',
    code: 'RI-CNS-01',
    titleEn: 'Console',
    titleKo: '조종실 / 관제',
    reading: '0.2 Bq',
    numericBq: 0.2,
    status: 'normal',
    leadShielding: '2.5 mmPb 납유리 관측창',
    standardLimit: '0.4 Bq 이하 (정상)',
    lastSurveyTime: '5분 전 측정',
  },
  {
    id: 'zone-4',
    code: 'RI-CYC-01',
    titleEn: 'Cyclotron',
    titleKo: '의료 가속기실',
    reading: '1.1 Bq',
    numericBq: 1.1,
    status: 'normal',
    leadShielding: '150 cm 중정석 콘크리트 차폐',
    standardLimit: '4.0 Bq 이하 (정상)',
    lastSurveyTime: '20분 전 측정',
  },
  {
    id: 'zone-5',
    code: 'RI-HOT-01',
    titleEn: 'Hot Lab',
    titleKo: 'RI 조제 / 분주실',
    reading: '5.6 Bq',
    numericBq: 5.6,
    status: 'warning',
    leadShielding: '50 mmPb 핫셀 분주함',
    standardLimit: '4.0 Bq 이하 (주의: 국소 분주기 제염 요망)',
    lastSurveyTime: '8분 전 측정',
  },
  {
    id: 'zone-6',
    code: 'RI-STR-01',
    titleEn: 'Storage',
    titleKo: '선원 보관실',
    reading: '0.9 Bq',
    numericBq: 0.9,
    status: 'normal',
    leadShielding: '10 mmPb 차폐금고',
    standardLimit: '4.0 Bq 이하 (정상)',
    lastSurveyTime: '30분 전 측정',
  },
  {
    id: 'zone-7',
    code: 'RI-WAIT-01',
    titleEn: 'Wait',
    titleKo: '투여환자 대기실',
    reading: '19.8 Bq (주의)',
    numericBq: 19.8,
    status: 'alert',
    leadShielding: '3.0 mmPb 미로형 차폐벽',
    standardLimit: '방사성의약품 투여 환자 전용 대기구역 (퇴실선량 점검)',
    lastSurveyTime: '12분 전 측정',
  },
  {
    id: 'zone-8',
    code: 'RI-INJ-01',
    titleEn: 'Inject',
    titleKo: 'RI 주사·투여실',
    reading: '1.2 Bq',
    numericBq: 1.2,
    status: 'normal',
    leadShielding: '2.0 mmPb L형 차폐대',
    standardLimit: '4.0 Bq 이하 (정상)',
    lastSurveyTime: '18분 전 측정',
  },
  {
    id: 'zone-9',
    code: 'RI-PET-01',
    titleEn: 'PET/CT',
    titleKo: '촬영 갠트리실',
    reading: '0.8 Bq',
    numericBq: 0.8,
    status: 'normal',
    leadShielding: '3.0 mmPb 사방 차폐벽',
    standardLimit: '4.0 Bq 이하 (정상)',
    lastSurveyTime: '25분 전 측정',
  },
  {
    id: 'zone-10',
    code: 'RI-DRAIN-01',
    titleEn: 'Drain (오염)',
    titleKo: '방사성 폐수 배수조',
    reading: '0.7 Bq (초과!)',
    numericBq: 0.7,
    status: 'critical',
    hasWarningIcon: true,
    leadShielding: '이중 스테인리스 집수조 5.0mmPb',
    standardLimit: '배수 방류 기준 초과 (희석 저장조 전환 필요)',
    lastSurveyTime: '3분 전 실시간 센서 감지',
  },
  {
    id: 'zone-11',
    code: 'RI-WST-01',
    titleEn: 'Waste (오염)',
    titleKo: '폐기물 보관소',
    reading: '15.2 Bq',
    numericBq: 15.2,
    status: 'critical',
    leadShielding: '10 mmPb 차폐 보관 드럼 랙',
    standardLimit: '표면오염 및 선량률 정기 계측 관리 대상',
    lastSurveyTime: '35분 전 측정',
  },
  {
    id: 'zone-12',
    code: 'RI-DCN-01',
    titleEn: 'Decon',
    titleKo: '비상 제염실',
    reading: '0.3 Bq',
    numericBq: 0.3,
    status: 'normal',
    leadShielding: '비상 샤워기 및 차폐 배수 트랩',
    standardLimit: '0.4 Bq 이하 (정상)',
    lastSurveyTime: '40분 전 측정',
  },
];

interface RadiationZoneGridProps {
  onSelectZoneForAction?: (zone: RadiationZoneItem) => void;
}

export const RadiationZoneGrid: React.FC<RadiationZoneGridProps> = ({
  onSelectZoneForAction,
}) => {
  const [zones, setZones] = useState<RadiationZoneItem[]>(INITIAL_ZONES);
  const [selectedZone, setSelectedZone] = useState<RadiationZoneItem>(INITIAL_ZONES[4]);
  const [newReadingInput, setNewReadingInput] = useState('');
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  const handleUpdateReading = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newReadingInput);
    if (isNaN(val)) return;

    let newStatus: RadiationZoneItem['status'] = 'normal';
    let readingText = `${val} Bq`;

    if (val >= 10.0) {
      newStatus = 'critical';
      readingText = `${val} Bq (초과!)`;
    } else if (val >= 4.0) {
      newStatus = 'warning';
      readingText = `${val} Bq (주의)`;
    }

    const updated = zones.map((z) =>
      z.id === selectedZone.id
        ? {
            ...z,
            numericBq: val,
            reading: readingText,
            status: newStatus,
            lastSurveyTime: '방금 전 실측 갱신',
          }
        : z
    );

    setZones(updated);
    const updatedSelected = updated.find((z) => z.id === selectedZone.id);
    if (updatedSelected) setSelectedZone(updatedSelected);
    setShowSurveyModal(false);
    setNewReadingInput('');
  };

  return (
    <div className="rounded-2xl bg-[#09101d] text-slate-100 p-5 md:p-6 border border-[#1a273e] shadow-2xl space-y-5">
      {/* Header bar matching user's design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#18253c] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold tracking-tight text-white">
                핵의학과 / 방사선관리구역 공간 배치도
              </h3>
              <span className="font-mono text-2xs uppercase tracking-wider text-teal-400/90 font-semibold px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/50">
                B1F Nuclear Medicine & Radioisotope Suite
              </span>
            </div>
            <p className="text-2xs text-slate-400 mt-0.5">
              원자력안전법에 따른 구역별 표면오염도(Bq) 및 선량률 실시간 매핑
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101c30] border border-[#1e2f4d] text-2xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            실시간 텔레메트리 연동
          </span>
        </div>
      </div>

      {/* 4x3 Grid of Radiation Controlled Areas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {zones.map((zone) => {
          const isSelected = selectedZone.id === zone.id;

          // Theme styling based on zone status matching reference screenshot
          let cardStyle =
            'bg-[#0b172a]/90 border-[#10b981]/50 text-emerald-400 hover:border-[#10b981] hover:bg-[#0c1c33]';
          let titleStyle = 'text-emerald-300';
          let readingStyle = 'text-emerald-400 font-mono';
          let glow = '';

          if (zone.status === 'warning') {
            // Hot lab (Amber / Yellow)
            cardStyle =
              'bg-[#19150b]/90 border-[#f59e0b] text-amber-300 hover:bg-[#231d0d] shadow-[0_0_15px_rgba(245,158,11,0.15)]';
            titleStyle = 'text-amber-400 font-extrabold';
            readingStyle = 'text-amber-300 font-mono font-bold';
            glow = 'ring-1 ring-amber-500/30';
          } else if (zone.status === 'alert') {
            // Wait room (Pinkish Red Glow)
            cardStyle =
              'bg-[#200b14]/90 border-[#f43f5e] text-rose-300 hover:bg-[#2c0e1b] shadow-[0_0_18px_rgba(244,63,94,0.2)]';
            titleStyle = 'text-rose-400 font-extrabold';
            readingStyle = 'text-rose-300 font-mono font-bold';
            glow = 'ring-1 ring-rose-500/40';
          } else if (zone.status === 'critical') {
            if (zone.code === 'RI-WST-01') {
              // Muted Waste crimson
              cardStyle =
                'bg-[#1e0f17]/90 border-[#be123c]/70 text-rose-300 hover:bg-[#26131e]';
              titleStyle = 'text-rose-300 font-bold';
              readingStyle = 'text-rose-400 font-mono';
            } else {
              // Drain (오염): 초록색의 보색인 강렬한 크림슨 레드(Crimson Red)로 차별화하여 주변 녹색 구역과 즉시 구분
              cardStyle =
                'bg-[#2c0812] border-rose-500 text-rose-200 hover:bg-[#3b0b18] shadow-[0_0_15px_rgba(244,63,94,0.25)]';
              titleStyle = 'text-rose-300 font-black tracking-wide';
              readingStyle = 'text-rose-300 font-mono font-black';
              glow = 'ring-2 ring-rose-500/60';
            }
          }

          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[110px] select-none ${cardStyle} ${glow} ${
                isSelected ? 'scale-[1.02] ring-2 ring-teal-400/80 shadow-xl' : ''
              }`}
            >
              <div>
                {/* Zone Code */}
                <div className="flex items-center gap-1.5 text-2xs font-mono font-semibold tracking-wider opacity-80 mb-1">
                  {zone.hasWarningIcon && (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span>{zone.code}</span>
                </div>

                {/* English Room Title */}
                <div className={`text-base font-bold leading-tight ${titleStyle}`}>
                  {zone.titleEn}
                </div>

                {/* Korean Room Subtitle */}
                <div className="text-2xs opacity-85 mt-0.5 leading-snug">
                  {zone.titleKo}
                </div>
              </div>

              {/* Surface Contamination Reading */}
              <div className="mt-3 text-xs font-bold flex items-baseline justify-between border-t border-white/10 pt-1.5">
                <span className={readingStyle}>{zone.reading}</span>
                {isSelected && (
                  <span className="text-[10px] text-white/60 font-sans">선택됨</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Instruction Text from screenshot */}
      <div className="p-3 bg-[#0d1626] rounded-xl border border-[#19273f] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">💡</span>
          <span>구역을 클릭하면 하단 상세 제원 확인 및 오염도 실측 / 조치 등록 폼에 즉시 연동됩니다.</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSurveyModal(true)}
            className="px-3 py-1.5 text-2xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>[{selectedZone.code}] 오염도 재측정</span>
          </button>
          {onSelectZoneForAction && (
            <button
              type="button"
              onClick={() => onSelectZoneForAction(selectedZone)}
              className="px-3 py-1.5 text-2xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>조치 항목 등록</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Zone Telemetry Panel */}
      <div className="p-4 bg-[#0d1729] rounded-xl border border-[#1b2b48] grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-2xs text-slate-400">선택된 관리구역</span>
          <div className="font-bold text-white text-sm mt-0.5">
            {selectedZone.titleKo} ({selectedZone.code})
          </div>
          <div className="text-2xs text-slate-400">{selectedZone.titleEn}</div>
        </div>

        <div>
          <span className="text-2xs text-slate-400">방사선 차폐 구조</span>
          <div className="font-semibold text-teal-300 mt-0.5">
            {selectedZone.leadShielding}
          </div>
          <div className="text-2xs text-slate-400">규격 적합 시공</div>
        </div>

        <div>
          <span className="text-2xs text-slate-400">표면오염도 관리 기준</span>
          <div className="font-semibold text-slate-200 mt-0.5">
            {selectedZone.standardLimit}
          </div>
          <div className="text-2xs text-slate-400">원자력안전법 시행규칙</div>
        </div>

        <div className="text-right">
          <span className="text-2xs text-slate-400">최근 서베이 점검</span>
          <div className="font-mono font-bold text-amber-300 mt-0.5">
            {selectedZone.reading}
          </div>
          <div className="text-2xs text-slate-400">{selectedZone.lastSurveyTime}</div>
        </div>
      </div>

      {/* Interactive Contamination Re-measurement Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#0f1a2d] border border-[#233554] rounded-2xl p-5 max-w-sm w-full text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#213454]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold text-white">
                  [{selectedZone.code}] 표면 오염도 실측 갱신
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSurveyModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleUpdateReading} className="space-y-3 text-xs">
              <div>
                <label className="block text-2xs text-slate-400 mb-1">
                  측정 장소: <strong className="text-white">{selectedZone.titleKo}</strong>
                </label>
                <div className="p-2 bg-[#09111e] rounded text-slate-300 text-2xs font-mono">
                  현재 기록치: {selectedZone.reading}
                </div>
              </div>

              <div>
                <label className="block text-2xs text-slate-300 mb-1 font-semibold">
                  신규 측정치 입력 (단위: Bq)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newReadingInput}
                  onChange={(e) => setNewReadingInput(e.target.value)}
                  placeholder="예: 0.3 (정상) 또는 4.5 (주의)"
                  className="w-full px-3 py-2 bg-[#080e18] border border-[#233554] rounded-lg text-white font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="text-[11px] text-slate-400 leading-tight">
                ※ 4.0 Bq 이상은 주의(노랑), 10.0 Bq 이상은 초과 경보(빨강)로 구역 색상이 즉시 자동 전환됩니다.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#213454]">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="px-3 py-1.5 bg-[#17253d] text-slate-300 rounded-lg text-2xs"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-2xs shadow-xs"
                >
                  실측치 갱신
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
