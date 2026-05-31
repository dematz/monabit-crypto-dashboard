import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { fetchAndSetProfile } from '@/services/auth';
import { useAppStore } from '@/stores/app-store';

export function useAuthListener() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') &&
        session &&
        !useAppStore.getState().user
      ) {
        useAppStore.setState({ token: session.access_token });
        fetchAndSetProfile(session.access_token);
      }
    });

    const timer = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && !useAppStore.getState().user) {
        useAppStore.setState({ token: session.access_token });
        fetchAndSetProfile(session.access_token);
      }
    }, 100);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);
}
