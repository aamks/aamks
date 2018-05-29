import { Component, OnInit } from '@angular/core';

import { Project } from '../../../services/project/project';
import { MainService } from '../../../services/main/main.service';
import { ProjectService } from '../../../services/project/project.service';
import { Main } from '../../../services/main/main';
import { CategoryService } from '../../../services/category/category.service';
import { CategoryObject } from '../../../services/category/category';
import { RiskScenarioService } from '../../../services/risk-scenario/risk-scenario.service';
import { find } from 'lodash';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  main: Main;
  projects: Project[] = [];

  constructor(private mainService: MainService,
    private projectService: ProjectService,
    private riskScenarioService: RiskScenarioService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.mainService.getMain().subscribe(main => this.main = main);
    this.projects = this.main.projects;
  }

  /** Set/unset project to current in main object */
  setCurrentProject(index: number) {
    if(this.main.currentProject != undefined && this.main.currentRiskScenario != undefined) {
      this.riskScenarioService.updateRiskScenario(this.main.currentProject.id, this.main.currentRiskScenario.id);
    }
    this.projectService.setCurrnetProject(index);
    this.main.currentRiskScenario = undefined;
  }
  unsetCurrentProject() {
    if(this.main.currentProject != undefined && this.main.currentRiskScenario != undefined) {
      this.riskScenarioService.updateRiskScenario(this.main.currentProject.id, this.main.currentRiskScenario.id);
    }
    this.main.currentProject = undefined;
    this.main.currentRiskScenario = undefined;
  }

  /** Add new project */
  addProject() {
    this.projectService.createProject();
  }

  /** Update project name/desc/category in DB */
  updateProject(index: number) {
    this.projectService.updateProject(index);
  }

  /** Delete project from DB */
  deleteProject(index: number) {
    this.projectService.deleteProject(index);
  }

  /** Check if category is visible (turned on/off) */
  checkProjectCategory(categoryUuid: string) {
    let category = find(this.main.categories, function (category) {
      return category.uuid == categoryUuid;
    });
    if (category && category.active == true) {
      return true;
    } else {
      return false;
    }
  }

  /** Change category activity */
  changeCategoryActivity(categoryUuid: string, categoryIndex: number) {
    if (this.main.currentProject != undefined && this.main.currentProject.category == categoryUuid) {
      this.main.currentProject = undefined;
    }
    this.categoryService.updataCategory(categoryUuid, this.main.categories[categoryIndex]);
  }

  /** Set risk scenario to current */
  setCurrentRiskScenario(projectId: number, riskScenarioId: number) {
    this.riskScenarioService.setCurrentRiskScenario(projectId, riskScenarioId).subscribe();
  }

  /** Add risk scenario */
  addRiskScenario(projectId: number) {
    this.riskScenarioService.createRiskScenario(projectId);
  }

  /** Update risk scenario */
  updateRiskScenario(projectId: number, riskScenarioId: number) {
    this.riskScenarioService.updateRiskScenario(projectId, riskScenarioId, 'head');
  }

  /** Delete risk scenario */
  deleteRiskScenario(projectIndex: number, riskScenarioIndex: number) {
    if (this.main.currentRiskScenario != undefined && this.main.currentRiskScenario.id == this.main.projects[projectIndex].riskScenarios[riskScenarioIndex].id) 
      this.main.currentRiskScenario = undefined;

    this.riskScenarioService.deleteRiskScenario(projectIndex, riskScenarioIndex);
  }


}