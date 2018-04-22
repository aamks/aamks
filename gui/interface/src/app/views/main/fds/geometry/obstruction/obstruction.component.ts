import { WebsocketService } from '../../../../../services/websocket/websocket.service';
import { Fds } from '../../../../../services/fds-object/fds-object';
import { Hole } from '../../../../../services/fds-object/geometry/hole';
import { Obst } from '../../../../../services/fds-object/geometry/obst';
import { Main } from '../../../../../services/main/main';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MainService } from '../../../../../services/main/main.service';
import { UiStateService } from '../../../../../services/ui-state/ui-state.service';
import { UiState } from '../../../../../services/ui-state/ui-state';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { set, find, cloneDeep, findIndex } from 'lodash';
import { FdsEnums } from '../../../../../enums/fds/enums/fds-enums';

@Component({
  selector: 'app-obstruction',
  templateUrl: './obstruction.component.html',
  styleUrls: ['./obstruction.component.scss']
})
export class ObstructionComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  geometry: any;
  ui: UiState;
  output: any;

  // Component objects
  obsts: Obst[];
  obst: Obst;
  obstOld: Obst;
  holes: Hole[];
  hole: Hole;
  holeOld: Hole;

  // Scrolbars containers
  @ViewChild('obstScrollbar') obstScrollbar: PerfectScrollbarComponent;
  @ViewChild('holeScrollbar') holeScrollbar: PerfectScrollbarComponent;

  // Enums
  ENUMS_OBST = FdsEnums.OBST;

  constructor(private mainService: MainService, private websocketService: WebsocketService, private uiStateService: UiStateService) { }

  ngOnInit() {
    console.clear();
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.uiStateService.getUiState().subscribe(ui => this.ui = ui);

    // Assign to local variables
    this.fds = this.main.currentFdsScenario.fdsObject;
    this.geometry = this.main.currentFdsScenario.fdsObject.geometry;
    this.output = this.main.currentFdsScenario.fdsObject.output;
    this.obsts = this.main.currentFdsScenario.fdsObject.geometry.obsts;
    this.holes = this.main.currentFdsScenario.fdsObject.geometry.holes;

    // Activate last element
    this.obsts.length > 0 ? this.obst = this.obsts[this.ui.geometry['obst'].elementIndex] : this.obst = undefined;
    this.holes.length > 0 ? this.hole = this.holes[this.ui.geometry['hole'].elementIndex] : this.hole = undefined;

    // Subscribe websocket requests status for websocket CAD sync
    this.websocketService.requestStatus.subscribe(
      (status) => {
        if (status == 'error') {
          //this.mesh = cloneDeep(this.meshOld);
          console.log('Cannot sync mesh ...');
        }
        else if (status == 'success') {
          //this.meshOld = cloneDeep(this.mesh);
          console.log('Mesh updated ...')
        }
      },
      (error) => {
        //this.mesh = cloneDeep(this.meshOld);
        console.log('Cannot sync mesh ...');
      }
    );
  }

  ngAfterViewInit() {
    // Set scrollbars position y after view rendering and set last selected element
    this.obstScrollbar.directiveRef.scrollToY(this.ui.geometry['obst'].scrollPosition);
    this.holeScrollbar.directiveRef.scrollToY(this.ui.geometry['hole'].scrollPosition);
    this.obsts.length > 0 && this.activate(this.obsts[this.ui.geometry['obst'].elementIndex].id, 'obst');
    this.holes.length > 0 && this.activate(this.holes[this.ui.geometry['hole'].elementIndex].id, 'hole');
  }

  /** Activate element on click */
  public activate(id: string, type: string = '') {
    if (type == 'obst') {
      this.obst = find(this.fds.geometry.obsts, function (o) { return o.id == id; });
      this.ui.geometry['obst'].elementIndex = findIndex(this.obsts, { id: id });
      this.obstOld = cloneDeep(this.obst);
    }
    else if (type == 'hole') {
      this.hole = find(this.fds.geometry.holes, function (o) { return o.id == id; });
      this.ui.geometry['hole'].elementIndex = findIndex(this.holes, { id: id });
      this.holeOld = cloneDeep(this.hole);
    }
  }

  /** Push new element */
  public add(type: string = '') {
    if (type == 'obst') {
      let element = { id: 'OBST' + this.mainService.getListId(this.obsts) };
      this.obsts.push(new Obst(JSON.stringify(element)));
      this.activate(element.id, 'obst');
    }
    else if (type == 'hole') {
      let element = { id: 'HOLE' + this.mainService.getListId(this.holes) };
      this.holes.push(new Hole(JSON.stringify(element)));
      this.activate(element.id, 'hole');
    }
  }

  /** Delete element */
  public delete(id: string, type: string = '') {
    if (type == 'obst') {
      let index = findIndex(this.obsts, { id: id });
      this.obsts.splice(index, 1);
      if (this.ui.geometry['obst'].elementIndex == index) {
        this.obsts.length == 0 ? this.obst = undefined : this.activate(this.obsts[index - 1].id);
      }
    }
    else if (type == 'hole') {
      let index = findIndex(this.holes, { id: id });
      this.holes.splice(index, 1);
      if (this.ui.geometry['hole'].elementIndex == index) {
        this.holes.length == 0 ? this.hole = undefined : this.activate(this.holes[index - 1].id);
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.geometry, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.geometry().y);
  }

  /** Update CAD element */
  public updateCad(type: string = '') {
    if (type == 'obst') {
      this.obstOld = cloneDeep(this.obst);
      this.websocketService.syncUpdateItem("obst", this.obst);
    }
    else if (type == 'hole') {
      this.holeOld = cloneDeep(this.hole);
      this.websocketService.syncUpdateItem("hole", this.hole);
    }
  }

  // COMPONENT METHODS


}
