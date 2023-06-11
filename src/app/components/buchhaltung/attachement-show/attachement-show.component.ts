import { Component } from '@angular/core';
import { BackendService } from '@service/backend.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-attachement-show',
  templateUrl: './attachement-show.component.html',
  styleUrls: ['./attachement-show.component.scss']
})
export class AttachementShowComponent {

  receipt = ''
  pdfFile = '';
  
  constructor(private backendService: BackendService,
    public config: DynamicDialogConfig
  ) {
    this.receipt = config.data.receipt;
    this.backendService.uploadAtt(this.receipt).subscribe(
      { next: (file) => {
        // path to save file: src/assets/downloads
        const url = window.URL.createObjectURL(file);
        this.pdfFile = url;        
      }
    })
  }

}
