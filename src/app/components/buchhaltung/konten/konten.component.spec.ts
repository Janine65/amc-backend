import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontenComponent } from './konten.component';

describe('KontenComponent', () => {
  let component: KontenComponent;
  let fixture: ComponentFixture<KontenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KontenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KontenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
