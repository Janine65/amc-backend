import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdresseEditComponent } from './adresse-edit.component';

describe('AdresseEditComponent', () => {
  let component: AdresseEditComponent;
  let fixture: ComponentFixture<AdresseEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdresseEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdresseEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
