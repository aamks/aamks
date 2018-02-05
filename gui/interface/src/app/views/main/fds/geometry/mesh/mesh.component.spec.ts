import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeshComponent } from './mesh.component';

describe('MeshComponent', () => {
  let component: MeshComponent;
  let fixture: ComponentFixture<MeshComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeshComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeshComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
