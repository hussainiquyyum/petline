import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../service/user.service';
import { User } from '../../interface/user.interface';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';
import { PetsService } from '../../service/pets.service';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';

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
  
  public isLoading = signal(true);
  public userInfo: User = {} as User;
  public data: any[] = [];
  public gettingPets = signal(false);
  public nameEditing = signal(false);
  public nameEditingLoading = signal(false);
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

  editName() {
    this.nameEditing.set(!this.nameEditing());
  }

  saveName() {
    this.nameEditingLoading.set(true);
    this.userService.updateUser(this.userInfo).pipe(
      finalize(() => this.nameEditingLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res: any) => {
      this.userInfo = res;
      this.nameEditing.set(false);
    });
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

