import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category, Menu } from '../interface/menu.interface';
import { Observable } from 'rxjs';


const BASE_URL_MENU = `${environment.apiUrl}/menu/customer`;
const BASE_URL_CAT = `${environment.apiUrl}/categories/customer`;

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient)
  constructor() { }

  getMenulist():Observable<Menu[]> {
    return this.http.get<Menu[]>(`${BASE_URL_MENU}`)
  }

  getMenuItemById(id:string):Observable<Menu> {
    return this.http.get<Menu>(`${BASE_URL_MENU}/${id}`)
  }

  editMenuItemById(id:string, menuItem:Menu):Observable<Menu> {
    return this.http.post<Menu>(`${BASE_URL_MENU}/${id}`, {menuItem})
  }

  addMenuItem(menuItem:Menu):Observable<Menu> {
    return this.http.put<Menu>(`${BASE_URL_MENU}`, {menuItem})
  }

  deleteMenuItemById(id:string):Observable<Menu> {
    return this.http.delete<Menu>(`${BASE_URL_MENU}/${id}`)
  }

  getCategoriesList():Observable<Category[]> {
    return this.http.get<Category[]>(`${BASE_URL_CAT}`)
  }

  getCategoryById(id:string):Observable<Category> {
    return this.http.get<Category>(`${BASE_URL_CAT}/${id}`)
  }

  addCategory(category:Category):Observable<Category> {
    return this.http.post<Category>(`${BASE_URL_CAT}`, {category})
  }

  editCategoryById(id:string, category:Category):Observable<Category> {
    return this.http.put<Category>(`${BASE_URL_CAT}/${id}`, {category})
  }

  deleteCategoryById(id:string):Observable<Category> {
    return this.http.delete<Category>(`${BASE_URL_CAT}/${id}`)
  }

}