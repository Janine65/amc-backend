import { Component } from '@angular/core';
import { BackendService } from '@app/service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-email-dialog',
  templateUrl: './email-dialog.component.html',
  styleUrls: ['./email-dialog.component.scss']
})
export class EmailDialogComponent {
  emailBody : any;

  constructor(
    private backendService: BackendService,
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig
    ) { 
    this.emailBody = config.data.emailBody
  }

  back() {
    this.ref.close();
  }
  submit() {
    // send mail
    return
  }

}
