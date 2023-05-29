import { Component, OnInit } from '@angular/core';
import { Clubmeister, Kegelmeister, ParamData } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-meisterschaft',
  templateUrl: './meisterschaft.component.html',
  styleUrls: ['./meisterschaft.component.scss']
})
export class MeisterschaftComponent implements OnInit {

  parameter: ParamData[] = []
  jahr: number | null = null
  selJahre = [{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }]
  selJahr = 2
  lstClubmeister: Clubmeister[] = []
  lstKegelmeister: Kegelmeister[] = []
  loading = true;
  public objHeightc$ = '400px';
  public objHeightk$ = '400px';


  constructor(private backendService: BackendService, private messageService: MessageService) {
    const str = localStorage.getItem('parameter');
    this.parameter = str ? JSON.parse(str) : [];
    const paramJahr = this.parameter.find((param) => param.key === 'CLUBJAHR');
    this.jahr = Number(paramJahr?.value)
  }

  ngOnInit(): void {
    this.getHeight();

    if (this.jahr) {
      this.selJahre[0] = { value: this.jahr - 1, label: String(this.jahr - 1) }
      this.selJahre[1] = { value: this.jahr, label: String(this.jahr) }
      this.selJahre[2] = { value: this.jahr + 1, label: String(this.jahr + 1) }
      this.selJahr = this.jahr

      this.readMeisterschaft();

    }
  }

  private getHeight() {
    let element = document.getElementById("table-boxc")
    if (element) {
      this.objHeightc$ = (element.scrollHeight - 300).toString() + 'px';
    }
    element = document.getElementById("table-boxk")
    if (element) {
      this.objHeightk$ = (element.scrollHeight - 300).toString() + 'px';
    }
  }

  public onResizeHandler(): void {
    this.getHeight();
  }

  public refresh() {
    this.loading = true;

    this.backendService.refreshClubmeister(this.selJahr).subscribe({
      complete: () => {
        this.backendService.refreshKegelmeister(this.selJahr).subscribe({
          complete: () => {
            this.readMeisterschaft();
            this.messageService.add({ detail: 'Die Daten wurden aktualisiert', closable: true, severity: 'info', 
              summary: 'Meisterschaft aktualisieren', sticky: false });
          }
        })
      }
    })
  }

  public readMeisterschaft() {
    this.loading = true;

    this.backendService.getClubmeister(this.selJahr).subscribe({
      next: (list) => this.lstClubmeister = list,
      complete: () => {
        this.backendService.getKegelmeister(this.selJahr).subscribe({
          next: (list) => this.lstKegelmeister = list,
          complete: () => { this.loading = false; this.getHeight(); }
        })
      }
    })
  }

}
