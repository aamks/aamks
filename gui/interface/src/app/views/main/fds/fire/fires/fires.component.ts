import {FdsEnums} from '../../../../../enums/fds-enums';
import {Fire} from '../../../../../services/fds-object/fire';
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
import { IdGeneratorService } from '../../../../../services/id-generator/id-generator.service';

@Component({
  selector: 'app-fires',
  templateUrl: './fires.component.html',
  styleUrls: ['./fires.component.scss']
})
export class FiresComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;
  ui: UiState;
  lib: Library;

  // Component objects
  fires: Fire[];
  libFires: Fire[];
  fire: Fire;
  fireOld: Fire;
  ramps: Ramp[];
  libRamps: Ramp[];
  objectType: string = 'current'; // Lib or current

  // Enums
  ENUMS_FIRE = FdsEnums.FIRE;

  // Scrolbars containers
  @ViewChild('fireScrollbar') fireScrollbar: PerfectScrollbarComponent;
  @ViewChild('fireLibScrollbar') fireLibScrollbar: PerfectScrollbarComponent;

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
    this.fires = this.main.currentFdsScenario.fdsObject.fires.fires;
    this.libFires = this.lib.fires;
    this.ramps = this.main.currentFdsScenario.fdsObject.ramps.ramps;
    this.libRamps = this.lib.ramps;

    // Activate last element
    this.fires.length > 0 ? this.fire = this.fires[this.ui.fires['fire'].elementIndex] : this.fire = undefined;

    // Subscribe websocket requests status for websocket CAD sync
    this.websocketService.requestStatus.subscribe(
      (status) => {
        if (status == 'error') {
          this.fire = cloneDeep(this.fireOld);
          console.log('Cannot sync fire ...');
        }
        else if (status == 'success') {
          this.fireOld = cloneDeep(this.fire);
          console.log('Mesh updated ...')
        }
      },
      (error) => {
        this.fire = cloneDeep(this.fireOld);
        console.log('Cannot sync fire ...');
      }
    );
  }

  ngAfterViewInit() {
    // Set scrollbars position y after view rendering and set last selected element
    this.fireScrollbar.directiveRef.scrollToY(this.ui.fires['fire'].scrollPosition);
    this.fires.length > 0 && this.activate(this.fires[this.ui.fires['fire'].elementIndex].id);
  }

  /** Activate element on click */
  public activate(id: string, library?: boolean) {
    if (!library) {
      this.objectType = 'current';
      this.fire = find(this.fds.fires.fires, function (o) { return o.id == id; });
      this.ui.fires['fire'].elementIndex = findIndex(this.fires, { id: id });
      this.fireOld = cloneDeep(this.fire);
    }
    else {
      this.objectType = 'library';
      this.fire = find(this.lib.fires, function (o) { return o.id == id; });
      this.ui.fires['libFire'].elementIndex = findIndex(this.libFires, { id: id });
      this.fireOld = cloneDeep(this.fire);
    }
  }

  /** Push new element */
  public add(library?: boolean) {
    // Create new fire object with unique id
    if (!library) {
      let element = { id: 'FIRE' + this.mainService.getListId(this.fires, 'fire') };
      this.fires.push(new Fire(JSON.stringify(element), this.ramps));
      this.activate(element.id);
    }
    else {
      let element = { id: 'FIRE' + this.mainService.getListId(this.libFires, 'fire') };
      this.libFires.push(new Fire(JSON.stringify(element), this.libRamps));
      this.activate(element.id, true);
    }
  }

  /** Delete element */
  public delete(id: string, library?: boolean) {
    if (!library) {
      let index = findIndex(this.fires, { id: id });
      this.fires.splice(index, 1);
      if (this.ui.fires['fire'].elementIndex == index) {
        this.fires.length == 0 ? this.fire = undefined : this.activate(this.fires[index - 1].id);
      }
    }
    else {
      let index = findIndex(this.libFires, { id: id });
      this.libFires.splice(index, 1);
      if (this.ui.fires['libFire'].elementIndex == index) {
        this.libFires.length == 0 ? this.fire = undefined : this.activate(this.libFires[index - 1].id, true);
      }
    }
  }

  /** Update scroll position */
  public scrollbarUpdate(element: string) {
    set(this.ui.fires, element + '.scrollPosition', this[element + 'Scrollbar'].directiveRef.fires().y);
  }

  /** Update CAD element */
  public updateCad() {
    this.fireOld = cloneDeep(this.fire);
    this.websocketService.syncUpdateItem("fire", this.fire);
  }

  /** Toggle library */
  public toggleLibrary() {
    this.ui.fires['fire'].lib == 'closed' ? this.ui.fires['fire'].lib = 'opened' : this.ui.fires['fire'].lib = 'closed';
  }

  /** Import from library */
  public importLibraryItem(id: string) {
    let libFire = find(this.lib.fires, function (o) { return o.id == id; });
    let fire = cloneDeep(libFire);
    let idGeneratorService = new IdGeneratorService;
    fire.uuid = idGeneratorService.genUUID()
    this.fires.push(fire);
  }

  // COMPONENT METHODS
  /** Add ramp and activate */
  public addRamp(type: string, property?: string) {

  }

}
