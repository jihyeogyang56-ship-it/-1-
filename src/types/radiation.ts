/**
 * Type definitions for Hospital Diagnostic Radiation Safety Management System
 */

export type ActionStatus = '미조치' | '조치 진행 중' | '관리자 확인 대기' | '최종 완료';

export type PriorityLevel = '높음' | '보통' | '낮음';

export interface ActionHistoryEntry {
  id: string;
  timestamp: string;
  author: string;
  role: string;
  actionType: '등록' | '상태변경' | '조치등록' | '보완요청' | '최종승인' | '수정';
  notes: string;
}

export interface InspectionItem {
  id: string;
  itemCode: string; // e.g., RAD-2026-001
  title: string; // 점검 항목명
  inspectionDate: string; // 점검 일자 (YYYY-MM-DD)
  description: string; // 문제 발생 내용
  locationOrEquipment: string; // 관련 장비 또는 장소
  department: string; // 소속 부서 (영상의학과, 수술실 등)
  assignee: string; // 담당자 (김○○ 등)
  assigneeRole?: string; // 담당자 직위/역할
  dueDate: string; // 조치 기한 (YYYY-MM-DD)
  priority: PriorityLevel; // 우선순위
  status: ActionStatus; // 진행 상태
  notes?: string; // 참고 사항
  actionDetail?: string; // 담당자가 등록한 조치 내용
  actionCompletedDate?: string; // 조치 완료일
  actionAttachments?: string[]; // 첨부 파일/사진
  adminReviewNotes?: string; // 관리자 검토 및 보완 요청 의견
  history: ActionHistoryEntry[];
}

export interface HazardReport {
  id: string;
  reportCode: string; // HAZ-2026-001
  location: string; // 위험 요소 발생 장소
  equipment?: string; // 관련 장비
  discoveryDate: string; // 발견 일자
  description: string; // 문제 내용
  reporter: string; // 신고자
  reporterDept: string; // 신고자 부서
  urgency: PriorityLevel;
  imageUrl?: string; // 사진 첨부
  status: '접수 대기' | '정식 조치 연계됨' | '자체 종결';
  linkedInspectionItemId?: string; // 연계된 점검 항목 ID
  createdAt: string;
}

export interface WorkerDosimetry {
  id: string;
  workerId: string; // 사번 e.g., EMP-1042
  name: string; // 이름
  department: string; // 소속 부서
  role: string; // 직무 (방사선사, 전문의, 간호사 등)
  dosimeterBadgeNo: string; // 선량계 번호 (TLD/OSL)
  monitoringQuarter: string; // 모니터링 분기 (e.g., 2026년 4분기)
  deepDoseHp10: number; // 심부선량 Hp(10) mSv
  shallowDoseHp007: number; // 표층선량 Hp(0.07) mSv
  cumulativeYearlyDose: number; // 연간 누적 선량 mSv (법정한도 50 mSv)
  fiveYearCumulativeDose: number; // 5개년 누적 mSv (법정한도 100 mSv)
  lastHealthCheckDate: string; // 최근 특수건강진단일
  nextHealthCheckDueDate: string; // 차기 특수건강진단 기한
  educationStatus: '이수 완료' | '미이수' | '대상 아님'; // 법정 안전교육
  educationCompletionDate?: string;
  isAlaraWarning: boolean; // 자체 ALARA 기준 초과 경보 (분기 3.0 mSv 기준)
}

export interface RadiationEquipment {
  id: string;
  equipmentCode: string; // e.g., XR-01, CT-02
  name: string; // 장비명 (e.g. 일반촬영장치 A, 전신 CT, C-arm 1호기)
  category: '일반촬영(X-ray)' | '전산화단층촬영(CT)' | '투시장치(C-arm)' | '유방촬영(Mammo)' | '혈관조영(Angio)' | '치과파노라마';
  floor: 'B1' | '1F' | '2F' | '3F';
  room: string; // e.g. 제1촬영실, 본관 3층 제2수술실
  manufacturer: string;
  installDate: string;
  status: '정상 가동' | '점검 요망' | '수리 중 / 사용중지';
  lastQADate: string;
  nextNsscInspectionDate: string; // 원안위 정기검사 도래일
  nextKdcaInspectionDate: string; // 질병청 정기검사 도래일
  manager: string;
  mapCoordinates: { x: number; y: number }; // Percentage for interactive floor map
}

export interface QACheckItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  checkDate: string;
  cycle: '일일 점검' | '주간 점검' | '월간 정도관리';
  item: string; // 점검 항목 (e.g., 조사야 일치도, 관전압 kVp 정확도, 콜리메이터 상태)
  standard: string; // 판정 기준 (e.g., ±5% 이내, 160kVp 이하, 균일도 양호)
  measuredValue: string; // 실측값
  result: '적합' | '부적합' | '주의';
  inspector: string;
}

export interface Radioisotope {
  id: string;
  nuclide: string; // e.g., F-18, Tc-99m, I-131, Ga-68, Lu-177
  compoundName: string; // e.g. [18F]FDG, 99mTc-MDP, [131I]NaI
  sourceType: '개봉 선원' | '밀봉 선원';
  halfLifeMinutes: number; // 반감기 (분 단위)
  halfLifeDisplay: string; // e.g. 109.8분, 6.0시간, 8.02일
  receivedDateTime: string; // 입고 일시 (ISO string)
  initialActivityMBq: number; // 입고 방사능 (MBq)
  currentActivityMBq: number; // 실시간 계산 방사능 (MBq)
  storageLocation: string; // 보관 장소 (e.g. 핫셀 #1, 차폐보관함 B)
  purpose: string; // 용도 (PET-CT 검사, 갑상선암 치료 등)
  manager: string;
}

export interface WasteDrum {
  id: string;
  drumNumber: string; // e.g., DRUM-2026-01
  wasteType: '고체 폐기물 (바이알 / 주사기)' | '액체 폐기물' | '오염 필터 / 가운';
  radioisotope: string; // 주요 포함 동위원소
  saturationPercent: number; // 포화도 0-100%
  storageStartDate: string; // 보관 개시일
  surfaceDoseRateMicroSv: number; // 표면선량률 (μSv/h)
  legalClearanceThresholdMicroSv: number; // 법정 자체 폐기 기준 (1.0 μSv/h 이하)
  isEligibleForDisposal: boolean; // 자체 폐기 가능 여부
  disposalStatus: '보관 중 (감쇠 대기)' | '자체 폐기 승인 가능' | '자체 폐기 완료';
}

export interface UserProfile {
  id: string;
  name: string;
  role: '안전관리책임자' | '방사선사' | '간호사' | '부서관리자';
  department: string;
  avatarInitials: string;
  isAdmin: boolean;
}
