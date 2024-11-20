import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AppMenuService {
	getAppMenus() {
		return [
			{ 'text': 'Navigation', 'is_header': true },
			{ 'path': '/', 'icon': 'bi bi-house-door', 'text': 'Home' }, 
		];
	}
}