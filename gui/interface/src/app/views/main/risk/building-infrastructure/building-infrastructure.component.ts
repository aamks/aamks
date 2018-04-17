import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../services/main/main';
import { RiskEnums } from '../../../../enums/risk-enums';
import { MainService } from '../../../../services/main/main.service';
import { BuildingInfrastructure } from '../../../../services/risk-object/building-infrastructure';

@Component({
  selector: 'app-building-infrastructure',
  templateUrl: './building-infrastructure.component.html',
  styleUrls: ['./building-infrastructure.component.scss']
})
export class BuildingInfrastructureComponent implements OnInit {

  main: Main;
  buildingInfrastructure: BuildingInfrastructure;

  ALARMING = RiskEnums.alarming;
  DETECTOR_TYPE = RiskEnums.detectorType;

  constructor(private mainService: MainService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.buildingInfrastructure = this.main.currentRiskScenario.riskObject.buildingInfrastructure;
  }

}
