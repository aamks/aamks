import { Open } from '../../../../../services/fds-object/open';
import { FdsEnums } from '../../../../../enums/fds-enums';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { UiState } from '../../../../../services/ui-state/ui-state';
import { UiStateService } from '../../../../../services/ui-state/ui-state.service';
import { Component, OnInit, ViewChild } from '@angular/core';

import { Fds, FdsObject } from '../../../../../services/fds-object/fds-object';
import { Mesh, MeshObject } from '../../../../../services/fds-object/mesh';

import { set, cloneDeep, find, forEach, findIndex } from 'lodash';
import { MainService } from '../../../../../services/main/main.service';
import { Main, MainObject } from '../../../../../services/main/main';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';

@Component({
  selector: 'app-mesh',
  templateUrl: './mesh.component.html',
  styleUrls: ['./mesh.component.scss']
})
export class MeshComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  geometry: any;
  ui: UiState;

  // Component objects
  meshes: Mesh[];
  mesh: Mesh;
  meshOld: Mesh;
  opens: Open[];
  open: Open;
  openOld: Open;

  // Scrolbars containers
  @ViewChild('meshScrollbar') meshScrollbar: PerfectScrollbarComponent;
  @ViewChild('openScrollbar') openScrollbar: PerfectScrollbarComponent;

  constructor(private mainService: MainService, private websocketService: WebsocketService, private uiStateService: UiStateService) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.uiStateService.getUiState().subscribe(ui => this.ui = ui);

    // Assign to local variables
    this.fds = this.main.currentFdsScenario.fdsObject;
    this.geometry = this.main.currentFdsScenario.fdsObject.geometry;
    this.meshes = this.main.currentFdsScenario.fdsObject.geometry.meshes;
    this.opens = this.main.currentFdsScenario.fdsObject.geometry.opens;

    // Activate last element
    this.meshes.length > 0 ? this.mesh = this.meshes[this.ui.geometry['mesh'].elementIndex] : undefined;
    this.opens.length > 0 ? this.open = this.opens[this.ui.geometry['open'].elementIndex] : undefined;

    // Subscribe websocket requests status for websocket CAD sync
    this.websocketService.requestStatus.subscribe(
      (status) => {
        if (status == 'error') {
          this.mesh = cloneDeep(this.meshOld);
          console.log('Cannot sync mesh ...');
        }
        else if (status == 'success') {
          this.meshOld = cloneDeep(this.mesh);
          console.log('Mesh updated ...')
        }
      },
      (error) => {
        this.mesh = cloneDeep(this.meshOld);
        console.log('Cannot sync mesh ...');
      }
    );
  }

  ngAfterViewInit() {
    // Set scrollbars position y after view rendering and set last selected element
    this.meshScrollbar.directiveRef.scrollToY(this.ui.geometry['mesh'].scrollPosition);
    this.openScrollbar.directiveRef.scrollToY(this.ui.geometry['open'].scrollPosition);
    this.activate(this.meshes[this.ui.geometry['mesh'].elementIndex].id, 'mesh');
    this.activate(this.opens[this.ui.geometry['open'].elementIndex].id, 'open');
  }

  /** Activate element on click */
  public activate(id: string, type: string = '') {
    if (type == 'mesh') {
      this.mesh = find(this.fds.geometry.meshes, function (o) { return o.id == id; });
      this.ui.geometry['mesh'].elementIndex = findIndex(this.meshes, { id: id });
      this.meshOld = cloneDeep(this.mesh);
    }
    else if (type == 'open') {
      this.open = find(this.fds.geometry.opens, function (o) { return o.id == id; });
      this.ui.geometry['open'].elementIndex = findIndex(this.opens, { id: id });
      this.openOld = cloneDeep(this.open);
    }
  }

  /** Push new element */
  public add(type: string = '') {
    if (type == 'mesh') {
      let element = { id: 'MESH' + this.mainService.getListId(this.meshes) };
      this.meshes.push(new Mesh(JSON.stringify(element)));
    }
    else if (type == 'open') {
      let element = { id: 'OPEN' + this.mainService.getListId(this.opens) };
      this.opens.push(new Open(JSON.stringify(element)));
    }
  }

  /** Delete element */
  public delete(id: string, type: string = '') {
    if (type == 'mesh') {
      let index = findIndex(this.meshes, { id: id });
      this.meshes.splice(index, 1);
      if (this.ui.geometry['mesh'].elementIndex == index) {
        index > 1 ? this.activate(this.meshes[index - 1].id) : this.activate(this.meshes[index].id);
      }
    }
    else if (type == 'open') {
      let index = findIndex(this.opens, { id: id });
      this.opens.splice(index, 1);
      if (this.ui.geometry['open'].elementIndex == index) {
        index > 1 ? this.activate(this.opens[index - 1].id) : this.activate(this.opens[index].id);
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.geometry, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.geometry().y);
  }

  /** Update CAD element */
  public updateCad(type: string = '') {
    if (type == 'mesh') {
      this.meshOld = cloneDeep(this.mesh);
      this.websocketService.syncUpdateItem('mesh', this.mesh);
    }
    else if (type == 'open') {
      this.openOld = cloneDeep(this.open);
      this.websocketService.syncUpdateItem('open', this.open);
    }
  }

  // COMPONENT METHODS

  /** Calculate no of cells in domain */
  public totalCells(): number {
    let totalCells = 0;
    forEach(this.fds.geometry.meshes, (mesh) => {
      totalCells += mesh.cells;
    });
    return totalCells;
  }

}
