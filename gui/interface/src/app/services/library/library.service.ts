import { Result, HttpManagerService } from '../http-manager/http-manager.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Injectable } from '@angular/core';
import { Library } from './library';

@Injectable()
export class LibraryService {

  library: Library = new Library('{ }');

  constructor(private httpManager: HttpManagerService) { }

  //** Get library */
  getLibrary(): Observable<Library> {
    return of(this.library);
  }

  /** Get library from database */
  loadLibrary() {

    this.httpManager.get('https://aamks.inf.sgsp.edu.pl/api/library').then((result: Result) => {
      console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
      //Create new library
      console.log(result.data);
      this.library = new Library(JSON.stringify(result.data));
      console.log(this.library);
      console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    });
  }

  /** Update library in database */
  updateLibrary() {

  }


}
