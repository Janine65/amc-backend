import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeisterschaftComponent } from './meisterschaft.component';

describe('MeisterschaftComponent', () => {
  let component: MeisterschaftComponent;
  let fixture: ComponentFixture<MeisterschaftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeisterschaftComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeisterschaftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
