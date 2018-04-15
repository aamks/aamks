import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Mesh } from '../fds-object/mesh';
import { map, sortBy, filter, each, find, cloneDeep } from 'lodash';
import { Obst } from '../fds-object/obst';
import { Surf } from '../fds-object/surf';
import { MainService } from '../main/main.service';
import { Main } from '../main/main';
import { Library } from '../library/library';
import { LibraryService } from '../library/library.service';
import { Xb } from '../fds-object/primitives';
import { Ramp } from '../fds-object/ramp';
import { Matl } from '../fds-object/matl';

@Injectable()
export class CadService {

  main: Main;
  lib: Library;

  constructor(
    private mainService: MainService,
    private libraryService: LibraryService
  ) { 
    this.mainService.getMain().subscribe(main => this.main = main);
    this.libraryService.getLibrary().subscribe(lib => this.lib = lib);
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

  /**
   * Transform CAD SURF elements
   * @param acElements CAD elements
   * @param currentElements Current fds elements
   */
  transformSurfs(acElements: object[], currentElements: Surf[]) {

    this.libraryService.getLibrary().subscribe(lib => this.lib = lib);

    let updatedElements = [];

    // Sort AC and current elements
    let sortedAcElements = this.sortAcElements(acElements, 'surf');
    let sortedCurrentElements = this.sortCurrentElements(currentElements);

    // For each sorted AC element
    each(sortedAcElements, (acElement) => {
      // Check if element already exists
      let res = this.binaryIndexOf(acElement, sortedCurrentElements, 'idAC');
      // If surf element not exists in currnet scenario
      if (res == -1) {
        // Find surf in library
        let tempSurf = find(this.lib.surfs, function (o) {
          return o.id == acElement.id;
        });
        let libSurf = cloneDeep(tempSurf);

        // Import surf from library if exists
        if (libSurf != undefined && libSurf.layers) {
          each(libSurf.layers, (layer) => {

            // Import materials if exists
            if (layer.materials) {
              each(layer.materials, (material) => {
                // Check if exists in current scenario
                let matl = find(this.main.currentFdsScenario.fdsObject.geometry.matls, function (o) {
                  return o.id == material.material.id;
                });

                // Import matl from library
                if (matl == undefined) {
                  // Import conductivity ramp
                  if (material.material.conductivity_ramp && material.material.conductivity_ramp.id) {
                    let ramp = find(this.main.currentFdsScenario.fdsObject.ramps.ramps, function (o) {
                      return o.id == material.material.conductivity_ramp.id;
                    });

                    // Import ramp from library
                    if (ramp == undefined) {
                      let tempRamp = find(this.lib.ramps, function (o) {
                        return o.id == material.material.conductivity_ramp.id;
                      });
                      let libRamp = cloneDeep(tempRamp);

                      if (libRamp != undefined) {
                        // Copy to current fds scenario ramp
                        this.main.currentFdsScenario.fdsObject.ramps.ramps.push(new Ramp(JSON.stringify(libRamp.toJSON())));
                      }
                    }
                  }

                  // Import specific heat ramp
                  if (material.material.specific_heat_ramp && material.material.specific_heat_ramp.id) {
                    let ramp = find(this.main.currentFdsScenario.fdsObject.ramps.ramps, function (o) {
                      return o.id == material.material.specific_heat_ramp.id;
                    });

                    // Import ramp from library
                    if (ramp == undefined) {
                      let tempRamp = find(this.lib.ramps, function (o) {
                        return o.id == material.material.specific_heat_ramp.id;
                      });
                      let libRamp = cloneDeep(tempRamp);

                      if (libRamp != undefined) {
                        // Copy to current fds scenario ramp
                        this.main.currentFdsScenario.fdsObject.ramps.ramps.push(new Ramp(JSON.stringify(libRamp.toJSON())));
                      }
                    }
                  }

                  let tempMatl = find(this.lib.matls, function (o) {
                    return o.id == material.material.id
                  });
                  let libMatl = cloneDeep(tempMatl);
                  
                  if (libMatl != undefined) {
                    this.main.currentFdsScenario.fdsObject.geometry.matls.push(new Matl(JSON.stringify(libMatl.toJSON()), this.main.currentFdsScenario.fdsObject.ramps.ramps));
                  }
                }

              });
            }
          });

          // Import library surf into current scenario
          updatedElements.push(new Surf(JSON.stringify(libSurf.toJSON()), this.main.currentFdsScenario.fdsObject.geometry.matls));
        }
        else {
          // If it is not in library
          updatedElements.push(new Surf(JSON.stringify(acElement), this.main.currentFdsScenario.fdsObject.geometry.matls));
        }
      }
      else {
        let originalElement: Surf = sortedCurrentElements[res];

        // Rewrite properties and leave unchanged others
        // TODO! change id if layer in CAD has changed

        console.log(originalElement);
        // Create new element based on new data
        let newElement = new Surf(JSON.stringify(originalElement.toJSON()));
        // Add element
        updatedElements.push(newElement);
        // Delete from current elements
        sortedCurrentElements.splice(res, 1);
      }
    });

    // Rewrite ids
    updatedElements = this.rewriteIds(updatedElements, 'SURF');

    return updatedElements;
  }

  /**
   * Transform CAD MESH elements
   * @param acElements CAD elements
   * @param currentElements Current fds elements
   */
  transformMeshes(acElements: object[], currentElements: Mesh[]) {
    let updatedElements = [];

    // Sort AC and current elements
    let sortedAcElements = this.sortAcElements(acElements);
    let sortedCurrentElements = this.sortCurrentElements(currentElements);

    // For each sorted AC element
    each(sortedAcElements, (acElement) => {
      // Check if element already exists
      let res = this.binaryIndexOf(acElement, sortedCurrentElements, 'idAC');
      // If element not exists
      if (res == -1) {
        acElement.id = '';
        updatedElements.push(new Mesh(JSON.stringify(acElement)));
      }
      else {
        let originalElement: Mesh = sortedCurrentElements[res];

        // Rewrite properties and leave unchanged others
        originalElement.xb = new Xb(JSON.stringify(acElement.xb));

        // Create new element based on new data
        let newElement = new Mesh(JSON.stringify(originalElement.toJSON()));
        // Add element
        updatedElements.push(newElement);
        // Delete from current elements
        sortedCurrentElements.splice(res, 1);
      }
    });

    // Rewrite ids
    updatedElements = this.rewriteIds(updatedElements, 'MESH');

    return updatedElements;
  }

  /**
   * Transform CAD OBST elements
   * @param acElements CAD elements
   * @param currentElements Current fds elements
   */
  transformObsts(acElements: object[], currentElements: Obst[]) {
    let updatedElements = [];

    // Sort AC and current elements
    let sortedAcElements = this.sortAcElements(acElements);
    let sortedCurrentElements = this.sortCurrentElements(currentElements);

    // For each sorted AC elemenj
    each(sortedAcElements, (acElement) => {
      // Check if element already exists
      let res = this.binaryIndexOf(acElement, sortedCurrentElements, 'idAC');
      // If element not exists
      if (res == -1) {
        acElement.id = '';
        updatedElements.push(new Obst(JSON.stringify(acElement), this.main.currentFdsScenario.fdsObject.geometry.surfs));
      }
      else {
        let originalElement: Obst = sortedCurrentElements[res];

        let surfType = originalElement.surf.type;
        let surfId;

        switch (surfType) {
          case 'surf_id':
            surfId = 'surf_id'; break;
          case 'surf_ids':
            surfId = 'surf_idx'; break;
          case 'surf_id6':
            surfId = 'surf_id1'; break;
        }

        // Rewrite properties and leave unchanged others
        originalElement.xb = new Xb(JSON.stringify(acElement.xb));
        originalElement.surf.surf_id = acElement.surf.surf_id;
        originalElement.elevation = acElement.elevation;

        // Create new element based on new data
        let newElement = new Obst(JSON.stringify(originalElement.toJSON()), this.main.currentFdsScenario.fdsObject.geometry.surfs);
        // Add element
        updatedElements.push(newElement);
        // Delete from current elements
        sortedCurrentElements.splice(res, 1);
      }
    });

    // Rewrite ids
    updatedElements = this.rewriteIds(updatedElements, 'OBST');

    return updatedElements;
  }

}
