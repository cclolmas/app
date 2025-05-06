import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { PerformanceMonitorService } from '../services/performance-monitor.service';

@Injectable()
export class PerformanceInterceptor implements HttpInterceptor {

  constructor(private performanceService: PerformanceMonitorService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const requestId = `${request.method} ${request.url}`;
    
    this.performanceService.startMetric(`HTTP:${requestId}`, {
      method: request.method,
      url: request.url
    });

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const responseSize = JSON.stringify(event.body).length;
          // Adicionar tamanho da resposta como metadata
          this.performanceService.startMetric(`PARSE:${requestId}`, {
            responseSize,
            status: event.status
          });
          // Finalizar imediatamente para simular tempo de parse
          this.performanceService.endMetric(`PARSE:${requestId}`);
        }
      }),
      finalize(() => {
        this.performanceService.endMetric(`HTTP:${requestId}`);
      })
    );
  }
}
