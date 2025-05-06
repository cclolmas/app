import { Component, OnInit, OnDestroy } from '@angular/core';
import { PerformanceMonitorService, PerformanceMetric, FrameRateMetric } from '../../services/performance-monitor.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-performance-dashboard',
  templateUrl: './performance-dashboard.component.html',
  styleUrls: ['./performance-dashboard.component.scss']
})
export class PerformanceDashboardComponent implements OnInit, OnDestroy {
  metrics: PerformanceMetric[] = [];
  frameRateData: FrameRateMetric[] = [];
  averageFps = 0;
  showDashboard = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private performanceService: PerformanceMonitorService) {}

  ngOnInit(): void {
    // Monitora métricas de performance
    this.subscriptions.push(
      this.performanceService.getMetrics().subscribe(metrics => {
        this.metrics = metrics;
      })
    );
    
    // Monitora taxa de quadros
    this.subscriptions.push(
      this.performanceService.getFrameRateMetrics().subscribe(frameRateData => {
        this.frameRateData = frameRateData;
        this.calculateAverageFps();
      })
    );
    
    // Inicia monitoramento de FPS
    this.performanceService.startFrameRateMonitoring();
  }
  
  toggleDashboard(): void {
    this.showDashboard = !this.showDashboard;
  }
  
  clearMetrics(): void {
    this.performanceService.clearMetrics();
  }
  
  private calculateAverageFps(): void {
    if (this.frameRateData.length === 0) {
      this.averageFps = 0;
      return;
    }
    
    const sum = this.frameRateData.reduce((acc, curr) => acc + curr.fps, 0);
    this.averageFps = sum / this.frameRateData.length;
  }
  
  getHttpMetrics(): PerformanceMetric[] {
    return this.metrics.filter(m => m.name.startsWith('HTTP:'));
  }
  
  getRenderMetrics(): PerformanceMetric[] {
    return this.metrics.filter(m => m.name.startsWith('RENDER:'));
  }
  
  getEventMetrics(): PerformanceMetric[] {
    return this.metrics.filter(m => m.name.startsWith('EVENT:'));
  }
  
  ngOnDestroy(): void {
    this.performanceService.stopFrameRateMonitoring();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
