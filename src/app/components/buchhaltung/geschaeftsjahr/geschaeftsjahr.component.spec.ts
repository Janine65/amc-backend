import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeschaeftsjahrComponent } from './geschaeftsjahr.component';

describe('GeschaeftsjahrComponent', () => {
  let component: GeschaeftsjahrComponent;
  let fixture: ComponentFixture<GeschaeftsjahrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeschaeftsjahrComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeschaeftsjahrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
