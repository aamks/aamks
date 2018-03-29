import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingCharacteristicComponent } from './building-characteristic.component';

describe('BuildingCharacteristicComponent', () => {
  let component: BuildingCharacteristicComponent;
  let fixture: ComponentFixture<BuildingCharacteristicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildingCharacteristicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildingCharacteristicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
