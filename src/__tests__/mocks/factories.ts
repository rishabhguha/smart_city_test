import type { User, Department, Category, ServiceRequest, StatusHistory } from '@/db/schema';

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user_test',
    username: 'testuser',
    name: 'Test User',
    role: 'citizen',
    departmentId: null,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createDepartment(overrides: Partial<Department> = {}): Department {
  return {
    id: 'dept_test',
    name: 'Public Works',
    emailAlias: 'publicworks@city.gov',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'cat_test',
    name: 'Pothole',
    departmentId: 'dept_test',
    slaHours: 72,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createRequest(overrides: Partial<ServiceRequest> = {}): ServiceRequest {
  return {
    id: 'req_test',
    citizenName: 'Jane Doe',
    citizenEmail: null,
    citizenId: null,
    categoryId: 'cat_test',
    departmentId: 'dept_test',
    title: 'Large pothole on Main St',
    description: 'About 6 inches deep near the crosswalk',
    address: '123 Main St',
    lat: 40.7128,
    lng: -74.006,
    photoUrl: null,
    status: 'open',
    priority: 'medium',
    assignedTo: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createStatusHistory(overrides: Partial<StatusHistory> = {}): StatusHistory {
  return {
    id: 'hist_test',
    requestId: 'req_test',
    oldStatus: null,
    newStatus: 'open',
    changedBy: null,
    note: 'Request submitted',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
