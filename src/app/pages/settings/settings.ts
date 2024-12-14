import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../service/user.service';
import { User } from '../../interface/user.interface';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';
import { PetsService } from '../../service/pets.service';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';

function takeUntilDestroyed(destroyRef: DestroyRef): <T>(source: Observable<T>) => Observable<T> {
  const destroy$ = new Subject<void>();
  destroyRef.onDestroy(() => destroy$.next());

  return <T>(source: Observable<T>) => source.pipe(takeUntil(destroy$));
}

@Component({
    selector: 'settings',
    templateUrl: './settings.html',
    standalone: false
})

export class SettingsPage implements OnInit  {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private petService = inject(PetsService);
  private router = inject(Router);
  private swPush = inject(SwPush);
  public isLoading = signal(true);
  public userInfo: User = {} as User;
  public data: any[] = [];
  public gettingPets = signal(false);
  public loadProfile: any = {
    nameEditing: signal(false),
    nameEditingLoading: signal(false),
    userNameEditing: signal(false),
    userNameEditingLoading: signal(false),
    dobEditing: signal(false),
    dobEditingLoading: signal(false),
    emailEditing: signal(false),
    emailEditingLoading: signal(false),
  };
  public loggingOut = signal(false);
  
  constructor() {
    
  }

  ngOnInit() {
    this._getUserInfo();
    this._getMyPets();
  }

  hideItem(id: string) {
    console.log(id);
  }

  deleteItem(id: string, index: number) {
    this.data[index].deleting = true;
    this.petService.deletePet(id).subscribe((res: any) => {
      this.data.splice(index, 1);
    });
  }

  onEditName() {
    this.loadProfile.nameEditing.set(!this.loadProfile.nameEditing());
  }

  onSaveProfile(type: string) {
    this.loadProfile[`${type}EditingLoading`].set(true);
    this.userService.updateUser(this.userInfo).pipe(
      finalize(() => this.loadProfile[`${type}EditingLoading`].set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res: any) => {
      this.userInfo = res;
      this.loadProfile[`${type}Editing`].set(false);
    });
  }

  isAnyProfileEditing(): boolean {
    return Object.keys(this.loadProfile)
      .filter(key => key.includes('Editing') && !key.includes('Loading'))
      .some(key => this.loadProfile[key]());
  }

  onEditProfile(type: string) {
    this.loadProfile[`${type}Editing`].set(true);
  }

  onEditProfileCancel(type: string) {
    this.loadProfile[`${type}Editing`].set(false);
  }

  logout() {
    this.loggingOut.set(true);
    this.authService.logout().pipe(
      finalize(() => this.loggingOut.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (error: any) => {
        Swal.fire({
          icon: 'warning',
          title: 'Logout failed',
          text: 'Something went wrong!',
        });
      }
    });
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
			this.authService.saveSubscription(subscription, this.userInfo._id??'').subscribe((res: any) => {
        console.log('Subscription saved to backend', res);
        // Set up listeners
        this.setupNotificationListeners();
			});

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

  private _getMyPets() {
    this.gettingPets.set(true);
    this.petService.getMyPets().pipe(
      finalize(() => this.gettingPets.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res: any) => {
      this.data = res.pets;
    });
  }

  private _getUserInfo() {
    this.isLoading.set(true);
    this.userService.getUser().pipe(
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (user: any) => {
        this.userInfo = user;
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }
}

