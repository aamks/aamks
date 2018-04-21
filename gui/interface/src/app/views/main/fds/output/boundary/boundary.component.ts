import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../../services/main/main';
import { MainService } from '../../../../../services/main/main.service';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';
import { Bndf } from '../../../../../services/fds-object/output/bndf';
import { forEach, find, findIndex } from 'lodash';

@Component({
  selector: 'app-boundary',
  templateUrl: './boundary.component.html',
  styleUrls: ['./boundary.component.scss']
})
export class BoundaryComponent implements OnInit {

  main: Main;
  bndfs: Bndf[];
  selectedBndfs: string[] = [];

  constructor(private mainService: MainService, private websocket: WebsocketService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.bndfs = this.main.currentFdsScenario.fdsObject.output.bndfs;
  }

  public selectBndf() {
    forEach(this.selectedBndfs, (selectedBndf) => {
      let index = findIndex(this.bndfs, function(o) {
        return o.quantity == selectedBndf;
      });

      this.bndfs[index].marked = true;
    });

  }

}
