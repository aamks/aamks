import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CombustionComponent } from './combustion.component';

describe('CombustionComponent', () => {
  let component: CombustionComponent;
  let fixture: ComponentFixture<CombustionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CombustionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CombustionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
