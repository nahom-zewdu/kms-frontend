// lib/auth.ts
// This module provides authentication-related utilities for the KMS frontend application.
// It includes a function to retrieve the current user's context, which can be used across the application to determine access levels, display user-specific information, and manage playbook limits based on the user's subscription plan. 
// The getUserContext function interacts with Supabase's authentication system to fetch the current user's details and returns a structured context object that includes the user's ID, email, company affiliation, subscription plan, and playbook usage statistics.

import { supabase } from './supabase';

export type UserContext = {
  userId: string;
  email: string;
  companyId: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  activePlaybooks: number;
  maxPlaybooks: number;
};

export async function getUserContext(): Promise<UserContext | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // TODO: Replace with real user metadata later
  return {
    userId: user.id,
    email: user.email || '',
    companyId: 'default',
    plan: 'starter',
    activePlaybooks: 3,
    maxPlaybooks: 10,
  };
}
