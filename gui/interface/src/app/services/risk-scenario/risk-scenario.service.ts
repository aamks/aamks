import { Injectable } from '@angular/core';
import { Main } from '../main/main';
import { MainService } from '../main/main.service';
import { HttpManagerService, Result } from '../http-manager/http-manager.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { RiskScenario } from './risk-scenario';
import { find } from 'lodash';
import { Risk } from '../risk-object/risk-object';

@Injectable()
export class RiskScenarioService {

  main: Main;

  constructor(private mainService: MainService, private httpManager: HttpManagerService) {
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

      this.main.currentRiskScenario = new RiskScenario(JSON.stringify(result.data));
      this.main.currentFdsScenario = undefined;
      console.log(this.main.currentRiskScenario.riskObject);

      // Set current project in main object
      let project = find(this.main.projects, function (o) {
        return o.id == projectId;
      });
      this.main.currentProject = project;

    });

    return of(this.main.currentRiskScenario)
  }

  /** Create risk scenario */
  public createRiskScenario(projectId: number) {
    // Request
    this.httpManager.post('https://aamks.inf.sgsp.edu.pl/api/riskScenario/' + projectId, JSON.stringify({})).then((result: Result) => {
      let data = result.data;
      let riskScenario = new RiskScenario(JSON.stringify({ id: data['id'], projectId: data['projectId'], name: data['name'], riskObject: new Risk(JSON.stringify({})) }));
      // add ui state in riskscenario constructor ???
      this.main.currentProject.riskScenarios.push(riskScenario);
    });
  }

  /**
   * Update risk Scenario
   * @param projectId 
   * @param riskScenarioId 
   * @param syncType Default value: 'all'
   */
  public updateRiskScenario(projectId: number, riskScenarioId: number, syncType: string = 'all') {
    // Find project
    let project = find(this.main.projects, (project) => {
      return project.id == projectId;
    });
    // Find scenario
    let riskScenario = find(project.riskScenarios, (riskScenario) => {
      return riskScenario.id == riskScenarioId;
    });
    console.log(JSON.stringify(riskScenario.riskObject));
    // Sync only main info without risk object
    if (syncType == 'head') {
      this.httpManager.put('https://aamks.inf.sgsp.edu.pl/api/riskScenario/' + riskScenarioId, JSON.stringify({ type: "head", data: { id: riskScenario.id, name: riskScenario.name } })).then((result: Result) => {

      });
    }
    else if (syncType == 'all') {
      this.httpManager.put('https://aamks.inf.sgsp.edu.pl/api/riskScenario/' + riskScenarioId, riskScenario.toJSON()).then((result: Result) => {

      });
    }
  }
  /** Delete risk scenario */
  public deleteRiskScenario(projectIndex: number, riskScenarioIndex: number) {
    let riskScenarioId = this.main.projects[projectIndex].riskScenarios[riskScenarioIndex].id;
    this.httpManager.delete('https://aamks.inf.sgsp.edu.pl/api/riskScenario/' + riskScenarioId).then((result: Result) => {
      this.main.projects[projectIndex].riskScenarios.splice(riskScenarioIndex, 1);
    });

  }

}
