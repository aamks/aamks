import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../services/main/main';
import { Settings } from '../../../../services/risk-object/settings';
import { MainService } from '../../../../services/main/main.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  main: Main;
  settings: Settings;

  //SETTINGS = RiskEnums.alarming;

  constructor(private mainService: MainService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.settings = this.main.currentRiskScenario.riskObject.settings;
  }

}
