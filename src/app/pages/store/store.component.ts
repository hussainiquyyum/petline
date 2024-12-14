import { Component, OnInit, inject } from '@angular/core';
import { Product } from '../../interface/product.interface';
import { ProductService } from '../../service/product.service';
import { AppSettings } from '../../service/app-settings.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
  standalone: false,
})
export class StoreComponent implements OnInit {
  products: Product[] = [];
  searchQuery: string = '';
  selectedCategory: string = 'all';
  private productService = inject(ProductService);
  public appSettings = inject(AppSettings);
  
  categories = [
    { id: 'all', name: 'All', icon: 'bi bi-grid' },
    { id: 'food', name: 'Food', icon: 'bi bi-basket' },
    { id: 'health', name: 'Health', icon: 'bi bi-heart' },
    { id: 'toys', name: 'Toys', icon: 'bi bi-stars' },
    { id: 'care', name: 'Care', icon: 'bi bi-shield-check' },
    { id: 'home', name: 'Home', icon: 'bi bi-house-heart' },
    { id: 'grooming', name: 'Grooming', icon: 'bi bi-scissors' },
    { id: 'accessories', name: 'Accessories', icon: 'bi bi-gift' }
  ];

  ngOnInit() {
    this.loadProducts();
    this.appSettings.appHeaderNone = true;
  }

  loadProducts() {
    this.productService.getProducts().subscribe(
      products => this.products = products
    );
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    if (categoryId === 'all') {
      this.loadProducts();
    } else {
      this.productService.getProductsByCategory(categoryId).subscribe(
        products => this.products = products
      );
    }
  }
} 