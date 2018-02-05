import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UniqueSelectComponent } from './unique-select.component';

describe('UniqueSelectComponent', () => {
  let component: UniqueSelectComponent;
  let fixture: ComponentFixture<UniqueSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UniqueSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UniqueSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
