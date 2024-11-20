// Core Module
import { Router, NavigationEnd, ActivatedRoute }   from '@angular/router';
import { CommonModule, JsonPipe }                  from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule }                        from '@angular/common/http';
import { NgModule, isDevMode }                                from '@angular/core';
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
import { PosCustomerOrderPage }            from './pages/pos/customer-order/pos-customer-order';
import { AuthInterceptor } from './service/http.interceptor';
import { OtpComponent } from './auth/otp/otp.component';
import { ProductDetailsPage } from './pages/product-details/page-product-details';
import { LoaderComponent } from './components/loader/loader.component';
import { ImageSrcPipe } from './shared/pipe/image-src.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FilterBottomSheetComponent } from './filter-bottom-sheet/filter-bottom-sheet.component';

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
    PosCustomerOrderPage,
    ProductDetailsPage,
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
  	QuillModule.forRoot(),
   ServiceWorkerModule.register('ngsw-worker.js', {
     enabled: !isDevMode(),
     // Register the ServiceWorker as soon as the application is stable
     // or after 30 seconds (whichever comes first).
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
    // { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
	],
  bootstrap: [ AppComponent ]
})

export class AppModule {
	title: string = 'Pet Line';
	
  constructor(private router: Router, private titleService: Title, private route: ActivatedRoute) {
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
      	if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.data['title']) {
      		this.title = 'Pet Line | '+ this.route.snapshot.firstChild.data['title'];
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