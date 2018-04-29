import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../services/main/main';
import { RiskEnums } from '../../../../enums/risk/enums/risk-enums';
import { MainService } from '../../../../services/main/main.service';
import { BuildingInfrastructure } from '../../../../services/risk-object/building-infrastructure';
import { BuildingCharacteristic } from '../../../../services/risk-object/building-characteristic';
import { Settings } from '../../../../services/risk-object/settings';
import { find, keys, toInteger, last, includes } from 'lodash';
import { RiskScenarioService } from '../../../../services/risk-scenario/risk-scenario.service';
import "rxjs/add/operator/takeWhile";

@Component({
  selector: 'app-building-infrastructure',
  templateUrl: './building-infrastructure.component.html',
  styleUrls: ['./building-infrastructure.component.scss']
})
export class BuildingInfrastructureComponent implements OnInit {

  private subscribe: boolean = true;

  main: Main;
  buildingCharacteristic: BuildingCharacteristic;
  buildingInfrastructure: BuildingInfrastructure;
  settings: Settings;

  // Component elements
  alarmingSliceMin: number = 0;
  alarmingSliceMax: number = 3;

  ALARMING = RiskEnums.alarming;
  DETECTOR_TYPE = RiskEnums.detectorType;

  PRE_TIMES = RiskEnums.preTimes;
  BUILDING_TYPE = RiskEnums.buildingType;

  constructor(private mainService: MainService, private riskScenarioService: RiskScenarioService) { }

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
    // alarming
    let alarmingLevels = keys(buildingCategory.pre[this.buildingCharacteristic.managment][this.buildingCharacteristic.complexity]);
    if (!includes(alarmingLevels, this.buildingInfrastructure.alarming)) this.buildingInfrastructure.alarming = alarmingLevels[0];
    this.alarmingSliceMin = toInteger(alarmingLevels[0].slice(1)) - 1;
    this.alarmingSliceMax = toInteger(last(alarmingLevels).slice(1));

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
