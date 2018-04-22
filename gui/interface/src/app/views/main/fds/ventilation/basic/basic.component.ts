import { LibraryService } from '../../../../../services/library/library.service';
import { Library } from '../../../../../services/library/library';
import { Ramp } from '../../../../../services/fds-object/ramp/ramp';
import { UiStateService } from '../../../../../services/ui-state/ui-state.service';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';
import { MainService } from '../../../../../services/main/main.service';
import { FdsEnums } from '../../../../../enums/fds/enums/fds-enums';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { Vent } from '../../../../../services/fds-object/ventilation/vent';
import { UiState } from '../../../../../services/ui-state/ui-state';
import { Fds } from '../../../../../services/fds-object/fds-object';
import { Main } from '../../../../../services/main/main';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SurfVent } from '../../../../../services/fds-object/ventilation/surf-vent';
import { find, findIndex, cloneDeep, set } from 'lodash';
import { IdGeneratorService } from '../../../../../services/id-generator/id-generator.service';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss']
})
export class BasicComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  ventilation: any;
  ui: UiState;
  lib: Library;

  // Component objects
  vents: Vent[];
  vent: Vent;
  ventOld: Vent;
  surfs: SurfVent[];
  libSurfs: SurfVent[];
  surf: SurfVent;
  surfOld: SurfVent;
  ramps: Ramp[];
  libRamps: Ramp[];
  objectType: string = 'current'; // Lib or current

  // Scrolbars containers
  @ViewChild('ventScrollbar') ventScrollbar: PerfectScrollbarComponent;
  @ViewChild('surfScrollbar') surfScrollbar: PerfectScrollbarComponent;
  @ViewChild('surfLibScrollbar') surfLibScrollbar: PerfectScrollbarComponent;

  // Enums
  ENUMS_SURF = FdsEnums.SURF;

  constructor(
    private mainService: MainService,
    private websocketService: WebsocketService,
    private uiStateService: UiStateService,
    private libraryService: LibraryService
  ) { }

  ngOnInit() {
    console.clear();
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.uiStateService.getUiState().subscribe(ui => this.ui = ui);
    this.libraryService.getLibrary().subscribe(lib => this.lib = lib);

    // Assign to local variables
    this.fds = this.main.currentFdsScenario.fdsObject;
    this.ventilation = this.main.currentFdsScenario.fdsObject.ventilation;
    this.vents = this.main.currentFdsScenario.fdsObject.ventilation.vents;
    this.surfs = this.main.currentFdsScenario.fdsObject.ventilation.surfs;
    this.ramps = this.main.currentFdsScenario.fdsObject.ramps.ramps;
    this.libRamps = this.lib.ramps;
    this.libSurfs = this.lib.ventsurfs;

    // Activate last element
    this.vents.length > 0 ? this.vent = this.vents[this.ui.ventilation['vent'].elementIndex] : this.vent = undefined;
    this.surfs.length > 0 ? this.surf = this.surfs[this.ui.ventilation['surf'].elementIndex] : this.surf = undefined;

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
    this.ventScrollbar.directiveRef.scrollToY(this.ui.ventilation['vent'].scrollPosition);
    this.surfScrollbar.directiveRef.scrollToY(this.ui.ventilation['surf'].scrollPosition);
    this.vents.length > 0 && this.activate(this.vents[this.ui.ventilation['vent'].elementIndex].id, 'vent');
    this.surfs.length > 0 && this.activate(this.surfs[this.ui.ventilation['surf'].elementIndex].id, 'surf');
  }

  /** Activate element on click */
  public activate(id: string, type: string = '', library?: boolean) {
    if (type == 'vent') {
      this.vent = find(this.fds.ventilation.vents, function (o) { return o.id == id; });
      this.ui.ventilation['vent'].elementIndex = findIndex(this.vents, { id: id });
      this.ventOld = cloneDeep(this.vent);
    }
    else if (type == 'surf') {
      if (!library) {
        this.objectType = 'current';
        this.surf = find(this.fds.ventilation.surfs, function (o) { return o.id == id; });
        this.ui.ventilation['surf'].elementIndex = findIndex(this.surfs, { id: id });
        this.surfOld = cloneDeep(this.surf);
      }
      else {
        this.objectType = 'library';
        this.surf = find(this.lib.ventsurfs, function (o) { return o.id == id; });
        this.ui.geometry['libSurf'].elementIndex = findIndex(this.libSurfs, { id: id });
        this.surfOld = cloneDeep(this.surf);
      }
    }
  }

  /** Push new element */
  public add(type: string = '', library?: boolean) {
    if (type == 'vent') {
      let element = { id: 'VENT' + this.mainService.getListId(this.vents) };
      this.vents.push(new Vent(JSON.stringify(element)));
      this.activate(element.id, 'vent');
    }
    else if (type == 'surf') {
      if (!library) {
        let element = { id: 'SURF' + this.mainService.getListId(this.surfs) };
        this.surfs.push(new SurfVent(JSON.stringify(element), this.ramps));
        this.activate(element.id, 'surf');
      }
      else {
        let element = { id: 'SURF' + this.mainService.getListId(this.libSurfs) };
        this.libSurfs.push(new SurfVent(JSON.stringify(element), this.libRamps));
        this.activate(element.id, 'surf', true);
      }
    }
  }

  /** Delete element */
  public delete(id: string, type: string = '', library?: boolean) {
    if (type == 'vent') {
      let index = findIndex(this.vents, { id: id });
      this.vents.splice(index, 1);
      if (this.ui.ventilation['vent'].elementIndex == index) {
        this.vents.length == 0 ? this.vent = undefined : this.activate(this.vents[index - 1].id);
      }
    }
    else if (type == 'surf') {
      if (!library) {
        let index = findIndex(this.surfs, { id: id });
        this.surfs.splice(index, 1);
        if (this.ui.ventilation['surf'].elementIndex == index) {
          this.surfs.length == 0 ? this.surf = undefined : this.activate(this.surfs[index - 1].id);
        }
      }
      else {
        let index = findIndex(this.libSurfs, { id: id });
        this.libSurfs.splice(index, 1);
        if (this.ui.ventilation['libSurf'].elementIndex == index) {
          this.libSurfs.length == 0 ? this.surf = undefined : this.activate(this.libSurfs[index - 1].id, 'surf', true);
        }
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.ventilation, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.geometry().y);
  }

  /** Update CAD element */
  public updateCad(type: string = '') {
    if (type == 'vent') {
      this.ventOld = cloneDeep(this.vent);
      this.websocketService.syncUpdateItem("vent", this.vent);
    }
    else if (type == 'surf') {
      this.surfOld = cloneDeep(this.surf);
      this.websocketService.syncUpdateItem("surf", this.surf);
    }
  }

  /** Toggle library */
  public toggleLibrary() {
    this.ui.ventilation['surf'].lib == 'closed' ? this.ui.ventilation['surf'].lib = 'opened' : this.ui.ventilation['surf'].lib = 'closed';
  }

  /** Import from library */
  public importLibraryItem(id: string) {
    let idGeneratorService = new IdGeneratorService;
    let libSurf = find(this.lib.ventsurfs, function (o) { return o.id == id; });
    let ramp = undefined;
    let libRamp = undefined;
    if (libSurf.ramp.id) {
      // Check if ramp already exists
      libRamp = find(this.ramps, function (o) { return o.id == libSurf.ramp.id });
      // If ramp do not exists import from library
      if (libRamp == undefined) {
        let libRamp = find(this.lib.ramps, function (o) { return o.id == libSurf.ramp.id });
        ramp = cloneDeep(libRamp);
        ramp.uuid = idGeneratorService.genUUID();
        this.ramps.push(ramp);
      } 
      else {
        // TODO: warrning that ramp was not imported because name already exists
      }
    }
    let surf = cloneDeep(libSurf);
    surf.uuid = idGeneratorService.genUUID()
    surf.ramp = ramp != undefined ? ramp : libRamp;
    this.surfs.push(surf);
  }

  // COMPONENT METHODS
  /** Add ramp and activate */
  public addRamp(type: string, property?: string) {
    // Chcek if current or library
    if (this.objectType == 'current') {
      let element = { id: 'RAMP' + this.mainService.getListId(this.ramps), type: type };
      this.ramps.push(new Ramp(JSON.stringify(element)));
      this.surf.ramp = find(this.ramps, (ramp) => {
        return ramp.id == element.id;
      });
    }
    else if (this.objectType == 'library') {
      let element = { id: 'RAMP' + this.mainService.getListId(this.libRamps), type: type };
      this.libRamps.push(new Ramp(JSON.stringify(element)));
      this.surf.ramp = find(this.libRamps, (ramp) => {
        return ramp.id == element.id;
      });
    }
  }


}
