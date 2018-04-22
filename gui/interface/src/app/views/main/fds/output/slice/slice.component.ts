import { Component, OnInit, ViewChild } from '@angular/core';
import { Main } from '../../../../../services/main/main';
import { Fds } from '../../../../../services/fds-object/fds-object';
import { UiState } from '../../../../../services/ui-state/ui-state';
import { Library } from '../../../../../services/library/library';
import { Slcf } from '../../../../../services/fds-object/output/slcf';
import { quantities } from '../../../../../enums/fds/enums/fds-enums-quantities';
import { filter, map, includes, cloneDeep, find, findIndex, set, remove, merge } from 'lodash';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { MainService } from '../../../../../services/main/main.service';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';
import { UiStateService } from '../../../../../services/ui-state/ui-state.service';
import { LibraryService } from '../../../../../services/library/library.service';
import { IdGeneratorService } from '../../../../../services/id-generator/id-generator.service';
import { FdsEnums } from '../../../../../enums/fds/enums/fds-enums';
import { Quantity } from '../../../../../services/fds-object/primitives';
import { NotifierService } from 'angular-notifier';
import { Spec } from '../../../../../services/fds-object/specie/spec';
import { species } from '../../../../../enums/fds/enums/fds-enums-species';

@Component({
  selector: 'app-slice',
  templateUrl: './slice.component.html',
  styleUrls: ['./slice.component.scss']
})
export class SliceComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  ui: UiState;
  lib: Library;

  // Component objects
  slcfs: Slcf[];
  libSlcfs: Slcf[];
  slcf: Slcf;
  slcfOld: Slcf;
  objectType: string = 'current'; // Lib or current

  // Enums
  QUANTITIES = map(filter(quantities, function (o) { return includes(o.type, 's') }), function (o) { return new Quantity(JSON.stringify(o)) });
  DIRECTIONS = FdsEnums.SLCF.directions;
  SPECIES: Spec[];

  // Scrolbars containers
  @ViewChild('slcfScrollbar') slcfScrollbar: PerfectScrollbarComponent;
  @ViewChild('slcfLibScrollbar') slcfLibScrollbar: PerfectScrollbarComponent;

  constructor(
    private mainService: MainService,
    private websocketService: WebsocketService,
    private uiStateService: UiStateService,
    private libraryService: LibraryService,
    private readonly notifierService: NotifierService,
  ) { }

  ngOnInit() {
    console.clear();
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.uiStateService.getUiState().subscribe(ui => this.ui = ui);
    this.libraryService.getLibrary().subscribe(lib => this.lib = lib);

    // Assign to local variables
    this.fds = this.main.currentFdsScenario.fdsObject;
    this.slcfs = this.main.currentFdsScenario.fdsObject.output.slcfs;
    this.libSlcfs = this.lib.slcfs;

    // Activate last element
    this.slcfs.length > 0 ? this.slcf = this.slcfs[this.ui.output['slcf'].elementIndex] : this.slcf = undefined;

    this.SPECIES = merge(map(species, function(o) { return new Spec(JSON.stringify(o)) }), this.main.currentFdsScenario.fdsObject.specie.specs);

    // Subscribe websocket requests status for websocket CAD sync
    this.websocketService.requestStatus.subscribe(
      (status) => {
        if (status == 'error') {
          this.slcf = cloneDeep(this.slcfOld);
          console.log('Cannot sync slcf ...');
        }
        else if (status == 'success') {
          this.slcfOld = cloneDeep(this.slcf);
          console.log('Mesh updated ...')
        }
      },
      (error) => {
        this.slcf = cloneDeep(this.slcfOld);
        console.log('Cannot sync slcf ...');
      }
    );
  }

  ngAfterViewInit() {
    // Set scrollbars position y after view rendering and set last selected element
    this.slcfScrollbar.directiveRef.scrollToY(this.ui.output['slcf'].scrollPosition);
    this.slcfs.length > 0 && this.activate(this.slcfs[this.ui.output['slcf'].elementIndex].id);
  }

  /** Activate element on click */
  public activate(id: string, library?: boolean) {
    if (!library) {
      this.objectType = 'current';
      this.slcf = find(this.fds.output.slcfs, function (o) { return o.id == id; });
      this.ui.output['slcf'].elementIndex = findIndex(this.slcfs, { id: id });
      this.slcfOld = cloneDeep(this.slcf);
    }
    else {
      this.objectType = 'library';
      this.slcf = find(this.lib.slcfs, function (o) { return o.id == id; });
      this.ui.output['libSlcf'].elementIndex = findIndex(this.libSlcfs, { id: id });
      this.slcfOld = cloneDeep(this.slcf);
    }
  }

  /** Push new element */
  public add(library?: boolean) {
    // Create new slcf object with unique id
    if (!library) {
      let element = { id: 'SLCF' + this.mainService.getListId(this.slcfs, 'slcf') };
      this.slcfs.push(new Slcf(JSON.stringify(element), this.fds.specie.specs, this.fds.parts.parts));
      this.activate(element.id);
    }
    else {
      let element = { id: 'SLCF' + this.mainService.getListId(this.libSlcfs, 'slcf') };
      this.libSlcfs.push(new Slcf(JSON.stringify(element), this.lib.specs)); // Add parts ... !!!
      this.activate(element.id, true);
    }
  }

  /** Delete element */
  public delete(id: string, library?: boolean) {
    if (!library) {
      let index = findIndex(this.slcfs, { id: id });
      this.slcfs.splice(index, 1);
      if (this.ui.output['slcf'].elementIndex == index) {
        this.slcfs.length == 0 ? this.slcf = undefined : this.activate(this.slcfs[index - 1].id);
      }
    }
    else {
      let index = findIndex(this.libSlcfs, { id: id });
      this.libSlcfs.splice(index, 1);
      if (this.ui.output['libSlcf'].elementIndex == index) {
        this.libSlcfs.length == 0 ? this.slcf = undefined : this.activate(this.libSlcfs[index - 1].id, true);
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.output, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.slcfs().y);
  }

  /** Update CAD element */
  public updateCad() {
    this.slcfOld = cloneDeep(this.slcf);
    this.websocketService.syncUpdateItem("slcf", this.slcf);
  }

  /** Toggle library */
  public toggleLibrary() {
    this.ui.output['slcf'].lib == 'closed' ? this.ui.output['slcf'].lib = 'opened' : this.ui.output['slcf'].lib = 'closed';
  }

  /** Import from library */
  public importLibraryItem(id: string) {
    let idGeneratorService = new IdGeneratorService;
    let libSlcf = find(this.lib.slcfs, function (o) { return o.id == id; });
    let slcf = cloneDeep(libSlcf);
    slcf.uuid = idGeneratorService.genUUID()
    this.slcfs.push(slcf);
  }

  /** Import from library */
  public mergeLibraryItem(id: string) {
    let libSlcf = find(this.lib.slcfs, function (o) { return o.id == id; });
    if (this.slcf != undefined) {
      remove(this.slcf.quantities);
      this.slcf.quantities = libSlcf.quantities;
    }
    else {
        this.notifierService.notify('warning', 'Select current slcf before merging');
    }
  }

  // COMPONENT METHODS
  public showSpecs(): boolean {
    let specs = filter(this.slcf.quantities, function(o: Quantity) { return o.spec == true; });
    let show = specs.length > 0 ? true : false;
    return show;
  }

  public showParts(): boolean {
    let parts = filter(this.slcf.quantities, function(o: Quantity) { return o.part == true; });
    let show = parts.length > 0 ? true : false;
    return show;
  }

}
