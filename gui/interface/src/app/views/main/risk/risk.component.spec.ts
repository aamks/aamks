import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskComponent } from './risk.component';

describe('RiskComponent', () => {
  let component: RiskComponent;
  let fixture: ComponentFixture<RiskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
