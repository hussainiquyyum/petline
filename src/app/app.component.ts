import { Component, EventEmitter, ChangeDetectorRef, inject, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, NavigationStart, ActivatedRoute } from '@angular/router';
import { AppSettings } from './service/app-settings.service';
import * as PullToRefresh from 'pulltorefreshjs';
import { AuthService } from './service/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})

export class AppComponent {
	private authService = inject(AuthService);
	appEvent = new EventEmitter<string>();
	appLoaded: boolean = false;
	isLoggedIn = computed(() => this.authService.checkLogin());
	
	constructor(public appSettings: AppSettings, private cdr: ChangeDetectorRef) { 
		// const savedToken = localStorage.getItem('accessToken');
		// if (savedToken) {
		// 	this.authService.customerLogin(savedToken).subscribe();
		// }
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
		console.log(this.isLoggedIn);
		console.log(this.authService.checkLogin());
		PullToRefresh.init({
			mainElement: '#app', // Specify the element to attach the pull-to-refresh
			iconRefreshing: 'U+1F431 fa-spin',
			iconArrow: 'fa fa-arrow-up',
			distThreshold: 50,
			onRefresh() {
			  window.location.reload(); // Reload the page
			}
		});
		
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
}
