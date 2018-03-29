import { Component, OnInit } from '@angular/core';
import { Main } from '../../services/main/main';
import { MainService } from '../../services/main/main.service';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { FdsScenarioService } from '../../services/fds-scenario/fds-scenario.service';
import { Library } from '../../services/library/library';
import { LibraryService } from '../../services/library/library.service';

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
    private libraryService: LibraryService
  ) {}

  ngOnInit() {
      this.mainService.getMain().subscribe(main => this.main = main);
    setTimeout(() => {
      this.libraryService.getLibrary().subscribe(lib => this.lib = lib);
    }, 1000)
  }

  showDiagnosticData() {
    console.clear();
    console.log("======== Diagnostic ========");
    //console.log("--- Main -------------------");
    //console.log(this.main);
    //console.log();
    console.log("--- Current fds scenario ---");
    console.log(this.main.currentFdsScenario);
    console.log();

    console.log("--- Current risk scenario ---");
    console.log(this.main.currentRiskScenario);
    console.log();
    //console.log("--- Library ---");
    //console.log(this.lib);
    //console.log();
    if (this.main.currentFdsScenario != undefined) {
      //console.log("--- Fds object -------------");
      //console.log(this.main.currentFdsScenario.fdsObject);
      //console.log();
      //console.log("--- Fds object toJSON ------");
      //console.log(this.main.currentFdsScenario.fdsObject.toJSON());
      //console.log();
      //console.log("--- Ventilation object -----");
      //console.log(this.main.currentFdsScenario.fdsObject.ventilation);
      //console.log();
    }
    console.log("======== End Diagnostic ========");
  }

  setCurrentFdsScenario(projectId: number, fdsScenarioId: number) {
    this.fdsScenarioService.setCurrentFdsScenario(projectId, fdsScenarioId).subscribe();
  }

}
