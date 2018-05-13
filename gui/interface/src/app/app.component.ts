import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { MainService } from './services/main/main.service';
import { Main, MainObject } from './services/main/main';
import { WebsocketService } from './services/websocket/websocket.service';
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

  constructor(private mainService: MainService,
    private websocket: WebsocketService,
    private projectService: ProjectService,
    private categoryService: CategoryService,
    private router: Router
  ) { }

  ngOnInit() {
    console.clear();
    this.mainService.getMain().subscribe(main => this.main = main);
    this.projectService.getProjects();
    this.categoryService.getCategories();

    this.websocket.initializeWebSocket();

    // Navigate after page is reloaded
    this.router.navigate(['']);

    // For developing purpose
    setTimeout(() => {
     //this.router.navigate(['risk/results']);
     this.projectService.setCurrnetProject(8);

    }, 1000);
    setTimeout(() => {

    }, 2000);
  }

  ngAfterViewInit() {

  }
  /**
   * ngOnInit:
   * 1. Utworz main object
   * 2. Pobierz dane uzytkownika
   * 3. Pobierz projekty i scenariusze (naglowki)
   */


}
