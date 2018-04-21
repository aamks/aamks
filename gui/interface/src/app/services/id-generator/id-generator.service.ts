import { Injectable } from '@angular/core';
import { chain, some } from 'lodash';

@Injectable()
export class IdGeneratorService {

  constructor() { }

  /**
   * Generate uuid
   */
  genUUID(): string {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  };


  /**
   * Generate id in elements list
   * @param name Element name
   * @param list List of elements
   */
  genId(name, list): string {
    let id = "";

    let number = 0;
    if (list.length > 0) {
      number = chain(list)
        .map(function (element) { return element['id']; })
        .filter(function (element) {
          var res = element.match(new RegExp(name + '\\d+'));
          return res != null && element == res[0];
        })
        .map(function (element) {
          var res = element.match(/\d+/);
          return 1 * res;
        })
        .max()
        .value();
    }

    if (number && isFinite(number)) {
      id = name + (number + 1) + '';
    } else {
      id = name + '1';
    }
    return id;
  }

  /**
   * Check if id exists in list
   * @param id Element id 
   * @param list List of elements
   */
  checkId(id, list): boolean {
    if (some(list, function (element) { return element.id == id; })) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Check if correct id
   * @param id Element id
   * @param list List of elements
   */
  correctId(id, list): boolean {
    if (this.checkId(id, list)) {
      let res = id.match(/^[a-zA-Z_]+\w*$/);
      if (res && res.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }


}
