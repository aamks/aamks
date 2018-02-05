import { FdsScenarioService } from './services/fds-scenario/fds-scenario.service';
import { Component, OnInit } from '@angular/core';

import { MainService } from './services/main/main.service';
import { Main, MainObject } from './services/main/main';
import * as _ from 'lodash';
import { WebsocketService } from './services/websocket/websocket.service';
import { Library } from './services/library/library';
import { LibraryService } from './services/library/library.service';
import { ProjectService } from './services/project/project.service';
import { CategoryService } from './services/category/category.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title: string = 'app';
  main: Main;
  lib: Library;

  constructor(private mainService: MainService,
    private websocket: WebsocketService,
    private libraryService: LibraryService,
    private projectService: ProjectService,
    private fdsScenarioService: FdsScenarioService,
    private categoryService: CategoryService
  ) {

    this.websocket.initializeWebSocket();
    // Check??
    this.websocket.dataStream.subscribe(
      (data) => {
        if (data) {
          //console.log(data);
        }
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("Websocket disconnected ...");
      }
    );

  }

  ngOnInit() {
    this.mainService.getMain().subscribe(main => this.main = main);
    this.projectService.getProjects();
    this.libraryService.loadLibrary();
    this.libraryService.getLibrary().subscribe(library => this.lib = library);
    this.categoryService.getCategories();
    this.setCurrentFdsScenario(177, 687)
  }

  setCurrentFdsScenario(projectId: number, fdsScenarioId: number) {
    this.fdsScenarioService.setCurrentFdsScenario(projectId, fdsScenarioId).subscribe();
  }
  /**
   * ngOnInit:
   * 1. Utworz main object
   * 2. Pobierz dane uzytkownika
   * 3. Pobierz projekty i scenariusze (naglowki)
   */


}
