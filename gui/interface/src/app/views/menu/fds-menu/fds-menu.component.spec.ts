import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FdsMenuComponent } from './fds-menu.component';

describe('FdsMenuComponent', () => {
  let component: FdsMenuComponent;
  let fixture: ComponentFixture<FdsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FdsMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FdsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
