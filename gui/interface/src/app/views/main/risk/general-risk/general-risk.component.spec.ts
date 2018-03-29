import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralRiskComponent } from './general-risk.component';

describe('GeneralRiskComponent', () => {
  let component: GeneralRiskComponent;
  let fixture: ComponentFixture<GeneralRiskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralRiskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
