import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { PerformanceInterceptor } from '../interceptors/performance.interceptor';
import { PerformanceMonitorService } from '../services/performance-monitor.service';
import { PerformanceTrackDirective } from '../directives/performance-track.directive';
import { PerformanceDashboardComponent } from '../components/performance-dashboard/performance-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    PerformanceTrackDirective,
    PerformanceDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    PerformanceMonitorService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PerformanceInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }