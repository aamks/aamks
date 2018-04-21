import { Component, OnInit, ViewChild } from '@angular/core';
import { Main } from '../../../../../services/main/main';
import { Fds } from '../../../../../services/fds-object/fds-object';
import { UiState } from '../../../../../services/ui-state/ui-state';
import { Library } from '../../../../../services/library/library';
import { Spec } from '../../../../../services/fds-object/specie/spec';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { MainService } from '../../../../../services/main/main.service';
import { UiStateService } from '../../../../../services/ui-state/ui-state.service';
import { LibraryService } from '../../../../../services/library/library.service';
import { find, findIndex, cloneDeep, set } from 'lodash';
import { IdGeneratorService } from '../../../../../services/id-generator/id-generator.service';

@Component({
  selector: 'app-spec',
  templateUrl: './spec.component.html',
  styleUrls: ['./spec.component.scss']
})
export class SpecComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  ui: UiState;
  lib: Library;

  // Component objects
  specs: Spec[];
  libSpecs: Spec[];
  spec: Spec;
  specOld: Spec;
  objectType: string = 'current'; // Lib or current

  // Enums

  // Scrolbars containers
  @ViewChild('specScrollbar') specScrollbar: PerfectScrollbarComponent;
  @ViewChild('specLibScrollbar') specLibScrollbar: PerfectScrollbarComponent;

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
    this.specs = this.main.currentFdsScenario.fdsObject.specie.specs;
    this.libSpecs = this.lib.specs;

    // Activate last element
    this.specs.length > 0 ? this.spec = this.specs[this.ui.specie['spec'].elementIndex] : this.spec = undefined;

  }

  ngAfterViewInit() {
    // Set scrollbars position y after view rendering and set last selected element
    this.specScrollbar.directiveRef.scrollToY(this.ui.specie['spec'].scrollPosition);
    this.specs.length > 0 && this.activate(this.specs[this.ui.specie['spec'].elementIndex].id);
  }

  /** Activate element on click */
  public activate(id: string, library?: boolean) {
    if (!library) {
      this.objectType = 'current';
      this.spec = find(this.fds.specie.specs, function (o) { return o.id == id; });
      this.ui.specie['spec'].elementIndex = findIndex(this.specs, { id: id });
      this.specOld = cloneDeep(this.spec);
    }
    else {
      this.objectType = 'library';
      this.spec = find(this.lib.specs, function (o) { return o.id == id; });
      this.ui.specie['libSpec'].elementIndex = findIndex(this.libSpecs, { id: id });
      this.specOld = cloneDeep(this.spec);
    }
  }

  /** Push new element */
  public add(library?: boolean) {
    // Create new fire object with unique id
    if (!library) {
      let element = { id: 'SPEC' + this.mainService.getListId(this.specs, 'spec') };
      this.specs.push(new Spec(JSON.stringify(element)));
      this.activate(element.id);
    }
    else {
      let element = { id: 'SPEC' + this.mainService.getListId(this.libSpecs, 'spec') };
      this.libSpecs.push(new Spec(JSON.stringify(element)));
      this.activate(element.id, true);
    }
  }

  /** Delete element */
  public delete(id: string, library?: boolean) {
    if (!library) {
      let index = findIndex(this.specs, { id: id });
      this.specs.splice(index, 1);
      if (this.ui.specie['spec'].elementIndex == index) {
        this.specs.length == 0 ? this.spec = undefined : this.activate(this.specs[index - 1].id);
      }
    }
    else {
      let index = findIndex(this.libSpecs, { id: id });
      this.libSpecs.splice(index, 1);
      if (this.ui.specie['libSpec'].elementIndex == index) {
        this.libSpecs.length == 0 ? this.spec = undefined : this.activate(this.libSpecs[index - 1].id, true);
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.specie, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.fires().y);
  }

  /** Toggle library */
  public toggleLibrary() {
    this.ui.specie['spec'].lib == 'closed' ? this.ui.specie['spec'].lib = 'opened' : this.ui.specie['spec'].lib = 'closed';
  }

  /** Import from library */
  public importLibraryItem(id: string) {
    let idGeneratorService = new IdGeneratorService;
    let libSpec = find(this.lib.specs, function (o) { return o.id == id; });
    let spec = cloneDeep(libSpec);
    spec.uuid = idGeneratorService.genUUID()
    this.specs.push(spec);
  }

  // COMPONENT METHODS

}
