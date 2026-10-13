import { createContext, useContext, useState, type PropsWithChildren } from 'react';

type Registration = { nombre: string; correo: string; telefono: string; ciudad: string };
const Context = createContext<{
  registration: Registration | null;
  setRegistration: (value: Registration | null) => void;
} | null>(null);

export function RegistrationProvider({ children }: PropsWithChildren) {
  const [registration, setRegistration] = useState<Registration | null>(null);
  return <Context.Provider value={{ registration, setRegistration }}>{children}</Context.Provider>;
}

export function useRegistration() {
  const context = useContext(Context);
  if (!context) throw new Error('RegistrationProvider is required');
  return context;
}
