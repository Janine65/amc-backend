/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { NgModel, NgForm } from '@angular/forms';


export class InputValidationErrorDef {
  required?: string;
  custom?: string;
  minlength?: string;
  pattern?: string;
}

@Component({
  selector: 'app-input-validation',
  template: `
    <div *ngIf="hasError()" class="ui-message ui-messages-error">
      {{ errorMessage }}
    </div>
  `,
  styles: [`
    .ui-messages-error {
      margin: 0;
      margin-top: 4px;
      color: red;
    }
  `]
})
export class InputValidationComponent {

  @Input()
  control!: NgModel;
  @Input()
  form!: NgForm;
  @Input() 
  errDef: InputValidationErrorDef = {};
  @Input() custom: any;

  errorMessages : string[]= [];
  errorMessage = '';

  hasError(): boolean {
    this.errorMessages = [];
    this.errorMessage = '';
    if ( this.errDef && ( this.control.errors || this.errDef['custom'] ) ) {
      if (this.control.errors && this.control.errors['required'])
        this.errorMessages.push(this.errDef['required']!)
      if (this.control.errors && this.control.errors['minlength'])
        this.errorMessages.push(this.errDef['minlength']!)
      if (this.control.errors && this.control.errors['pattern'])
        this.errorMessages.push(this.errDef['pattern']!)
      if ( this.errDef['custom'] && !this.runCustom() ) {
          this.errorMessages.push(this.errDef['custom']!);
      }
    }

    for ( const m of this.errorMessages ){
      if ( this.errorMessage.length > 0 ) {
        this.errorMessage = this.errorMessage + '.  ';
      }
      this.errorMessage = this.errorMessage + m;
    }

    if (this.errorMessages.length > 0 && this.control.dirty)
      return true;

    return false;

  }
  public runCustom(): boolean {
    return this.custom(this);
  }

}