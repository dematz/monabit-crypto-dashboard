import type { UserProfile } from '@monabit/shared-types';
import { api } from './api';

export function fetchUsers(): Promise<UserProfile[]> {
  return api.get('/users');
}

export function deactivateUser(id: string): Promise<UserProfile> {
  return api.delete(`/users/${id}`);
}

export function updateUser(
  id: string,
  data: Partial<Pick<UserProfile, 'display_name' | 'role' | 'is_active'>>,
): Promise<UserProfile> {
  return api.patch(`/users/${id}`, data);
}
