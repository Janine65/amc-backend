import { Component } from '@angular/core';
import { BackendService } from '@app/service';
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
  jahr = '';
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
    this.jahr = config.data.jahr;
  }

  prepareFiles(files: File[]) {
    this.uploadProgress = 0;
    for (const f of files) {
        this.backendService.uploadFiles(f)
        .subscribe({
          next: (response) => {
            if (response.type == 'info') {
                const files = response.data as any;
                if (files.file[0].originalFilename == f.name)
                  this.uploadFiles.push(f)
            }  
          },
          complete: () => {
            this.uploadProgress = 100;
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
    const files = this.uploadFiles.map((value: File) => value.name).join(',')
    if (files.length > 0)
      this.backendService.bulkAddReceipt(this.jahr, this.journalid, files).subscribe({
        complete: () => {
          this.ref.close()
        }
      })
      this.ref.close()
  }
}
