import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountService, BackendService } from '@app/service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmailBody, EmailSignature } from './email-dialog.types';
import {  MessageService } from 'primeng/api';
import { environment } from '@environments/environment';
import { Subscription } from 'rxjs';
import { Editor } from 'ngx-editor';

@Component({
  selector: 'app-email-dialog',
  templateUrl: './email-dialog.component.html',
  styleUrls: ['./email-dialog.component.scss']
})
export class EmailDialogComponent implements OnInit, OnDestroy {
  emailBody: EmailBody;
  uploadFiles: File[] = [];
  uploadProgress: number | null = null;
  uploadSub?: Subscription;

  editor!: Editor;

  constructor(
    private backendService: BackendService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService,
    private accountService: AccountService
  ) {
    this.emailBody = config.data.emailBody;
  }

  ngOnInit(): void {
    this.editor = new Editor();
  }

  // make sure to destory the editor
  ngOnDestroy(): void {
    this.editor.destroy();
  }

  prepareFiles(files: File[]) {
    this.uploadProgress = 0;
    for (const f of files) {
        this.backendService.uploadFiles(f)
        .subscribe(response => {
          if (response.body) {
            const body = response.body;
            if (body['status'] == 'ok') {
              this.uploadProgress = 100;
              const files = body.files;
              if (files.file.originalFilename == f.name)
                this.uploadFiles.push(f)
            }
          }
      })
    }
  }

  cancelUpload() {
    if (this.uploadSub)
      this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = undefined;
  }

  back() {
    this.ref.close();
  }
  submit() {
    // send mail
    if ((this.emailBody.email_an == undefined || this.emailBody.email_an == '') && (this.emailBody.email_cc == undefined || this.emailBody.email_cc == '') && (this.emailBody.email_bcc == undefined || this.emailBody.email_bcc == '')) {
      this.messageService.add({ summary: 'Fehler: Email senden: An wen willst Du diese Email senden? Keinen Absender angegeben.', severity: 'error', closable: true })
      return
    }

    if (this.emailBody.email_subject == undefined || this.emailBody.email_subject == '') {
      this.messageService.add({ summary: 'Fehler: Email senden: Kein Betreff angegeben.', severity: 'error', closable: true })
      return
    }

    if (this.emailBody.email_body == undefined || this.emailBody.email_body == '') {
      this.messageService.add({ summary: 'Fehler: Email senden: Keinen Text angegeben.', severity: 'error', closable: true })
      return
    }

    if (this.uploadFiles.length > 0) {
      this.emailBody.uploadFiles = this.uploadFiles.map((file) => file.name).join(',');
    }

    if (this.emailBody.email_signature == undefined) {
      this.emailBody.email_signature = (Object.keys(EmailSignature)[Object.values(EmailSignature).indexOf(environment.defaultSignature as unknown as EmailSignature)] as unknown as EmailSignature);
    }

    console.log(this.emailBody);

    // alles bereit zum Senden der Email
    this.backendService.sendEmail(this.emailBody)
      .subscribe(
        {
          next: (res) => {
            console.log(res);
            if (res.response == "250 Message received")
              this.messageService.add({ summary: 'OK: Email senden: Email wurde versandt.', severity: 'info', sticky: false, closable: false, life: 2000 })
            this.ref.close(res);
          },
          error: (res) => {
            this.messageService.add({ summary: 'Fehler: Email senden: ' + res.response, severity: 'error', sticky: true, closable: true })
          }
        }
      )
  }

}
