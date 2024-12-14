import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreNavComponent } from './more-nav.component';

describe('MoreNavComponent', () => {
  let component: MoreNavComponent;
  let fixture: ComponentFixture<MoreNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoreNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoreNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
