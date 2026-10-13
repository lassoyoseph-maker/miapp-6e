import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { authError, loadUserProfile, type UserProfile } from './auth';
import { getSupabase } from './supabase';

const Context = createContext<{
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  profileLoading: boolean;
  error: string;
} | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    try {
      const client = getSupabase();
      let receivedEvent = false;
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
        if (!active) return;
        receivedEvent = true;
        setSession(nextSession);
        setError('');
        setLoading(false);
      });
      void client.auth.getSession().then(({ data, error: sessionError }) => {
        if (!active || receivedEvent) return;
        if (sessionError) setError(authError(sessionError));
        setSession(data.session);
        setLoading(false);
      }).catch((err) => {
        if (active) { setError(authError(err)); setLoading(false); }
      });
      const updateRefresh = (state: string | null) => {
        if (state === 'active') client.auth.startAutoRefresh();
        else client.auth.stopAutoRefresh();
      };
      const appStateSubscription = Platform.OS !== 'web'
        ? AppState.addEventListener('change', updateRefresh) : null;
      if (Platform.OS !== 'web') updateRefresh(AppState.currentState);
      return () => {
        active = false;
        subscription.unsubscribe();
        appStateSubscription?.remove();
        if (Platform.OS !== 'web') client.auth.stopAutoRefresh();
      };
    } catch (err) {
      setError(authError(err));
      setLoading(false);
    }
    return () => { active = false; };
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    let active = true;
    setProfile(null);
    if (!userId) { setProfileLoading(false); return; }
    setProfileLoading(true);
    // Run database work outside onAuthStateChange to avoid the Auth client lock.
    void loadUserProfile(userId).then((value) => {
      if (active) setProfile(value);
    }).catch((err) => {
      if (active) setError(authError(err));
    }).finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [userId]);

  return <Context.Provider value={{ session, loading, profile, profileLoading, error }}>{children}</Context.Provider>;
}

export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error('AuthProvider is required');
  return value;
}
