import { Component, HostListener, OnInit } from '@angular/core';
import { Clubmeister, Kegelmeister, ParamData } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { MessageService } from 'primeng/api';
import { map, zip } from 'rxjs';

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
  getScreenWidth = 0;
  getScreenHeight = 0;


  constructor(private backendService: BackendService, private messageService: MessageService) {
    const str = localStorage.getItem('parameter');
    this.parameter = str ? JSON.parse(str) : [];
    const paramJahr = this.parameter.find((param) => param.key === 'CLUBJAHR');
    this.jahr = Number(paramJahr?.value)
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    console.log(this.getScreenWidth, this.getScreenHeight);
    this.getHeight();
  }

  ngOnInit(): void {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    console.log(this.getScreenWidth, this.getScreenHeight);

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
    this.objHeightc$ = (this.getScreenHeight - 400).toFixed(0) + 'px';
    this.objHeightk$ = this.objHeightc$;
    console.log(this.objHeightc$, this.objHeightk$);
  }

  public refresh() {
    this.loading = true;

    zip(this.backendService.refreshClubmeister(this.selJahr),
    this.backendService.refreshKegelmeister(this.selJahr))
    .subscribe({
      complete: () => {
            this.readMeisterschaft();
            this.messageService.add({ detail: 'Die Daten wurden aktualisiert', closable: true, severity: 'info', 
              summary: 'Meisterschaft aktualisieren', sticky: false });
      }
    })
  }

  public readMeisterschaft() {
    this.loading = true;

    zip(this.backendService.getClubmeister(this.selJahr),
    this.backendService.getKegelmeister(this.selJahr))
    .pipe(map(([list1, list2]) => {
      this.lstClubmeister = list1;
      this.lstKegelmeister = list2;
      this.loading = false; 
      this.getHeight();
    }))
    .subscribe();
  }

}
