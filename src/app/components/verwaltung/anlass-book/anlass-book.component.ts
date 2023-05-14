/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Adresse, Anlass, Meisterschaft } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { MessageService } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, from } from 'rxjs';

@Component({
  selector: 'app-anlass-book',
  templateUrl: './anlass-book.component.html',
  styleUrls: ['./anlass-book.component.scss'],
  providers: [DialogService]
})
export class AnlassBookComponent {
  anlass : Anlass = {}
  lstMeisterschaft : Meisterschaft[] = []
  selMeisterschaft : Meisterschaft = {}
  newMeisterschaft : Meisterschaft = {}
  lstAdressen : Adresse[] = []
  selAdresse? : number;
  subs! : Subscription
  dialogRef!: DynamicDialogRef;

  constructor(
    private backendService: BackendService, 
    public ref: DynamicDialogRef, 
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private messageService: MessageService) {
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

  back() {
    this.ref.close();
  }

  selTeilnehmer(f: NgForm) {
      //teilnehmer.resetFilter();
      if (this.selAdresse == null)
        return; 

      // check if neuen Eintrag oder bestehender
      this.newMeisterschaft = this.lstMeisterschaft.find(meist => meist.mitgliedid === this.selAdresse) || new Meisterschaft();
      f.form.markAsUntouched();
      if (this.newMeisterschaft.eventid == undefined) {
        this.newMeisterschaft.eventid = this.anlass.id
        this.newMeisterschaft.mitgliedid = this.selAdresse;
        this.newMeisterschaft.punkte = this.anlass.punkte;
        f.form.markAllAsTouched();
      }

      //console.log(f)
    }
    
  save(f: NgForm) {
    if (f.invalid) {
      this.messageService.add({detail: 'Die Daten sind noch nicht korrekt und können nicht gespeichert werden', closable: true, severity: 'error', summary: 'Meisterschaft speichern' } );
      return;
    }

    if (f.untouched) {
      this.messageService.add({detail: 'Die Daten wurden nicht geändert. Es ist kein Speichern notwendig', sticky: true ,closable: true, severity: 'info', summary: 'Meisterschaft speichern' } );
      return;

    }
    // this.backendService.updAnlaesseData(this.anlass).subscribe(
    //   {next: (anl) => {
    //     console.log(anl);
    //     this.ref.close(anl)
    //   }}
    // )
  }

}
