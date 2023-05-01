import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Anlass } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, from } from 'rxjs';

@Component({
  selector: 'app-anlaesse-edit',
  templateUrl: './anlaesse-edit.component.html',
  styleUrls: ['./anlaesse-edit.component.scss'],
  providers: [DialogService]
})
export class AnlaesseEditComponent {
  anlass : Anlass = {}
  lstFKAnlaesse : Anlass[] = []
  dlstFKAnlaesse = [{value:undefined,id:undefined}]
  selFKAnlaesse = {value:undefined,id:undefined}
  subs! : Subscription
  lstStatus = [{name:'Aktiv', code: 1},{name:'Inaktiv', code: 0}]
  dialogRef!: DynamicDialogRef;

  constructor(
    private backendService: BackendService, 
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService) {
    this.anlass = config.data.anlass
    this.subs = from(this.backendService.getAnlaesseFKData())
      .subscribe(list => {
        this.dlstFKAnlaesse = list;
        
        if (this.anlass.anlaesseid) {
          const fFK = this.dlstFKAnlaesse.find(entry => entry.id == this.anlass.anlaesseid)
          if (fFK)
            this.selFKAnlaesse = fFK
        }
        console.log(this.dlstFKAnlaesse)
      });
  }

  back() {
    this.ref.close();
  }


  save(f: NgForm) {
    if (f.invalid) {
      this.messageService.add({detail: 'Die Daten sind noch nicht korrekt und können nicht gespeichert werden', closable: true, severity: 'error', summary: 'Adresse speichern' } );
      return;
    }

    if (this.anlass.datum != this.anlass.datum_date?.toISOString())
      this.anlass.datum = this.anlass.datum_date?.toISOString()

    this.backendService.updAnlaesseData(this.anlass).subscribe(
      {next: (anl) => {
        console.log(anl);
        this.ref.close(anl)
      }}
    )
    // this.ref.close(this.anlass);
  }


}
