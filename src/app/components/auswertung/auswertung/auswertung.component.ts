/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { MeisterschaftAuswertung, ParamData } from '@model/datatypes';
import { BackendService } from '@service/backend.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-auswertung',
  templateUrl: './auswertung.component.html',
  styleUrls: ['./auswertung.component.scss']
})
export class AuswertungComponent implements OnInit {

  lstGraphData: MeisterschaftAuswertung[] = []
  parameter: ParamData[] = []
  selJahre = [{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }]
  selJahr = 2
  jahr: number;
  data: any;
  options: any;

  constructor(private backendService: BackendService, private messageService: MessageService) {
    const str = localStorage.getItem('parameter');
    this.parameter = str ? JSON.parse(str) : [];
    const paramJahr = this.parameter.find((param) => param.key === 'CLUBJAHR');
    this.jahr = Number(paramJahr?.value)

  }

  ngOnInit(): void {
    if (this.jahr) {
      this.selJahre[0] = { value: this.jahr - 2, label: String(this.jahr - 2) }
      this.selJahre[1] = { value: this.jahr - 1, label: String(this.jahr - 1) }
      this.selJahre[2] = { value: this.jahr, label: String(this.jahr) }
      this.selJahr = this.jahr
    }

    this.updateGraph();
  }

  updateGraph() {
    this.backendService.getChartData(this.selJahr).subscribe({
      next: (list) => {
        this.lstGraphData = list;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const labels: string[] = []
    const dataset1: number[] = []
    const dataset2: number[] = []

    this.lstGraphData.forEach((rec) => {
      labels.push(rec.name!);
      dataset1.push(rec.meisterschafts!.teilnehmer ? rec.meisterschafts!.teilnehmer : 0)
      dataset2.push(rec.gaeste ? rec.gaeste : 0)
    })

    this.data = {
      labels: labels,
      datasets: [
        {
          label: 'Teilnehmer',
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          data: dataset1
        },
        {
          label: 'Gäste',
          backgroundColor: documentStyle.getPropertyValue('--pink-500'),
          borderColor: documentStyle.getPropertyValue('--pink-500'),
          data: dataset2
        }
      ]
    };

    this.options = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          stacked: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };    
  }
})
}
}
