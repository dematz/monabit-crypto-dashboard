import { api } from './api';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';

export async function fetchAndSetProfile(token: string) {
  try {
    const { user, profile } = await api.get<{
      user: { id: string; email: string; role: 'admin' | 'user' };
      profile: { display_name: string | null } | null;
    }>('/auth/me');
    useAppStore.getState().setSession(
      {
        id: user.id,
        name: profile?.display_name ?? user.email.split('@')[0] ?? 'User',
        email: user.email,
        role: user.role === 'admin' ? 'Admin' : 'User',
      },
      token,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('deactivated') || message.includes('403')) {
      toast.error('Your account has been deactivated. Contact an administrator.');
      useAppStore.getState().logout();
    }
  }
}
