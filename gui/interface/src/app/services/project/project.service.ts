import {Result, HttpManagerService} from '../http-manager/http-manager.service';
import { Injectable } from '@angular/core';
import { MainService } from '../main/main.service';
import { Project } from './project';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import * as _ from 'lodash';
import { Main } from '../main/main';

@Injectable()
export class ProjectService {

  main:Main;

  constructor(private mainService:MainService, private httpManager:HttpManagerService) { 
    // Sync with main object
    this.mainService.getMain().subscribe(main => this.main = main);
  }

  /** Get all project from database */
  getProjects() {
    this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/projects').then((result:Result) => {
      // Iterate through all projects
      _.forEach(result.data, (project) => {
        this.main.projects.push(new Project(JSON.stringify(project)));
      });
    });
  }

  /** Set current project in main object */
  setCurrnetProject(projectId:number) {
    let project = _.find(this.main.projects, function(o) {
      return o.id == projectId;
    });
    this.main.currentProject = project;
  }

  /** Create new project */
  createProject() {
    this.httpManager.post('https://aamks.inf.sgsp.edu.pl/api/project', JSON.stringify({})).then((result:Result) => {
      let data = result.data;
      let project = new Project(JSON.stringify({id: data['id'], name: data['name'], description: data['description'], category: data['category_id']}));
      this.main.projects.push(project);
    });
  }

  /** Update project */
  updateProject(projectIndex:number) {
    let project = this.main.projects[projectIndex];
    let projectId = project.id;
    this.httpManager.put('https://aamks.inf.sgsp.edu.pl/api/project/'+ projectId, project.toJSON()).then((result:Result) => {
      console.log(result);
    });

  }

  /** Delete project */
  deleteProject(projectIndex:number) {
    let projectId = this.main.projects[projectIndex].id;
    this.httpManager.delete('https://aamks.inf.sgsp.edu.pl/api/project/'+ projectId).then((result:Result) => {
      this.main.projects.splice(projectIndex, 1);
    });

  }

}
