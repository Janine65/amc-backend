import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, from } from 'rxjs';
import { BackendService } from '@app/service/backend.service';
import { Adresse } from 'src/app/models/datatypes';

@Component({
  selector: 'app-adresse-edit',
  templateUrl: './adresse-edit.component.html',
  styleUrls: ['./adresse-edit.component.scss'],
  providers: [MessageService]
})
export class AdresseEditComponent {
  adresse : Adresse = {}
  lstFKAdressen : Adresse[] = []
  dlstFKAdressen = [{value:undefined,id:undefined}]
  selFKAdressen = {value:undefined,id:undefined}
  subs! : Subscription
  lstGeschlecht = [{name:'Männlich', code: 1},{name:'Weiblich', code: 2}]
  
  constructor(
    private backendService: BackendService, 
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig,
    private messageService: MessageService) {
    this.adresse = config.data.adresse
    this.subs = from(this.backendService.getAdressenFK())
      .subscribe(list => {
        this.dlstFKAdressen = list;
        
        if (this.adresse.adressenid) {
          const fFK = this.dlstFKAdressen.find(entry => entry.id == this.adresse.adressenid)
          if (fFK)
            this.selFKAdressen = fFK
        }
        console.log(this.dlstFKAdressen)
      });
  }

  back() {
    this.ref.close();
  }

  sendEmail() {
    return
  }

  save(f: NgForm) {
    if (f.invalid) {
      this.messageService.add({detail: 'Die Daten sind noch nicht korrekt und können nicht gespeichert werden', closable: true, severity: 'error', summary: 'Adresse speichern' } );
      return;
    }

    if (this.adresse.eintritt != this.adresse.eintritt_date?.toISOString())
      this.adresse.eintritt = this.adresse.eintritt_date?.toISOString()
    if (this.adresse.austritt != this.adresse.austritt_date?.toISOString())
      this.adresse.austritt = this.adresse.austritt_date?.toISOString()

    this.backendService.updateData(this.adresse).subscribe(
      {next: () => {
        this.ref.close(this.adresse)
      }}
    )


    this.ref.close(this.adresse);
  }
}
