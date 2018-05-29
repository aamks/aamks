import { Injectable } from '@angular/core';
import { Main } from '../main/main';
import { MainService } from '../main/main.service';
import { HttpManagerService, Result } from '../http-manager/http-manager.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { RiskScenario } from './risk-scenario';
import { find, findIndex } from 'lodash';
import { Risk } from '../risk-object/risk-object';
import { NotifierService } from 'angular-notifier';
import { JsonRiskService } from '../json-risk/json-risk.service';

@Injectable()
export class RiskScenarioService {

  main: Main;

  constructor(
    private mainService: MainService,
    private httpManager: HttpManagerService,
    private readonly notifierService: NotifierService,
    private jsonRiskService: JsonRiskService
  ) {
    this.mainService.getMain().subscribe(main => this.main = main);
  }

  /**
   * Set risk scenario to current
   * @param projectId 
   * @param riskScenarioId 
   */
  public setCurrentRiskScenario(projectId: number, riskScenarioId: number): Observable<RiskScenario> {

    // Set current scenario in main object
    this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/riskScenario/' + riskScenarioId).then((result: Result) => {
      console.log('Result data:');
      console.log(result.data);
      this.main.currentRiskScenario = new RiskScenario(JSON.stringify(result.data));
      console.log('currentRiskScenario');
      console.log(this.main.currentRiskScenario);
      // Set current project in main object
      let project = find(this.main.projects, function (o) {
        return o.id == projectId;
      });
      this.main.currentProject = project;
      this.notifierService.notify(result.meta.status, result.meta.details[0]);
    });

    return of(this.main.currentRiskScenario)
  }

  /**
   * Create risk scenario
   * @param projectId 
   */
  public createRiskScenario(projectId: number) {
    // Request
    return this.httpManager.post('https://aamks.inf.sgsp.edu.pl/api/riskScenario/' + projectId, JSON.stringify({})).then((result: Result) => {
      let data = result.data;
      let riskScenario = new RiskScenario(JSON.stringify({ id: data['id'], projectId: data['projectId'], name: data['name'], riskObject: new Risk(JSON.stringify({})) }));
      // add ui state in riskscenario constructor ???
      this.main.currentProject.riskScenarios.push(riskScenario);
      this.main.currentRiskScenario = riskScenario;
      this.notifierService.notify(result.meta.status, result.meta.details[0]);
    });
  }

  /**
   * Update risk scenario
   * @param projectId 
   * @param riskScenarioId 
   * @param syncType Default value: 'all'
   */
  public updateRiskScenario(projectId: number, riskScenarioId: number, syncType: string = 'all') {

    // Sync only main info without risk object
    if (syncType == 'head') {
      // Sync currentScenario with scenario from list
      let projectIndex = findIndex(this.main.projects, function (o) {
        return o.id == projectId;
      });
      let riskScenarioIndex = findIndex(this.main.projects[projectIndex].riskScenarios, function (o) {
        return o.id == riskScenarioId;
      });
      let riskScenario = this.main.projects[projectIndex].riskScenarios[riskScenarioIndex];
      this.httpManager.put('https://aamks.inf.sgsp.edu.pl/api/riskScenario/' + riskScenarioId, JSON.stringify({ type: 'head', data: { id: riskScenario.id, name: riskScenario.name } })).then((result: Result) => {
        if (this.main.currentRiskScenario != undefined)
          this.main.currentRiskScenario = riskScenario;
        this.notifierService.notify(result.meta.status, result.meta.details[0]);
      });
    }
    else if (syncType == 'all') {
      // Sync scenario from list with currentScenario
      let riskScenario = this.main.currentRiskScenario;
      this.httpManager.put('https://aamks.inf.sgsp.edu.pl/api/riskScenario/' + riskScenarioId, JSON.stringify({ type: 'all', data: riskScenario.toJSON() })).then((result: Result) => {
        let projectIndex = findIndex(this.main.projects, function (o) {
          return o.id == projectId;
        });
        let riskScenarioIndex = findIndex(this.main.projects[projectIndex].riskScenarios, function (o) {
          return o.id == riskScenarioId;
        });
        this.main.projects[projectIndex].riskScenarios[riskScenarioIndex] = riskScenario;
        this.notifierService.notify(result.meta.status, result.meta.details[0]);
      });
    }
  }

  /**
   * Delete risk scenario
   * @param projectIndex 
   * @param riskScenarioIndex 
   */
  public deleteRiskScenario(projectIndex: number, riskScenarioIndex: number) {

    let riskScenarioId = this.main.projects[projectIndex].riskScenarios[riskScenarioIndex].id;
    this.httpManager.delete('https://aamks.inf.sgsp.edu.pl/api/riskScenario/' + riskScenarioId).then((result: Result) => {
      this.main.projects[projectIndex].riskScenarios.splice(riskScenarioIndex, 1);
      this.notifierService.notify(result.meta.status, result.meta.details[0]);
    });
  }

  /**
   * Run risk scenario
   */
  public runRiskScenario() {
    let riskScenario = this.main.currentRiskScenario;
    let inputJson = this.jsonRiskService.createInputFile();
    this.httpManager.post('https://aamks.inf.sgsp.edu.pl/api/runRiskScenario/' + riskScenario.id, JSON.stringify(inputJson)).then((result: Result) => {
      this.notifierService.notify(result.meta.status, result.meta.details[0]);
    });
  }

  /**
   * Generate risk results
   */
  public generateResults() {
    let riskScenario = this.main.currentRiskScenario;
    let promise = new Promise((resolve, reject) => {
      this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/riskScenario/generateResults/' + riskScenario.projectId + '/' + riskScenario.id).then((result: Result) => {
        this.notifierService.notify(result.meta.status, result.meta.details[0]);
        resolve(result);
      });
    });
    return promise;
  }

  /**
   * Are results generated
   */
  public isGeneratedResults() {
    let riskScenario = this.main.currentRiskScenario;
    return this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/riskScenario/isGeneratedResults/' + riskScenario.projectId + '/' + riskScenario.id);
  }

}
