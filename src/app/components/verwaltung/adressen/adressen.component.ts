/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { from, Subscription } from 'rxjs';
import { BackendService } from '@app/service/backend.service';
import { Adresse } from 'src/app/models/datatypes';
import { TableOptions, TableToolbar } from '../../shared/basetable/basetable.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AdresseEditComponent } from '../adresse-edit/adresse-edit.component';

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

  constructor(private backendService: BackendService, private dialogService: DialogService) { }

  ngOnInit(): void {

    this.cols = [
      { field: 'mnr', header: 'MNR', format: false, sortable: false, filtering: false, filter: '' },
      { field: 'name', header: 'Nachname', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'vorname', header: 'Vorname', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'adresse', header: 'Strasse', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'plz', header: 'PLZ', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'ort', header: 'Ort', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'land', header: 'Land', format: false, sortable: false, filtering: true, filter: 'text' },
      { field: "eintritt", header: 'Eintritt', format: true, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'sam_mitglied', header: 'SAM', format: false, sortable: true, filtering: true, filter: 'boolean' },
      { field: 'vorstand', header: 'Vorstand', format: false, sortable: true, filtering: true, filter: 'boolean' },
      { field: 'revisor', header: 'Revisor', format: false, sortable: true, filtering: true, filter: 'boolean' },
      { field: 'allianz', header: 'Allianz', format: false, sortable: true, filtering: true, filter: 'boolean' },
      { field: "austritt", header: 'Austritt', format: true, sortable: true, filtering: true, filter: 'numeric' },
    ];

    this.toolbar = [
      { label: "Email", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-send", isDefault: false, clickfnc: this.emailSelected },
      { label: "Edit", btnClass: "p-button-primary p-button-outlined", icon: "pi pi-file-edit", isDefault: true, clickfnc: this.editAdresse },
      { label: "New", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-plus", isDefault: true, clickfnc: this.addAdress },
    ];

    this.subs = from(this.backendService.getAdressenData())
      .subscribe(list => {
        this.adressList = list;
        this.adressList.forEach(adr => {
          adr.eintritt_date = new Date(adr.eintritt!);
          adr.austritt_date = new Date(adr.austritt!);
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

  }

  addAdress = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AdressenComponent = this;
    console.log("New Adresse");
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
        this.adressList.push(adresse)
        console.log(adresse)
      }
    });
  }
  editAdresse = (selRec?: Adresse) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AdressenComponent = this;
    console.log("Edit Adresse", selRec);

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
        thisRef.adressList = thisRef.adressList.map(obj => [adresse].find(o => o.id === obj.id) || obj);
        console.log(adresse)
      }
    });
  }
}
