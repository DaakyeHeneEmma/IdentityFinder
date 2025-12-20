// Performance monitoring utilities for Identity Finder
// This module provides tools to monitor and optimize app performance

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Start timing a performance metric
   */
  startTiming(name: string, metadata?: Record<string, any>): void {
    const startTime = performance.now();
    this.metrics.set(name, {
      name,
      startTime,
      metadata,
    });

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ Started timing: ${name}`);
    }
  }

  /**
   * End timing a performance metric
   */
  endTiming(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`No timing started for: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Completed timing: ${name} - ${duration.toFixed(2)}ms`);
    }

    // Send to analytics in production (you can integrate with your analytics service)
    if (process.env.NODE_ENV === 'production') {
      this.sendAnalytics(metric);
    }

    return duration;
  }

  /**
   * Measure the execution time of an async function
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTiming(name, metadata);
    try {
      const result = await fn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  /**
   * Measure the execution time of a synchronous function
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    this.startTiming(name, metadata);
    try {
      const result = fn();
      this.endTiming(name);
      return result;
    } catch (error) {
      this.endTiming(name);
      throw error;
    }
  }

  /**
   * Cache data with TTL
   */
  setCache<T>(
    key: string,
    data: T,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    };

    this.cache.set(key, entry);

    // Clean up expired entries periodically
    if (this.cache.size % 10 === 0) {
      this.cleanExpiredCache();
    }
  }

  /**
   * Get cached data if not expired
   */
  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Clear specific cache entry
   */
  clearCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get all performance metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get specific metric
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    keys: string[];
    memoryUsage: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length,
    };
  }

  /**
   * Send analytics data (integrate with your analytics service)
   */
  private sendAnalytics(metric: PerformanceMetric): void {
    // Example: Send to Google Analytics, Mixpanel, or your custom analytics
    // gtag('event', 'performance', {
    //   event_category: 'timing',
    //   event_label: metric.name,
    //   value: Math.round(metric.duration || 0),
    //   custom_map: metric.metadata,
    // });

    console.log('📊 Performance metric:', metric);
  }

  /**
   * Create a performance decorator for class methods
   */
  createDecorator(metricName: string) {
    return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
      const method = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        return await performanceMonitor.measureAsync(
          `${target.constructor.name}.${propertyName}`,
          () => method.apply(this, args),
          { metricName, className: target.constructor.name, methodName: propertyName }
        );
      };
    };
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const startTiming = (name: string, metadata?: Record<string, any>) =>
  performanceMonitor.startTiming(name, metadata);

export const endTiming = (name: string) => performanceMonitor.endTiming(name);

export const measureAsync = <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
) => performanceMonitor.measureAsync(name, fn, metadata);

export const measureSync = <T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
) => performanceMonitor.measureSync(name, fn, metadata);

// Cache utilities
export const setCache = <T>(key: string, data: T, ttl?: number) =>
  performanceMonitor.setCache(key, data, ttl);

export const getCache = <T>(key: string): T | null =>
  performanceMonitor.getCache<T>(key);

export const clearCache = (key: string) => performanceMonitor.clearCache(key);

// React Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const startTimer = (name: string, metadata?: Record<string, any>) => {
    performanceMonitor.startTiming(name, metadata);
  };

  const endTimer = (name: string) => {
    return performanceMonitor.endTiming(name);
  };

  const measureComponent = async <T>(
    componentName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    return await performanceMonitor.measureAsync(
      `Component:${componentName}`,
      operation,
      { type: 'component' }
    );
  };

  return {
    startTimer,
    endTimer,
    measureComponent,
    metrics: performanceMonitor.getMetrics(),
    cacheStats: performanceMonitor.getCacheStats(),
  };
};

// Performance tracking decorators
export const trackPerformance = (metricName?: string) => {
  return performanceMonitor.createDecorator(metricName || 'default');
};

// Utility to debounce function calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Utility to throttle function calls
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Browser performance API utilities
export const getNavigationTiming = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      pageLoad: navigation.loadEventEnd - navigation.fetchStart,
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domComplete - navigation.domLoading,
    };
  }
  return null;
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSMemorySize: memory.usedJSMemorySize,
      totalJSMemorySize: memory.totalJSMemorySize,
      jsMemoryLimit: memory.jsMemoryLimit,
      usedPercentage: ((memory.usedJSMemorySize / memory.jsMemoryLimit) * 100).toFixed(2),
    };
  }
  return null;
};

// Performance observer for Core Web Vitals
export const observeWebVitals = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('🎨 LCP:', lastEntry.startTime);
      // Send to analytics
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('⚡ FID:', entry.processingStart - entry.startTime);
        // Send to analytics
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      console.log('📐 CLS:', clsValue);
      // Send to analytics
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  }
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Observe web vitals
  observeWebVitals();

  // Log navigation timing after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const timing = getNavigationTiming();
      if (timing) {
        console.log('🚀 Navigation Timing:', timing);
      }

      const memory = getMemoryUsage();
      if (memory) {
        console.log('🧠 Memory Usage:', memory);
      }
    }, 0);
  });
}

export default performanceMonitor;
