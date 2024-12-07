// Core Module
import { Router, NavigationEnd, ActivatedRoute }   from '@angular/router';
import { CommonModule, JsonPipe }                  from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule }                        from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule, inject, isDevMode }                                from '@angular/core';
import { FormsModule, ReactiveFormsModule }        from '@angular/forms';
import { BrowserModule, Title }                    from '@angular/platform-browser';
import { BrowserAnimationsModule }                 from '@angular/platform-browser/animations';
import { AppRoutingModule }                        from './app-routing.module';


// Plugins
import { NgScrollbarModule, NG_SCROLLBAR_OPTIONS } from 'ngx-scrollbar';
import { provideHighlightOptions, HighlightAuto }  from 'ngx-highlightjs';
import { FullCalendarModule }                      from '@fullcalendar/angular';
import { NgxMasonryModule }                        from 'ngx-masonry';
import { NgbDatepickerModule, 
         NgbAlertModule,
         NgbTypeaheadModule,
         NgbTimepickerModule, 
         NgbProgressbarModule,
         NgbCarouselModule}                     from '@ng-bootstrap/ng-bootstrap';
import { ColorSketchModule }                       from 'ngx-color/sketch';
import { TagInputModule }                          from 'ngx-chips';
import { NgxMaskDirective, 
         NgxMaskPipe, 
         provideNgxMask }                          from 'ngx-mask';
import { QuillModule }                             from 'ngx-quill';
import { NgSelectModule }                          from '@ng-select/ng-select';
import { CountdownModule }                         from 'ngx-countdown';
import { NgChartsModule }                          from 'ng2-charts';
import { NgApexchartsModule }                      from 'ng-apexcharts';
import { NgOtpInputModule }                        from 'ng-otp-input';
import { ServiceWorkerModule }                     from '@angular/service-worker';
import { TokenInterceptor } from './service/token.interceptor';

// App Component
import { AppComponent }                    from './app.component';
import { HeaderComponent }                 from './components/header/header.component';
import { TopNavComponent }                 from './components/top-nav/top-nav.component';
import { SidebarComponent }                from './components/sidebar/sidebar.component';
import { SidebarMobileBackdropComponent }  from './components/sidebar-mobile-backdrop/sidebar-mobile-backdrop.component';
import { FooterComponent }                 from './components/footer/footer.component';
import { ThemePanelComponent }             from './components/theme-panel/theme-panel.component';
import { NavScrollComponent }              from './components/nav-scroll/nav-scroll.component';
import { CardComponent, 
         CardHeaderComponent, 
         CardBodyComponent, 
         CardFooterComponent, 
         CardImgOverlayComponent, 
         CardGroupComponent,
         CardExpandTogglerComponent }      from './components/card/card.component';
import { NgOtpInputValueAccessorDirective } from './service/otp-input-value-accessor.directive';
import { NavComponent } from './pages/nav/nav.component';
import { LoginPage }                     from './auth/login/page-login';
import { RegisterPage }                  from './auth/register/page-register';
import { CartComponent }                  from './pages/cart/cart.component';
import { SettingsPage }                    from './pages/settings/settings';
import { HomePage }                   		 from './pages/home/home';
import { ErrorPage }                       from './pages/page/error/page-error';
import { ListPage }            from './pages/list/list.component';
import { AuthInterceptor } from './service/http.interceptor';
import { OtpComponent } from './auth/otp/otp.component';
import { NewListingPage } from './pages/new-listing/new-listing.component';
import { LoaderComponent } from './components/loader/loader.component';
import { ImageSrcPipe } from './shared/pipe/image-src.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FilterBottomSheetComponent } from './filter-bottom-sheet/filter-bottom-sheet.component';
import * as Sentry from '@sentry/angular';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { environment } from '../environments/environment';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

Sentry.init({
  dsn: "https://cd12303fc780ad9d9257719d48da8288@o4508347076444160.ingest.de.sentry.io/4508347079065680",
  integrations: [
    // Registers and configures the Tracing integration,
    // which automatically instruments your application to monitor its
    // performance, including custom Angular routing instrumentation
    Sentry.browserTracingIntegration(),
    // Registers the Replay integration,
    // which automatically captures Session Replays
    Sentry.replayIntegration(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for tracing.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  tracePropagationTargets: [
    environment.frontendUrl,
  ],
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export class SentryErrorHandler implements ErrorHandler {
  handleError(err:any) : void {
    Sentry.captureException(err.originalError || err);
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    TopNavComponent,
    SidebarComponent,
    SidebarMobileBackdropComponent,
    FooterComponent,
    ThemePanelComponent,
    NavScrollComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardFooterComponent,
    CardImgOverlayComponent,
    CardGroupComponent,
    CardExpandTogglerComponent,
    CartComponent,
    HomePage,
    LoaderComponent,
    FilterBottomSheetComponent,
    LoginPage,
    OtpComponent,
    RegisterPage,
    ListPage,
    NewListingPage,
    NgOtpInputValueAccessorDirective,
    NavComponent,
    SettingsPage,
		ErrorPage,
		ImageSrcPipe,
		FileSizePipe
  ],
  imports: [
  	CommonModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
  	HttpClientModule,
  	JsonPipe,
  	InfiniteScrollModule,
  	NgChartsModule,
    NgScrollbarModule,
  	NgxMasonryModule,
  	NgbDatepickerModule,
  	NgbTimepickerModule,
  	NgbTypeaheadModule,
  	NgxMaskDirective, 
  	NgxMaskPipe,
  	NgSelectModule,
  	NgApexchartsModule,
    HighlightAuto,
  	FullCalendarModule,
  	ColorSketchModule,
  	CountdownModule,
  	TagInputModule,
    NgbProgressbarModule,
    NgOtpInputModule,
    NgbCarouselModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
  	QuillModule.forRoot(),
   ServiceWorkerModule.register('ngsw-worker.js', {
     enabled: environment.production,
     registrationStrategy: 'registerWhenStable:30000'
   })
  ],
  providers: [Title, 
  	provideNgxMask(),
  	provideHighlightOptions({
      fullLibraryLoader: () => import('highlight.js'),
      lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
    }),
  	{ 
			provide: NG_SCROLLBAR_OPTIONS,
			useValue: {
				visibility: 'hover'
			}
		},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
    // { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
	],
  bootstrap: [ AppComponent ]
})

export class AppModule {
	public title: string = 'Homie Pets';
	
  constructor(private router: Router, private titleService: Title, private route: ActivatedRoute) {
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
      	if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.data['title']) {
      		this.title = 'Homie Pets | '+ this.route.snapshot.firstChild.data['title'];
      	}
        this.titleService.setTitle(this.title);
        
        var elm = document.getElementById('app');
				if (elm) {
					elm.classList.remove('app-sidebar-toggled');
					elm.classList.remove('app-sidebar-mobile-toggled');
				}
      }
    });
  }
}