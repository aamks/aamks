import {Result, HttpManagerService} from '../http-manager/http-manager.service';
import {MainService} from '../main/main.service';
import {Main} from '../main/main';
import { Injectable } from '@angular/core';
import { Category, CategoryObject } from './category';
import { IdGeneratorService } from '../id-generator/id-generator.service';
import { NotifierService } from 'angular-notifier';
import { forEach } from 'lodash';

@Injectable()
export class CategoryService {

  main:Main;

  constructor(
    private mainService:MainService, 
    private httpManager:HttpManagerService, 
    private idGeneratorService:IdGeneratorService, 
    private readonly notifierService: NotifierService
  ) { 
    // Sync with main object
    this.mainService.getMain().subscribe(main => this.main = main);
  }

  /** Get categories from DB */
  getCategories() {
    this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/categories').then((result:Result) => {
      // Iterate through all projects
      forEach(result.data, (category) => {
        (category.visible == 't') ? category.visible = true : category.visible = false;
        (category.active == 't') ? category.active = true : category.active = false;

        this.main.categories.push(new Category(JSON.stringify(category)));
      });
      this.notifierService.notify(result.meta.status, result.meta.details[0]);
    });
  }

  /** Create new category in DB */
  createCategory() {
    let category = new Category(JSON.stringify({uuid: this.idGeneratorService.genUUID, label:"New category", active:true, visible:true}));
    this.httpManager.post('https://aamks.inf.sgsp.edu.pl/api/category', category.toJSON()).then((result:Result) => {
      this.main.categories.push(category);
      this.notifierService.notify(result.meta.status, result.meta.details[0]);
    });
  }

  /** Update category in DB */
  updataCategory(uuid:string, category:Category) {
    this.httpManager.put('https://aamks.inf.sgsp.edu.pl/api/category/'+uuid, category.toJSON()).then((result:Result) => {

      this.notifierService.notify(result.meta.status, result.meta.details[0]);
    });
  }

  /** Delete category */
  deleteCategory(uuid:string) {
    this.httpManager.delete('https://aamks.inf.sgsp.edu.pl/api/category/'+uuid).then((result:Result) => {

      this.notifierService.notify(result.meta.status, result.meta.details[0]);
    });
  }

}
