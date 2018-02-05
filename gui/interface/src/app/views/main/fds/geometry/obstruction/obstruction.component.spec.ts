import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObstructionComponent } from './obstruction.component';

describe('ObstructionComponent', () => {
  let component: ObstructionComponent;
  let fixture: ComponentFixture<ObstructionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObstructionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
