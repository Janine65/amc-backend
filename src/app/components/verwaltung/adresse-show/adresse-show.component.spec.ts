import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdresseShowComponent } from './adresse-show.component';

describe('AdresseShowComponent', () => {
  let component: AdresseShowComponent;
  let fixture: ComponentFixture<AdresseShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdresseShowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdresseShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
