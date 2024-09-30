import { DatePipe, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Anlass, MeisterAdresse, Meisterschaft } from '@model/datatypes';
import { BackendService } from '@app/service';
import { TableOptions, TableToolbar } from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { map, zip } from 'rxjs';

@Component({
  selector: 'app-adresse-show',
  templateUrl: './adresse-show.component.html',
  styleUrls: ['./adresse-show.component.scss']
})
export class AdresseShowComponent {
  dialogRef?: DynamicDialogRef;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];
  lstEvents: Meisterschaft[] = []
  colsM: TableOptions[] = [];
  toolbarM: TableToolbar[] = [];
  lstMeister: MeisterAdresse[] = []
  adresseid = 0

  constructor(
    private backendService: BackendService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService) {
    this.adresseid = config.data.adresseid;

    this.cols = [
      { field: 'jahr', header: 'Jahr', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'event_datum_date', header: 'Datum', format: false, sortable: true, filtering: true, filter: 'date', pipe: DatePipe, args: 'dd.MM.yyyy' },
      { field: 'name', header: 'Name', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'punkte', header: 'Punkte', format: false, sortable: true, filtering: true, filter: 'numeric', pipe: DecimalPipe, args: '1.0-0' },
      { field: 'total_kegeln', header: 'Total Kegeln', format: false, sortable: true, filtering: true, filter: 'numeric', pipe: DecimalPipe, args: '1.0-0' },
      { field: 'streichresultat', header: 'Streichresultat', format: false, sortable: true, filtering: true, filter: 'boolean' },
    ];

    this.toolbar = [
      { label: 'Schliessen', btnClass: 'p-button-secondary p-button-outlined', clickfnc: this.back, disabledNoSelection: false, disabledWhenEmpty: false, icon: '', isDefault: false, roleNeeded: '' , isEditFunc: false}
    ];

    this.colsM = [
      { field: 'jahr', header: 'Jahr', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'rangC', header: 'Club Rang', format: false, sortable: true, filtering: true, filter: 'numeric'},
      { field: 'punkteC', header: 'Club Punkte', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'diffErsterC', header: 'Club Differenz', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'anlaesseC', header: 'Club Anlässe', format: false, sortable: true, filtering: true, filter: 'numeric'},
      { field: 'werbungenC', header: 'Club Werbungen', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'mitglieddauerC', header: 'Club Mitglieddauer', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'statusC', header: 'Club Status', format: false, sortable: true, filtering: true, filter: 'boolean' },
      { field: 'rangK', header: 'Kegel Rang', format: false, sortable: true, filtering: true, filter: 'numeric'},
      { field: 'punkteK', header: 'Kegel Punkte', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'diffErsterK', header: 'Kegel Differenz', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'anlaesseK', header: 'Kegel Anlässe', format: false, sortable: true, filtering: true, filter: 'numeric'},
      { field: 'babeliK', header: 'Kegel Babeli', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'statusC', header: 'Kegel Status', format: false, sortable: true, filtering: true, filter: 'boolean' },
    ];

    this.toolbarM = [
      { label: 'Schliessen', btnClass: 'p-button-secondary p-button-outlined', clickfnc: this.back, disabledNoSelection: false, disabledWhenEmpty: false, icon: '', isDefault: false, roleNeeded: '' , isEditFunc: false}
    ];

    zip(
      this.backendService.getAdresseMeisterschaft(this.adresseid),
      this.backendService.getAdresseMeister(this.adresseid))
      .pipe(map((result) => {
        console.log(result);
        this.lstEvents = result[0].data as Anlass[];
        this.lstEvents.forEach(rec => {
          rec.event_datum_date = new Date(rec.datum!);
        })
        this.lstMeister = result[1].data as MeisterAdresse[];
      }))
      .subscribe();
    
  }

  back = () => {
    this.ref.close();
  }


}
