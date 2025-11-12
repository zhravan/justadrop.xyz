import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  // Use Prisma for type-safe queries
  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  return profile;
});

export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
};

export const requireRole = async (allowedRoles: string[]) => {
  const profile = await getCurrentProfile();
  if (!profile || !allowedRoles.includes(profile.role)) {
    throw new Error('Forbidden');
  }
  return profile;
};

