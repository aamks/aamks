import { Directive, HostListener, ElementRef, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[stringInput]'
})
export class StringInputDirective {

  private el: HTMLInputElement;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
   }

   ngAfterContentChecked() {
     this.formatInput();
   }

  formatInput(){
    if(this.el.value.length > 0) {
      this.el.size = this.el.value.length;
    }
  }

}
