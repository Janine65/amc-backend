import { Component, OnInit } from '@angular/core';
import { from, Subscription } from 'rxjs';
import { BackendService } from 'src/app/service/backend.service';
import { Adresse } from 'src/app/service/datatypes';
import { TableOptions } from '../../shared/basetable/basetable.component';

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

  constructor(private backendService: BackendService) {}
  ngOnInit(): void {
  
    this.cols = [
      {field: 'id', header: 'ID'},
      {field: 'mnr', header: 'MNR', sortable: false, filtering: false, filter: ''},
      {field: 'name', header: 'Nachname', sortable: true, filtering: true, filter: '<p-columnFilter type="text" field="name" display="menu"></p-columnFilter>'},
      {field: 'vorname', header: 'Vorname', sortable: false, filtering: false, filter: ''},
      {field: 'adresse', header: 'Strasse', sortable: false, filtering: false, filter: ''},
      {field: 'plz', header: 'PLZ', sortable: false, filtering: false, filter: ''},
      {field: 'ort', header: 'Ort', sortable: false, filtering: false, filter: ''},
      {field: 'land', header: 'Land', sortable: false, filtering: false, filter: ''},
      {field: "eintritt", header: 'Eintritt', format: true, sortable: false, filtering: false, filter: ''},
      {field: 'sam_mitglied', header: 'SAM', sortable: false, filtering: false, filter: ''},
      {field: 'vorstand', header: 'Vorstand', sortable: false, filtering: false, filter: ''},
      {field: 'revisor', header: 'Revisor', sortable: false, filtering: false, filter: ''},
      {field: 'allianz', header: 'Allianz', sortable: false, filtering: false, filter: ''},
      {field: "austritt", header: 'Austritt', format: true, sortable: false, filtering: false, filter: ''},
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
        const retValue = dt.getFullYear().toString()
        return retValue;
        
      case 'vorstand':
      case 'sam_mitglied':
      case 'ehrenmitglied':
      case 'revisor':
      case 'allianz':
        return value ? 'Ja' : 'Nein';

      default:
        return value;
    }
  }

}
