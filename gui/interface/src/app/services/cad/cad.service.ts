import { Injectable } from '@angular/core';
import { map, sortBy, filter, each, find, cloneDeep } from 'lodash';
import { MainService } from '../main/main.service';
import { Main } from '../main/main';

@Injectable()
export class CadService {

  main: Main;

  constructor(
    private mainService: MainService,
  ) {
    this.mainService.getMain().subscribe(main => this.main = main);
  }

  /** Desc ... */
  binaryIndexOf(elem, list, prop) {
    let minIndex = 0;
    let maxIndex = list.length - 1;
    let currentIndex;
    let currentElement;

    while (minIndex <= maxIndex) {
      currentIndex = (minIndex + maxIndex) / 2 | 0;
      currentElement = list[currentIndex];
      if (currentElement[prop] < elem[prop]) {
        minIndex = currentIndex + 1;
      } else if (currentElement[prop] > elem[prop]) {
        maxIndex = currentIndex - 1;
      } else if (currentElement[prop] == elem[prop]) {
        return currentIndex;
      }
    }
    return -1;
  }

  /** Rewrite ids of imported elements */
  public rewriteIds(updatedElements: any[], type: string): any[] {
    // Rewrite elements Id
    let maxId = 0;
    // Check max Id of existing elements
    each(updatedElements, function (element) {
      if (element.id != "" && element.id.substr(0, 4) == type) {
        let number = Number(element.id.substr(4));
        if (number > maxId) {
          maxId = number;
        }
      }
    });

    // Next id 
    maxId++;

    // Add id to newly added elements
    each(updatedElements, function (element) {
      if (element.id == '') {
        element.id = type + maxId;
        maxId++;
      }
    });

    return updatedElements;
  }

  /** Sort currnet elements by idAC */
  public sortCurrentElements(currentElements: any[]): any[] {
    var validCurrentElements = filter(currentElements, function (element) {
      return element['idAC'] && element['idAC'] != '';
    });

    var sortedCurrentElements = sortBy(validCurrentElements, function (element) {
      return element['idAC'];
    });

    return sortedCurrentElements;
  }

  /** Sort AC elements by idAC */
  public sortAcElements(acElements: any[], type?: string): any[] {
    if (type == 'surf') {
      acElements = filter(acElements, function (element) {
        return element.id != "INERT" && element.id != "inert";
      });
    }

    let sortedAcElements = sortBy(acElements, function (element) {
      return element['idAC'];
    });
    return sortedAcElements;
  }


}
