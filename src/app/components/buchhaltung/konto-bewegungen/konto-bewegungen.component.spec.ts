import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KontoBewegungenComponent } from './konto-bewegungen.component';

describe('KontoBewegungenComponent', () => {
  let component: KontoBewegungenComponent;
  let fixture: ComponentFixture<KontoBewegungenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KontoBewegungenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KontoBewegungenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
