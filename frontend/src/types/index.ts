// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'technicien';
  phone?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  fullName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  color?: string;
  bodyType: 'sedan' | 'suv' | 'truck' | 'van' | 'bus' | 'motorcycle' | 'other';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
  transmission: 'manual' | 'automatic' | 'cvt';
  engineSize?: number;
  horsepower?: number;
  registrationDate?: string;
  registrationExpiry?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  status: 'active' | 'maintenance' | 'offline' | 'retired';
  assignedDriver?: User | null;
  department?: string;
  currentMileage: number;
  mileageUnit: 'km' | 'miles';
  maintenanceSchedule: {
    oilChangeInterval: number;
    lastOilChange?: string;
    lastOilChangeMileage: number;
    tireRotationInterval: number;
    lastTireRotation?: string;
    brakeCheckInterval: number;
    lastBrakeCheck?: string;
    generalInspectionInterval: number;
    lastGeneralInspection?: string;
  };
  components: {
    battery: ComponentStatus;
    distributionChain: ComponentStatus;
    engineBelt: ComponentStatus;
    brakeFluid: ComponentStatus;
    coolant: ComponentStatus;
  };
  purchaseDate?: string;
  purchasePrice?: number;
  notes?: string;
  images?: VehicleImage[];
  createdBy?: User;
  updatedBy?: User;
  createdAt?: string;
  updatedAt?: string;
  age?: number;
  nextScheduledMaintenance?: ScheduledMaintenance[];
}

export interface ComponentStatus {
  lastReplaced?: string;
  lastChanged?: string;
  condition: 'good' | 'fair' | 'poor' | 'unknown';
  nextReplacementDate?: string;
  nextChangeDate?: string;
}

export interface ScheduledMaintenance {
  type: string;
  date: string;
}

export interface VehicleImage {
  url: string;
  caption?: string;
  uploadedAt: string;
}

// Maintenance Types
export interface Maintenance {
  id: string;
  vehicle: Vehicle | string;
  type: MaintenanceType;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  startDate?: string;
  completionDate?: string;
  mileageAtService?: number;
  nextServiceMileage?: number;
  nextServiceDate?: string;
  description: string;
  workPerformed?: string;
  partsUsed: PartUsed[];
  laborHours: number;
  laborRate: number;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  serviceProvider?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  technician?: User | string;
  technicianName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  warranty?: {
    hasWarranty: boolean;
    warrantyMonths: number;
    warrantyExpiry?: string;
  };
  documents?: Document[];
  images?: MaintenanceImage[];
  invoiceNumber?: string;
  invoiceDate?: string;
  notes?: string;
  createdBy?: User;
  updatedBy?: User;
  createdAt?: string;
  updatedAt?: string;
  duration?: number;
  daysUntilScheduled?: number;
}

export type MaintenanceType = 
  | 'oil_change'
  | 'tire_rotation'
  | 'brake_service'
  | 'battery_replacement'
  | 'chain_replacement'
  | 'belt_replacement'
  | 'brake_fluid_change'
  | 'coolant_change'
  | 'general_inspection'
  | 'engine_repair'
  | 'transmission_repair'
  | 'electrical_repair'
  | 'body_work'
  | 'other';

export interface PartUsed {
  id?: string;
  name: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Document {
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

export interface MaintenanceImage {
  url: string;
  caption?: string;
  uploadedAt: string;
}

// Dashboard Types
export interface DashboardOverview {
  vehicles: {
    total: number;
    active: number;
    maintenance: number;
    offline: number;
  };
  maintenance: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
  };
  users: {
    total: number;
    active: number;
  };
  monthlyCost: number;
  recentVehicles: Vehicle[];
  recentMaintenance: Maintenance[];
  upcomingMaintenance: Maintenance[];
}

export interface TrendData {
  month: string;
  count: number;
  completed: number;
  cost: number;
}

export interface Alert {
  type: string;
  severity: 'urgent' | 'warning' | 'info';
  message: string;
  vehicle?: string;
  plateNumber?: string;
  maintenance?: string;
  date: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// Filter Types
export interface VehicleFilters {
  search?: string;
  status?: string;
  make?: string;
  fuelType?: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface MaintenanceFilters {
  vehicle?: string;
  status?: string;
  type?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// Theme Type
export type Theme = 'light' | 'dark' | 'system';
