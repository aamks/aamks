import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IsosurfaceComponent } from './isosurface.component';

describe('IsosurfaceComponent', () => {
  let component: IsosurfaceComponent;
  let fixture: ComponentFixture<IsosurfaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IsosurfaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IsosurfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
