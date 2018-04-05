import {FdsEnums} from '../../../../../enums/fds-enums';
import {PerfectScrollbarComponent} from 'ngx-perfect-scrollbar';
import { UiStateService } from '../../../../../services/ui-state/ui-state.service';
import { MainService } from '../../../../../services/main/main.service';
import { Matl } from '../../../../../services/fds-object/matl';
import { UiState } from '../../../../../services/ui-state/ui-state';
import { Fds } from '../../../../../services/fds-object/fds-object';
import { Main } from '../../../../../services/main/main';
import { Component, OnInit, ViewChild } from '@angular/core';
import { set, cloneDeep, find, forEach, findIndex } from 'lodash';
import { LibraryService } from '../../../../../services/library/library.service';
import { Library } from '../../../../../services/library/library';

@Component({
  selector: 'app-combustion',
  templateUrl: './combustion.component.html',
  styleUrls: ['./combustion.component.scss']
})
export class CombustionComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  fires: any;
  ui: UiState;
  lib: Library;

  // Component objects
  objectType: string = 'current'; // Lib or current

  // Enums
  radcals = FdsEnums.radcals;

  // Scrolbars containers
  @ViewChild('fuelLibScrollbar') fuelLibScrollbar: PerfectScrollbarComponent;

  constructor(
    private mainService: MainService,
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
    this.fires = this.main.currentFdsScenario.fdsObject.fires;
  }

  ngAfterViewInit() {
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.fires, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.geometry().y);
  }

  /** Toggle library */
  public toggleLibrary() {
    this.ui.fires['fuel'].lib == 'closed' ? this.ui.fires['fuel'].lib = 'opened' : this.ui.fires['fuel'].lib = 'closed';
  }

  /** Import from library */
  public importLibraryItem(id: string) {
    let libFuel = find(this.lib.matls, function (o) { return o.id == id; });
    // Check if import ramps
    console.log(libFuel);

  }

  // COMPONENT METHODS


}
