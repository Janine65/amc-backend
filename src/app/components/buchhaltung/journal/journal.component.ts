/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { Account, Fiscalyear, Journal, ParamData } from '@model/datatypes';
import { BackendService } from '@app/service';
import {
  TableOptions,
  TableToolbar,
} from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, map, zip } from 'rxjs';
import { AttachementListComponent } from '../attachement-list/attachement-list.component';
import { AttachmentAddComponent } from '../attachment-add/attachment-add.component';
import { DatePipe, DecimalPipe } from '@angular/common';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
  providers: [DialogService],
})
export class JournalComponent implements OnInit {
  dialogRef?: DynamicDialogRef;

  selJahre = [{}];
  selJahr = 0;

  lstJournal: Journal[] = [];
  selJournal: Journal = {};
  loading = true;
  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];
  toolbarRW: TableToolbar[] = [];
  toolbarRO: TableToolbar[] = [];
  editMode = false;
  addMode = false;

  lstStates = [
    { label: 'Aktiv', value: 1 },
    { label: 'Inaktiv', value: 0 },
  ];
  selState = 1;
  parameter: ParamData[];
  jahr: number;
  lstAccounts: Account[] = [];
  lstFromAccounts: Account[] = [];
  lstToAccounts: Account[] = [];
  selFromAccount: Account = {};
  selToAccount: Account = {};
  selFiscalyear: Fiscalyear = {};

  constructor(
    private backendService: BackendService,
    private dialogService: DialogService,
    private messageService: MessageService
  ) {
    const str = localStorage.getItem('parameter');
    this.parameter = str ? JSON.parse(str) : [];
    const paramJahr = this.parameter.find((param) => param.key === 'CLUBJAHR');
    this.jahr = Number(paramJahr?.value);
    this.selJahr = this.jahr;
    this.selJahre.pop();
    this.selJahre.push({
      label: (this.jahr - 1).toString(),
      value: this.jahr - 1,
    });
    this.selJahre.push({ label: this.jahr.toString(), value: this.jahr });
    this.selJahre.push({
      label: (this.jahr + 1).toString(),
      value: this.jahr + 1,
    });
  }

  ngOnInit(): void {
    this.cols = [
      {
        field: 'journalno',
        header: 'No.',
        format: false,
        sortable: true,
        filtering: false,
        filter: 'numeric',
        pipe: DecimalPipe,
        args: '1.0-0',
      },
      {
        field: 'date',
        header: 'Datum',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'date',
        pipe: DatePipe,
        args: 'dd.MM.yyyy',
      },
      {
        field: 'fromAcc',
        header: 'Konto Soll',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'toAcc',
        header: 'Konto Haben',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'memo',
        header: 'Buchungstext',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'amount',
        header: 'Betrag',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
        pipe: DecimalPipe,
        args: '1.2-2',
      },
    ];

    this.toolbarRW = [
      {
        label: 'Edit',
        btnClass: 'p-button-primary p-button-outlined',
        icon: 'pi pi-file-edit',
        isDefault: true,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.editJournal,
        roleNeeded: 'admin',
        isEditFunc: true,
      },
      {
        label: 'Delete',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-minus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.delJournal,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'New',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-plus',
        isDefault: false,
        disabledWhenEmpty: false,
        disabledNoSelection: false,
        clickfnc: this.addJournal,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Copy',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-plus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.copyJournal,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-list',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.showAtt,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-plus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.addAtt,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Alle Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-list',
        isDefault: false,
        disabledWhenEmpty: false,
        disabledNoSelection: false,
        clickfnc: this.showAllAtt,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-upload',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.addNewAtt,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Export',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-download',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportJournal,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Export +',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-download',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportJournalAll,
        roleNeeded: '',
        isEditFunc: false,
      },
    ];
    this.toolbarRO = [
      {
        label: 'Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-list',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.showAtt,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Alle Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-list',
        isDefault: false,
        disabledWhenEmpty: false,
        disabledNoSelection: false,
        clickfnc: this.showAllAtt,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Export',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-download',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportJournal,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Export +',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-download',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportJournalAll,
        roleNeeded: '',
        isEditFunc: false,
      },
    ];
    this.readJournal();
  }

  isEditable() {
    if (this.selFiscalyear) return this.selFiscalyear.state < 3;
    else return false;
  }
  private readJournal() {
    zip(
      this.backendService.getJournal(this.selJahr),
      this.backendService.getAccount(),
      this.backendService.getOneFiscalyear(this.selJahr.toString())
    )
      .pipe(
        map(([list1, list2, result]) => {
          this.lstJournal = list1.data as Journal[];
          this.lstJournal.forEach((x) => {
            x.date_date = new Date(x.date);
            x.fromAcc =
              x.fromAccountAccount?.order.toFixed(0) +
              ' ' +
              x.fromAccountAccount.name;
            x.from_account = x.fromAccountAccount?.id;
            x.toAcc =
              x.toAccountAccount?.order.toFixed(0) +
              ' ' +
              x.toAccountAccount.name;
            x.to_account = x.toAccountAccount?.id;
          });
          this.lstAccounts = list2.data as Account[];
          this.selFiscalyear = result.data as Fiscalyear;
          if (!this.selFiscalyear || this.selFiscalyear.state == 3)
            this.toolbar = this.toolbarRO;
          else this.toolbar = this.toolbarRW;
          this.loading = false;
        })
      )
      .subscribe();
  }

  formatField(
    field: string,
    value: string | number | boolean | null
  ): string | number | boolean | null {
    if (field == 'date') {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };
      return new Intl.DateTimeFormat('de-CH', options).format(
        new Date(value as string)
      );
      //return new Date((value as string)).toLocaleDateString('de-CH', options)
    }
    return value;
  }

  chgJahr() {
    this.readJournal();
  }

  fromAccountSel(acc: Account) {
    // document why this method 'fromAccountSel' is empty
    this.lstFromAccounts = [];
    this.selJournal.fromAccountAccount = acc;
  }

  toAccountSel(acc: Account) {
    // document why this method 'fromAccountSel' is empty
    this.lstToAccounts = [];
    this.selJournal.toAccountAccount = acc;
  }

  fromAccountSearch(event: AutoCompleteCompleteEvent) {
    // document why this method 'fromAccountSel' is empty
    this.lstFromAccounts = [];
    const lstString = event.query.split(' ');
    if (!lstString || lstString.length == 0) return;

    this.lstFromAccounts = this.lstAccounts.filter((acc) => {
      let match = false;
      lstString.forEach((text) => {
        const regex = new RegExp(text, 'i');
        const matchL = RegExp(regex).exec(acc.name);
        const matchV = RegExp(regex).exec(String(acc.order));
        if (matchL || matchV) match = true;
      });
      return match;
    });
    if (this.lstFromAccounts.length == 1) {
      this.fromAccountSel(this.lstFromAccounts[0]);
    }
  }

  toAccountSearch(event: AutoCompleteCompleteEvent) {
    // document why this method 'toAccountSel' is empty
    this.lstToAccounts = [];
    const lstString = event.query.split(' ');
    if (!lstString || lstString.length == 0) return;

    this.lstToAccounts = this.lstAccounts.filter((acc) => {
      let match = false;
      lstString.forEach((text) => {
        const regex = new RegExp(text, 'i');
        const matchL = RegExp(regex).exec(acc.name);
        const matchV = RegExp(regex).exec(String(acc.order));
        if (matchL || matchV) match = true;
      });
      return match;
    });
    if (this.lstToAccounts.length == 1) {
      this.toAccountSel(this.lstToAccounts[0]);
    }
  }

  exportJournal = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.add({
      severity: 'info',
      detail: 'Der Download startet gleich. Bitte warten.',
      sticky: true,
      closable: false,
    });
    thisRef.backendService.exportJournal(thisRef.selJahr, 0).subscribe({
      next: (result) => {
        if (result.type == 'info') {
          const filename = result.data.filename;
          thisRef.backendService.downloadFile(filename).subscribe({
            next(data) {
              if (data.body) {
                const blob = new Blob([data.body]);
                const downloadURL = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadURL;
                link.download = filename;
                link.click();
                thisRef.messageService.clear();
              }
            },
          });
        }
      },
    });
  };

  exportJournalAll = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.add({
      severity: 'info',
      detail: 'Der Download startet gleich. Bitte warten.',
      sticky: true,
      closable: false,
    });

    thisRef.backendService.exportJournal(thisRef.selJahr, 1).subscribe({
      next: (result) => {
        if (result.type == 'info') {
          const filename = result.data.filename;
          thisRef.backendService.downloadFile(filename).subscribe({
            next(data) {
              if (data.body) {
                const blob = new Blob([data.body]);
                const downloadURL = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadURL;
                link.download = filename;
                link.click();
                thisRef.messageService.clear();
              }
            },
          });
        }
      },
    });
  };

  addNewAtt = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.clear();
    if (selRec)
      thisRef.dialogRef = thisRef.dialogService.open(AttachmentAddComponent, {
        data: {
          jahr: thisRef.selJahr,
          journalid: selRec.id,
        },
        header: 'Neuen Anhang zu Journaleintrag ' + selRec.memo + ' hinzufügen',
        width: '90%',
        height: '90%',
        resizable: true,
        modal: true,
        maximizable: true,
        draggable: true,
      });
  };

  addAtt = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.clear();
    if (selRec)
      thisRef.dialogRef = thisRef.dialogService.open(AttachementListComponent, {
        data: {
          journalid: selRec.id,
          jahr: thisRef.selJahr,
          type: 'add',
          editable: this.isEditable(),
        },
        header: 'Anhänge zu Journaleintrag ' + selRec.memo + ' hinzufügen',
        width: '90%',
        height: '90%',
        resizable: true,
        modal: true,
        maximizable: true,
        draggable: true,
      });
  };

  showAtt = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    console.log('Show Attachement');
    thisRef.messageService.clear();

    if (selRec) {
      thisRef.dialogRef = thisRef.dialogService.open(AttachementListComponent, {
        data: {
          journalid: selRec.id,
          jahr: this.selJahr,
          type: 'one',
          editable: this.isEditable(),
        },
        header: 'Anhänge anzeigen für den Journaleintrag ' + selRec.memo,
        width: '90%',
        height: '90%',
        resizable: true,
        modal: true,
        maximizable: true,
        draggable: true,
      });
    }
  };

  showAllAtt = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    console.log('Show All Attachement');
    thisRef.messageService.clear();
    thisRef.dialogRef = thisRef.dialogService.open(AttachementListComponent, {
      data: {
        journalid: undefined,
        jahr: this.selJahr,
        type: 'all',
        editable: this.isEditable(),
      },
      header: 'Alle Anhänge anzeigen für das Jahr ' + this.selJahr,
      width: '90%',
      height: '90%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true,
    });
  };

  editJournal = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    console.log('Edit Journal');
    thisRef.messageService.clear();
    thisRef.clearFields();
    thisRef.editMode = true;
    if (selRec) {
      Object.assign(thisRef.selJournal, selRec);
      console.log(thisRef.selJournal);
    }
  };

  delJournal = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    console.log('Del Journal');
    thisRef.messageService.clear();
    this.clearFields();

    if (selRec)
      this.backendService.delJournal(selRec).subscribe({
        complete: () => {
          thisRef.lstJournal.splice(thisRef.lstJournal.indexOf(selRec), 1);
        },
      });
  };

  addJournal = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    console.log('New Journal');
    this.clearFields();
    thisRef.messageService.clear();
    this.addMode = true;
  };

  copyJournal = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    console.log('Copy Journal');
    this.clearFields();
    thisRef.messageService.clear();
    this.addMode = true;

    if (selRec) {
      thisRef.selJournal = structuredClone(selRec);
      thisRef.selJournal.id = undefined;
    }
  };

  private clearFields() {
    this.addMode = false;
    this.editMode = false;
    this.selJournal = {};
  }
  save() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sub: Observable<any>;

    this.selJournal.from_account = this.selJournal.fromAccountAccount?.id;
    this.selJournal.to_account = this.selJournal.toAccountAccount?.id;
    this.selJournal.date = `${this.selJournal.date_date.getFullYear()}-${this.selJournal.date_date.toLocaleString(
      'default',
      { month: '2-digit' }
    )}-${this.selJournal.date_date.toLocaleString('default', {
      day: '2-digit',
    })}`;

    if (this.addMode) {
      sub = this.backendService.addJournal(this.selJournal);
    } else {
      sub = this.backendService.updJournal(this.selJournal);
    }
    sub.subscribe({
      next: (record) => {
        const jour = record.data as Journal;
        this.backendService.getOneJournal(jour.id).subscribe({
          next: (result) => {
            const jour = result.data as Journal;
            jour.date_date = new Date(jour.date);
            jour.fromAcc = jour.fromAccountAccount?.longname;
            jour.from_account = jour.fromAccountAccount?.id;
            jour.toAcc = jour.toAccountAccount?.longname;
            jour.to_account = jour.toAccountAccount?.id;

            if (this.addMode) {
              this.lstJournal.push(jour);
              this.lstJournal.sort((a: Journal, b: Journal) =>
                a.journalno && b.journalno
                  ? a.journalno - b.journalno
                  : a.date_date < b.date_date
                  ? -1
                  : 1
              );
            } else
              this.lstJournal = this.lstJournal.map(
                (obj) => [jour].find((o) => o.id === obj.id) ?? obj
              );

            this.clearFields();
          },
        });
      },
    });
  }
  reset() {
    this.clearFields();
  }
}
