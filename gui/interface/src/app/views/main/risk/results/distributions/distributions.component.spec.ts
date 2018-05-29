import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionsComponent } from './distributions.component';

describe('DistributionsComponent', () => {
  let component: DistributionsComponent;
  let fixture: ComponentFixture<DistributionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistributionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistributionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
