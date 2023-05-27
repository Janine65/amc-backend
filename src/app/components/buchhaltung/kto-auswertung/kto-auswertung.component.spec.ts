import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KtoAuswertungComponent } from './kto-auswertung.component';

describe('KtoAuswertungComponent', () => {
  let component: KtoAuswertungComponent;
  let fixture: ComponentFixture<KtoAuswertungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KtoAuswertungComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KtoAuswertungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
