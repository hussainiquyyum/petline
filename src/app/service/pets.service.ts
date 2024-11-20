import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = `${environment.apiUrl}/pets`;
const API_BREEDS_URL = `${environment.apiUrl}/breeds`;

@Injectable({
  providedIn: 'root'
})
export class PetsService {
  eventSource: EventSource | null = null;
  private isUploading = signal(false);
  public uploadStatusUrl: string = `${API_URL}/upload-status`;
  public filtersSearch: Subject<any> = new Subject<any>();

  constructor(private http: HttpClient) { }

  getPets(params: any): Observable<any> {
    let url = API_URL;
    if (params) {
      url += `?${Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')}`;
    }
    return this.http.get(url);
  }

  getMyPets(): Observable<any> {
    return this.http.get(`${API_URL}/my`);
  }

  getPetById(id: string): Observable<any> {
    return this.http.get(`${API_URL}/${id}`);
  }

  createPet(petData: any): Observable<any> {
    return this.http.post(API_URL, petData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  updatePet(id: string, petData: any): Observable<any> {
    return this.http.put(`${API_URL}/${id}`, petData);
  }

  deletePet(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }

  getPetsByAnimal(animal: string): Observable<any> {
    return this.http.get(`${API_URL}/animals/${animal}`);
  }

  getPetsByBreed(breed: string): Observable<any> {
    return this.http.get(`${API_URL}/breeds/${breed}`);
  }

  getAllAnimalAndBreed(): Observable<any> {
    return this.http.get(API_BREEDS_URL);
  }

  startEventStream() {
    this.eventSource = new EventSource(`${API_URL}/upload-status`);

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Event data:', data);
      this.isUploading.set(data.isUploading);
      // Handle the event data as needed
    };

    this.eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      this.closeEventStream();
    };
  }

  closeEventStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
