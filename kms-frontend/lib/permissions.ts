// lib/permissions.ts

import { getUserContext } from './auth';

type Role = 'member' | 'manager' | 'admin';

function isRole(role: unknown): role is Role {
  return role === 'member' || role === 'manager' || role === 'admin';
}

export async function requireRole(minRole: 'member' | 'manager' | 'admin') {
  const user = await getUserContext();
  if (!user) throw new Error('Unauthorized');

  const roleOrder: Record<Role, number> = { member: 1, manager: 2, admin: 3 };
  const userRole = user.activeCompany?.role;
  if (!isRole(userRole) || roleOrder[userRole] < roleOrder[minRole]) {
    throw new Error('Insufficient permissions');
  }
  return user;
}
