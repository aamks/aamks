import { Component, OnInit } from '@angular/core';
import { BuildingCharacteristic } from '../../../../services/risk-object/building-characteristic';
import { MainService } from '../../../../services/main/main.service';
import { Main } from '../../../../services/main/main';
import { RiskEnums } from '../../../../enums/risk-enums';
import { find } from 'lodash';
import { BuildingInfrastructure } from '../../../../services/risk-object/building-infrastructure';
import { Settings } from '../../../../services/risk-object/settings';

@Component({
  selector: 'app-building-characteristic',
  templateUrl: './building-characteristic.component.html',
  styleUrls: ['./building-characteristic.component.scss']
})
export class BuildingCharacteristicComponent implements OnInit {

  main: Main;
  buildingCharacteristic: BuildingCharacteristic;
  buildingInfrastructure: BuildingInfrastructure;
  settings: Settings;

  TYPE = RiskEnums.buildingType;
  COMPLEXITY = RiskEnums.complexity;
  MANAGMENT = RiskEnums.managment;
  MATERIALS = RiskEnums.materials;

  PRE_TIMES = RiskEnums.preTimes;
  BUILDING_TYPE = RiskEnums.buildingType;

  constructor(private mainService: MainService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.buildingCharacteristic = this.main.currentRiskScenario.riskObject.buildingCharacteristic;
    this.buildingInfrastructure = this.main.currentRiskScenario.riskObject.buildingInfrastructure;
    this.settings = this.main.currentRiskScenario.riskObject.settings;
  }

  /** Sets pre-evacuation times */
  public setPreMovementTimes() {
    let buildingType = find(this.BUILDING_TYPE, (o) => {
      return o.value == this.buildingCharacteristic.type;
    });
    let preEvacuationTime = find(this.PRE_TIMES, function(o) {
      return o.type == buildingType.type;
    });
    if (preEvacuationTime != undefined) {
      this.settings.preEvacuationTime.meanAndSdOrdinaryRoom[0] = preEvacuationTime.pre[this.buildingCharacteristic.managment][this.buildingCharacteristic.complexity][this.buildingInfrastructure.alarming].loc;
      this.settings.preEvacuationTime.meanAndSdOrdinaryRoom[1] = preEvacuationTime.pre[this.buildingCharacteristic.managment][this.buildingCharacteristic.complexity][this.buildingInfrastructure.alarming].scale;
      this.settings.preEvacuationTime.meanAndSdOrdinaryRoom = preEvacuationTime.preEvacuationRoomOfFireOrigin;
    }
  }


}
