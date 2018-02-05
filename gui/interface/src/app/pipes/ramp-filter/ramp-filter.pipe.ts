import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rampFilter',
  pure: false
})
export class RampFilterPipe implements PipeTransform {

  transform(items: any[] = [], filter: Object): any {
    if (!items || !filter) {
        return items;
    }
    return items.filter(item => item.type.indexOf(filter['type']) !== -1);
}

}
