/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, AppTheme } from './components/Header';
import { Sidebar, TabId } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InspectionItemsView } from './components/InspectionItemsView';
import { AssigneeBoardView } from './components/AssigneeBoardView';
import { HazardReportView } from './components/HazardReportView';
import { DosimetryView } from './components/DosimetryView';
import { EquipmentQAView } from './components/EquipmentQAView';
import { IsotopeLifecycleView } from './components/IsotopeLifecycleView';
import { HistoryReportView } from './components/HistoryReportView';
import { ItemModal } from './components/ItemModal';
import { ActionReviewModal } from './components/ActionReviewModal';
import { HazardModal } from './components/HazardModal';
import { RadiationZoneItem } from './components/RadiationZoneGrid';

import {
  InspectionItem,
  HazardReport,
  WorkerDosimetry,
  RadiationEquipment,
  QACheckItem,
  Radioisotope,
  WasteDrum,
  UserProfile,
  ActionStatus,
} from './types/radiation';

import {
  DEMO_USERS,
  INITIAL_INSPECTION_ITEMS,
  INITIAL_HAZARD_REPORTS,
  INITIAL_WORKER_DOSIMETRY,
  INITIAL_EQUIPMENT,
  INITIAL_QA_ITEMS,
  INITIAL_RADIOISOTOPES,
  INITIAL_WASTE_DRUMS,
} from './data/mockData';

import {
  loadStoredData,
  saveStoredData,
  resetAllDataToDefault,
  KEYS,
} from './utils/storage';

import {
  CURRENT_SYSTEM_DATE,
  isItemOverdue,
} from './utils/statusHelpers';

export default function App() {
  // Theme State (defaulting to 'navy' for the requested dark cockpit command center)
  const [theme, setTheme] = useState<AppTheme>(() =>
    loadStoredData('rad_safety_theme_v2', 'navy')
  );

  // Apply theme to document body
  useEffect(() => {
    document.body.className = `theme-${theme} font-sans antialiased selection:bg-teal-500 selection:text-white`;
    saveStoredData('rad_safety_theme_v2', theme);
  }, [theme]);

  // Navigation & User Role State
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadStoredData(KEYS.CURRENT_USER, DEMO_USERS[0])
  );

  // Core Data States
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>(() =>
    loadStoredData(KEYS.INSPECTIONS, INITIAL_INSPECTION_ITEMS)
  );
  const [hazardReports, setHazardReports] = useState<HazardReport[]>(() =>
    loadStoredData(KEYS.HAZARDS, INITIAL_HAZARD_REPORTS)
  );
  const [workers, setWorkers] = useState<WorkerDosimetry[]>(() =>
    loadStoredData(KEYS.DOSIMETRY, INITIAL_WORKER_DOSIMETRY)
  );
  const [equipment, setEquipment] = useState<RadiationEquipment[]>(() =>
    loadStoredData(KEYS.EQUIPMENT, INITIAL_EQUIPMENT)
  );
  const [qaItems, setQaItems] = useState<QACheckItem[]>(() =>
    loadStoredData(KEYS.QA, INITIAL_QA_ITEMS)
  );
  const [isotopes, setIsotopes] = useState<Radioisotope[]>(() =>
    loadStoredData(KEYS.ISOTOPES, INITIAL_RADIOISOTOPES)
  );
  const [wasteDrums, setWasteDrums] = useState<WasteDrum[]>(() =>
    loadStoredData(KEYS.WASTE, INITIAL_WASTE_DRUMS)
  );

  // Sync to LocalStorage
  useEffect(() => {
    saveStoredData(KEYS.CURRENT_USER, currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStoredData(KEYS.INSPECTIONS, inspectionItems);
  }, [inspectionItems]);

  useEffect(() => {
    saveStoredData(KEYS.HAZARDS, hazardReports);
  }, [hazardReports]);

  useEffect(() => {
    saveStoredData(KEYS.DOSIMETRY, workers);
  }, [workers]);

  useEffect(() => {
    saveStoredData(KEYS.EQUIPMENT, equipment);
  }, [equipment]);

  useEffect(() => {
    saveStoredData(KEYS.QA, qaItems);
  }, [qaItems]);

  useEffect(() => {
    saveStoredData(KEYS.ISOTOPES, isotopes);
  }, [isotopes]);

  useEffect(() => {
    saveStoredData(KEYS.WASTE, wasteDrums);
  }, [wasteDrums]);

  // Modal Control States
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InspectionItem | null>(null);
  const [prefillHazard, setPrefillHazard] = useState<HazardReport | null>(null);

  const [isActionReviewModalOpen, setIsActionReviewModalOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<InspectionItem | null>(null);

  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);

  // Handlers for Inspection Items
  const handleOpenNewItem = () => {
    setEditingItem(null);
    setPrefillHazard(null);
    setIsItemModalOpen(true);
  };

  const handleSelectItemForReview = (item: InspectionItem) => {
    setReviewingItem(item);
    setIsActionReviewModalOpen(true);
  };

  const handleSelectZoneForAction = (zone: RadiationZoneItem) => {
    setPrefillHazard({
      id: `zone-${zone.code}`,
      reportCode: `HAZ-ZONE-${zone.code}`,
      location: `본관 지하 1층 핵의학과 ${zone.titleKo} (${zone.code})`,
      equipment: zone.titleEn,
      discoveryDate: CURRENT_SYSTEM_DATE,
      description: `${zone.titleKo}(${zone.code}) 구역 표면오염도 측정 결과 ${zone.reading} 기록됨. 차폐 구조(${zone.leadShielding}) 및 환기 배기 덕트 누설 점검, 즉시 제염 조치 요망.`,
      reporter: currentUser.name,
      reporterDept: currentUser.department,
      urgency: zone.status === 'critical' ? '높음' : '보통',
      status: '접수 대기',
      createdAt: CURRENT_SYSTEM_DATE,
    });
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleSaveInspectionItem = (formData: Partial<InspectionItem>) => {
    if (editingItem) {
      // Update existing item
      const updated = inspectionItems.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            ...formData,
            history: [
              ...item.history,
              {
                id: `h-${Date.now()}`,
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                author: currentUser.name,
                role: currentUser.role,
                actionType: '수정' as const,
                notes: '점검 항목 정보 수정됨',
              },
            ],
          };
        }
        return item;
      });
      setInspectionItems(updated);
    } else {
      // Create new item
      const nextNum = inspectionItems.length + 1;
      const code = `RAD-2026-${String(nextNum).padStart(3, '0')}`;
      const newItem: InspectionItem = {
        id: code,
        itemCode: code,
        title: formData.title || '',
        inspectionDate: formData.inspectionDate || CURRENT_SYSTEM_DATE,
        description: formData.description || '',
        locationOrEquipment: formData.locationOrEquipment || '',
        department: formData.department || '영상의학과',
        assignee: formData.assignee || DEMO_USERS[1].name,
        assigneeRole: '담당 방사선사',
        dueDate: formData.dueDate || CURRENT_SYSTEM_DATE,
        priority: formData.priority || '보통',
        status: '미조치',
        notes: formData.notes || '',
        history: [
          {
            id: `h-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            author: currentUser.name,
            role: currentUser.role,
            actionType: '등록',
            notes: `안전점검 지적 사항 등록 (조치 기한: ${formData.dueDate})`,
          },
        ],
      };

      setInspectionItems([newItem, ...inspectionItems]);

      // If created from a hazard report, mark that hazard report as linked
      if (prefillHazard) {
        setHazardReports((prev) =>
          prev.map((h) =>
            h.id === prefillHazard.id
              ? { ...h, status: '정식 조치 연계됨', linkedInspectionItemId: newItem.id }
              : h
          )
        );
      }
    }
  };

  const handleUpdateStatus = (
    itemId: string,
    newStatus: ActionStatus,
    actionDetail?: string,
    actionDate?: string,
    adminNotes?: string
  ) => {
    setInspectionItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          let actionType: any = '상태변경';
          let noteText = `상태를 [${newStatus}]으로 변경`;

          if (newStatus === '관리자 확인 대기') {
            actionType = '조치등록';
            noteText = `조치 결과 등록 및 관리자 검토 요청: "${actionDetail}"`;
          } else if (newStatus === '최종 완료') {
            actionType = '최종승인';
            noteText = `관리자 최종 확인 및 완료 승인 (${adminNotes || '적합'})`;
          } else if (adminNotes && newStatus === '조치 진행 중') {
            actionType = '보완요청';
            noteText = `관리자 보완 요청: "${adminNotes}"`;
          }

          const updatedItem: InspectionItem = {
            ...item,
            status: newStatus,
            actionDetail: actionDetail !== undefined ? actionDetail : item.actionDetail,
            actionCompletedDate: actionDate !== undefined ? actionDate : item.actionCompletedDate,
            adminReviewNotes: adminNotes !== undefined ? adminNotes : item.adminReviewNotes,
            history: [
              ...item.history,
              {
                id: `h-${Date.now()}`,
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                author: currentUser.name,
                role: currentUser.role,
                actionType,
                notes: noteText,
              },
            ],
          };

          // Also update reviewingItem in modal
          setReviewingItem(updatedItem);
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setInspectionItems((prev) => prev.filter((i) => i.id !== itemId));
    setIsActionReviewModalOpen(false);
  };

  // Hazard Handlers
  const handleAddHazard = (reportData: Partial<HazardReport>) => {
    const nextNum = hazardReports.length + 1;
    const code = `HAZ-2026-${String(nextNum).padStart(3, '0')}`;
    const newReport: HazardReport = {
      id: code,
      reportCode: code,
      location: reportData.location || '',
      equipment: reportData.equipment || '',
      discoveryDate: reportData.discoveryDate || CURRENT_SYSTEM_DATE,
      description: reportData.description || '',
      reporter: reportData.reporter || currentUser.name,
      reporterDept: reportData.reporterDept || currentUser.department,
      urgency: reportData.urgency || '보통',
      imageUrl: reportData.imageUrl || '',
      status: '접수 대기',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setHazardReports([newReport, ...hazardReports]);
  };

  const handlePromoteHazardToInspection = (hazard: HazardReport) => {
    setPrefillHazard(hazard);
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  const handleCloseHazard = (hazardId: string) => {
    setHazardReports((prev) =>
      prev.map((h) => (h.id === hazardId ? { ...h, status: '자체 종결' } : h))
    );
  };

  // Other Handlers
  const handleAddWorkerRecord = (record: WorkerDosimetry) => {
    setWorkers([record, ...workers]);
  };

  const handleAddQACheck = (item: QACheckItem) => {
    setQaItems([item, ...qaItems]);
  };

  const handleUpdateEquipmentStatus = (
    id: string,
    status: '정상 가동' | '점검 요망' | '수리 중 / 사용중지'
  ) => {
    setEquipment((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  const handleDischargeDrum = (drumId: string) => {
    setWasteDrums((prev) =>
      prev.map((d) =>
        d.id === drumId
          ? {
              ...d,
              disposalStatus: '자체 폐기 완료',
              isEligibleForDisposal: false,
              saturationPercent: 0,
            }
          : d
      )
    );
    alert('방사성 폐기물 드럼의 자체 폐기 처리가 완료되었습니다 (대장 기록 갱신됨).');
  };

  const handleResetData = () => {
    if (confirm('모든 데이터를 최초 기본 예시 상태로 초기화하시겠습니까?')) {
      resetAllDataToDefault();
      setInspectionItems(INITIAL_INSPECTION_ITEMS);
      setHazardReports(INITIAL_HAZARD_REPORTS);
      setWorkers(INITIAL_WORKER_DOSIMETRY);
      setEquipment(INITIAL_EQUIPMENT);
      setQaItems(INITIAL_QA_ITEMS);
      setIsotopes(INITIAL_RADIOISOTOPES);
      setWasteDrums(INITIAL_WASTE_DRUMS);
      setCurrentUser(DEMO_USERS[0]);
    }
  };

  // Badges calculation
  const overdueCount = inspectionItems.filter((i) => isItemOverdue(i.dueDate, i.status)).length;
  const pendingReviewCount = inspectionItems.filter((i) => i.status === '관리자 확인 대기').length;
  const hazardPendingCount = hazardReports.filter((h) => h.status === '접수 대기').length;

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar Header */}
      <Header
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        inspectionItems={inspectionItems}
        onOpenReportPrint={() => setActiveTab('reports')}
        onResetData={handleResetData}
        onSelectItem={handleSelectItemForReview}
        currentTheme={theme}
        onSelectTheme={setTheme}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="no-print">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            overdueCount={overdueCount}
            pendingReviewCount={pendingReviewCount}
            hazardPendingCount={hazardPendingCount}
          />
        </div>

        {/* View Content Viewport with High-Tech Medical Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 medical-grid-bg transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                items={inspectionItems}
                workers={workers}
                equipment={equipment}
                currentUser={currentUser}
                onSelectItem={handleSelectItemForReview}
                onOpenNewItem={handleOpenNewItem}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'inspections' && (
              <InspectionItemsView
                items={inspectionItems}
                onSelectItem={handleSelectItemForReview}
                onOpenNewItem={handleOpenNewItem}
              />
            )}

            {activeTab === 'assignees' && (
              <AssigneeBoardView
                items={inspectionItems}
                currentUser={currentUser}
                workers={workers}
                onSelectItem={handleSelectItemForReview}
                onOpenNewItem={handleOpenNewItem}
              />
            )}

            {activeTab === 'hazards' && (
              <HazardReportView
                reports={hazardReports}
                currentUser={currentUser}
                onOpenNewHazard={() => setIsHazardModalOpen(true)}
                onPromoteToInspection={handlePromoteHazardToInspection}
                onCloseHazard={handleCloseHazard}
              />
            )}

            {activeTab === 'dosimetry' && (
              <DosimetryView
                workers={workers}
                onAddWorkerRecord={handleAddWorkerRecord}
              />
            )}

            {activeTab === 'equipment' && (
              <EquipmentQAView
                equipment={equipment}
                qaItems={qaItems}
                onAddQACheck={handleAddQACheck}
                onUpdateEquipmentStatus={handleUpdateEquipmentStatus}
                onSelectZoneForAction={handleSelectZoneForAction}
              />
            )}

            {activeTab === 'isotopes' && (
              <IsotopeLifecycleView
                isotopes={isotopes}
                wasteDrums={wasteDrums}
                onDischargeDrum={handleDischargeDrum}
              />
            )}

            {activeTab === 'reports' && (
              <HistoryReportView
                items={inspectionItems}
                currentUser={currentUser}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
          setPrefillHazard(null);
        }}
        onSave={handleSaveInspectionItem}
        initialData={editingItem}
        prefillFromHazard={prefillHazard}
      />

      <ActionReviewModal
        isOpen={isActionReviewModalOpen}
        item={reviewingItem}
        currentUser={currentUser}
        onClose={() => {
          setIsActionReviewModalOpen(false);
          setReviewingItem(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        onEditClick={(item) => {
          setEditingItem(item);
          setIsItemModalOpen(true);
        }}
        onDeleteClick={handleDeleteItem}
      />

      <HazardModal
        isOpen={isHazardModalOpen}
        currentUser={currentUser}
        onClose={() => setIsHazardModalOpen(false)}
        onSubmit={handleAddHazard}
      />
    </div>
  );
}
