import { Component, EventEmitter, ChangeDetectorRef, inject, computed, HostListener, signal, DestroyRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { AppSettings } from './service/app-settings.service';
import * as PullToRefresh from 'pulltorefreshjs';
import { AuthService } from './service/auth.service';
import { AppVariablesService } from './service/app-variables.service';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})

export class AppComponent {
	private authService = inject(AuthService);
	private router = inject(Router);
	public appEvent = new EventEmitter<string>();
	public appLoaded: boolean = false;
	public isLoggedIn = signal(false);
	public isLoginPage = signal(false);
	public deferredPrompt: any;
	public showInstallButton = false;
	public isAndroid = false;
	public isIOS = false;
	public brandName = inject(AppVariablesService).brandName;
	private swUpdate = inject(SwUpdate);
	private destroyRef = inject(DestroyRef);

	constructor(public appSettings: AppSettings, private cdr: ChangeDetectorRef) { 
		// const savedToken = localStorage.getItem('accessToken');
		// if (savedToken) {
		// 	this.authService.customerLogin(savedToken).subscribe();
		// }
		this.isLoggedIn.set(this.authService.checkLogin());
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.isLoginPage.set(this.router.url.includes('/login') || this.router.url.includes('/register') || this.router.url.includes('/otp'));
			}
		});
		// Check if it's Android
		this.isAndroid = /Android/i.test(navigator.userAgent);
		this.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
		
		window.addEventListener('beforeinstallprompt', (e: any) => {
			// Prevent Chrome 67 and earlier from automatically showing the prompt
			e.preventDefault();
			
			// Show the prompt only if it's Android
			this.deferredPrompt = e;
			this.showInstallButton = true;
			if (this.isAndroid) {
				// Stash the event so it can be triggered later.
			}
		});
		this.checkForUpdates();
	}
	
	handleSetCover(coverClass: string) {
		var htmlElm = document.querySelector('html');
		if (htmlElm) {
			for (var x = 0; x < document.documentElement.classList.length; x++) {
				var targetClass = document.documentElement.classList[x];
				if (targetClass.search('bg-cover-') > -1) {
					htmlElm.classList.remove(targetClass);
				}
			}
			htmlElm.classList.add(coverClass);
		}
	}

	handleSetMode(mode: string) {
		document.documentElement.setAttribute('data-bs-theme', mode);
		this.appEvent.emit('theme-reload');
	}

	handleSetTheme(themeClass: string) {
		for (var x = 0; x < document.body.classList.length; x++) {
			var targetClass = document.body.classList[x];
			if (targetClass.search('theme-') > -1) {
				document.body.classList.remove(targetClass);
			}
		}
		document.body.classList.add(themeClass);
		this.appEvent.emit('theme-reload');
	}
	
	ngOnInit() {
		console.log(this.isLoggedIn());
		console.log(this.authService.checkLogin());
		// PullToRefresh.init({
		// 	mainElement: '#app', // Specify the element to attach the pull-to-refresh
		// 	iconRefreshing: 'U+1F431 fa-spin',
		// 	iconArrow: 'fa fa-arrow-up',
		// 	distThreshold: 50,
		// 	onRefresh() {
		// 	  window.location.reload(); // Reload the page
		// 	}
		// });
		
		var elm = document.body;
		if (elm) {
			elm.classList.add('app-init');
		}
		
		if (this.appSettings.appMode) {
			this.handleSetMode(this.appSettings.appMode);
		}
		if (this.appSettings.appTheme) {
			this.handleSetTheme(this.appSettings.appTheme);
		}
		if (this.appSettings.appCover) {
			this.handleSetCover(this.appSettings.appCover);
		}
		// Request notification permission
		if ('Notification' in window) {
			Notification.requestPermission().then(permission => {
				if (permission === 'granted') {
					console.log('Notification permission granted.');
					// You can now show notifications
				} else if (permission === 'denied') {
					console.log('Notification permission denied.');
					// Optionally, inform the user about the denied permission
				} else {
					console.log('Notification permission dismissed.');
					// Handle the case where the user dismissed the permission request
				}
			}).catch(error => {
				console.error('Notification permission request failed:', error);
			});
		}
	}
	
	ngAfterViewInit() {
		this.appLoaded = true;
		this.cdr.detectChanges();
	}

	@HostListener('window:beforeinstallprompt', ['$event'])
	onBeforeInstallPrompt(event: Event) {
		// Prevent the mini-infobar from appearing on mobile
		event.preventDefault();
		// Stash the event so it can be triggered later.
		this.deferredPrompt = event;
		// Update UI to notify the user they can install the PWA
		this.showInstallButton = true;
	}

	async installPWA() {
		if (this.deferredPrompt) {
			// Show the prompt
			this.deferredPrompt.prompt();
			
			// Wait for the user to respond to the prompt
			const { outcome } = await this.deferredPrompt.userChoice;
			
			// We no longer need the prompt. Clear it up
			this.deferredPrompt = null;
			this.showInstallButton = false;
		}
	}

	@HostListener('window:appinstalled', ['$event'])
	onAppInstalled(event: Event) {
		console.log('PWA was installed');
		// You can perform additional actions here if needed
	}

	closeIOSPrompt() {
		this.showInstallButton = false;
	}

	private checkForUpdates(): void {
		if (this.swUpdate.isEnabled) {
			// Check for updates when app starts
			this.swUpdate.checkForUpdate();

			// Listen for available updates
			this.swUpdate.versionUpdates.pipe(
				takeUntilDestroyed(this.destroyRef)
			).subscribe((event) => {
				if (event.type === 'VERSION_READY') {
					Swal.fire({
						title: 'New Version Available',
						text: `A new version is available. Would you like to update?`,
						icon: 'info',
						toast: true,
						position: 'top',
						showCancelButton: false,
						showConfirmButton: false,
					}).then(() => {
						this.swUpdate.activateUpdate().then(() => {
							window.location.reload();
						});
					});
				}
			});

			// Check for updates every 6 hours
			setInterval(() => {
				this.swUpdate.checkForUpdate();
			}, 6 * 60 * 60 * 1000);
		}
	}
}
