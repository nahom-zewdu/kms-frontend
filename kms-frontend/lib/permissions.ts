// lib/permissions.ts

import { getUserContext } from './auth';

export async function requireRole(minRole: 'member' | 'manager' | 'admin') {
  const user = await getUserContext();
  if (!user) throw new Error('Unauthorized');

  const roleOrder = { member: 1, manager: 2, admin: 3 } as const;
  const userRole = user.role as keyof typeof roleOrder;
  if (roleOrder[userRole] < roleOrder[minRole]) {
    throw new Error('Insufficient permissions');
  }
  return user;
}
