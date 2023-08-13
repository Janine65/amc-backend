import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { BackendService } from '@service/backend.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';


@Component({
  selector: 'app-attachement-show',
  templateUrl: './attachement-show.component.html',
  styleUrls: ['./attachement-show.component.scss']
})
export class AttachementShowComponent implements AfterViewInit, OnDestroy {

  receipt = ''
  pdfFile = '';
  documentBlobObjectUrl = ''
  
  constructor(private backendService: BackendService,
    public config: DynamicDialogConfig ) {
    this.receipt = config.data.receipt;
  }
  ngOnDestroy(): void {
    URL.revokeObjectURL(this.documentBlobObjectUrl);
  }
  ngAfterViewInit(): void {
    this.backendService.uploadAtt(this.receipt).subscribe(
      { next: (file) => {
        this.documentBlobObjectUrl = URL.createObjectURL(file);
        this.pdfFile = this.documentBlobObjectUrl;                
      }
     });
  }

}
