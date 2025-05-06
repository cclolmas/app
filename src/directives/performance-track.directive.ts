import { Directive, Input, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { PerformanceMonitorService } from '../services/performance-monitor.service';

@Directive({
  selector: '[appPerformanceTrack]'
})
export class PerformanceTrackDirective implements AfterViewInit, OnDestroy {
  @Input() trackId: string;
  @Input() trackRender = true;
  @Input() trackEvents: string[] = ['click'];
  
  private observers: ResizeObserver[] = [];
  private eventListeners: { event: string, handler: any }[] = [];

  constructor(
    private el: ElementRef,
    private performanceService: PerformanceMonitorService
  ) {}

  ngAfterViewInit() {
    if (this.trackRender) {
      this.trackElementRender();
    }
    
    this.setupEventTracking();
    this.setupResizeTracking();
  }

  private trackElementRender() {
    const id = this.trackId || this.generateElementId();
    this.performanceService.startMetric(`RENDER:${id}`);
    
    // Esperamos que o browser termine de renderizar
    setTimeout(() => {
      this.performanceService.endMetric(`RENDER:${id}`);
    }, 0);
  }

  private setupEventTracking() {
    const id = this.trackId || this.generateElementId();
    
    this.trackEvents.forEach(eventName => {
      const handler = () => {
        const metricId = `EVENT:${eventName}:${id}`;
        this.performanceService.startMetric(metricId);
        
        // Medimos quanto tempo leva para responder ao evento
        setTimeout(() => {
          this.performanceService.endMetric(metricId);
        }, 0);
      };
      
      this.el.nativeElement.addEventListener(eventName, handler);
      this.eventListeners.push({ event: eventName, handler });
    });
  }

  private setupResizeTracking() {
    const id = this.trackId || this.generateElementId();
    
    try {
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        const metricId = `RESIZE:${id}`;
        
        this.performanceService.startMetric(metricId, {
          contentRect: entry.contentRect
        });
        
        // Esperamos que o browser termine de renderizar após o resize
        setTimeout(() => {
          this.performanceService.endMetric(metricId);
        }, 0);
      });
      
      observer.observe(this.el.nativeElement);
      this.observers.push(observer);
    } catch (e) {
      console.warn('ResizeObserver not supported in this browser');
    }
  }

  private generateElementId(): string {
    const tagName = this.el.nativeElement.tagName;
    const classes = this.el.nativeElement.className.split(' ').join('.');
    return `${tagName}${classes ? '.' + classes : ''}`;
  }

  ngOnDestroy() {
    // Limpar todos os observers
    this.observers.forEach(observer => observer.disconnect());
    
    // Remover event listeners
    this.eventListeners.forEach(({event, handler}) => {
      this.el.nativeElement.removeEventListener(event, handler);
    });
  }
}
