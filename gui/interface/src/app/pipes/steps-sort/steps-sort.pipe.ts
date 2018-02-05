import { Pipe, PipeTransform } from '@angular/core';
import { sortBy } from 'lodash';

@Pipe({
  name: 'stepsSort',
  pure: false
})
export class StepsSortPipe implements PipeTransform {

  transform(steps: any, args?: any): any {
    return sortBy(steps, ['t']);
  }

}
