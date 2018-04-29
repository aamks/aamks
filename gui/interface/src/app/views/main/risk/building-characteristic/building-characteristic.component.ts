import { Component, OnInit } from '@angular/core';
import { BuildingCharacteristic } from '../../../../services/risk-object/building-characteristic';
import { MainService } from '../../../../services/main/main.service';
import { Main } from '../../../../services/main/main';
import { RiskEnums } from '../../../../enums/risk/enums/risk-enums';
import { find, size, keys, toInteger, last, sortBy, includes } from 'lodash';
import { BuildingInfrastructure } from '../../../../services/risk-object/building-infrastructure';
import { Settings } from '../../../../services/risk-object/settings';
import "rxjs/add/operator/takeWhile";

@Component({
  selector: 'app-building-characteristic',
  templateUrl: './building-characteristic.component.html',
  styleUrls: ['./building-characteristic.component.scss']
})
export class BuildingCharacteristicComponent implements OnInit {

  private subscribe: boolean = true;

  main: Main;
  buildingCharacteristic: BuildingCharacteristic;
  buildingInfrastructure: BuildingInfrastructure;
  settings: Settings;

  // Component elements
  complexitySliceMin: number = 0;
  complexitySliceMax: number = 3;

  TYPE = sortBy(RiskEnums.buildingType, ['label']);
  COMPLEXITY = RiskEnums.complexity;
  MANAGMENT = RiskEnums.managment;
  MATERIALS = RiskEnums.materials;

  PRE_TIMES = RiskEnums.preTimes;
  BUILDING_TYPE = RiskEnums.buildingType;

  constructor(private mainService: MainService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().takeWhile(() => this.subscribe).subscribe(main => this.main = main);
    this.buildingCharacteristic = this.main.currentRiskScenario.riskObject.buildingCharacteristic;
    this.buildingInfrastructure = this.main.currentRiskScenario.riskObject.buildingInfrastructure;
    this.settings = this.main.currentRiskScenario.riskObject.settings;

    this.setPreMovementTimes();
  }
  ngOnDestroy() {
    this.subscribe = false;
  }

  /**
   * Sets pre-movement times and make context forms
   */
  public setPreMovementTimes() {
    // Find building category
    let buildingType = find(this.BUILDING_TYPE, (o) => {
      return o.value == this.buildingCharacteristic.type;
    });
    let buildingCategory = find(this.PRE_TIMES, function(o) {
      return o.type == buildingType.type;
    });

    // Update select lists - alway m1, m2, m3
    // complexity
    let complexityLevels = keys(buildingCategory.pre[this.buildingCharacteristic.managment]);
    if (!includes(complexityLevels, this.buildingCharacteristic.complexity)) this.buildingCharacteristic.complexity = complexityLevels[0];
    this.complexitySliceMin = toInteger(complexityLevels[0].slice(1)) - 1;
    this.complexitySliceMax = toInteger(last(complexityLevels).slice(1));
    // alarming
    let alarmingLevels = keys(buildingCategory.pre[this.buildingCharacteristic.managment][this.buildingCharacteristic.complexity]);
    if (!includes(alarmingLevels, this.buildingInfrastructure.alarming)) this.buildingInfrastructure.alarming = alarmingLevels[0];

    // Assing pre-times to settings variables and Update others
    if (buildingCategory != undefined && !this.settings.userDefinedData) {
      this.settings.preEvacuationTime.meanAndSdOrdinaryRoom[0] = buildingCategory.pre[this.buildingCharacteristic.managment][this.buildingCharacteristic.complexity][this.buildingInfrastructure.alarming].loc;
      this.settings.preEvacuationTime.meanAndSdOrdinaryRoom[1] = buildingCategory.pre[this.buildingCharacteristic.managment][this.buildingCharacteristic.complexity][this.buildingInfrastructure.alarming].scale;
      this.settings.preEvacuationTime.meanAndSdRoomOfFireOrigin = buildingCategory.preEvacuationRoomOfFireOrigin;

      this.settings.heatReleaseRate.hrrpuaMinModeMax = [buildingType.hrrpua * 0.3, buildingType.hrrpua, buildingType.hrrpua * 1.3];
      this.settings.heatReleaseRate.alphaMinModeMax[1] = buildingType.alphaMod;

      this.settings.evacueesConcentration.cor = buildingType.evacCorridorDensity;
      this.settings.evacueesConcentration.hall = buildingType.evacHallDensity;
      this.settings.evacueesConcentration.room = buildingType.evacRoomDensity;
      this.settings.evacueesConcentration.stai = buildingType.evacStaircaseDensity;
    }
  }


}
