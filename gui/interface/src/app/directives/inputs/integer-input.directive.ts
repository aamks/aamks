import { Directive, HostListener, ElementRef, OnInit, Input } from '@angular/core';
import { isInteger, toNumber } from 'lodash';

@Directive({
  selector: '[integerInput]'
})
export class IntegerInputDirective {

  private el: HTMLInputElement;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
   }

   ngAfterContentChecked() {
     this.formatInput();
   }

  formatInput(){
    //this.el.value = this.currencyPipe.parse(value); // opossite of transform

    // Set auto size
    //if (this.el.value.length < 3) {
    //  this.el.size = 3;
    //}
    //else {
      this.el.style.width = 0.6 * this.el.value.length + 'rem';
    //}

    // Set background if invalid value
    if (!isInteger(toNumber(this.el.value))) {
      this.el.style.borderBottom = 'solid 2px red';
      this.el.style.boxShadow = 'none';
    }
    else {
      this.el.style.borderBottom = '1px solid #808080';
      this.el.style.boxShadow = '0 -1px 0 #303030 inset'
    }

  }

}
