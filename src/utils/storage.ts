import {
  InspectionItem,
  HazardReport,
  WorkerDosimetry,
  RadiationEquipment,
  QACheckItem,
  Radioisotope,
  WasteDrum,
  UserProfile,
} from '../types/radiation';
import {
  INITIAL_INSPECTION_ITEMS,
  INITIAL_HAZARD_REPORTS,
  INITIAL_WORKER_DOSIMETRY,
  INITIAL_EQUIPMENT,
  INITIAL_QA_ITEMS,
  INITIAL_RADIOISOTOPES,
  INITIAL_WASTE_DRUMS,
  DEMO_USERS,
} from '../data/mockData';

const KEYS = {
  INSPECTIONS: 'rad_safety_inspections_v1',
  HAZARDS: 'rad_safety_hazards_v1',
  DOSIMETRY: 'rad_safety_dosimetry_v1',
  EQUIPMENT: 'rad_safety_equipment_v1',
  QA: 'rad_safety_qa_v1',
  ISOTOPES: 'rad_safety_isotopes_v1',
  WASTE: 'rad_safety_waste_v1',
  CURRENT_USER: 'rad_safety_user_v1',
};

export function loadStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Failed to load ${key} from localStorage:`, err);
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

export function resetAllDataToDefault(): void {
  try {
    localStorage.setItem(KEYS.INSPECTIONS, JSON.stringify(INITIAL_INSPECTION_ITEMS));
    localStorage.setItem(KEYS.HAZARDS, JSON.stringify(INITIAL_HAZARD_REPORTS));
    localStorage.setItem(KEYS.DOSIMETRY, JSON.stringify(INITIAL_WORKER_DOSIMETRY));
    localStorage.setItem(KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENT));
    localStorage.setItem(KEYS.QA, JSON.stringify(INITIAL_QA_ITEMS));
    localStorage.setItem(KEYS.ISOTOPES, JSON.stringify(INITIAL_RADIOISOTOPES));
    localStorage.setItem(KEYS.WASTE, JSON.stringify(INITIAL_WASTE_DRUMS));
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS[0]));
  } catch (err) {
    console.error('Failed to reset storage:', err);
  }
}

export { KEYS };
