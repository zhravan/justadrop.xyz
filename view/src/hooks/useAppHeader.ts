import { useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useClickOutside } from './useClickOutside';
import { useAuth } from '@/lib/auth/use-auth';
import { useNgo } from '@/contexts/NgoContext';

export function useAppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [ngoDropdownOpen, setNgoDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const ngoDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { organizations, selectedOrgId, setSelectedOrgId, selectedOrg } = useNgo();

  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);
  const closeUserMenu = useCallback(() => setUserMenuOpen(false), []);
  const closeNgoDropdown = useCallback(() => setNgoDropdownOpen(false), []);

  useClickOutside(menuRef, mobileMenuOpen, closeMenu);
  useClickOutside(userMenuRef, userMenuOpen, closeUserMenu);
  useClickOutside(ngoDropdownRef, ngoDropdownOpen, closeNgoDropdown);

  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((prev) => !prev), []);
  const toggleUserMenu = useCallback(() => setUserMenuOpen((prev) => !prev), []);
  const toggleNgoDropdown = useCallback(() => setNgoDropdownOpen((prev) => !prev), []);

  return {
    mobileMenuOpen,
    userMenuOpen,
    ngoDropdownOpen,
    menuRef,
    userMenuRef,
    ngoDropdownRef,
    pathname,
    user,
    logout,
    organizations,
    selectedOrgId,
    setSelectedOrgId,
    selectedOrg,
    closeMenu,
    closeUserMenu,
    toggleMobileMenu,
    toggleUserMenu,
    toggleNgoDropdown,
  };
}
