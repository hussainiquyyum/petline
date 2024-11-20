import { Component, inject, ViewEncapsulation, OnInit, DestroyRef, signal, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AppSettings } from '../../service/app-settings.service';
import { PetsService } from '../../service/pets.service';
import { Breed } from '../../interface/pets.interface';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'page-product-details',
  templateUrl: './page-product-details.html',
  styleUrls: [ './page-product-details.scss' ],
  encapsulation: ViewEncapsulation.None
})

export class ProductDetailsPage implements OnInit, OnDestroy {
  private appSettings = inject(AppSettings);
  private petsService = inject(PetsService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  public isLoading = signal(true);
	sizeTagsValue = ['XL', 'S'];
  eventSource: EventSource | null = null;

  sizeTagsValidator = Validators.required;
  
	colorTagsValue = ['Black'];
  colorTagsValidator = Validators.required;
  
	materialTagsValue = [];
  materialTagsValidator = Validators.required;
  
	tagsInputValue = ['Laptop', 'Apple'];
  tagsInputValidator = Validators.required;
  
  imageFiles: File[] = [];
  imageLimit = this.appSettings.imageLimit;
  uploading = signal(false);
  uploadProgress = 0;
  uploadProgressInterval: any;

  animals: any[] = [];
  breeds: Breed[] = [];
  filteredBreeds: Breed[] = [];
  selectedAnimal: string = '';
  selectedBreed: string = '';
  isSubmitting = signal(false);
  infoForm = new FormGroup({
    title: new FormControl('', Validators.required),
    age: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),
    price: new FormControl('', Validators.required),
    breed: new FormControl('', Validators.required),
    animal: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });
  public uploadStatus: string = '';


  constructor() {
    console.log(this.imageFiles);
  }

  ngOnInit(): void {
    this._getAllAnimalAndBreed();
    // this.petsService.startEventStream();
  }

  ngOnDestroy(): void {
    // this.petsService.closeEventStream();
    // this.destroyRef.onDestroy(() => {
    //   this.petsService.closeEventStream();
    // });
  }

  onFilesInputChange(event: any) {
    let files = event.target.files;
    if (this.imageFiles.length + files.length > this.imageLimit) {
      Swal.fire({
        title: 'Error',
        text: 'You can only upload up to 8 images removing last images',
        icon: 'error',
        toast: true,
        position: 'bottom',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      files = Object.values(files).slice(0, this.imageLimit - this.imageFiles.length);
    }
    this.imageFiles.push(...files);
  }

  onFilesInputReset() {
    this.imageFiles = [];
  }

  onRemoveFile(index: number) {
    this.imageFiles.splice(index, 1);
  }

  // onUploadStart() {
  //   this.uploading = true;
  //   this.uploadProgress = 0;
  //   this.uploadProgressInterval = setInterval(() => {
  //     this.uploadProgress += 10;
  //     if (this.uploadProgress >= 100) {
  //       clearInterval(this.uploadProgressInterval);
  //       setTimeout(() => {
  //         this.uploading = false;
  //       }, 1000);
  //     }
  //   }, 1000);
  // }

  onAnimalChange(event: any) {
    this.selectedAnimal = event.target.value;
    this.filteredBreeds = this.breeds.filter((breed: Breed) => breed.category === this.selectedAnimal);
    this.infoForm.get('animal')?.setValue(this.selectedAnimal);
  }

  onSubmit() {
    this.isSubmitting.set(true);
    const formData = new FormData();
    formData.append('name', this.infoForm.get('title')?.value??'');
    formData.append('age', this.infoForm.get('age')?.value??'');
    formData.append('price', this.infoForm.get('price')?.value??'');
    formData.append('animal', this.infoForm.get('animal')?.value??'');
    formData.append('breed', this.infoForm.get('breed')?.value??'');
    formData.append('gender', this.infoForm.get('gender')?.value??'');
    formData.append('description', this.infoForm.get('description')?.value??'');
    this.imageFiles.forEach((file, index) => {
      formData.append('images', file, file.name);
    });
    console.log(formData);
    this.uploading.set(true);
    this.petsService.createPet(formData).pipe(
      finalize(() => {
        this.isSubmitting.set(false);
        this.uploading.set(false);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (res) => {
        if (res.type === HttpEventType.UploadProgress) {
          const progress = Math.round(res.loaded / res.total * 100);
          console.log('next upload status: ', progress + '%');
          this.uploadProgress = progress;
        } else if (res.type === HttpEventType.Response) { 
          console.log(res);
          Swal.fire({
            title: 'Success',
            text: 'Pet created successfully',
            icon: 'success',
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
          });
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  private _getAllAnimalAndBreed() {
    this.petsService.getAllAnimalAndBreed().pipe(
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res: {breeds:Breed[]}) => {
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

