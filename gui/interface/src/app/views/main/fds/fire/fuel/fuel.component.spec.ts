import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelComponent } from './fuel.component';

describe('FuelComponent', () => {
  let component: FuelComponent;
  let fixture: ComponentFixture<FuelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
