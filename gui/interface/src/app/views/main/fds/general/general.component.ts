import { Main } from '../../../../services/main/main';
import { MainService } from '../../../../services/main/main.service';
import { WebsocketService } from '../../../../services/websocket/websocket.service';
import { Component, OnInit } from '@angular/core';
import { General } from '../../../../services/fds-object/general/general';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {
  main: Main;
  general: General;
  dump: any;

  constructor(private mainService: MainService, private websocket: WebsocketService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.general = this.main.currentFdsScenario.fdsObject.general;
    this.dump = this.main.currentFdsScenario.fdsObject.output.general;
  }

}
