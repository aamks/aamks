import {Result, HttpManagerService} from '../http-manager/http-manager.service';
import {MainService} from '../main/main.service';
import {Main} from '../main/main';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Category, CategoryObject } from './category';
import { IdGeneratorService } from '../id-generator/id-generator.service';

@Injectable()
export class CategoryService {

  main:Main;

  constructor(private mainService:MainService, private httpManager:HttpManagerService, private idGeneratorService:IdGeneratorService) { 
    // Sync with main object
    this.mainService.getMain().subscribe(main => this.main = main);
  }

  /** Get categories from DB */
  getCategories() {
    this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/categories').then((result:Result) => {
      // Iterate through all projects
      _.forEach(result.data, (category) => {
        (category.visible == 't') ? category.visible = true : category.visible = false;
        (category.active == 't') ? category.active = true : category.active = false;

        this.main.categories.push(new Category(JSON.stringify(category)));
      });
      console.log("catego");
      console.log(this.main.categories);
    });
  }

  /** Create new category in DB */
  createCategory() {
    let category = new Category(JSON.stringify({uuid: this.idGeneratorService.genUUID, label:"New category", active:true, visible:true}));
    this.httpManager.post('https://aamks.inf.sgsp.edu.pl/api/category', category.toJSON()).then((result:Result) => {
      this.main.categories.push(category);
    });
  }

  /** Update category in DB */
  updataCategory(uuid:string, category:Category) {
    this.httpManager.put('https://aamks.inf.sgsp.edu.pl/api/category/'+uuid, category.toJSON()).then((result:Result) => {

    });
  }

  /** Delete category */
  deleteCategory(uuid:string) {
    this.httpManager.delete('https://aamks.inf.sgsp.edu.pl/api/category/'+uuid).then((result:Result) => {

    });
  }

}
