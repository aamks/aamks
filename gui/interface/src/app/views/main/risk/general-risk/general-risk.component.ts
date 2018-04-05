import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../services/main/main';
import { MainService } from '../../../../services/main/main.service';
import { General } from '../../../../services/risk-object/general';
import { WebsocketService } from '../../../../services/websocket/websocket.service';

@Component({
  selector: 'app-general-risk',
  templateUrl: './general-risk.component.html',
  styleUrls: ['./general-risk.component.scss']
})
export class GeneralRiskComponent implements OnInit {

  main: Main;
  general: General;

  constructor(private mainService: MainService, private websocket: WebsocketService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.general = this.main.currentRiskScenario.riskObject.general;
  }

}
