import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Input } from '@angular/core';
import { forEach, find } from 'lodash';

@Component({
  selector: 'unique-select',
  templateUrl: './unique-select.component.html',
  styleUrls: ['./unique-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UniqueSelectComponent implements OnInit {

  //@ViewChild('rampChart') private chartContainer: ElementRef;
  @Input() private allElements: object[];
  @Input() private usedElements: object[];
  @Input() private currentElement: object[];

  private elements: object[] = [];

  constructor() { }

  // TODO Monitor changing of usedElements ...
  ngOnInit() {
    console.log(this.allElements);
    console.log(this.usedElements);
    console.log(this.currentElement);

    forEach(this.allElements, (element) => {
      if(find(this.usedElements, function (o) { return o['material']['id'] == element['id']}) == undefined || element == this.currentElement) {
        this.elements.push(element);
      }
    });
  }

  // TODO onChange

}
