/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Journal } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

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

  subFields!: Subscription[];
  fromAcc = 0;

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
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.date.setValue(yesterday);
  }

  changeDate(date: Date | null) {
    if (date)
      this.backendService.getAmountOneAcc(date.getFullYear(), 1002).subscribe({
        next: (result) => {
          const amount = Number(result.amount);
          this.fromAcc = Number(result.id);
          this.kasse.setValue( amount );
          this.calculate(null, null, 0);
        }
      })
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
      this.kasse.getRawValue() - this.total.getRawValue()
    )

  }
  saveJournal() {
    const journal = new Journal();
    journal.amount = this.differenz.getRawValue() ?? 0;
    if (journal.amount != 0) {
      const date : Date = this.date.getRawValue()
      if (!date)
        return
      journal.date = date.toLocaleDateString("fr-CA")
      journal.from_account = this.fromAcc;
      this.backendService.getOneDataByOrder(6002).subscribe({
        next: (acc) => {
          journal.to_account = acc.id!
          journal.memo = 'Kegeln ' + date.toLocaleString("de-CH", { month: "long" })
    
          this.backendService.addJournal(journal).subscribe({
            next: () => {
              this.messageService.add({detail: "Journaleintrag wurde gespeichert", sticky: false, closable: true, summary: 'Kegelneintrag speichern'})
            }
          })
        }
      });
    }
  }
}
