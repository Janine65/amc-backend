import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnlassBookComponent } from './anlass-book.component';

describe('AnlassBookComponent', () => {
  let component: AnlassBookComponent;
  let fixture: ComponentFixture<AnlassBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnlassBookComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnlassBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
