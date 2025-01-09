// Health monitoring and logging system
export class HealthMonitoring {
  private static instance: HealthMonitoring;
  private metrics: Map<string, number> = new Map();
  private errors: Error[] = [];

  private constructor() {
    this.setupPerformanceMonitoring();
    this.setupErrorHandling();
  }

  static getInstance(): HealthMonitoring {
    if (!HealthMonitoring.instance) {
      HealthMonitoring.instance = new HealthMonitoring();
    }
    return HealthMonitoring.instance;
  }

  private setupPerformanceMonitoring() {
    // Monitor page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        this.recordMetric('pageLoadTime', timing.loadEventEnd - timing.navigationStart);
        this.recordMetric('domInteractive', timing.domInteractive - timing.navigationStart);
        this.recordMetric('firstContentfulPaint', this.getFCP());
      });
    }

    // Monitor API calls
    this.monitorFetch();
  }

  private getFCP(): number {
    const [entry] = performance.getEntriesByType('paint')
      .filter(entry => entry.name === 'first-contentful-paint');
    return entry ? entry.startTime : 0;
  }

  private monitorFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch.apply(window, args);
        this.recordMetric('apiLatency', performance.now() - startTime);
        return response;
      } catch (error) {
        this.recordError(error as Error);
        throw error;
      }
    };
  }

  private setupErrorHandling() {
    window.addEventListener('error', (event) => {
      this.recordError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(new Error(event.reason));
    });
  }

  recordMetric(name: string, value: number) {
    this.metrics.set(name, value);
    this.reportMetrics();
  }

  private recordError(error: Error) {
    this.errors.push(error);
    this.reportErrors();
  }

  private reportMetrics() {
    // Report metrics using Navigator.sendBeacon for reliability
    if (navigator.sendBeacon) {
      const metrics = Object.fromEntries(this.metrics);
      const blob = new Blob([JSON.stringify(metrics)], { type: 'application/json' });
      navigator.sendBeacon('/api/metrics', blob);
    }
  }

  private reportErrors() {
    if (navigator.sendBeacon && this.errors.length > 0) {
      const errorData = this.errors.map(error => ({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }));

      const blob = new Blob([JSON.stringify(errorData)], { type: 'application/json' });
      navigator.sendBeacon('/api/errors', blob);
      this.errors = [];
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}