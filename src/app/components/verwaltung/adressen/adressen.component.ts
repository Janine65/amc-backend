import { Component, OnInit } from '@angular/core';
import { from, Subscription } from 'rxjs';
import { BackendService } from 'src/app/service/backend.service';
import { Adresse } from 'src/app/service/datatypes';
import { TableOptions, TableToolbar } from '../../shared/basetable/basetable.component';

@Component({
  selector: 'app-adressen',
  templateUrl: './adressen.component.html',
  styles: [
  ]
})
export class AdressenComponent implements OnInit {

  adressList : Adresse[] = [];
  loading = true;
  subs!: Subscription;

  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];

  constructor(private backendService: BackendService) {}
  ngOnInit(): void {
  
    this.cols = [
      {field: 'mnr', header: 'MNR', format: false, sortable: false, filtering: false, filter: ''},
      {field: 'name', header: 'Nachname', format: false, sortable: true, filtering: true, filter: 'text'},
      {field: 'vorname', header: 'Vorname', format: false, sortable: true, filtering: true, filter: 'text'},
      {field: 'adresse', header: 'Strasse', format: false, sortable: true, filtering: true, filter: 'text'},
      {field: 'plz', header: 'PLZ', format: false, sortable: true, filtering: true, filter: 'numeric'},
      {field: 'ort', header: 'Ort', format: false, sortable: true, filtering: true, filter: 'text'},
      {field: 'land', header: 'Land', format: false, sortable: false, filtering: true, filter: 'text'},
      {field: "eintritt", header: 'Eintritt', format: true, sortable: true, filtering: true, filter: 'numeric'},
      {field: 'sam_mitglied', header: 'SAM', format: false, sortable: true, filtering: true, filter: 'boolean'},
      {field: 'vorstand', header: 'Vorstand', format: false, sortable: true, filtering: true, filter: 'boolean'},
      {field: 'revisor', header: 'Revisor', format: false, sortable: true, filtering: true, filter: 'boolean'},
      {field: 'allianz', header: 'Allianz', format: false, sortable: true, filtering: true, filter: 'boolean'},
      {field: "austritt", header: 'Austritt', format: true, sortable: true, filtering: true, filter: 'numeric'},
    ];

    this.toolbar = [
      {label: "Email", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-send", clickfnc: this.emailSelected}
    ];

    this.subs = from(this.backendService.getAdressenData())
      .subscribe(list => {
        this.adressList = list;
        this.loading = false;
      });
    
  }

  formatField(field: string, value: string | number | boolean | null) : string | number | boolean | null {
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

  emailSelected(selRec?: Adresse, lstData?: Adresse[]) {
    console.log("Email an selectierte Adressen", lstData);
  }
}
