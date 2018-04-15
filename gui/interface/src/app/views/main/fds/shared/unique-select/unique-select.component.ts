import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, HostListener } from '@angular/core';
import { find, each } from 'lodash';

@Component({
  selector: 'unique-select',
  templateUrl: './unique-select.component.html',
  styleUrls: ['./unique-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UniqueSelectComponent implements OnInit, OnChanges {

  //@ViewChild('rampChart') private chartContainer: ElementRef;
  @Input() private allElements: object[];
  @Input() private usedElements: object[];
  @Input() public currentElement: object;
  @Output() public currentElementChange: EventEmitter<object> = new EventEmitter<object>();

  public elements: object[] = [];

  constructor() { }

  /** On mose hover update list */
  @HostListener('mouseenter') onMouseEnter() {
    this.elements = [];
    each(this.allElements, (element) => {
      if (find(this.usedElements, function (o) {
        if (o['material'] != undefined) {
          return o['material']['id'] == element['id']
        }
        else {
          return undefined;
        }
      }) == undefined || element == this.currentElement) {
        this.elements.push(element);
      }
    });
  }

  ngOnInit() {
    this.elements = [];
    each(this.allElements, (element) => {
      if (find(this.usedElements, function (o) {
        if (o['material'] != undefined) {
          return o['material']['id'] == element['id']
        }
        else {
          return undefined;
        }
      }) == undefined || element == this.currentElement) {
        this.elements.push(element);
      }
    });
  }

  ngOnChanges() {
    this.elements = [];
    each(this.allElements, (element) => {
      if (find(this.usedElements, function (o) {
        if (o['material'] != undefined) {
          return o['material']['id'] == element['id']
        }
        else {
          return undefined;
        }
      }) == undefined || element == this.currentElement) {
        this.elements.push(element);
      }
    });
  }

  changeMaterial() {
    this.currentElementChange.emit(this.currentElement);
  }

}
