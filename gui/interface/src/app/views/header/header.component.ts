import { Component, OnInit } from '@angular/core';
import { Main } from '../../services/main/main';
import { MainService } from '../../services/main/main.service';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { FdsScenarioService } from '../../services/fds-scenario/fds-scenario.service';
import { Library } from '../../services/library/library';
import { LibraryService } from '../../services/library/library.service';
import { RiskScenarioService } from '../../services/risk-scenario/risk-scenario.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  main: Main;
  lib: Library;

  constructor(
    private mainService: MainService, 
    private websocket: WebsocketService, 
    private fdsScenarioService: FdsScenarioService, 
    private riskScenarioService: RiskScenarioService, 
    private libraryService: LibraryService
  ) {}

  ngOnInit() {
      this.mainService.getMain().subscribe(main => this.main = main);
    setTimeout(() => {
      this.libraryService.getLibrary().subscribe(lib => this.lib = lib);
    }, 1000)
  }

  public showDiagnosticData() {
    console.clear();
    console.log("======== Diagnostic ========");
    console.log("--- Main -------------------");
    console.log(this.main);
    console.log("--- Current fds scenario ---");
    console.log(this.main.currentFdsScenario);
    console.log("--- Current risk scenario ---");
    console.log(this.main.currentRiskScenario);
    console.log("--- Library ---");
    console.log(this.lib);
    console.log("======== End Diagnostic ========");
  }

  public setCurrentFdsScenario(projectId: number, fdsScenarioId: number) {
    this.fdsScenarioService.setCurrentFdsScenario(projectId, fdsScenarioId).subscribe();
  }

  /** Update FDS scenario */
  public updateFdsScenario(projectId: number, fdsScenarioId: number) {
    this.fdsScenarioService.updateFdsScenario(projectId, fdsScenarioId);
  }

  /** Update risk scenario */
  public updateRiskScenario(projectId: number, riskScenarioId: number) {
    this.riskScenarioService.updateRiskScenario(projectId, riskScenarioId);
  }

  /** Run risk scenario */
  public runRiskScenario() {
    this.riskScenarioService.runRiskScenario();
  }

  /** Update FDS library */
  public updateFdsLibrary() {
    this.libraryService.updateLibrary();
  }

}
