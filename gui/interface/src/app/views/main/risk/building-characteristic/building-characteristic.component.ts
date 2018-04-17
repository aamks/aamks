import { Component, OnInit } from '@angular/core';
import { BuildingCharacteristic } from '../../../../services/risk-object/building-characteristic';
import { MainService } from '../../../../services/main/main.service';
import { Main } from '../../../../services/main/main';
import { RiskEnums } from '../../../../enums/risk-enums';
import { find } from 'lodash';
import { BuildingInfrastructure } from '../../../../services/risk-object/building-infrastructure';

@Component({
  selector: 'app-building-characteristic',
  templateUrl: './building-characteristic.component.html',
  styleUrls: ['./building-characteristic.component.scss']
})
export class BuildingCharacteristicComponent implements OnInit {

  main: Main;
  buildingCharacteristic: BuildingCharacteristic;

  buildingInfrastructure: BuildingInfrastructure;

  pre1: number;
  pre2: number;

  TYPE = RiskEnums.buildingType;
  COMPLEXITY = RiskEnums.complexity;
  MANAGMENT = RiskEnums.managment;
  MATERIALS = RiskEnums.materials;

  PRE_TIMES = RiskEnums.preTimes;

  constructor(private mainService: MainService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.buildingCharacteristic = this.main.currentRiskScenario.riskObject.buildingCharacteristic;
    this.buildingInfrastructure = this.main.currentRiskScenario.riskObject.buildingInfrastructure;
  }

  pre() {

    let preTime = find(this.PRE_TIMES, function(o) {
      return o.type == 'a';
      //return o.type == this.buildingCharacteristic.buildingType.type;
    })

    this.pre1 = preTime.pre[this.buildingCharacteristic.managment][this.buildingCharacteristic.complexity][this.buildingInfrastructure.alarming].pre1;
    this.pre2 = preTime.pre[this.buildingCharacteristic.managment][this.buildingCharacteristic.complexity][this.buildingInfrastructure.alarming].pre2;

  }



}
