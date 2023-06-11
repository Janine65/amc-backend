import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentAddComponent } from './attachment-add.component';

describe('AttachmentAddComponent', () => {
  let component: AttachmentAddComponent;
  let fixture: ComponentFixture<AttachmentAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachmentAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttachmentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
