import { Component } from '@angular/core';
import { BackendService } from '@service/backend.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-attachment-add',
  templateUrl: './attachment-add.component.html',
  styleUrls: ['./attachment-add.component.scss']
})
export class AttachmentAddComponent {

  journalid = 0;
  uploadFiles: File[] = [];
  uploadProgress: number | null = null;
  uploadSub?: Subscription;

  constructor(
    private backendService: BackendService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService,
  ) {
    this.journalid = config.data.journalid;
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

  save() {
    this.ref.close();
  }
}
