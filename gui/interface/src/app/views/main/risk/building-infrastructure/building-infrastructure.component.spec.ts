import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingInfrastructureComponent } from './building-infrastructure.component';

describe('BuildingInfrastructureComponent', () => {
  let component: BuildingInfrastructureComponent;
  let fixture: ComponentFixture<BuildingInfrastructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildingInfrastructureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildingInfrastructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
