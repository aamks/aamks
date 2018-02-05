import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RampComponent } from './ramp.component';

describe('RampComponent', () => {
  let component: RampComponent;
  let fixture: ComponentFixture<RampComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RampComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
