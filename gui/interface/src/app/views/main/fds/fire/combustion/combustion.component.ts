import {FdsEnums} from '../../../../../enums/fds-enums';
import {PerfectScrollbarComponent} from 'ngx-perfect-scrollbar';
import { UiStateService } from '../../../../../services/ui-state/ui-state.service';
import { MainService } from '../../../../../services/main/main.service';
import { Matl } from '../../../../../services/fds-object/geometry/matl';
import { UiState } from '../../../../../services/ui-state/ui-state';
import { Fds } from '../../../../../services/fds-object/fds-object';
import { Main } from '../../../../../services/main/main';
import { Component, OnInit, ViewChild } from '@angular/core';
import { set, cloneDeep, find, forEach, findIndex } from 'lodash';
import { LibraryService } from '../../../../../services/library/library.service';
import { Library } from '../../../../../services/library/library';
import { Combustion } from '../../../../../services/fds-object/fire/combustion';

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

  // Component objects
  combustion: Combustion;
  objectType: string = 'current'; // Lib or current

  // Enums
  RADCALS = FdsEnums.radcals;

  constructor(
    private mainService: MainService,
    private uiStateService: UiStateService,
    private libraryService: LibraryService
  ) { }

  ngOnInit() {
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    this.uiStateService.getUiState().subscribe(ui => this.ui = ui);

    // Assign to local variables
    this.fds = this.main.currentFdsScenario.fdsObject;
    this.fires = this.main.currentFdsScenario.fdsObject.fires;
  }

  ngAfterViewInit() {
  }

  // COMPONENT METHODS


}
