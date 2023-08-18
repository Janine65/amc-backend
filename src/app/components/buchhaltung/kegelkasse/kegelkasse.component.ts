/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Journal, Kegelkasse } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, Subscription, map, zip } from 'rxjs';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TableOptions, TableToolbar } from '@shared/basetable/basetable.component';
import { User } from '@model/user';

@Component({
  selector: 'app-kegelkasse',
  templateUrl: './kegelkasse.component.html',
  styleUrls: ['./kegelkasse.component.scss']
})
export class KegelkasseComponent implements OnInit {

  fgKasse = new FormGroup({
    date: new FormControl<Date | null>({ value: null, disabled: false }),
    kasse: new FormControl<number | null>({ value: 0.00, disabled: true }),
    rappen5: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    rappen10: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    rappen15: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    rappen20: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    rappen50: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    franken1: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    franken2: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    franken5: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    franken10: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    franken20: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    franken50: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    franken100: new FormControl<number | null>({ value: 0, disabled: false }, [Validators.required, Validators.min(0)]),
    rappen5_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    rappen10_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    rappen20_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    rappen50_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    franken1_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    franken2_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    franken5_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    franken10_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    franken20_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    franken50_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    franken100_sum: new FormControl<number | null>({ value: 0.00, disabled: true }),
    total: new FormControl<number | null>({ value: 0.00, disabled: true }),
    differenz: new FormControl<number | null>({ value: 0.00, disabled: true }),
  })

  decimalPipe = DecimalPipe;

  subFields!: Subscription[];
  fromAcc = 0;
  kegelkasse: Kegelkasse = {};
  lstKegelkasse: Kegelkasse[] = [];

  cols: TableOptions[] = [];
  toolbar: TableToolbar[] = [];



  get date() { return this.fgKasse.get('date')! }
  get kasse() { return this.fgKasse.get('kasse')! }
  get rappen5() { return this.fgKasse.get('rappen5')! }
  get rappen10() { return this.fgKasse.get('rappen10')! }
  get rappen20() { return this.fgKasse.get('rappen20')! }
  get rappen50() { return this.fgKasse.get('rappen50')! }
  get franken1() { return this.fgKasse.get('franken1')! }
  get franken2() { return this.fgKasse.get('franken2')! }
  get franken5() { return this.fgKasse.get('franken5')! }
  get franken10() { return this.fgKasse.get('franken10')! }
  get franken20() { return this.fgKasse.get('franken20')! }
  get franken50() { return this.fgKasse.get('franken50')! }
  get franken100() { return this.fgKasse.get('franken100')! }
  get rappen5_sum() { return this.fgKasse.get('rappen5_sum')! }
  get rappen10_sum() { return this.fgKasse.get('rappen10_sum')! }
  get rappen20_sum() { return this.fgKasse.get('rappen20_sum')! }
  get rappen50_sum() { return this.fgKasse.get('rappen50_sum')! }
  get franken1_sum() { return this.fgKasse.get('franken1_sum')! }
  get franken2_sum() { return this.fgKasse.get('franken2_sum')! }
  get franken5_sum() { return this.fgKasse.get('franken5_sum')! }
  get franken10_sum() { return this.fgKasse.get('franken10_sum')! }
  get franken20_sum() { return this.fgKasse.get('franken20_sum')! }
  get franken50_sum() { return this.fgKasse.get('franken50_sum')! }
  get franken100_sum() { return this.fgKasse.get('franken100_sum')! }
  get total() { return this.fgKasse.get('total')! }
  get differenz() { return this.fgKasse.get('differenz')! }

  constructor(
    private backendService: BackendService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.subFields = [];
    this.subscribeFields();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.date.setValue(yesterday);

    this.cols = [
      { field: 'datum', header: 'Datum', format: false, sortable: false, filtering: false, filter: undefined, pipe: DatePipe, args: 'dd.MM.yyyy' },
      { field: 'differenz', header: 'Einnahmen', format: false, sortable: false, filtering: false, filter: undefined, pipe: DecimalPipe, args: '1.2-2' },
      { field: 'cntUsers', header: 'Anzahl Teilnehmer', format: false, sortable: false, filtering: false, filter: undefined, pipe: DecimalPipe, args: '1.0-0' },
      { field: 'amountProUser', header: 'Einnahmen pro Teilnehmer', format: false, sortable: false, filtering: false, filter: undefined, pipe: DecimalPipe, args: '1.2-2' },
      { field: 'journalid', header: 'verbucht', format: false, sortable: false, filtering: false, filter: 'boolean' },
      { field: 'userName', header: 'User', format: false, sortable: false, filtering: false, filter: undefined },
    ];

  }

  unsubscribeFields() {
    this.subFields.forEach(sub => {
      sub.unsubscribe()
    });
    this.subFields = [];

  }

  subscribeFields() {
    this.subFields.push(this.rappen5.valueChanges.subscribe(() => this.calculate(this.rappen5.value, 'rappen5_sum', 0.05)));
    this.subFields.push(this.rappen10.valueChanges.subscribe(() => this.calculate(this.rappen10.value, 'rappen10_sum', 0.1)));
    this.subFields.push(this.rappen20.valueChanges.subscribe(() => this.calculate(this.rappen20.value, 'rappen20_sum', 0.2)));
    this.subFields.push(this.rappen50.valueChanges.subscribe(() => this.calculate(this.rappen50.value, 'rappen50_sum', 0.5)));
    this.subFields.push(this.franken1.valueChanges.subscribe(() => this.calculate(this.franken1.value, 'franken1_sum', 1)));
    this.subFields.push(this.franken2.valueChanges.subscribe(() => this.calculate(this.franken2.value, 'franken2_sum', 2)));
    this.subFields.push(this.franken5.valueChanges.subscribe(() => this.calculate(this.franken5.value, 'franken5_sum', 5)));
    this.subFields.push(this.franken10.valueChanges.subscribe(() => this.calculate(this.franken10.value, 'franken10_sum', 10)));
    this.subFields.push(this.franken20.valueChanges.subscribe(() => this.calculate(this.franken20.value, 'franken20_sum', 20)));
    this.subFields.push(this.franken50.valueChanges.subscribe(() => this.calculate(this.franken50.value, 'franken50_sum', 50)));
    this.subFields.push(this.franken100.valueChanges.subscribe(() => this.calculate(this.franken100.value, 'franken100_sum', 100)));

    this.subFields.push(this.date.valueChanges.subscribe(() => this.changeDate(this.date.value)));

  }

  unsubscribeDatum() {
    const sub = this.subFields[this.subFields.length - 1]
    sub.unsubscribe();
    this.subFields.pop();
  }

  subscribeDatum() {
    this.subFields.push(this.date.valueChanges.subscribe(() => this.changeDate(this.date.value)));

  }

  isButtonAllowed(role: string): boolean {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role == role || user.role == 'admin')
        return false;
    }
    return true;
  }

  clearTotal() {
    this.rappen5.setValue(0);
    this.rappen10.setValue(0);
    this.rappen20.setValue(0);
    this.rappen50.setValue(0);
    this.franken1.setValue(0);
    this.franken2.setValue(0);
    this.franken5.setValue(0);
    this.franken10.setValue(0);
    this.franken20.setValue(0);
    this.franken50.setValue(0);
    this.franken100.setValue(0);
  }

  changeDate(date: Date | null) {
    if (date) {
      this.kegelkasse = {}
      zip(this.backendService.getKegelkasse(date.getMonth() + 1),
      this.backendService.getAmountOneAcc(date.toLocaleDateString("fr-CA"), 1002)
      ).pipe(map(([kegelkasse, result]) => {
        if (kegelkasse.length > 0) {
          this.kegelkasse = kegelkasse[0];
          this.kasse.setValue(this.kegelkasse.kasse ?? 0);
          this.rappen5.setValue(this.kegelkasse.rappen5 ?? 0);
          this.rappen10.setValue(this.kegelkasse.rappen10 ?? 0);
          this.rappen20.setValue(this.kegelkasse.rappen20 ?? 0);
          this.rappen50.setValue(this.kegelkasse.rappen50 ?? 0);
          this.franken1.setValue(this.kegelkasse.franken1 ?? 0);
          this.franken2.setValue(this.kegelkasse.franken2 ?? 0);
          this.franken5.setValue(this.kegelkasse.franken5 ?? 0);
          this.franken10.setValue(this.kegelkasse.franken10 ?? 0);
          this.franken20.setValue(this.kegelkasse.franken20 ?? 0);
          this.franken50.setValue(this.kegelkasse.franken50 ?? 0);
          this.franken100.setValue(this.kegelkasse.franken100 ?? 0);
          this.unsubscribeDatum();
          date = new Date(this.kegelkasse.datum!)
          this.date.setValue(date);
          this.subscribeDatum();
        } else {
          const user = localStorage.getItem('user')
          if (user) {
            this.kegelkasse.user = new BehaviorSubject<User>(JSON.parse(user)).value;
            this.kegelkasse.userid = this.kegelkasse.user.id;
          }
        
        }
        const amount = Number(result.amount);
        this.fromAcc = Number(result.id);
        this.kasse.setValue(amount);
        this.kegelkasse.kasse = amount;
        this.calculate(null, null, 0);

      }))
      .subscribe();      
    }
  }

  calculate(value: number | null, sum: string | null, summand: number) {
    if (sum) {
      const fieldSum = this.fgKasse.get(sum);
      if (fieldSum) {
        let calc = 0
        if (value)
          calc = value * summand;
        fieldSum.setValue(calc);
      }
    }

    this.total.setValue(
      this.rappen5_sum.getRawValue() +
      this.rappen10_sum.getRawValue() +
      this.rappen20_sum.getRawValue() +
      this.rappen50_sum.getRawValue() +
      this.franken1_sum.getRawValue() +
      this.franken2_sum.getRawValue() +
      this.franken5_sum.getRawValue() +
      this.franken10_sum.getRawValue() +
      this.franken20_sum.getRawValue() +
      this.franken50_sum.getRawValue() +
      this.franken100_sum.getRawValue()
    )

    this.differenz.setValue(
      Number((this.total.getRawValue() - this.kasse.getRawValue()).toFixed(2))
    )

  }

  createReceipt() {
    //TODO
    if (this.kegelkasse.id)
      this.backendService.createReceipt(this.kegelkasse.id).subscribe({
        next: (result) => {
          if (result.type == 'info')
            this.messageService.add({severity: 'info', detail: 'Beleg wurde ertellt.\n' + result.message, summary: 'Beleg erstellen', sticky: false, closable: true});
          else
            this.messageService.add({severity: 'error', detail: result.message, summary: 'Beleg erstellen', sticky: true, closable: true});
        }
      })
  }

  async saveJournal(mitJournal: boolean) {
    const date: Date = this.date.getRawValue()
    if (!date)
      return
    this.kegelkasse.datum = date.toLocaleDateString("fr-CA")
    this.kegelkasse.kasse = this.kasse.getRawValue() ?? 0;
    this.kegelkasse.rappen5 = this.rappen5.getRawValue() ?? 0;
    this.kegelkasse.rappen10 = this.rappen10.getRawValue() ?? 0;
    this.kegelkasse.rappen20 = this.rappen20.getRawValue() ?? 0;
    this.kegelkasse.rappen50 = this.rappen50.getRawValue() ?? 0;
    this.kegelkasse.franken1 = this.franken1.getRawValue() ?? 0;
    this.kegelkasse.franken2 = this.franken2.getRawValue() ?? 0;
    this.kegelkasse.franken5 = this.franken5.getRawValue() ?? 0;
    this.kegelkasse.franken10 = this.franken10.getRawValue() ?? 0;
    this.kegelkasse.franken20 = this.franken20.getRawValue() ?? 0;
    this.kegelkasse.franken50 = this.franken50.getRawValue() ?? 0;
    this.kegelkasse.franken100 = this.franken100.getRawValue() ?? 0;
    this.kegelkasse.total = this.total.getRawValue() ?? 0;
    this.kegelkasse.differenz = this.differenz.getRawValue() ?? 0;

    if (mitJournal) {
      if (this.kegelkasse.journal) {
        // Update Journal
        this.kegelkasse.journal.amount = this.differenz.getRawValue() ?? 0;
        if (this.kegelkasse.journal.amount != 0) {
          this.kegelkasse.journal.date = date.toLocaleDateString("fr-CA");
          zip(this.backendService.updJournal(this.kegelkasse.journal),
          this.backendService.updKegelkasse(this.kegelkasse)
          ).pipe(map(() => {
            this.messageService.add({ severity: 'info', detail: "Journaleintrag wurde aktualisiert", sticky: false, closable: true, summary: 'Kegelkasse speichern' })
          }))
        }
      } else {
        // add Journal
        const journal = new Journal();
        journal.amount = this.differenz.getRawValue() ?? 0;
        if (journal.amount != 0) {
          journal.date = date.toLocaleDateString("fr-CA");
          journal.from_account = this.fromAcc;
          this.backendService.getOneDataByOrder(6002).subscribe({
            next: (acc) => {
              journal.to_account = acc.id!;
              journal.memo = 'Kegeln ' + date.toLocaleString("de-CH", { month: "long" });
              this.backendService.addJournal(journal).subscribe({
                next: (saveJournal) => {
                  this.backendService.getOneJournal(saveJournal.id!).subscribe({
                    next: (oneJournal) => {
                      this.kegelkasse.journal = oneJournal
                      this.backendService.updKegelkasse(this.kegelkasse).subscribe({
                        next: () => {
                          this.messageService.add({ severity: 'info', detail: "Journaleintrag wurde erstellt", sticky: false, closable: true, summary: 'Kegelkasse speichern' })
                        }
                      })
                    }
                  });
                }
              });
            }
          });
        }
      }
    } else {
      this.backendService.updKegelkasse(this.kegelkasse).subscribe({
        next: () => {
          this.messageService.add({ severity: 'info', detail: "Kegelkasse wurde gespeichert", sticky: false, closable: true, summary: 'Kegelkasse speichern' })
        }
      })
    }
  }
  tabChanged(tabIndex: number) {
    if (tabIndex == 1) {
      this.backendService.getAllKegelkasse(this.date.getRawValue().getFullYear()).subscribe({
        next: (list) => {
          this.lstKegelkasse = list
          for (const entry of this.lstKegelkasse) {
            entry.datum_date = new Date(entry.datum!);
            if (entry.user)
              entry.userName = entry.user.name
            else
              entry.userName = ''
            if (entry.cntUsers && entry.cntUsers > 0)
              entry.amountProUser = entry.differenz! / entry.cntUsers
            else
              entry.amountProUser = 0
          }
        }
      })
    }
  }

}
