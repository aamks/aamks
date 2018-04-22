import { Component, OnInit } from '@angular/core';
import { Main } from '../../../../../services/main/main';
import { MainService } from '../../../../../services/main/main.service';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';
import { Bndf } from '../../../../../services/fds-object/output/bndf';
import { forEach, find, findIndex, filter, includes, remove, partition, map, merge } from 'lodash';
import { quantities } from '../../../../../enums/fds/enums/fds-enums-quantities';
import { Fds } from '../../../../../services/fds-object/fds-object';
import { species } from '../../../../../enums/fds/enums/fds-enums-species';
import { Spec } from '../../../../../services/fds-object/specie/spec';

@Component({
  selector: 'app-boundary',
  templateUrl: './boundary.component.html',
  styleUrls: ['./boundary.component.scss']
})
export class BoundaryComponent implements OnInit {

  // Global objects
  main: Main;
  fds: Fds;

  // Component objects

  // Prepare quantities for select
  QUANTITIES = map(filter(quantities, function (o) { return includes(o.type, 'b') }), function (o) { return new Bndf(JSON.stringify(o)) });
  SPECIES: Spec[];

  constructor(private mainService: MainService) { }

  ngOnInit() {
    console.clear();
    // Subscribe main object
    this.mainService.getMain().subscribe(main => this.main = main);
    // Assign to local variables
    this.fds = this.main.currentFdsScenario.fdsObject;

    this.SPECIES = merge(map(species, function(o) { return new Spec(JSON.stringify(o)) }), this.main.currentFdsScenario.fdsObject.specie.specs);
  }

  // COMPONENT METHODS
  public showSpecs(): boolean {
    let specs = filter(this.main.currentFdsScenario.fdsObject.output.bndfs, function(o: Bndf) { return o.spec == true; });
    let show = specs.length > 0 ? true : false;
    return show;
  }

  public showParts(): boolean {
    let parts = filter(this.main.currentFdsScenario.fdsObject.output.bndfs, function(o: Bndf) { return o.part == true; });
    let show = parts.length > 0 ? true : false;
    return show;
  }

}
