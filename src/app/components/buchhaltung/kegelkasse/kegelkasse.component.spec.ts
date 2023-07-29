import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KegelkasseComponent } from './kegelkasse.component';

describe('KegelkasseComponent', () => {
  let component: KegelkasseComponent;
  let fixture: ComponentFixture<KegelkasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KegelkasseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KegelkasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
