import { clubmeister, kegelmeister } from '@prisma/client';

export class MeisterEnitity {
  fillDataClub(data: clubmeister) {
    this.jahr = data.jahr!;
    this.rangC = data.rang!;
    this.punkteC = data.punkte!;
    this.anlaesseC = data.anlaesse!;
    this.werbungenC = data.werbungen!;
    this.mitglieddauerC = data.mitglieddauer!;
    this.statusC = data.status;
    this.diffErsterC = 0;
  }

  fillDataKegel(data: kegelmeister) {
    this.jahr = data.jahr!;
    this.rangK = data.rang!;
    this.punkteK = data.punkte!;
    this.anlaesseK = data.anlaesse!;
    this.statusK = data.status;
    this.babeliK = data.babeli!;
    this.diffErsterK = 0;
  }

  jahr!: string;
  rangC: number | undefined;
  punkteC: number | undefined;
  anlaesseC: number | undefined;
  werbungenC: number | undefined;
  mitglieddauerC: number | undefined;
  statusC: boolean | undefined;
  diffErsterC: number | undefined;
  rangK: number | undefined;
  punkteK: number | undefined;
  anlaesseK: number | undefined;
  statusK: boolean | undefined;
  babeliK: number | undefined;
  diffErsterK: number | undefined;
}
