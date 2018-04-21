import { Component, OnInit } from '@angular/core';

import { Project } from '../../../services/project/project';
import { MainService } from '../../../services/main/main.service';
import { ProjectService } from '../../../services/project/project.service';
import { FdsScenarioService } from '../../../services/fds-scenario/fds-scenario.service';
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
    private fdsScenarioService: FdsScenarioService,
    private riskScenarioService: RiskScenarioService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.mainService.getMain().subscribe(main => this.main = main);
    this.projects = this.main.projects;
  }

  /** Set/unset project to current in main object */
  setCurrentProject(index: number) {
    this.projectService.setCurrnetProject(index);
  }
  unsetCurrentProject() {
    this.main.currentProject = undefined;
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
      if (this.main.currentFdsScenario != undefined) {
        this.main.currentFdsScenario = undefined;
      }
      this.main.currentProject = undefined;
    }
    this.categoryService.updataCategory(categoryUuid, this.main.categories[categoryIndex]);
  }

  /** Set fds scenario to current */
  setCurrentFdsScenario(projectId: number, fdsScenarioId: number) {
    this.fdsScenarioService.setCurrentFdsScenario(projectId, fdsScenarioId).subscribe();
  }

  /** Add fds scenario */
  addFdsScenario(projectId: number) {
    this.fdsScenarioService.createFdsScenario(projectId);
  }

  /** Set fds scenario name  */
  updateFdsScenario(projectId: number, fdsScenarioId: number) {
    this.fdsScenarioService.updateFdsScenario(projectId, fdsScenarioId, 'head');
  }

  /** Download fds file */
  downloadFdsScenario(projectId: number, fdsScenarioId: number) {
    console.log("download fds scenario");
  }

  /** Delete fds scenario */
  deleteFdsScenario(projectIndex: number, fdsScenarioIndex: number) {
    this.fdsScenarioService.deleteFdsScenario(projectIndex, fdsScenarioIndex);
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

  /** Delete fds scenario */
  deleteRiskScenario(projectIndex: number, riskScenarioIndex: number) {
    this.riskScenarioService.deleteRiskScenario(projectIndex, riskScenarioIndex);
  }


}