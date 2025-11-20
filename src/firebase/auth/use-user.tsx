'use client';

import { useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { useSyncExternalStore } from 'react';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

// Store the initial server-side state
let serverState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

// A function to subscribe to auth state changes
function subscribe(callback: () => void) {
  const auth = useAuth();
  return onAuthStateChanged(auth, (user) => {
    serverState = { ...serverState, user, isLoading: false };
    callback();
  }, (error) => {
    serverState = { ...serverState, error, isLoading: false };
    callback();
  });
}

// A function to get the current snapshot of the auth state
function getSnapshot(): AuthState {
  return serverState;
}

/**
 * Hook for accessing the authenticated user's state.
 * It uses useSyncExternalStore for concurrent rendering safety.
 *
 * @returns {AuthState} An object containing the user, loading state, and error.
 */
export function useUser(): AuthState {
  const authState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return useMemo(() => authState, [authState.user, authState.isLoading, authState.error]);
}
