import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { Main, MainObject } from './main';
import { Project } from '../project/project';
import { RiskScenario } from '../risk-scenario/risk-scenario';
import { HttpManagerService, Result } from '../http-manager/http-manager.service';
import { each } from 'lodash';
import { NotifierService } from 'angular-notifier';

@Injectable()
export class MainService {

  // This is the main object including all current data
  main: Main = new Main('{ }');

  constructor(
    private httpManager: HttpManagerService,
    private readonly notifierService: NotifierService
  ) { 
    this.httpManager.get(this.main.hostAddres + '/api/settings').then((result:Result) => {
      let main = new Main(JSON.stringify(result.data));
      this.main.hostAddres = main.hostAddres;
      this.main.editor = main.editor;
      this.main.timeout = main.timeout;
      this.main.userId = main.userId;
      this.main.userName = main.userName;
      this.notifierService.notify(result.meta.status, result.meta.details[0]);
    });
  }

  getMain(): Observable<Main> {
    return of(this.main);
  }

  /** Get current projects */
  getProjects(): Observable<Project[]> {
    return of(this.main.projects);
  }

  /** Get max id from list */
  public getListId(list: any[], type?: string): number {
    if (list.length > 0) {

      let maxId = 0;
      let id: number;

      // Check max Id of existing elements
      each(list, function (element) {
        if (element['id'] != "") {
          if(type == 'jetfan') {
            id = Number(element['id'].toString().substr(6));
          }
          else {
            id = Number(element['id'].toString().substr(4));
          }

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
