'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export interface Organization {
  id: string;
  orgName: string;
  description: string | null;
  causes: string[];
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface NgoContextValue {
  organizations: Organization[];
  selectedOrgId: string | null;
  setSelectedOrgId: (id: string | null) => void;
  selectedOrg: Organization | null;
  isLoading: boolean;
  refetchOrgs: () => Promise<void>;
}

const NgoContext = createContext<NgoContextValue | null>(null);

const SELECTED_ORG_KEY = 'justadrop_selected_org_id';

export function NgoProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/organizations', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const orgs = Array.isArray(data) ? data : (data?.organizations ?? []);
        setOrganizations(orgs);
        const stored = typeof window !== 'undefined' ? localStorage.getItem(SELECTED_ORG_KEY) : null;
        if (stored && orgs.some((o: Organization) => o.id === stored)) {
          setSelectedOrgIdState(stored);
        } else if (orgs.length > 0 && !stored) {
          setSelectedOrgIdState(orgs[0].id);
          if (typeof window !== 'undefined') {
            localStorage.setItem(SELECTED_ORG_KEY, orgs[0].id);
          }
        } else {
          setSelectedOrgIdState(null);
        }
      } else {
        setOrganizations([]);
        setSelectedOrgIdState(null);
      }
    } catch {
      setOrganizations([]);
      setSelectedOrgIdState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const setSelectedOrgId = useCallback((id: string | null) => {
    setSelectedOrgIdState(id);
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem(SELECTED_ORG_KEY, id);
      else localStorage.removeItem(SELECTED_ORG_KEY);
    }
  }, []);

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId) ?? null;

  return (
    <NgoContext.Provider
      value={{
        organizations,
        selectedOrgId,
        setSelectedOrgId,
        selectedOrg,
        isLoading,
        refetchOrgs: fetchOrgs,
      }}
    >
      {children}
    </NgoContext.Provider>
  );
}

export function useNgo() {
  const ctx = useContext(NgoContext);
  if (!ctx) {
    throw new Error('useNgo must be used within NgoProvider');
  }
  return ctx;
}
