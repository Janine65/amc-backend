/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Adresse, Anlass, Meisterschaft } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, from } from 'rxjs';

@Component({
  selector: 'app-anlass-book',
  templateUrl: './anlass-book.component.html',
  styleUrls: ['./anlass-book.component.scss'],
  providers: [DialogService]
})
export class AnlassBookComponent implements OnInit, AfterViewInit {
  anlass: Anlass = {}
  lstMeisterschaft: Meisterschaft[] = []
  selMeisterschaft: Meisterschaft = {}
  newMeisterschaft: Meisterschaft = {}
  fMeisterschaft = false;
  lstAdressen: Adresse[] = []
  selAdresse?: number;
  subs!: Subscription;
  dialogRef!: DynamicDialogRef;
  subFields: Subscription[] = []

  public getScreenWidth: any;
  public getScreenHeight: any;
  public objHeight$ = '300px';

  fgMeisterschaft = new FormGroup({
    teilnehmername: new FormControl('', Validators.required),
    punkte: new FormControl<number | null>({ value: null, disabled: true }, [Validators.required,Validators.min(0),Validators.max(200)]),
    wurf1: new FormControl<number | null>({ value: null, disabled: true }, [Validators.min(0),Validators.max(9)]),
    wurf2: new FormControl<number | null>({ value: null, disabled: true }, [Validators.min(0),Validators.max(9)]),
    wurf3: new FormControl<number | null>({ value: null, disabled: true }, [Validators.min(0),Validators.max(9)]),
    wurf4: new FormControl<number | null>({ value: null, disabled: true }, [Validators.min(0),Validators.max(9)]),
    wurf5: new FormControl<number | null>({ value: null, disabled: true }, [Validators.min(0),Validators.max(9)]),
    zusatz: new FormControl<number | null>({ value: null, disabled: true }),
    total: new FormControl<number | null>({ value: null, disabled: true })
  });

  constructor(
    private backendService: BackendService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService,
    private renderer: Renderer2) {
    this.anlass = config.data.anlass

    this.subs = from(this.backendService.getMeisterschaft(this.anlass.id!))
      .subscribe(list => {
        this.lstMeisterschaft = list;
      });
    this.subs = from(this.backendService.getAdressenData())
      .subscribe(list => {
        this.lstAdressen = list;
        this.lstAdressen.forEach(adr => adr.fullname = adr.vorname + ' ' + adr.name);
        console.log(this.lstAdressen);
      });
  }

  ngOnInit(): void {
    this.getHeight();    
  }

  ngAfterViewInit() {
    setTimeout(() => {

      this.renderer.selectRootElement('#teilnehmername').focus();
      this.subFields.push(this.fgMeisterschaft.get("teilnehmername")!.valueChanges.subscribe(() => this.searchTeilnehmer()));
    }, 1000);
  }

  back() {
    this.ref.close();
  }

  get teilnehmername() { return this.fgMeisterschaft.get('teilnehmername')!}
  get punkte() { return this.fgMeisterschaft.get('punkte')!}
  get wurf1() { return this.fgMeisterschaft.get('wurf1')!}
  get wurf2() { return this.fgMeisterschaft.get('wurf2')!}
  get wurf3() { return this.fgMeisterschaft.get('wurf3')!}
  get wurf4() { return this.fgMeisterschaft.get('wurf4')!}
  get wurf5() { return this.fgMeisterschaft.get('wurf5')!}
  get zusatz() { return this.fgMeisterschaft.get('zusatz')!}
  get total() { return this.fgMeisterschaft.get('total')!}

  private getHeight() { 
    const element = document.getElementById("table-box")
    if (element) {
      this.objHeight$ = (element.scrollHeight - 150).toString() + 'px'; 
    }
  }

  public onResizeHandler(): void {
    this.getHeight();
  }
 
  inputWurf(wurfControl: number) {
    const value = this.fgMeisterschaft.get("wurf" + wurfControl)?.value

      let total = 0;

      for (let ind = 1; ind < 6; ind++) {
          const wurf = this.fgMeisterschaft.get("wurf" + ind)?.value
          if (wurf != null)
            total += wurf
      }
      const zusatz = this.zusatz.value
      if (zusatz != null)
        total += zusatz

      this.total.setValue(total)
      if (value == null)
        return;


      if (wurfControl < 5)
        this.renderer.selectRootElement('#wurf' + (wurfControl + 1)).focus();
      // else
      //   this.renderer.selectRootElement('#save').focus();
  }

  setDisabled(disabled: boolean) {
    if (disabled) {
      this.punkte.disable();
      if (this.anlass.istkegeln) {
        this.wurf1.disable();
        this.wurf2.disable();
        this.wurf3.disable();
        this.wurf4.disable();
        this.wurf5.disable();
      }
    } else {
      this.punkte.enable();
      if (this.anlass.istkegeln) {
        this.wurf1.enable();
        this.wurf2.enable();
        this.wurf3.enable();
        this.wurf4.enable();
        this.wurf5.enable();
      }
    }
  }

  clearTeilnehmer() {
    this.unsubscribeList();
    this.teilnehmername.setValue('');

    this.subFields.push(this.fgMeisterschaft.get("teilnehmername")!.valueChanges.subscribe(() => this.searchTeilnehmer()));
    this.newMeisterschaft = {};
    this.patchFields();

    this.teilnehmername.enable();
    this.renderer.selectRootElement('#teilnehmername').focus();
    this.setDisabled(true)
  }

  saveGaeste() {
    this.backendService.updAnlaesseData(this.anlass).subscribe({
      complete: () => {
        this.messageService.add({ detail: 'Die Daten wurden gespeicher. ', sticky: true, closable: true, severity: 'info', summary: 'Gäste speichern' });
      }
    })
  }

  deleteEntry() {
    this.backendService.delMeisterschaft(this.selMeisterschaft).subscribe({
      complete: () => {
        this.lstMeisterschaft.splice(this.lstMeisterschaft.indexOf(this.selMeisterschaft),1)
      }
    })
    this.clearTeilnehmer();
  }

  selTeilnehmerTable() {
    this.newMeisterschaft = this.selMeisterschaft;
    this.unsubscribeList();
    this.teilnehmername.setValue(this.selMeisterschaft.teilnehmer?.fullname!);
    this.patchFields()
    this.fgMeisterschaft.markAsUntouched({onlySelf: false});

    this.setDisabled(false)
    this.teilnehmername.disable();
    if (this.anlass.istkegeln)
      this.renderer.selectRootElement('#wurf1').focus();
    else
      this.renderer.selectRootElement('#punkte').focus();
  
    if (this.anlass.istkegeln) {
      this.subFields.push(this.wurf1!.valueChanges.subscribe(() => this.inputWurf(1)));
      this.subFields.push(this.wurf2.valueChanges.subscribe(() => this.inputWurf(2)));
      this.subFields.push(this.wurf3.valueChanges.subscribe(() => this.inputWurf(3)));
      this.subFields.push(this.wurf4.valueChanges.subscribe(() => this.inputWurf(4)));
      this.subFields.push(this.wurf5.valueChanges.subscribe(() => this.inputWurf(5)));
    }

  }

  searchTeilnehmer() {
    const lstString = this.fgMeisterschaft.get('teilnehmername')?.value!.split(" ");
    if (!lstString || lstString.length == 0)
      return;

    const lstFindName = this.lstAdressen.filter(adr => {
      let match = false
      lstString.forEach(text => {
        const regex = new RegExp(text, "i")
        const matchL = adr.name!.match(regex);
        const matchV = adr.vorname!.match(regex);
        if (matchL || matchV)
          match = true
      })
      return match
    })
    if (lstFindName.length == 1) {
      // focus auf nächstes Objekt setzen
      this.unsubscribeList();
      this.setDisabled(false)
      if (this.anlass.istkegeln)
        this.renderer.selectRootElement('#wurf1').focus();
      else
        this.renderer.selectRootElement('#punkte').focus();
      this.teilnehmername.setValue(lstFindName[0].vorname + ' ' + lstFindName[0].name);
      // check if neuen Eintrag oder bestehender
      this.newMeisterschaft = this.lstMeisterschaft.find(meist => meist.teilnehmer?.id === lstFindName[0].id!) || new Meisterschaft();
      this.patchFields();
      this.fgMeisterschaft.markAsUntouched({onlySelf: false});

      if (this.newMeisterschaft.eventid == undefined) {
        this.newMeisterschaft.eventid = this.anlass.id
        this.newMeisterschaft.mitgliedid = lstFindName[0].id;
        this.newMeisterschaft.punkte = this.anlass.punkte;
        this.newMeisterschaft.teilnehmer = {id : lstFindName[0].id!, fullname : lstFindName[0].fullname!};
        this.patchFields();
        this.fgMeisterschaft.markAllAsTouched();
      }

      if (this.anlass.istkegeln) {
        this.subFields.push(this.wurf1.valueChanges.subscribe(() => this.inputWurf(1)));
        this.subFields.push(this.wurf2.valueChanges.subscribe(() => this.inputWurf(2)));
        this.subFields.push(this.wurf3.valueChanges.subscribe(() => this.inputWurf(3)));
        this.subFields.push(this.wurf4.valueChanges.subscribe(() => this.inputWurf(4)));
        this.subFields.push(this.wurf5.valueChanges.subscribe(() => this.inputWurf(5)));
      }

      this.teilnehmername.disable();
    }
    return
  }

  unsubscribeList() {
    this.subFields.forEach(
      sub => sub.unsubscribe()
    )
    this.subFields = []

  }

  patchFields() {
    this.fgMeisterschaft.patchValue({
      punkte: this.newMeisterschaft.punkte,
      wurf1: this.newMeisterschaft.wurf1,
      wurf2: this.newMeisterschaft.wurf2,
      wurf3: this.newMeisterschaft.wurf3,
      wurf4: this.newMeisterschaft.wurf4,
      wurf5: this.newMeisterschaft.wurf5,
      zusatz: this.newMeisterschaft.zusatz,
      total: this.newMeisterschaft.total_kegel
    })

  }

  save() {
    if (this.fgMeisterschaft.invalid) {
      this.messageService.add({ detail: 'Die Daten sind noch nicht korrekt und können nicht gespeichert werden', closable: true, severity: 'error', summary: 'Meisterschaft speichern' });
      return;
    }

    if (this.fgMeisterschaft.untouched) {
      this.messageService.add({ detail: 'Die Daten wurden nicht geändert. Es ist kein Speichern notwendig', sticky: true, closable: true, severity: 'info', summary: 'Meisterschaft speichern' });
      return;

    }

    this.newMeisterschaft.punkte = this.punkte.value ? this.punkte.value : 0;
    this.newMeisterschaft.wurf1 = this.wurf1.value ? this.wurf1.value : null;
    this.newMeisterschaft.wurf2 = this.wurf2.value ? this.wurf2.value : null;
    this.newMeisterschaft.wurf3 = this.wurf3.value ? this.wurf3.value : null;
    this.newMeisterschaft.wurf4 = this.wurf4.value ? this.wurf4.value : null;
    this.newMeisterschaft.wurf5 = this.wurf5.value ? this.wurf5.value : null;
    this.newMeisterschaft.zusatz = this.zusatz.value ? this.zusatz.value : null;
    this.newMeisterschaft.total_kegel = this.total.value ? this.total.value : null;

    this.backendService.updMeisterschaft(this.newMeisterschaft).subscribe(
      {
        next: (anl) => {
          console.log(anl);
          this.clearTeilnehmer();
          this.subs = from(this.backendService.getMeisterschaft(this.anlass.id!))
          .subscribe(list => {
            this.lstMeisterschaft = list;
          });
        }
      }
    )
  }

}
