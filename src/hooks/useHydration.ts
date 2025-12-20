import { useState, useEffect } from "react";

/**
 * Custom hook to handle hydration safely in Next.js
 * Prevents hydration mismatches by ensuring components only render after hydration
 *
 * @returns {boolean} mounted - Whether the component has mounted on the client
 */
export const useHydration = (): boolean => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};

/**
 * Custom hook for hydration-safe state management
 * Returns undefined during SSR and the actual value after hydration
 *
 * @param value - The value to return after hydration
 * @returns The value after hydration, undefined during SSR
 */
export const useHydrationSafeValue = <T>(value: T): T | undefined => {
  const mounted = useHydration();
  return mounted ? value : undefined;
};

/**
 * Custom hook for conditional rendering based on hydration state
 * Useful for components that should only render on the client
 *
 * @param clientComponent - Component to render after hydration
 * @param serverComponent - Component to render during SSR (optional)
 * @returns The appropriate component based on hydration state
 */
export const useHydrationSafeRender = <T, U>(
  clientComponent: T,
  serverComponent?: U,
): T | U | null => {
  const mounted = useHydration();

  if (!mounted) {
    return serverComponent || null;
  }

  return clientComponent;
};

/**
 * Custom hook for handling user authentication state safely during hydration
 * Prevents auth-related hydration mismatches
 *
 * @param user - The user object from auth context
 * @param loading - Loading state from auth context
 * @returns Safe auth state that prevents hydration mismatches
 */
export const useHydrationSafeAuth = (
  user: any,
  loading: boolean,
): { user: any; loading: boolean; isHydrated: boolean } => {
  const mounted = useHydration();

  return {
    user: mounted ? user : null,
    loading: mounted ? loading : true,
    isHydrated: mounted,
  };
};

/**
 * Custom hook for safely handling dynamic content that might cause hydration mismatches
 *
 * @param dynamicContent - Content that might differ between server and client
 * @param fallbackContent - Safe fallback content for SSR
 * @returns Safe content that prevents hydration mismatches
 */
export const useHydrationSafeContent = <T>(
  dynamicContent: T,
  fallbackContent: T,
): T => {
  const mounted = useHydration();
  return mounted ? dynamicContent : fallbackContent;
};

export default useHydration;
