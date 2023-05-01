/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit } from '@angular/core';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { from } from 'rxjs';
import { Anlass } from '@model/datatypes';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableOptions, TableToolbar } from '@shared/basetable/basetable.component';
import { AnlaesseEditComponent } from '../anlaesse-edit/anlaesse-edit.component';

@Component({
  selector: 'app-anlaesse',
  templateUrl: './anlaesse.component.html',
  styles: [
  ],
  providers: [DialogService]
})
export class AnlaesseComponent implements OnInit{
  anlaesseList: Anlass[] = [];
  anlaesseListAll: Anlass[] = [];
  loading = true;

  dialogRef?: DynamicDialogRef;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];

  selJahre = [{}]
  selJahr = 0;

  constructor(
    private backendService: BackendService, 
    private dialogService: DialogService, 
    private messageService: MessageService) {}
  ngOnInit(): void {

    this.cols = [
      { field: 'datum_date', header: 'Datum', format: false, sortable: true, filtering: true, filter: 'date' },
      { field: 'name', header: 'Name', format: false, sortable: true, filtering: true, filter: 'text' },
      { field: 'status', header: 'Status', format: true, sortable: true, filtering: true, filter: 'text' },
      { field: 'punkte', header: 'Punkte', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'gaeste', header: 'Gäste', format: false, sortable: true, filtering: true, filter: 'numeric' },
      { field: 'istkegeln', header: 'Kegeln?', format: false, sortable: true, filtering: true, filter: 'boolean' },
      { field: 'nachkegeln', header: 'Nachkegeln?', format: false, sortable: false, filtering: true, filter: 'boolean' },
      { field: "istsamanlass", header: 'SAM-Anlass?', format: true, sortable: true, filtering: true, filter: 'boolean' },
      { field: 'vorjahr', header: 'Vorjahres Termin', format: false, sortable: true, filtering: true, filter: 'text' },
    ];

    this.toolbar = [
      {
        label: "Punkte vergeben", btnClass: "p-button-primary p-button-outlined", icon: "pi pi-file-excel",
        isDefault: true, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.doAnlass, roleNeeded: ''
      },
      {
        label: "Datenblatt", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-file-excel",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: false, clickfnc: this.exportOne, roleNeeded: ''
      },
      {
        label: "leer", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-file-excel",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: false, clickfnc: this.exportAllEmpty, roleNeeded: ''
      },
      {
        label: "voll", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-file-excel",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: false, clickfnc: this.exportAllFull, roleNeeded: ''
      },
      {
        label: "Edit", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-file-edit",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.editAnlass, roleNeeded: ''
      },
      {
        label: "Copy", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-copy",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.copyAnlass, roleNeeded: ''
      },
      {
        label: "Delete", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-minus",
        isDefault: false, disabledWhenEmpty: true, disabledNoSelection: true, clickfnc: this.delAnlass, roleNeeded: ''
      },
      {
        label: "New", btnClass: "p-button-secondary p-button-outlined", icon: "pi pi-plus",
        isDefault: false, disabledWhenEmpty: false, disabledNoSelection: false, clickfnc: this.addAnlass, roleNeeded: ''
      },
    ];

    this.selJahr = new Date().getFullYear();
    this.selJahre.pop();
    this.selJahre.push({label: (this.selJahr - 1).toString(), value: this.selJahr - 1});
    this.selJahre.push({label: this.selJahr.toString(), value: this.selJahr});
    this.selJahre.push({label: (this.selJahr + 1).toString(), value: this.selJahr + 1});
    
    // read Anlaesse
    from(this.backendService.getAnlaesseData()).subscribe(
      (list) => {
        this.anlaesseListAll = list;
        this.anlaesseListAll.forEach(anl => {
          anl.datum_date = new Date(anl.datum ? anl.datum : '');
          anl.vorjahr = (anl.linkedEvent ? anl.linkedEvent.vorjahr : '');
        })
        this.chgJahr()
        this.loading = false;
      }
    )
  }

  formatField(field: string, value: string | number | boolean | null): string | number | boolean | null {
    switch (field) {
      case 'status': 
        return (value && (value as number) == 1 ? 'Aktiv' : 'Inaktiv')
      
      default:
        return value;
    }
  }

  chgJahr() {
    this.anlaesseList = this.anlaesseListAll.filter(anl => anl.datum_date?.getFullYear() === this.selJahr)
  }

  addAnlass = (_selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    const thisRef: AnlaesseComponent = this;
    console.log("Neuer Anlass erfassen");
    thisRef.messageService.clear();
    const newAnl = new Anlass();
    newAnl.datum_date = new Date()
    newAnl.status = 1;
    newAnl.punkte = 50;

    thisRef.dialogRef = thisRef.dialogService.open(AnlaesseEditComponent, {
      data: {
        anlass: newAnl
      },
      header: 'Neuer Anlass erfassen',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true
    });
    thisRef.dialogRef.onClose.subscribe((anlass: Anlass) => {
      if (anlass) {
        anlass.datum_date = new Date(anlass.datum!);

        thisRef.anlaesseListAll.push(anlass);
        thisRef.chgJahr()
        console.log(anlass)
      }
    });
  }

  editAnlass = (selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    const thisRef: AnlaesseComponent = this;
    console.log("Anlass ändern", selRec);
    thisRef.messageService.clear();

    const newAnl = new Anlass();
    Object.assign(newAnl, selRec);

    thisRef.dialogRef = thisRef.dialogService.open(AnlaesseEditComponent, {
      data: {
        anlass: selRec
      },
      header: 'Anlass ändern',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true
    });
    thisRef.dialogRef.onClose.subscribe((anlass: Anlass) => {
      if (anlass) {
        anlass.datum_date = new Date(anlass.datum!);
        thisRef.anlaesseListAll = thisRef.anlaesseListAll.map(obj => [anlass].find(o => o.id === obj.id) || obj);
        thisRef.chgJahr()
        console.log(anlass)
      }
    });
  }

  copyAnlass = (selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    const thisRef: AnlaesseComponent = this;
    console.log("Anlass kopieren", selRec);
    thisRef.messageService.clear();
    const newAnl = new Anlass();
    Object.assign(newAnl, selRec);
    newAnl.id = undefined;
    newAnl.anlaesseid = selRec?.id;
    let newYear = selRec?.datum_date?.getFullYear();
    if (newYear) {
      newYear++;
      newAnl.datum_date?.setFullYear(newYear);
    }
    newAnl.status = 1;

    thisRef.dialogRef = thisRef.dialogService.open(AnlaesseEditComponent, {
      data: {
        anlass: newAnl
      },
      header: 'Neuer Anlass erfassen (Kopie)',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true
    });
    thisRef.dialogRef.onClose.subscribe((anlass: Anlass) => {
      if (anlass) {
        anlass.datum_date = new Date(anlass.datum!);

        thisRef.anlaesseListAll.push(anlass);
        thisRef.chgJahr()
        console.log(anlass)
      }
    });
  }

  delAnlass = (selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    const thisRef: AnlaesseComponent = this;
    console.log("Anlass löschen", selRec);
    thisRef.messageService.clear();

    thisRef.backendService.delAnlaesseData(selRec!).subscribe(
      {
        complete: () => {
          thisRef.backendService.getOneAnlass(selRec!.id!).subscribe(
            {
              next: (anlass) => {
                anlass.datum_date = new Date(anlass.datum!);
                thisRef.anlaesseListAll = thisRef.anlaesseListAll.map(obj => anlass.id === obj.id ? anlass : obj);
                thisRef.anlaesseList = thisRef.anlaesseListAll.map(obj => anlass.id === obj.id ? anlass : obj);
                thisRef.messageService.add({ detail: 'Der Anlass wurde gelöscht', closable: true, severity: 'info', summary: 'Anlass beenden' });
              }
            }
          )
        }
      }
    )
  }

  doAnlass = (selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    const thisRef: AnlaesseComponent = this;
    console.log("Anlass buchen", selRec);
  }

  exportOne = (_selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    const thisRef: AnlaesseComponent = this;
    console.log("Datenblatt erstellen");
    from(this.backendService.getSheet({year: this.selJahr, type: 0, id: null})).subscribe(
      (response) => {
        if (response.type == 'info') {
          thisRef.backendService.downloadFile(response.filename).subscribe(
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

  exportAllEmpty = (_selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    const thisRef: AnlaesseComponent = this;
    console.log("Datenblatt leer für alle erstellen");
    from(this.backendService.getSheet({year: this.selJahr, type: 1, id: 0})).subscribe(
      (response) => {
        if (response.type == 'info') {
          thisRef.backendService.downloadFile(response.filename).subscribe(
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
  exportAllFull = (_selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, @typescript-eslint/no-unused-vars
    const thisRef: AnlaesseComponent = this;
    console.log("Datenblatt voll für alle erstellen");
    from(this.backendService.getSheet({year: this.selJahr, type: 2, id: 0})).subscribe(
      (response) => {
        if (response.type == 'info') {
          thisRef.backendService.downloadFile(response.filename).subscribe(
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
}
