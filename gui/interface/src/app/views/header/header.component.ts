import { Component, OnInit } from '@angular/core';
import { Main } from '../../services/main/main';
import { MainService } from '../../services/main/main.service';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { RiskScenarioService } from '../../services/risk-scenario/risk-scenario.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  main: Main;

  constructor(
    private mainService: MainService, 
    private websocketService: WebsocketService, 
    private riskScenarioService: RiskScenarioService, 
  ) {}

  ngOnInit() {
      this.mainService.getMain().subscribe(main => this.main = main);
  }

  public showDiagnosticData() {
    console.clear();
    console.log("======== Diagnostic ========");
    console.log("--- Main -------------------");
    console.log(this.main);
    console.log("--- Current risk scenario ---");
    console.log(this.main.currentRiskScenario);
    console.log("======== End Diagnostic ========");
  }

  /** Update risk scenario */
  public updateRiskScenario(projectId: number, riskScenarioId: number) {
    this.riskScenarioService.updateRiskScenario(projectId, riskScenarioId);
  }

  /** Run risk scenario */
  public runRiskScenario() {
    this.riskScenarioService.runRiskScenario();
  }

  /** Connect to CAD */
  public connectCad() {

  }

}
