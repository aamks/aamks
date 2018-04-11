import { Component, OnInit } from '@angular/core';
import { BuildingCharacteristic } from '../../../../services/risk-object/building-characteristic';
import { MainService } from '../../../../services/main/main.service';
import { WebsocketService } from '../../../../services/websocket/websocket.service';
import { Main } from '../../../../services/main/main';
import { RiskEnums } from '../../../../enums/risk-enums';

@Component({
  selector: 'app-building-characteristic',
  templateUrl: './building-characteristic.component.html',
  styleUrls: ['./building-characteristic.component.scss']
})
export class BuildingCharacteristicComponent implements OnInit {

  main: Main;
  buildingCharacteristic: BuildingCharacteristic;

  TYPE = RiskEnums.buildingType;
  COMPLEXITY = RiskEnums.complexity;
  MANAGMENT = RiskEnums.managment;
  MATERIALS = RiskEnums.materials;

  constructor(private mainService: MainService, private websocket: WebsocketService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.buildingCharacteristic = this.main.currentRiskScenario.riskObject.buildingCharacteristic;
  }


}
