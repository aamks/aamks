import { Matl } from '../../../../../services/fds-object/matl';
import { LibraryService } from '../../../../../services/library/library.service';
import { UiStateService } from '../../../../../services/ui-state/ui-state.service';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';
import { MainService } from '../../../../../services/main/main.service';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { Surf } from '../../../../../services/fds-object/surf';
import { Library } from '../../../../../services/library/library';
import { UiState } from '../../../../../services/ui-state/ui-state';
import { Fds } from '../../../../../services/fds-object/fds-object';
import { Main } from '../../../../../services/main/main';
import { Component, OnInit, ViewChild } from '@angular/core';
import { cloneDeep, find, set, findIndex } from 'lodash';
import { FdsEnums } from '../../../../../enums/fds-enums';

@Component({
  selector: 'app-surface',
  templateUrl: './surface.component.html',
  styleUrls: ['./surface.component.scss']
})
export class SurfaceComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  geometry: object;
  ui: UiState;
  lib: Library;

  // Component objects
  surfs: Surf[];
  libSurfs: Surf[];
  surf: Surf;
  surfOld: Surf;
  matls: Matl[];
  libMatls: Matl[];
  objectType: string = 'current'; // Lib or current

  // Scrolbars containers
  @ViewChild('surfScrollbar') surfScrollbar: PerfectScrollbarComponent;

  // Enums
  COLORS = FdsEnums.color;
  BACKING = FdsEnums.SURF.surfaceBacking;

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
    this.surfs = this.main.currentFdsScenario.fdsObject.geometry.surfs;
    this.libSurfs = this.lib.surfs;
    this.matls = this.main.currentFdsScenario.fdsObject.geometry.matls;
    this.libMatls = this.lib.matls;

    // Activate last element
    this.surfs.length > 0 ? this.surf = this.surfs[this.ui.geometry['surf'].elementIndex] : undefined;

    // Subscribe websocket requests status for websocket CAD sync
    this.websocketService.requestStatus.subscribe(
      (status) => {
        if (status == 'error') {
          this.surf = cloneDeep(this.surfOld);
          console.log('Cannot sync matl ...');
        }
        else if (status == 'success') {
          this.surfOld = cloneDeep(this.surf);
          console.log('Mesh updated ...')
        }
      },
      (error) => {
        this.surf = cloneDeep(this.surfOld);
        console.log('Cannot sync matl ...');
      }
    );
  }

  ngAfterViewInit() {
    // Set scrollbars position y after view rendering and set last selected element
    this.surfScrollbar.directiveRef.scrollToY(this.ui.geometry['surf'].scrollPosition);
    this.activate(this.surfs[this.ui.geometry['surf'].elementIndex].id);
  }

  /** Activate element on click */
  public activate(id: string, library?: boolean) {
    if (!library) {
      this.objectType = 'current';
      this.surf = find(this.fds.geometry.surfs, function (o) { return o.id == id; });
      this.ui.geometry['surf'].elementIndex = findIndex(this.surfs, { id: id });
      this.surfOld = cloneDeep(this.surf);
      //console.log(this.surf);
    }
    else {
      this.objectType = 'library';
      this.surf = find(this.lib.surfs, function (o) { return o.id == id; });
      this.ui.geometry['libSurf'].elementIndex = findIndex(this.libSurfs, { id: id });
      this.surfOld = cloneDeep(this.surf);
    }
  }

  /** Push new element */
  public add(library?: boolean) {
    // Create new surf object with unique id
    if (!library) {
      let element = { id: 'SURF' + this.mainService.getListId(this.surfs) };
      this.surfs.push(new Surf(JSON.stringify(element), this.matls));
    }
    else {
      let element = { id: 'MATL' + this.mainService.getListId(this.libSurfs) };
      this.libSurfs.push(new Surf(JSON.stringify(element), this.libMatls));
    }
  }

  /** Delete element */
  public delete(id: string, library?: boolean) {
    if (!library) {
      let index = findIndex(this.surfs, { id: id });
      this.surfs.splice(index, 1);
      if (this.ui.geometry['surf'].elementIndex == index) {
        index > 1 ? this.activate(this.surfs[index - 1].id) : this.activate(this.surfs[index].id);
      }
    }
    else {
      let index = findIndex(this.libSurfs, { id: id });
      this.libSurfs.splice(index, 1);
      if (this.ui.geometry['libMatl'].elementIndex == index) {
        index > 1 ? this.activate(this.libSurfs[index - 1].id, true) : this.activate(this.libSurfs[index].id, true);
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.geometry, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.geometry().y);
  }

  /** Update CAD element */
  public updateCad() {
    this.surfOld = cloneDeep(this.surf);
    this.websocketService.syncUpdateItem("surf", this.surf);
  }

  /** Toggle library */
  public toggleLibrary() {
    this.ui.geometry['surf'].lib == 'closed' ? this.ui.geometry['surf'].lib = 'opened' : this.ui.geometry['surf'].lib = 'closed';
  }

  /** Import from library */
  public importLibraryItem(id: string) {
    //let libMatl = find(this.lib.surfs, function (o) { return o.id == id; });
    // Check if import ramps
  }

  // COMPONENT METHODS

  public addLayer() {
    this.surf.addLayer();
  }

  public deleteLayer(layerIndex: number) {
    this.surf.deleteLayer(layerIndex);
  }

  public addMaterial(layerIndex: number) {
    this.surf.addMaterial(layerIndex);
  }

  public changeMaterial() {
    console.log('dupaaaa');
  }

  public deleteMaterial(layerIndex: number, materialIndex: number) {
    this.surf.deleteMaterial(layerIndex, materialIndex);
  }

}
