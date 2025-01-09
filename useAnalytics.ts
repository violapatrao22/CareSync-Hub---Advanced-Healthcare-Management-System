import { useEffect } from 'react';
import { Analytics } from '../lib/analytics';
import { useAuth } from './useAuth';

export function useAnalytics() {
  const { user } = useAuth();
  const analytics = Analytics.getInstance();

  useEffect(() => {
    if (user) {
      analytics.setUser(user.id, {
        email: user.email,
        role: user.role
      });
    }
  }, [user]);

  return analytics;
}