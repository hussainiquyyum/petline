import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { PetsService } from '../service/pets.service';
import { Breed } from '../interface/pets.interface';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-bottom-sheet',
  templateUrl: './filter-bottom-sheet.component.html',
  styleUrl: './filter-bottom-sheet.component.scss'
})
export class FilterBottomSheetComponent implements OnInit {
  @Input() isOpen:boolean = false;
  @Output() onClose = new EventEmitter<void>();
  private destroyRef = inject(DestroyRef);
  animalTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Other'];
  selectedAnimalTypes: string = '';
  private _petsService = inject(PetsService);
  isLoading = signal(false);
  animals: string[] = [];
  breeds: Breed[] = [];
  selectedAnimal: any;
  filteredBreeds: Breed[] = [];
  selectedBreed: string = '';
  ngOnInit(): void {
    this._petsService.filtersSearch.subscribe((filters: any) => {
      console.log(filters);
      this.selectedAnimal = filters?.animalTypes??'';
      this.selectedBreed = filters?.selectedBreed??'';
    });
    this._getAllAnimalAndBreed();
  }

  toggleFilter(filter: string): void {
    if (this.selectedAnimalTypes.includes(filter)) {
      this.selectedAnimalTypes = this.selectedAnimalTypes.replace(filter, '');
    } else {
      this.selectedAnimalTypes = this.selectedAnimalTypes + ',' + filter;
    }
  }

  onBreedChange(event: any) {
    this.selectedBreed = event.target.value;
  }

  applyFilters(): void {
    this._petsService.filtersSearch.next({
      animalTypes: this.selectedAnimal,
      selectedBreed: this.selectedBreed
    });
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.onClose.emit();
  }

  onAnimalChange(event: any) {
    this.selectedAnimal = event.target.value;
    this.filteredBreeds = this.breeds.filter((breed: Breed) => breed.category === this.selectedAnimal);
  }

  private _getAllAnimalAndBreed() {
    this._petsService.getAllAnimalAndBreed().pipe(
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res: any) => {
        const data = res.breeds;
        data.forEach((item: any) => {
          if (!this.animals.includes(item.category)) {
            this.animals.push(item.category);
          }
          this.breeds.push(item);
        });
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

}
function takeUntilDestroyed(destroyRef: DestroyRef): <T>(source: Observable<T>) => Observable<T> {
  const destroy$ = new Subject<void>();
  destroyRef.onDestroy(() => destroy$.next());

  return <T>(source: Observable<T>) => source.pipe(takeUntil(destroy$));
}
