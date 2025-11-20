'use client';

import { useMemo, useCallback } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
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

let listeners: (() => void)[] = [];

// A function to subscribe to auth state changes
function subscribe(auth: Auth, callback: () => void) {
  if (listeners.length === 0) {
    onAuthStateChanged(auth, (user) => {
      serverState = { ...serverState, user, isLoading: false };
      listeners.forEach(l => l());
    }, (error) => {
      serverState = { ...serverState, error, isLoading: false };
      listeners.forEach(l => l());
    });
  }

  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
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
  const auth = useAuth();
  
  const subscribeCallback = useCallback((callback: () => void) => {
    return subscribe(auth, callback);
  }, [auth]);

  const authState = useSyncExternalStore(subscribeCallback, getSnapshot, getSnapshot);
  return useMemo(() => authState, [authState.user, authState.isLoading, authState.error]);
}
