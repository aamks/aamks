import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import * as _ from 'lodash';

import { Main, MainObject } from './main';
import { Project } from '../project/project';
import { FdsScenario } from '../fds-scenario/fds-scenario';
import { RiskScenario } from '../risk-scenario/risk-scenario';
import { HttpManagerService, Result } from '../http-manager/http-manager.service';
import { FdsScenarioService } from '../fds-scenario/fds-scenario.service';

@Injectable()
export class MainService {

  // This is the main object including all current data
  main: Main = new Main('{ }');

  constructor(private httpManager: HttpManagerService) { }

  getMain(): Observable<Main> {
    return of(this.main);
  }

  /** Get current projects */
  getProjects(): Observable<Project[]> {
    return of(this.main.projects);
  }

  /** Get max id from list */
  public getListId(list: any[]): number {
    if (list.length > 0) {

      let maxId = 0;

      // Check max Id of existing elements
      _.each(list, function (element) {
        if (element['id'] != "") {
          let id = Number(element['id'].toString().substr(4));

          if (id > maxId) {
            maxId = id;
          }
        }
      });
      maxId++;

      return maxId;

    }
    else return 1;
  }

  // zaladuj dane z bazy danych o ustawieniach uzytkownika ...
}
