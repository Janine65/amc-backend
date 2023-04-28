import { Injectable, NgZone } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

  constructor(
    private messageService: MessageService,
    private zone: NgZone,
    private alertService: AlertService) { }

  showSuccess(message: string): void {
    // Had an issue with the snackbar being ran outside of angular's zone.
    this.zone.run(() => {
      this.alertService.info(message, {autoClose: true});
//      this.messageService.add({detail: message, severity: 'info'});
    });
  }

  showError(message: string): void {
    this.zone.run(() => {
      // The second parameter is the text in the button. 
      // In the third, we send in the css class for the snack bar.
      console.log('error occurred - ' + message)
      this.alertService.error(message);
      //this.messageService.add({detail: message, severity: 'error'});
    });
  }
}