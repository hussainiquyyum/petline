import { Component, Input, Output, EventEmitter, Renderer2, OnDestroy, inject, signal } from '@angular/core';
import { AppSettings } from '../../service/app-settings.service';
import { PetsService } from '../../service/pets.service';

declare var slideToggle: any;

interface NotificationData {
  icon: string;
  title: string;
  time: string;
}

@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    host: {
        class: 'app-header'
    },
    standalone: false
})
export class HeaderComponent {
	public notificationData : NotificationData[] = [];
	private _petsService = inject(PetsService);
	public filters: string[] = [];
	public isBottomSheetOpen:boolean = false;
	
	/*
	notificationData = [{
		icon: 'bi bi-bag text-theme',
		title: 'NEW ORDER RECEIVED ($1,299)',
		time: 'JUST NOW'
	}]
	*/
	
	constructor(public appSettings: AppSettings) { 
		this._petsService.filtersSearch.subscribe((filters: any) => {
			this.filters = filters;
		});
	}
	
	handleToggleSidebarCollapsed(event: MouseEvent) {
		event.preventDefault();
		
		if (!this.appSettings.appSidebarNone) {
			var elm = document.getElementById('app');
			if (elm) {
				elm.classList.toggle('app-sidebar-collapsed');
			}
		}
	}

	onFilterChange(event: any) {
		this.filters = event;
		this._petsService.filtersSearch.next(event);
	}

	openBottomSheet(): void {
		this.isBottomSheetOpen = !this.isBottomSheetOpen;
	}
	
	handleToggleMobileSidebar(event: MouseEvent) {
		event.preventDefault();
		
		if (!(this.appSettings.appSidebarNone && this.appSettings.appTopNav)) {
			var elm = document.getElementById('app');
			if (elm) {
				elm.classList.toggle('app-sidebar-mobile-toggled');
			}
		} else {
			slideToggle(document.querySelector('.app-top-nav'));
			window.scrollTo(0, 0);
		}
	}
	
	handleAppToggleClass(event: MouseEvent, className: string) {
		event.preventDefault();
		
		var elm = document.getElementById('app');
		if (elm) {
			elm.classList.toggle(className);
		}
	}
}
