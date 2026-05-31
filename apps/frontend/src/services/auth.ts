import { api } from './api';
import { useAppStore } from '@/stores/app-store';
import { toast } from 'sonner';
import { authMeResponseSchema } from '@/lib/schemas';

export async function fetchAndSetProfile(token: string) {
  try {
    const raw = await api.get<unknown>('/auth/me');
    const parsed = authMeResponseSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error('Invalid server response');
      return;
    }
    const { user, profile } = parsed.data;
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
