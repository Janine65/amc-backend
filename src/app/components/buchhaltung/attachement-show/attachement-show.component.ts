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
        const filename = 'journal.pdf'
        const url = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        this.pdfFile = url;        
      }
    })
  }

}
