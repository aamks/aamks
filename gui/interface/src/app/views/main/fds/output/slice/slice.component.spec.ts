import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliceComponent } from './slice.component';

describe('SliceComponent', () => {
  let component: SliceComponent;
  let fixture: ComponentFixture<SliceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
