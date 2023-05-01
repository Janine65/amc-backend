import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnlaesseEditComponent } from './anlaesse-edit.component';

describe('AnlaesseEditComponent', () => {
  let component: AnlaesseEditComponent;
  let fixture: ComponentFixture<AnlaesseEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnlaesseEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnlaesseEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
