export class EmailBody {
    email_an?: string;
    email_cc?: string;
    email_bcc?: string;
    email_subject?: string;
    email_body?: string;
    email_signature: EmailSignature | undefined;
    uploadFiles?: string;

    constructor (init?:Partial<EmailBody>) {
        Object.assign(this, init);
    }

}

export enum EmailSignature {
    JanineFranken = "JanineFranken",
    HansjoergDutler = "HansjoergDutler"
}