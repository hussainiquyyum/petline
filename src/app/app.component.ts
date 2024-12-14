import { Component, EventEmitter, ChangeDetectorRef, inject, computed, HostListener, signal, DestroyRef, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { AppSettings } from './service/app-settings.service';
import * as PullToRefresh from 'pulltorefreshjs';
import { AuthService } from './service/auth.service';
import { AppVariablesService } from './service/app-variables.service';
import { SwUpdate, VersionReadyEvent, SwPush } from '@angular/service-worker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})

export class AppComponent implements OnInit {
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
	public swPush = inject(SwPush);

	constructor(
		public appSettings: AppSettings, 
		private cdr: ChangeDetectorRef,
	) { 
		console.log('SwPush enabled:', this.swPush.isEnabled);
		console.log('Service Worker supported:', 'serviceWorker' in navigator);
		console.log('Push Manager supported:', 'PushManager' in window);

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.getRegistration().then(registration => {
				console.log('Existing SW registration:', registration);
			});
		}
		
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

		if (this.swPush.isEnabled) {
			this.swPush.notificationClicks.subscribe(({ action, notification }) => {
				console.log('Notification clicked', notification);
				// Handle notification click - e.g., navigate to a specific route
				if (notification.data && notification.data.url) {
					this.router.navigateByUrl(notification.data.url);
				}
			});

			// Subscribe to push notifications if user is logged in
			// this.subscribeToNotifications();
		}

		// Request notification permission when user logs in
		setTimeout(() => {
			console.log('Checking if user is logged in');
			if (this.isLoggedIn()) {
				console.log('Requesting notification permission');
				this.requestNotificationPermission();
			}
		}, 1000);

		// Check service worker registration
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.getRegistration().then(registration => {
				if (registration) {
					console.log('Service Worker is registered:', registration);
				} else {
					console.error('No Service Worker registration found');
				}
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
						text: `A new version is available. Automatically updating...`,
						icon: 'info',
						confirmButtonText: `Update`,
						toast: true,
						position: 'top',
						timer: 6000,
						timerProgressBar: true,
						showCancelButton: false,
						allowOutsideClick: true,
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

	async requestNotificationPermission() {
		try {
			// First check if service workers are supported
			if (!('serviceWorker' in navigator)) {
				console.error('Service Workers are not supported');
				return;
			}

			// Then check if Push API is supported
			if (!('PushManager' in window)) {
				console.error('Push API is not supported');
				return;
			}

			if (!this.swPush.isEnabled) {
				console.error('Push notifications are not enabled. Checking why...');
				
				// Check if service worker is registered
				const registration = await navigator.serviceWorker.getRegistration();
				if (!registration) {
					console.error('Service Worker is not registered');
					return;
				}

				// Check if push subscription exists
				const subscription = await registration.pushManager.getSubscription();
				console.log('Existing subscription:', subscription);

				return;
			}

			const permission = await Notification.requestPermission();
			console.log('Notification permission:', permission);
			
			if (permission === 'granted') {
				await this.subscribeToNotifications();
			} else {
				console.warn('Notification permission was not granted:', permission);
			}
		} catch (error) {
			console.error('Error in requestNotificationPermission:', error);
		}
	}

	private async subscribeToNotifications() {
		try {
			console.log('Starting push subscription process...');
			console.log('SwPush enabled:', this.swPush.isEnabled);
			
			if (!this.swPush.isEnabled) {
				const registration = await navigator.serviceWorker.getRegistration();
				console.log('Current SW registration:', registration);
				if (!registration) {
					throw new Error('No Service Worker registration found');
				}
				throw new Error('Push notifications are not enabled');
			}

			if (Notification.permission === 'denied') {
				throw new Error('User has denied push notification permission');
			}

			console.log('Requesting push subscription with VAPID key:', environment.vapidPublicKey);
			const subscription = await this.swPush.requestSubscription({
				serverPublicKey: environment.vapidPublicKey
			});

			console.log('Push subscription obtained:', subscription);

			// Send subscription to backend
			// this.authService.saveSubscription(subscription, this.userInfo._id??'').subscribe((res: any) => {
			// 	console.log('Subscription saved to backend', res);
			// });

			// Set up listeners
			this.setupNotificationListeners();
		} catch (error) {
			console.error('Detailed subscription error:', error);
			throw error;
		}
	}

	private setupNotificationListeners() {
		this.swPush.messages.pipe(
			takeUntilDestroyed(this.destroyRef)
		).subscribe({
			next: message => {
				console.log('Push message received:', message);
				this.handlePushMessage(message);
			},
			error: error => {
				console.error('Push message error:', error);
			}
		});

		this.swPush.notificationClicks.pipe(
			takeUntilDestroyed(this.destroyRef)
		).subscribe({
			next: event => {
				console.log('Notification clicked:', event);
				this.handleNotificationClick(event);
			},
			error: error => {
				console.error('Notification click error:', error);
			}
		});
	}

	private handlePushMessage(message: any) {
		console.log('Received push message:', message);
		
		// Show a toast notification using SweetAlert2
		Swal.fire({
			title: message.title || 'New Notification',
			text: message.body || '',
			icon: 'info',
			toast: true,
			position: 'top',
			showConfirmButton: false,
			timer: 5000,
			timerProgressBar: true,
			didOpen: (toast) => {
				toast.addEventListener('mouseenter', Swal.stopTimer);
				toast.addEventListener('mouseleave', Swal.resumeTimer);
			}
		});
	}

	private handleNotificationClick(event: { action: string, notification: NotificationOptions & { data?: any } }) {
		console.log('Notification clicked:', event);
		
		const { notification } = event;
		
		// Handle navigation if URL is provided in the notification data
		if (notification.data?.url) {
			this.router.navigateByUrl(notification.data.url);
		}

		// Handle other actions based on notification data
		if (notification.data?.action) {
			switch (notification.data.action) {
				case 'openProfile':
					this.router.navigate(['/profile']);
					break;
				case 'openMessages':
					this.router.navigate(['/messages']);
					break;
				// Add other action handlers as needed
			}
		}
	}
}
