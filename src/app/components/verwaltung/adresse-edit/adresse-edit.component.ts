import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, from } from 'rxjs';
import { BackendService } from '@app/service/backend.service';
import { Adresse, ParamData } from 'src/app/models/datatypes';
import { EmailDialogComponent } from '@app/components/shared/email-dialog/email-dialog.component';
import { EmailBody, EmailSignature } from '@app/components/shared/email-dialog/email-dialog.types';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-adresse-edit',
  templateUrl: './adresse-edit.component.html',
  styleUrls: ['./adresse-edit.component.scss'],
  providers: [DialogService]
})
export class AdresseEditComponent {
  adresse : Adresse = {}
  lstFKAdressen : Adresse[] = []
  dlstFKAdressen = [{value:undefined,id:undefined}]
  selFKAdressen = {value:undefined,id:undefined}
  subs! : Subscription
  lstGeschlecht = [{name:'Männlich', code: 1},{name:'Weiblich', code: 2}]
  dialogRef!: DynamicDialogRef;
  
  constructor(
    private backendService: BackendService, 
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
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
    const emailBody = new EmailBody ({
      email_an: this.adresse.email,
      email_cc: '',
      email_bcc: '',
      email_subject: '',
      email_body: '',
      email_signature: (Object.keys(EmailSignature)[Object.values(EmailSignature).indexOf(environment.defaultSignature as unknown as EmailSignature)] as unknown as EmailSignature)
    })

    this.dialogRef = this.dialogService.open(EmailDialogComponent, {
      data: {
        emailBody: emailBody
      },
      header: 'Email senden',
      width: '70%',
      height: '80%',
      resizable: true, 
      modal: true, 
      maximizable: true, 
      draggable: true
    });
    this.dialogRef.onClose.subscribe(() => {
      return
    });
  }

  async emailSAM(f: NgForm) {
    if (f.dirty) {
      if (f.invalid) {
        this.messageService.add({detail: 'Die Daten sind noch nicht korrekt und können nicht gespeichert werden', closable: true, severity: 'error', summary: 'Adresse speichern' } );
        return;
      }
  
      if (this.adresse.eintritt != this.adresse.eintritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}))
        this.adresse.eintritt = this.adresse.eintritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'})
      if (this.adresse.austritt != this.adresse.austritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}))
        this.adresse.austritt = this.adresse.austritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'})
  
      this.backendService.updateData(this.adresse).subscribe();      
    }

    const body = '<p>Neue Adresse per sofort:</br>' + 
        this.adresse.adresse + '</br>' + this.adresse.plz + ' ' + this.adresse.ort + '</br></p>' +
        '<p>Mit freundlichen Grüssen</p>'

    const emailBody = new EmailBody ({
      email_an: environment.samEmail,
      email_cc: '',
      email_bcc: '',
      email_subject: this.adresse.mnr_sam + ' - ' + this.adresse.vorname + ' ' + this.adresse.name,
      email_body: body,
      email_signature: (Object.keys(EmailSignature)[Object.values(EmailSignature).indexOf(environment.defaultSignature as unknown as EmailSignature)] as unknown as EmailSignature)
    })

    this.dialogRef = this.dialogService.open(EmailDialogComponent, {
      data: {
        emailBody: emailBody
      },
      header: 'Email senden',
      width: '70%',
      height: '80%',
      resizable: true, 
      modal: true, 
      maximizable: true, 
      draggable: true
    });
    this.dialogRef.onClose.subscribe(() => {
      return
    });


  }
  async emailSAMAustritt(f: NgForm) {
    if (f.dirty) {
      if (f.invalid) {
        this.messageService.add({detail: 'Die Daten sind noch nicht korrekt und können nicht gespeichert werden', closable: true, severity: 'error', summary: 'Adresse speichern' } );
        return;
      }
  
      if (this.adresse.eintritt != this.adresse.eintritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}))
        this.adresse.eintritt = this.adresse.eintritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'})
      if (this.adresse.austritt != this.adresse.austritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}))
        this.adresse.austritt = this.adresse.austritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'})
  
      this.backendService.updateData(this.adresse).subscribe();      
    }

    const body = '<p>Austrittsmeldung per Ende Jahr für:</br>' + 
        this.adresse.mnr_sam + ' - ' + this.adresse.vorname + ' ' + this.adresse.name + '</p>' +
        '<p>Mit freundlichen Grüssen</p>'

    const emailBody = new EmailBody ({
      email_an: environment.samEmail,
      email_cc: '',
      email_bcc: '',
      email_subject: this.adresse.mnr_sam + ' - ' + this.adresse.vorname + ' ' + this.adresse.name,
      email_body: body,
      email_signature: (Object.keys(EmailSignature)[Object.values(EmailSignature).indexOf(environment.defaultSignature as unknown as EmailSignature)] as unknown as EmailSignature)
    })

    this.dialogRef = this.dialogService.open(EmailDialogComponent, {
      data: {
        emailBody: emailBody
      },
      header: 'Email senden',
      width: '70%',
      height: '80%',
      resizable: true, 
      modal: true, 
      maximizable: true, 
      draggable: true
    });
    this.dialogRef.onClose.subscribe(() => {
      return
    });


  }
  exportEmpty = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    console.log("Datenblatt leer für Adresse erstellen");
    const str = localStorage.getItem('parameter');
    const parameter = str ? JSON.parse(str) : [];
    const paramJahr = parameter.find((param:ParamData) => param.key === 'CLUBJAHR');
    from(this.backendService.getSheet({year: Number(paramJahr?.value), type: 1, id: this.adresse.id})).subscribe(
      (response) => {
        if (response.type == 'info') {
          this.backendService.downloadFile(response.filename).subscribe(
            {
              next(data) {
                if (data.body) {
                  const blob = new Blob([data.body]);
                  const downloadURL = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadURL;
                  link.download = response.filename;
                  link.click();
                }
              },
            }
          )
        }
      }
    )
  }
  exportFull = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    console.log("Datenblatt voll für alle erstellen");
    const str = localStorage.getItem('parameter');
    const parameter = str ? JSON.parse(str) : [];
    const paramJahr = parameter.find((param:ParamData) => param.key === 'CLUBJAHR');
    from(this.backendService.getSheet({year: Number(paramJahr?.value), type: 2, id: this.adresse.id})).subscribe(
      (response) => {
        if (response.type == 'info') {
          this.backendService.downloadFile(response.filename).subscribe(
            {
              next(data) {
                if (data.body) {
                  const blob = new Blob([data.body]);
                  const downloadURL = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadURL;
                  link.download = response.filename;
                  link.click();
                }
              },
            }
          )
        }
      }
    )
  }

  save(f: NgForm) {
    if (f.invalid) {
      this.messageService.add({detail: 'Die Daten sind noch nicht korrekt und können nicht gespeichert werden', closable: true, severity: 'error', summary: 'Adresse speichern' } );
      return;
    }

    if (this.adresse.eintritt != this.adresse.eintritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}))
      this.adresse.eintritt = this.adresse.eintritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'})
    if (this.adresse.austritt != this.adresse.austritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'}))
      this.adresse.austritt = this.adresse.austritt_date?.toLocaleDateString('fr-CA', {year: 'numeric', month: '2-digit', day: '2-digit'})

    this.backendService.updateData(this.adresse).subscribe(
      {next: (adr) => {
        this.ref.close(adr)
      }}
    )
    this.ref.close(this.adresse);
  }
}
