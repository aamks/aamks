import { Component, OnInit, ViewChild } from '@angular/core';
import { Main } from '../../../../services/main/main';
import { Fds } from '../../../../services/fds-object/fds-object';
import { UiState } from '../../../../services/ui-state/ui-state';
import { Library } from '../../../../services/library/library';
import { Ramp } from '../../../../services/fds-object/ramp/ramp';
import { FdsEnums } from '../../../../enums/fds/enums/fds-enums';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { MainService } from '../../../../services/main/main.service';
import { UiStateService } from '../../../../services/ui-state/ui-state.service';
import { LibraryService } from '../../../../services/library/library.service';
import { cloneDeep, find, findIndex, set } from 'lodash';
import { IdGeneratorService } from '../../../../services/id-generator/id-generator.service';

@Component({
  selector: 'app-ramp',
  templateUrl: './ramp.component.html',
  styleUrls: ['./ramp.component.scss']
})
export class RampComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  rampsElement: any;
  ui: UiState;
  lib: Library;

  // Component objects
  libRamps: Ramp[];
  ramps: Ramp[];
  ramp: Ramp;
  rampOld: Ramp;
  objectType: string = 'current'; // Lib or current

  // Enums
  RAMP_TYPE = FdsEnums.RAMP.rampType;

  // Scrolbars containers
  @ViewChild('rampScrollbar') rampScrollbar: PerfectScrollbarComponent;
  @ViewChild('rampLibScrollbar') rampLibScrollbar: PerfectScrollbarComponent;

  constructor(
    private mainService: MainService,
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
    this.rampsElement = this.main.currentFdsScenario.fdsObject.ramps;
    this.ramps = this.main.currentFdsScenario.fdsObject.ramps.ramps;
    this.libRamps = this.lib.ramps;

    // Activate last element
    this.ramps.length > 0 ? this.ramp = this.ramps[this.ui.ramps['ramp'].elementIndex] : this.ramp = undefined;
  }

  ngAfterViewInit() {
    // Set scrollbars position y after view rendering and set last selected element
    this.rampScrollbar.directiveRef.scrollToY(this.ui.ramps['ramp'].scrollPosition);
    this.ramps.length > 0 && this.activate(this.ramps[this.ui.ramps['ramp'].elementIndex].id);
  }

  /** Activate element on click */
  public activate(id: string, library?: boolean) {
    if (!library) {
      this.objectType = 'current';
      this.ramp = find(this.fds.ramps.ramps, function (o) { return o.id == id; });
      this.ui.ramps['ramp'].elementIndex = findIndex(this.ramps, { id: id });
      this.rampOld = cloneDeep(this.ramp);
    }
    else {
      this.objectType = 'library';
      this.ramp = find(this.lib.ramps, function (o) { return o.id == id; });
      this.ui.ramps['libRamp'].elementIndex = findIndex(this.libRamps, { id: id });
      this.rampOld = cloneDeep(this.ramp);
    }
  }

  /** Push new element */
  public add(library?: boolean) {
    // Create new ramp object with unique id
    if (!library) {
      let element = { id: 'RAMP' + this.mainService.getListId(this.ramps, 'ramp') };
      this.ramps.push(new Ramp(JSON.stringify(element)));
      this.activate(element.id);
    }
    else {
      let element = { id: 'RAMP' + this.mainService.getListId(this.libRamps, 'ramp') };
      this.libRamps.push(new Ramp(JSON.stringify(element)));
      this.activate(element.id, true);
    }
  }

  /** Delete element */
  public delete(id: string, library?: boolean) {
    if (!library) {
      let index = findIndex(this.ramps, { id: id });
      this.ramps.splice(index, 1);
      if (this.ui.ramps['ramp'].elementIndex == index) {
        this.ramps.length == 0 ? this.ramp = undefined : this.activate(this.ramps[index - 1].id);
      }
    }
    else {
      let index = findIndex(this.libRamps, { id: id });
      this.libRamps.splice(index, 1);
      if (this.ui.ramps['libRamp'].elementIndex == index) {
        this.libRamps.length == 0 ? this.ramp = undefined : this.activate(this.libRamps[index - 1].id, true);
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.ramps, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.geometry().y);
  }

  /** Toggle library */
  public toggleLibrary() {
    this.ui.ramps['ramp'].lib == 'closed' ? this.ui.ramps['ramp'].lib = 'opened' : this.ui.ramps['ramp'].lib = 'closed';
  }

  /** Import from library */
  public importLibraryItem(id: string) {
    let idGeneratorService = new IdGeneratorService;
    let libRamp = find(this.lib.ramps, function (o) { return o.id == id; });
    if (libRamp.id) {
      // Check if ramp already exists
      let libRamp = find(this.ramps, function (o) { return o.id == libRamp.id });
      // If ramp do not exists import from library
      if (libRamp == undefined) {
        let libRamp = find(this.lib.ramps, function (o) { return o.id == libRamp.id });
        let ramp = cloneDeep(libRamp);
        ramp.uuid = idGeneratorService.genUUID();
        this.ramps.push(ramp);
      }
    }
    let ramp = cloneDeep(libRamp);
    ramp.uuid = idGeneratorService.genUUID()
    this.ramps.push(ramp);
  }

  // COMPONENT METHODS

}
