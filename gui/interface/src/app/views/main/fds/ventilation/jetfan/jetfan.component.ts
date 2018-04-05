import {FdsEnums} from '../../../../../enums/fds-enums';
import { JetFan } from '../../../../../services/fds-object/jet-fan';
import { Ramp } from '../../../../../services/fds-object/ramp';
import { UiStateService } from '../../../../../services/ui-state/ui-state.service';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';
import { MainService } from '../../../../../services/main/main.service';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { UiState } from '../../../../../services/ui-state/ui-state';
import { Fds } from '../../../../../services/fds-object/fds-object';
import { Main } from '../../../../../services/main/main';
import { Component, OnInit, ViewChild } from '@angular/core';
import { set, cloneDeep, find, forEach, findIndex } from 'lodash';
import { LibraryService } from '../../../../../services/library/library.service';
import { Library } from '../../../../../services/library/library';

@Component({
  selector: 'app-jetfan',
  templateUrl: './jetfan.component.html',
  styleUrls: ['./jetfan.component.scss']
})
export class JetfanComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  ventilation: any;
  ui: UiState;
  lib: Library;

  // Component objects
  jetfans: JetFan[];
  libJetfans: JetFan[];
  jetfan: JetFan;
  jetfanOld: JetFan;
  ramps: Ramp[];
  libRamps: Ramp[];
  objectType: string = 'current'; // Lib or current

  // Enums
  ENUMS_JETFAN = FdsEnums.JETFAN;

  // Scrolbars containers
  @ViewChild('jetfanScrollbar') jetfanScrollbar: PerfectScrollbarComponent;
  @ViewChild('jetfanLibScrollbar') jetfanLibScrollbar: PerfectScrollbarComponent;

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
    this.ventilation = this.main.currentFdsScenario.fdsObject.ventilation;
    this.jetfans = this.main.currentFdsScenario.fdsObject.ventilation.jetfans;
    this.libJetfans = this.lib.jetfans;
    this.ramps = this.main.currentFdsScenario.fdsObject.ramps.ramps;
    this.libRamps = this.lib.ramps;

    // Activate last element
    this.jetfans.length > 0 ? this.jetfan = this.jetfans[this.ui.ventilation['jetfan'].elementIndex] : this.jetfan = undefined;

    // Subscribe websocket requests status for websocket CAD sync
    this.websocketService.requestStatus.subscribe(
      (status) => {
        if (status == 'error') {
          this.jetfan = cloneDeep(this.jetfanOld);
          console.log('Cannot sync jetfan ...');
        }
        else if (status == 'success') {
          this.jetfanOld = cloneDeep(this.jetfan);
          console.log('Mesh updated ...')
        }
      },
      (error) => {
        this.jetfan = cloneDeep(this.jetfanOld);
        console.log('Cannot sync jetfan ...');
      }
    );
  }

  ngAfterViewInit() {
    // Set scrollbars position y after view rendering and set last selected element
    this.jetfanScrollbar.directiveRef.scrollToY(this.ui.ventilation['jetfan'].scrollPosition);
    this.activate(this.jetfans[this.ui.ventilation['jetfan'].elementIndex].id);
  }

  /** Activate element on click */
  public activate(id: string, library?: boolean) {
    if (!library) {
      this.objectType = 'current';
      this.jetfan = find(this.fds.ventilation.jetfans, function (o) { return o.id == id; });
      this.ui.ventilation['jetfan'].elementIndex = findIndex(this.jetfans, { id: id });
      this.jetfanOld = cloneDeep(this.jetfan);
    }
    else {
      this.objectType = 'library';
      this.jetfan = find(this.lib.jetfans, function (o) { return o.id == id; });
      this.ui.ventilation['libJetfan'].elementIndex = findIndex(this.libJetfans, { id: id });
      this.jetfanOld = cloneDeep(this.jetfan);
    }
  }

  /** Push new element */
  public add(library?: boolean) {
    // Create new jetfan object with unique id
    if (!library) {
      let element = { id: 'JETFAN' + this.mainService.getListId(this.jetfans, 'jetfan') };
      this.jetfans.push(new JetFan(JSON.stringify(element), this.ramps));
    }
    else {
      let element = { id: 'JETFAN' + this.mainService.getListId(this.libJetfans, 'jetfan') };
      this.libJetfans.push(new JetFan(JSON.stringify(element), this.libRamps));
    }
  }

  /** Delete element */
  public delete(id: string, library?: boolean) {
    if (!library) {
      let index = findIndex(this.jetfans, { id: id });
      this.jetfans.splice(index, 1);
      if (this.ui.ventilation['jetfan'].elementIndex == index) {
        index >= 1 ? this.activate(this.jetfans[index - 1].id) : this.jetfan = undefined;
      }
    }
    else {
      let index = findIndex(this.libJetfans, { id: id });
      this.libJetfans.splice(index, 1);
      if (this.ui.ventilation['libJetfan'].elementIndex == index) {
        index >= 1 ? this.activate(this.libJetfans[index - 1].id, true) : this.jetfan = undefined;
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.ventilation, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.geometry().y);
  }

  /** Update CAD element */
  public updateCad() {
    this.jetfanOld = cloneDeep(this.jetfan);
    this.websocketService.syncUpdateItem("jetfan", this.jetfan);
  }

  /** Toggle library */
  public toggleLibrary() {
    this.ui.ventilation['jetfan'].lib == 'closed' ? this.ui.ventilation['jetfan'].lib = 'opened' : this.ui.ventilation['jetfan'].lib = 'closed';
  }

  /** Import from library */
  public importLibraryItem(id: string) {
    let libJetfan = find(this.lib.jetfans, function (o) { return o.id == id; });
    // Check if import ramps
    console.log(libJetfan);

  }

  // COMPONENT METHODS
  /** Add ramp and activate */
  public addRamp(type: string) {
    // Chcek if current or library
    if (this.objectType == 'current') {
      let element = { id: 'RAMP' + this.mainService.getListId(this.ramps), type: type };
      this.ramps.push(new Ramp(JSON.stringify(element)));
      this.jetfan.ramp = find(this.ramps, (ramp) => {
        return ramp.id == element.id;
      });
    }
    else if (this.objectType == 'library') {
      let element = { id: 'RAMP' + this.mainService.getListId(this.libRamps), type: type };
      this.libRamps.push(new Ramp(JSON.stringify(element)));
      this.jetfan.ramp = find(this.libRamps, (ramp) => {
        return ramp.id == element.id;
      });
    }
  }

}
