import { Component, computed, DestroyRef, inject, OnDestroy, OnInit, signal, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../service/app-settings.service';
import { MenuService } from '../../service/menu.service';
import { OrdersService } from '../../service/orders.service';
import { SocketService } from '../../service/socket.service';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Order as orderData } from 'datatables.net';
import { Customer } from '../../interface/customer.interface';
import { Order } from '../../interface/order.interface';
import { Category, Menu, NavBtn } from '../../interface/menu.interface';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { PetsService } from '../../service/pets.service';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Breed } from '../../interface/pets.interface';
import { AuthService } from '../../service/auth.service';
import { AppVariablesService } from '../../service/app-variables.service';

declare var bootstrap: any;
let TEMP_WHATSAPP_URL = '';

interface DataResponse {
  order: string[];
  orderNo: string;
  orderHistory: string[];
  tableNo: string;
}

@Component({
    selector: 'pos-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    standalone: false
})

export class ListPage implements OnInit, OnDestroy, AfterViewInit {
	listType = signal<'long' | 'list'>('long');
	public brandName = inject(AppVariablesService).brandName;	
	menu: any = {};
	order: Order = {
		customer: {
			name: '',
			email: '',
			phone: '',
			address: '',
			addedBy: '',
		},
		items: [],
		subTotal: 0,
		totalPrice: 0,
		tax: 0,
		orderStatus: 'pending'
	};
	orderNo: any = '#0000';
	orderHistory: any = {};
	tableNo: any = '0';
	modal: any = '';
	modalData: any = '';
	modalQuantity: any = '';
	modalSelectedSize: any = '';
	modalSelectedAddon: any = [];
	mobileSidebarToggled: boolean = false;
	private _menuService = inject(MenuService);
	private _authService = inject(AuthService);
	private _ordersService = inject(OrdersService);
	private _modalService = inject(NgbModal);
	private _socketService = inject(SocketService);
	private _petsService = inject(PetsService);
	private _route = inject(ActivatedRoute);
	private _router = inject(Router);
	destroy$: Subject<void> = new Subject();
	customer: any;
	isSubmitOrder: boolean = false;
	showConfirmation: boolean = false;
	showError: boolean = false;
	category: Category[] = [];
	navBtn: NavBtn[] = [];
	pendingOrder: Order[] = [];
	data: any[] = [];
	params: any = {
		page: 1,
		limit: 10,
		sort: 'asc',
		sortBy: 'name'
	};
	totalPages: any;
	loadingMore = signal(false);
	filters: any;
	isLoading = signal(false);
	public isBottomSheetOpen:boolean = false;

	private destroyRef = inject(DestroyRef);
	animals: any;
	breeds: Breed[] = [];
	isLoggedIn = signal(false);
	flippedCards: { [key: number]: boolean } = {};

	private observers: { [key: number]: IntersectionObserver } = {};

	constructor(
		private appSettings: AppSettings, 
		private http: HttpClient
	) {
		this.appSettings.appHeaderNone = false;
		this.appSettings.appSidebarNone = true;
		this.appSettings.appContentClass = 'p-1 ps-xl-4 pe-xl-4 pt-xl-3 pb-xl-3';
		this.appSettings.appContentFullHeight = true;
	}

	showType(event: Event, type: string) {
		event.preventDefault();
		
		for (var i = 0; i < this.navBtn.length; i++) {
			if (this.navBtn[i].name == type) {
				this.navBtn[i].active = true;
			} else {
				this.navBtn[i].active = false;
			}
		}
	}

	openWhatsApp(number: string, message: string) {
		const userAgent = navigator.userAgent || (navigator as any).vendor;
		const encodedMessage = encodeURIComponent(message);
		number = `+91${number}`;
		let whatsappUrl = `https://wa.me/${number}?text=${encodedMessage}`;
		// For Android, use the intent URL to directly open WhatsApp
		const dialogConfirm = document.getElementById('dialog_confirm');
		if (dialogConfirm) {
			(dialogConfirm as any).showModal();
		}
		
		if (/android/i.test(userAgent)) {
			whatsappUrl = `intent://send/?phone=${number}&text=${encodedMessage}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
		}
		TEMP_WHATSAPP_URL = whatsappUrl;
	}

	toggleDialogConfirm() {
		window.open(TEMP_WHATSAPP_URL, '_blank');
		const dialogConfirm = document.getElementById('dialog_confirm');
		if (dialogConfirm) {
			(dialogConfirm as any).close();
		}
	}

	onScrollDown() {
		console.log('scrolled down');
		if(this.totalPages > this.params.page) {
			this.loadingMore.set(true);
			this.params.page += 1;
			this._getPets();
		} else {
			console.log('no more pages');
		}	
	}

	toggleMobileSidebar(): void {
		this.mobileSidebarToggled = !this.mobileSidebarToggled;
	}
	
	ngOnInit() {
		// this._route.queryParams.subscribe((params: any) => {
		// 	this.params = params;
		// });
		this.isLoggedIn = this._authService.checkLogin;
		this._getPets();
		this._getFilters();
		this._getAllAnimalAndBreed();
	}
	setQueryParams() {
		if (this.filters?.animalTypes) {
			this.params = {
				...this.params,
				category: this.filters.animalTypes
			};
		}

		if (this.filters?.selectedBreed) {
			this.params = {
				...this.params, 
				breed: this.filters.selectedBreed
			};
		}
		// this._router.navigate(['/home'], { queryParams: this.params });
		this.data = [];
		this._getPets();
	}

	getBreedName(breed: string) {
		return this.breeds?.find((b: any) => b._id === breed)?.name;
	}

	clearFilter() {
		this.params.category = '';
		this.params.breed = '';
		this.params.page = 1;
		this.filters = null;
		this._petsService.filtersSearch.next(this.filters);
	}

	openBottomSheet(): void {
		this._petsService.isBottomSheetOpen.set(!this._petsService.isBottomSheetOpen());
	}

	private _getFilters() {
		this._petsService.filtersSearch.subscribe((filters: any) => {
			console.log(filters);
			this.filters = filters;
			this.setQueryParams();
		});
	}
	private _getAllAnimalAndBreed() {
		this._petsService.getAllAnimalAndBreed().pipe(
		  finalize(() => this.isLoading.set(false)),
		  takeUntilDestroyed(this.destroyRef)
		).subscribe({
		  next: (res: {breeds:Breed[]}) => {
			const data = res.breeds;
			data.forEach((item: any) => {
			  this.breeds.push(item);
			});
		  },
		  error: (error) => {
			console.log(error);
		  }
		});
	}

	changeOrderStatus(orderId: string, status: 'pending' | 'preparing' | 'completed' | 'cancelled') {

		this._ordersService.updateOrderStatus(orderId, status).pipe(takeUntil(this.destroy$)).subscribe({
			next: (response) => {
				console.log(response);
			},
			error: (error) => {
				console.error('Error changing order status', error);
			}
		});
	}

	private _getPets() {
		this.isLoading.set(true);

		if(this.loadingMore()) {
			this.isLoading.set(false);
		}
		this._petsService.getPets(this.params).pipe(takeUntil(this.destroy$), finalize(() => {
			this.isLoading.set(false)
			this.loadingMore.set(false)
			// Setup observers for new cards
			setTimeout(() => {
				this.setupCardObservers();
			});
		})).subscribe({
			next: (response) => {
				this.data = [...this.data, ...response.pets];
				this.totalPages = response.totalPages;
				this.params.page = response.currentPage;
			},
		});
	}

	toggleFlip(index: number) {
		this.flippedCards[index] = !this.flippedCards[index];
		
		// Set up observer when card is flipped
		if (this.flippedCards[index]) {
			const card = document.querySelector(`[data-card-index="${index}"]`);
			if (card) {
				this.setupObserver(card as HTMLElement, index);
			}
		}
	}

	isFlipped(index: number): boolean {
		return this.flippedCards[index] || false;
	}

	ngAfterViewInit() {
		// Set up observers after view is initialized
		setTimeout(() => {
			this.setupCardObservers();
		});
	}

	private setupCardObservers() {
		this.data.forEach((_, index) => {
			const card = document.querySelector(`[data-card-index="${index}"]`);
			if (card) {
				this.setupObserver(card as HTMLElement, index);
			}
		});
	}

	private setupObserver(element: HTMLElement, index: number) {
		// Remove existing observer if any
		if (this.observers[index]) {
			this.observers[index].disconnect();
		}

		// Create new observer
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(entry => {
					if (!entry.isIntersecting && this.flippedCards[index]) {
						// Card is not visible and is flipped - flip it back
						this.toggleFlip(index);
					}
				});
			},
			{
				threshold: 0.1 // Card will trigger when 10% visible/invisible
			}
		);

		observer.observe(element);
		this.observers[index] = observer;
	}

	ngOnDestroy() {
		// Clean up observers
		Object.values(this.observers).forEach(observer => observer.disconnect());
		this.observers = {};
		
		this.appSettings.appHeaderNone = false;
		this.appSettings.appSidebarNone = false;
		this.appSettings.appContentClass = '';
		this.appSettings.appContentFullHeight = false;
	}
}
function takeUntilDestroyed(destroyRef: DestroyRef): <T>(source: Observable<T>) => Observable<T> {
	const destroy$ = new Subject<void>();
	destroyRef.onDestroy(() => destroy$.next());
  
	return <T>(source: Observable<T>) => source.pipe(takeUntil(destroy$));
  }
