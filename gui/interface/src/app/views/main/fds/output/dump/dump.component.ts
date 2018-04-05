import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../../services/main/main';
import { MainService } from '../../../../../services/main/main.service';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';

@Component({
  selector: 'app-dump',
  templateUrl: './dump.component.html',
  styleUrls: ['./dump.component.scss']
})
export class DumpComponent implements OnInit {

  main: Main;
  dump: any;

  constructor(private mainService: MainService, private websocket: WebsocketService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.dump = this.main.currentFdsScenario.fdsObject.output.general;
  }

}
