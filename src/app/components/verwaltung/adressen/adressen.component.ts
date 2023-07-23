/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { from, Subscription } from 'rxjs';
import { BackendService } from '@app/service/backend.service';
import { Adresse } from '@model/datatypes';
import { TableOptions, TableToolbar } from '../../shared/basetable/basetable.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AdresseEditComponent } from '../adresse-edit/adresse-edit.component';
import { EmailBody, EmailSignature } from '@app/components/shared/email-dialog/email-dialog.types';
import { EmailDialogComponent } from '@app/components/shared/email-dialog/email-dialog.component';
import { environment } from '@environments/environment';
import { MessageService } from 'primeng/api';
import { DatePipe, DecimalPipe } from '@angular/common';


export class AdresseFilter {
  public name: string;
  public vorname: string;
  public adresse: string;
  public plz: string;
  public ort: string;
  public sam_mitglied: string;
  public vorstand: string;
  public revisor: string;
  public ehrenmitglied: string;

  constructor() {
    this.name = '';
    this.vorname = '';
    this.adresse = '';
    this.plz = '';
    this.ort = '';
    this.sam_mitglied = '';
    this.vorstand = '';
    this.revisor = '';
    this.ehrenmitglied = '';
  }

  //  {adresse: '', name: '', vorname: '', ort: '', plz: '', sam_mitglied: '', vorstand: '', revisor: '', ehrenmitglied: ''};

}

@Component({
  selector: 'app-adressen',
  templateUrl: './adressen.component.html',
  styles: [
  ],
  providers: [DialogService]
})
export class AdressenComponent implements OnInit {

  adressList: Adresse[] = [];
  loading = true;
  subs!: Subscription;

  dialogRef?: DynamicDialogRef;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];

  constructor(
    private backendService: BackendService, 
    private dialogService: DialogService, 
    private messageService: MessageService) { }

  ngOnInit(): void {

    this.cols = [
      { field: 'mnr', header: 'MNR', format: false, sortable: false, filtering: false, filter: '', pipe: DecimalPipe, args: '1.0-0' },
      { field: 'name', header: 'Nachname', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'vorname', header: 'Vorname', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'adresse', header: 'Strasse', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'plz', header: 'PLZ', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'ort', header: 'Ort', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'land', header: 'Land', format: false, sortable: false, filtering: true, filter: 'text' },
      { field: "eintritt", header: 'Eintritt', format: false, sortable: true, filtering: true, filter: 'text', pipe: DatePipe, args: 'yyyy' },
      { field: 'sam_mitglied', header: 'SAM', format: false, sortable: true, filtering: true, filter: 'boolean' },
      { field: 'vorstand', header: 'Vorstand', format: false, sortable: true, filtering: true, filter: 'boolean' },
      { field: 'revisor', header: 'Revisor', format: false, sortable: true, filtering: true, filter: 'boolean' },
      { field: 'allianz', header: 'Allianz', format: false, sortable: true, filtering: true, filter: 'boolean' },
      { field: "austritt", header: 'Austritt', format: false, sortable: true, filtering: true, filter: 'text', pipe: DatePipe, args: 'yyyy' },
    ];

    this.toolbar = [
      {
        label: "Email", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-send",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: false, clickfnc: this.emailSelected, roleNeeded: '', isEditFunc: false
      },
      {
        label: "Edit", btnClass: "p-button-primary p-button-outlined", icon: "pi pi-file-edit",
        isDefault: true, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.editAdresse, roleNeeded: '', isEditFunc: true
      },
      {
        label: "Delete", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-minus",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.delAdresse, roleNeeded: '', isEditFunc: false
      },
      {
        label: "New", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-plus",
        isDefault: false, disabledWhenEmpty: false, disabledNoSelection: false, clickfnc: this.addAdress, roleNeeded: '', isEditFunc: false
      },
      {
        label: "Export", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-file-excel",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: false, clickfnc: this.exportAdressen, roleNeeded: '', isEditFunc: false
      },
      {
        label: "Billing", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-file-excel",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: false, clickfnc: this.billAdressen, roleNeeded: 'admin', isEditFunc: false
      },
    ];

    this.subs = from(this.backendService.getAdressenData())
      .subscribe(list => {
        this.adressList = list;
        this.adressList.forEach(adr => {
          adr.eintritt_date = new Date(adr.eintritt!);
          adr.austritt_date = new Date(adr.austritt!);
          if (adr.austritt !== '3000-01-01')
            adr.classRow = 'inactive';
        })
        this.loading = false;
      });

  }

  formatField(field: string, value: string | number | boolean | null): string | number | boolean | null {
    switch (field) {
      case 'eintritt':
      case 'austritt':
        // eslint-disable-next-line no-case-declarations
        const dt: Date = new Date((value as string));
        // eslint-disable-next-line no-case-declarations
        const retValue = dt.getFullYear()
        if (retValue === 3000)
          return null
        return retValue;

      default:
        return value;
    }
  }

  emailSelected = (selRec?: Adresse, lstData?: Adresse[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    const thisRef: AdressenComponent = this;
    console.log("Email an selectierte Adressen", lstData);
    thisRef.messageService.clear();
    const emailBody = new EmailBody({
      email_an: environment.defaultEmail,
      email_cc: '',
      email_bcc: '',
      email_subject: '',
      email_body: '',
      email_signature: (Object.keys(EmailSignature)[Object.values(EmailSignature).indexOf(environment.defaultSignature as unknown as EmailSignature)] as unknown as EmailSignature)
    })

    lstData?.forEach(adresse => emailBody.email_bcc += adresse.email != '' ? adresse.email + ';' : '');
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

  addAdress = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AdressenComponent = this;
    console.log("New Adresse");
    thisRef.messageService.clear();
    const newAdr = new Adresse();
    newAdr.eintritt_date = new Date()
    newAdr.austritt_date = new Date('3000-01-01')
    newAdr.sam_mitglied = true;
    newAdr.allianz = false;
    newAdr.ehrenmitglied = false;
    newAdr.revisor = false;
    newAdr.vorstand = false;
    newAdr.land = 'CH'
    newAdr.mnr = undefined

    thisRef.dialogRef = thisRef.dialogService.open(AdresseEditComponent, {
      data: {
        adresse: newAdr
      },
      header: 'Neue Adresse erfassen',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true
    });
    thisRef.dialogRef.onClose.subscribe((adresse: Adresse) => {
      if (adresse) {
        adresse.eintritt_date = new Date(adresse.eintritt!);
        adresse.austritt_date = new Date(adresse.austritt!);

        this.adressList.push(adresse)
        console.log(adresse)
      }
    });
  }
  editAdresse = (selRec?: Adresse) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AdressenComponent = this;
    console.log("Edit Adresse", selRec);
    thisRef.messageService.clear();

    const newAdr = new Adresse();
    Object.assign(newAdr, selRec);

    thisRef.dialogRef = thisRef.dialogService.open(AdresseEditComponent, {
      data: {
        adresse: selRec
      },
      header: 'Adresse ändern',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true
    });
    thisRef.dialogRef.onClose.subscribe((adresse: Adresse) => {
      if (adresse) {
        adresse.eintritt_date = new Date(adresse.eintritt!);
        adresse.austritt_date = new Date(adresse.austritt!);
        thisRef.adressList = thisRef.adressList.map(obj => [adresse].find(o => o.id === obj.id) ?? obj);
        console.log(adresse)
      }
    });
  }


  delAdresse = (selRec?: Adresse) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AdressenComponent = this;
    console.log("Delete Adresse", selRec);
    thisRef.messageService.clear();

    if (selRec?.austritt != '3000-01-01') {
      thisRef.messageService.add({ detail: 'Dieses Mitglied hat bereits ein Austrittsdatum.', closable: true, severity: 'error', summary: 'Adresse beenden' });
      return
    }

    thisRef.backendService.removeData(selRec).subscribe(
      {
        complete: () => {
          thisRef.backendService.getOneAdress(selRec.id!).subscribe(
            {
              next: (adresse) => {
                adresse.eintritt_date = new Date(adresse.eintritt!);
                adresse.austritt_date = new Date(adresse.austritt!);
                thisRef.adressList = thisRef.adressList.map(obj => adresse.id === obj.id ? adresse : obj);
                thisRef.messageService.add({ detail: 'Das Austrittsdatum wurde auf den 31.12. gesetz', closable: true, severity: 'info', summary: 'Adresse beenden' });
              }
            }
          )
        }
      }
    )
  }

  billAdressen = (selRec?: Adresse, lstData?: Adresse[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef = this;
    if (lstData) {
      lstData.forEach( (adresse) => {
        this.backendService.qrBillAdresse(adresse).subscribe(
          { complete() {
            thisRef.messageService.add({detail: `Rechnung für ${adresse.vorname} ${adresse.name} wurde erstellt`, closable: true, severity: 'info', summary: 'Rechnung erstellen'});
            }
          }
        )
      })
    }
  }

  exportAdressen = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef = this;
    const filter: AdresseFilter = new AdresseFilter();

    const locStore = localStorage.getItem('adressen');

    if (locStore) {
      const filters = JSON.parse(locStore).filters;
      if (filters != undefined) {
        if (filters.name) {
          if (filters.name[0].value)
            filter.name = filters.name[0].value;
        }
        if (filters.vorname) {
          if (filters.vorname[0].value)
            filter.vorname = filters.vorname[0].value;
        }
        if (filters.adresse) {
          if (filters.adresse[0].value)
            filter.adresse = filters.adresse[0].value;
        }
        if (filters.plz) {
          if (filters.plz[0].value)
            filter.plz = filters.plz[0].value;
        }
        if (filters.ort) {
          if (filters.ort[0].value)
            filter.ort = filters.ort[0].value;
        }
        if (filters.sam_mitglied) {
          if (filters.sam_mitglied[0].value)
            filter.sam_mitglied = filters.sam_mitglied[0].value;
        }
        if (filters.vorstand) {
          if (filters.vorstand[0].value)
            filter.sam_mitglied = filters.vorstand[0].value;
        }
        if (filters.revisor) {
          if (filters.revisor[0].value)
            filter.sam_mitglied = filters.revisor[0].value;
        }
        console.log(filter);
      }
    }
    console.log("Expoert Adressen");

    thisRef.backendService.exportAdressData(filter).subscribe(
      {
        next: (result) => {
          if (result.body && result.body.type == 'info') {
            thisRef.backendService.downloadFile(result.body.filename).subscribe(
              {
                next(data) {
                  if (data.body) {
                    const blob = new Blob([data.body]);
                    const downloadURL = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadURL;
                    link.download = result.body.filename;
                    link.click();
                  }
                },
              }
            )
          }
        }
      });
  }
}