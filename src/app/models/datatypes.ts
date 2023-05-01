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
    constructor(public key: string, public value: string) { }
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

export class Fiscalyear {
    constructor(
        public id: number,
        public year: string,
        public name: string,
        public state: number,
        public createdAt: Date,
        public updatedAt: Date
    ){ }
}