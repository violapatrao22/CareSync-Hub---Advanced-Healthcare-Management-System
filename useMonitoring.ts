import { useEffect } from 'react';
import { HealthMonitoring } from '../lib/monitoring';

export function useMonitoring() {
  const monitoring = HealthMonitoring.getInstance();

  useEffect(() => {
    // Start monitoring when component mounts
    const startTime = performance.now();

    return () => {
      // Record component lifecycle on unmount
      monitoring.recordMetric('componentLifetime', performance.now() - startTime);
    };
  }, []);

  return monitoring;
}