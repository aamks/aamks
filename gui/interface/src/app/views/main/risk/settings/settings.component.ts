import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../services/main/main';
import { Settings } from '../../../../services/risk-object/settings';
import { MainService } from '../../../../services/main/main.service';
import { General } from '../../../../services/risk-object/general';
import { BuildingInfrastructure } from '../../../../services/risk-object/building-infrastructure';
import { RiskEnums } from '../../../../enums/risk/enums/risk-enums';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  main: Main;
  settings: Settings;
  general: General;
  buildingInfrastructure: BuildingInfrastructure;

  DETECTOR_TYPE = RiskEnums.detectorType;

  constructor(private mainService: MainService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.settings = this.main.currentRiskScenario.riskObject.settings;
    this.general = this.main.currentRiskScenario.riskObject.general;
    this.buildingInfrastructure = this.main.currentRiskScenario.riskObject.buildingInfrastructure;
  }

}
