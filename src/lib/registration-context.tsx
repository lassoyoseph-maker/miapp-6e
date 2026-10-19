import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useAuth } from './auth-context';

import type { FurnitureRegistration } from './vitrina';
type Registration = FurnitureRegistration;
const Context = createContext<{
  registration: Registration | null;
  setRegistration: (value: Registration | null) => void;
} | null>(null);

export function RegistrationProvider({ children }: PropsWithChildren) {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const { session } = useAuth();
  const userId = session?.user.id;
  useEffect(() => { setRegistration(null); }, [userId]);
  return <Context.Provider value={{ registration, setRegistration }}>{children}</Context.Provider>;
}

export function useRegistration() {
  const context = useContext(Context);
  if (!context) throw new Error('RegistrationProvider is required');
  return context;
}
