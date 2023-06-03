import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachementShowComponent } from './attachement-show.component';

describe('AttachementShowComponent', () => {
  let component: AttachementShowComponent;
  let fixture: ComponentFixture<AttachementShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachementShowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttachementShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
