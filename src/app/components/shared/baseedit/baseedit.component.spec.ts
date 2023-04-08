import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseeditComponent } from './baseedit.component';

describe('BaseeditComponent', () => {
  let component: BaseeditComponent;
  let fixture: ComponentFixture<BaseeditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseeditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
