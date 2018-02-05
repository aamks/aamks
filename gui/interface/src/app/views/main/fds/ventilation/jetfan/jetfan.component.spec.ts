import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JetfanComponent } from './jetfan.component';

describe('JetfanComponent', () => {
  let component: JetfanComponent;
  let fixture: ComponentFixture<JetfanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JetfanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JetfanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
