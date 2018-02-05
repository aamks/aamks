import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RampChartComponent } from './ramp-chart.component';

describe('RampChartComponent', () => {
  let component: RampChartComponent;
  let fixture: ComponentFixture<RampChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RampChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RampChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
