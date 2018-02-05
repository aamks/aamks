import { Ramp } from '../../../../../services/fds-object/ramp';
import { UiStateService } from '../../../../../services/ui-state/ui-state.service';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';
import { MainService } from '../../../../../services/main/main.service';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { Matl } from '../../../../../services/fds-object/matl';
import { UiState } from '../../../../../services/ui-state/ui-state';
import { Fds } from '../../../../../services/fds-object/fds-object';
import { Main } from '../../../../../services/main/main';
import { Component, OnInit, ViewChild } from '@angular/core';
import { set, cloneDeep, find, forEach, findIndex } from 'lodash';
import { LibraryService } from '../../../../../services/library/library.service';
import { Library } from '../../../../../services/library/library';

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.scss']
})
export class MaterialComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  geometry: object;
  ui: UiState;
  lib: Library;

  // Component objects
  matls: Matl[];
  libMatls: Matl[];
  matl: Matl;
  matlOld: Matl;
  ramps: Ramp[];
  libRamps: Ramp[];
  objectType: string = 'current'; // Lib or current

  // Scrolbars containers
  @ViewChild('matlScrollbar') matlScrollbar: PerfectScrollbarComponent;
  @ViewChild('matlLibScrollbar') matlLibScrollbar: PerfectScrollbarComponent;

  constructor(
    private mainService: MainService,
    private websocketService: WebsocketService,
    private uiStateService: UiStateService,
    private libraryService: LibraryService
  ) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.uiStateService.getUiState().subscribe(ui => this.ui = ui);
    this.libraryService.getLibrary().subscribe(lib => this.lib = lib);

    // Assign to local variables
    this.fds = this.main.currentFdsScenario.fdsObject;
    this.geometry = this.main.currentFdsScenario.fdsObject.geometry;
    this.matls = this.main.currentFdsScenario.fdsObject.geometry.matls;
    this.libMatls = this.lib.matls;
    this.ramps = this.main.currentFdsScenario.fdsObject.ramps.ramps;
    this.libRamps = this.lib.ramps;

    // Activate last element
    this.matls.length > 0 ? this.matl = this.matls[this.ui.geometry['matl'].elementIndex] : undefined;

    // Subscribe websocket requests status for websocket CAD sync
    this.websocketService.requestStatus.subscribe(
      (status) => {
        if (status == 'error') {
          this.matl = cloneDeep(this.matlOld);
          console.log('Cannot sync matl ...');
        }
        else if (status == 'success') {
          this.matlOld = cloneDeep(this.matl);
          console.log('Mesh updated ...')
        }
      },
      (error) => {
        this.matl = cloneDeep(this.matlOld);
        console.log('Cannot sync matl ...');
      }
    );
  }

  ngAfterViewInit() {
    // Set scrollbars position y after view rendering and set last selected element
    this.matlScrollbar.directiveRef.scrollToY(this.ui.geometry['matl'].scrollPosition);
    this.activate(this.matls[this.ui.geometry['matl'].elementIndex].id);
  }

  /** Activate element on click */
  public activate(id: string, library?: boolean) {
    if (!library) {
      this.objectType = 'current';
      this.matl = find(this.fds.geometry.matls, function (o) { return o.id == id; });
      this.ui.geometry['matl'].elementIndex = findIndex(this.matls, { id: id });
      this.matlOld = cloneDeep(this.matl);
    }
    else {
      this.objectType = 'library';
      this.matl = find(this.lib.matls, function (o) { return o.id == id; });
      this.ui.geometry['libMatl'].elementIndex = findIndex(this.libMatls, { id: id });
      this.matlOld = cloneDeep(this.matl);
    }
  }

  /** Push new element */
  public add(library?: boolean) {
    // Create new matl object with unique id
    if (!library) {
      let element = { id: 'MATL' + this.mainService.getListId(this.matls) };
      this.matls.push(new Matl(JSON.stringify(element), this.ramps));
    }
    else {
      let element = { id: 'MATL' + this.mainService.getListId(this.libMatls) };
      this.libMatls.push(new Matl(JSON.stringify(element), this.libRamps));
    }
  }

  /** Delete element */
  public delete(id: string, library?: boolean) {
    if (!library) {
      let index = findIndex(this.matls, { id: id });
      this.matls.splice(index, 1);
      if (this.ui.geometry['matl'].elementIndex == index) {
        index > 1 ? this.activate(this.matls[index - 1].id) : this.activate(this.matls[index].id);
      }
    }
    else {
      let index = findIndex(this.libMatls, { id: id });
      this.libMatls.splice(index, 1);
      if (this.ui.geometry['libMatl'].elementIndex == index) {
        index > 1 ? this.activate(this.libMatls[index - 1].id, true) : this.activate(this.libMatls[index].id, true);
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.geometry, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.geometry().y);
  }

  /** Update CAD element */
  public updateCad() {
    this.matlOld = cloneDeep(this.matl);
    this.websocketService.syncUpdateItem("matl", this.matl);
  }

  /** Toggle library */
  public toggleLibrary() {
    this.ui.geometry['matl'].lib == 'closed' ? this.ui.geometry['matl'].lib = 'opened' : this.ui.geometry['matl'].lib = 'closed';
  }

  /** Import from library */
  public importLibraryItem(id: string) {
    let libMatl = find(this.lib.matls, function (o) { return o.id == id; });
    // Check if import ramps
    console.log(libMatl);

  }

  // COMPONENT METHODS
  /** Add ramp and activate */
  public addRamp(type: string, property?: string) {
    // Chcek if current or library
    if (this.objectType == 'current') {
      let element = { id: 'RAMP' + this.mainService.getListId(this.ramps), type: type };
      this.ramps.push(new Ramp(JSON.stringify(element)));
      if (property == 'conductivity') {
        this.matl.conductivity_ramp = find(this.ramps, (ramp) => {
          return ramp.id == element.id;
        });
      }
      else if (property == 'specific_heat') {
        this.matl.specific_heat_ramp = find(this.ramps, (ramp) => {
          return ramp.id == element.id;
        });
      }
    }
    else if (this.objectType == 'library') {
      let element = { id: 'RAMP' + this.mainService.getListId(this.libRamps), type: type };
      this.libRamps.push(new Ramp(JSON.stringify(element)));
      if (property == 'conductivity') {
        this.matl.conductivity_ramp = find(this.libRamps, (ramp) => {
          return ramp.id == element.id;
        });
      }
      else if (property == 'specific_heat') {
        this.matl.specific_heat_ramp = find(this.libRamps, (ramp) => {
          return ramp.id == element.id;
        });
      }
    }
  }


}
