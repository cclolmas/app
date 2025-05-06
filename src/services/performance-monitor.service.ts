import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: any;
}

export interface FrameRateMetric {
  timestamp: number;
  fps: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitorService {
  private metricsSubject = new BehaviorSubject<PerformanceMetric[]>([]);
  private framerateSubject = new BehaviorSubject<FrameRateMetric[]>([]);
  private metricsMap = new Map<string, PerformanceMetric>();
  private frameRateMonitorActive = false;
  private lastFrameTimestamp = 0;
  private frameRateData: FrameRateMetric[] = [];
  private frameRateLimit = 100; // Limitar quantidade de dados armazenados

  constructor() {}

  startMetric(name: string, metadata?: any): void {
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    };
    this.metricsMap.set(name, metric);
  }

  endMetric(name: string): void {
    const metric = this.metricsMap.get(name);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
      
      const currentMetrics = this.metricsSubject.value;
      this.metricsSubject.next([...currentMetrics, {...metric}]);
      
      console.debug(`Performance metric: ${name} took ${metric.duration.toFixed(2)}ms`);
      this.metricsMap.delete(name);
    }
  }

  getMetrics(): Observable<PerformanceMetric[]> {
    return this.metricsSubject.asObservable();
  }

  clearMetrics(): void {
    this.metricsSubject.next([]);
    this.metricsMap.clear();
  }

  startFrameRateMonitoring(): void {
    if (this.frameRateMonitorActive) return;
    
    this.frameRateMonitorActive = true;
    this.lastFrameTimestamp = performance.now();
    this.frameRateData = [];
    this.monitorFrameRate();
  }

  stopFrameRateMonitoring(): void {
    this.frameRateMonitorActive = false;
  }

  private monitorFrameRate(): void {
    if (!this.frameRateMonitorActive) return;

    const now = performance.now();
    const elapsed = now - this.lastFrameTimestamp;
    
    if (elapsed > 0) {
      const fps = 1000 / elapsed;
      
      this.frameRateData.push({
        timestamp: now,
        fps: fps
      });
      
      // Limitar o tamanho dos dados armazenados
      if (this.frameRateData.length > this.frameRateLimit) {
        this.frameRateData.shift();
      }
      
      this.framerateSubject.next([...this.frameRateData]);
    }
    
    this.lastFrameTimestamp = now;
    requestAnimationFrame(() => this.monitorFrameRate());
  }

  getFrameRateMetrics(): Observable<FrameRateMetric[]> {
    return this.framerateSubject.asObservable();
  }
}
