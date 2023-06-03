import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachementListComponent } from './attachement-list.component';

describe('AttachementListComponent', () => {
  let component: AttachementListComponent;
  let fixture: ComponentFixture<AttachementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachementListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttachementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
