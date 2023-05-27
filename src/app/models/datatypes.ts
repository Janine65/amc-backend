import { TableData } from "../components/shared/basetable/basetable.component";

export class OverviewData {
    constructor(
        public label: string,
        public value: string
    ) {}
}

/*
'Aktive Mitglieder'
'SAM Mitglieder'
'Freimitglieder'
'Total Anlässe'
'Zukünftige Anlässe'
'Clubmeisterschaft'
'Kegelmeisterschaft'
'Buchhaltung'
*/

export class ParamData {
    constructor(public id: number, public key: string, public value: string) { }
}

export class Adresse extends TableData {
    public mnr?: number;
    public geschlecht?: string;
    public name?: string;
    public vorname?: string;
    public fullname?: string;
    public adresse?: string;
    public plz?: number;
    public ort?: string;
    public land?: string;
    public telefon_p?: string;
    public telefon_g?: string;
    public mobile?: string;
    public email?: string;
    public sam_mitglied?: boolean;
    public eintritt?: string;
    public eintritt_date?: Date;
    public jahresbeitrag?: number;
    public mnr_sam?: number;
    public vorstand?: boolean;
    public ehrenmitglied?: boolean;
    public revisor?: boolean;
    public austritt?: string;
    public austritt_date?: Date;
    public austritt_mail?: boolean;
    public adressenid?: number;
    public allianz?: boolean;
    public notes?: string;
}

export class Anlass extends TableData {
    public datum?: string;
    public datum_date?: Date;
    public name?: string;
    public beschreibung?: string;
    public punkte?: number;
    public istkegeln?: boolean;
    public nachkegeln?: boolean;
    public istsamanlass?: boolean;
    public gaeste?: number;
    public anlaesseid?: number;
    public longname?: string;
    public status?: number;
    public vorjahr?: string;
    public linkedEvent?: {vorjahr: string};
}

export class Meisterschaft extends TableData {
    public mitgliedid?: number | null;
    public eventid?: number | null;
    public punkte?: number | null;
    public wurf1?: number | null;
    public wurf2?: number | null;
    public wurf3?: number | null;
    public wurf4?: number | null;
    public wurf5?: number | null;
    public zusatz?: number | null;
    public streichresultat?: number | null;
    public total_kegel?: number | null;
    public teilnehmer?: {id?: number | null; fullname?: string | null}
}

export class Clubmeister extends TableData {
    jahr: number | null | undefined;
    rang: number | null | undefined;
    vorname: string | null | undefined;
    nachname: string | null | undefined;
    mitgliedid: number | null | undefined;
    punkte: number | null | undefined;
    anlaesse: number | null | undefined;
    werbungen: number | null | undefined;
    mitglieddauer: number | null | undefined;
    status: number | null | undefined;
  }  
  
  export class Kegelmeister extends TableData {
    jahr: number | null | undefined;
    rang: number | null | undefined;
    vorname: string | null | undefined;
    nachname: string | null | undefined;
    mitgliedid: number | null | undefined;
    punkte: number | null | undefined;
    anlaesse: number | null | undefined;
    babeli: number | null | undefined;
    status: number | null | undefined;
  }  

  export class Fiscalyear extends TableData {
    year?: string;
    name?: string;
    state?: number;
  }

  export class Account extends TableData {
    name?: string;
    level?: number;
    order?: number;
    status?: number;
  }

export class MeisterschaftAuswertung {
    public datum: string | undefined;
    public name: string | undefined;
    public gaeste: number | undefined | null;
    public meisterschafts:{teilnehmer: number | null | undefined} | undefined;
}