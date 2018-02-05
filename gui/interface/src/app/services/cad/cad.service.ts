import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Mesh } from '../fds-object/mesh';

@Injectable()
export class CadService {

  constructor() { }


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

  prepareCurrentElements(current_elements:object[]):object[] {
    var valid_current_elements = _.filter(current_elements, function(element) {
      return element['idAC'] && element['idAC'] != '';
    });

    var prepared_current_elements=_.map(valid_current_elements, function(element, index) {
      var new_element = element;
      new_element['index'] = index;
      return new_element;
    });

    var sorted_current_elements = _.sortBy(prepared_current_elements, function(element) {
      return element['idAC'];
    });

    return sorted_current_elements;
  }

  /** Desc ... */
  prepareAcElements(ac_elements) {
    var prepared_ac_elements=_.map(ac_elements, function(element, index) {
      var new_element = element;
      new_element['index'] = index;
      return new_element;
     });
 
    var sorted_ac_elements=_.sortBy(prepared_ac_elements, function(element) {
      return element['idAC'];
    });
 
    return sorted_ac_elements;
  }

  /** Desc ... */
  prepareAcSurfs(ac_elements) {
 
    var valid_ac_elements=_.filter(ac_elements, function(element) {
      return element.id!="INERT" && element.id!="inert";
    });
 
    var prepared_ac_elements=_.map(valid_ac_elements, function(element, index) {
      var new_element=element;
      new_element.index=index;
      return new_element;
    });
 
    var sorted_ac_elements=_.sortBy(prepared_ac_elements, function(element) {
      return element.idAC;
    });
 
    return sorted_ac_elements;
  }

  /**
   * Transform CAD MESH elements
   * @param ac_elements CAD elements
   * @param current_elements Current elements
   */
  transformMeshes(ac_elements:object[], current_elements:object[]) {
    
    let updated_elements=[];
      
    let sorted_ac_elements = this.prepareAcElements(ac_elements);
    let sorted_current_elements = this.prepareCurrentElements(current_elements);
      
    // For each element
    _.each(sorted_ac_elements, (ac_element) => {
      // Check if element already exists
      let res = this.binaryIndexOf(ac_element, sorted_current_elements, 'idAC');
      // If element not exists
      if(res == -1) {
        // Add new
        updated_elements.push(new Mesh(JSON.stringify(ac_element)));
      } else {
        let original_element = sorted_current_elements[res];

        // Rewrite some properties and leave unchanged others
        original_element['xb'] = ac_element['xb'];
        // Create new element based on existing one
        let modified_element = new Mesh(JSON.stringify(original_element));
      
        updated_elements.push(modified_element);
        sorted_current_elements.splice(res, 1);
      }
    });
    
    // Rewrite elements Id
    let maxId=0;
        
    // Check max Id of existing elements
    _.each(updated_elements, function(mesh) {
      if(mesh.id != "" && mesh.id.substr(0,4) == 'MESH') {
        let number = Number(mesh.id.substr(4));

        if(number > maxId) {
          maxId = number;
        }
      }
    });
    
    // Next id 
    maxId++;
    
    // Add id to new elements
    _.each(updated_elements, function(mesh) {
      if(mesh.id == "") {
        mesh.id = 'MESH' + maxId;
        maxId++;
      }
    });
    
    return updated_elements;
      
  }

}
