type StringEmpty = string | null | undefined;
export class EmailBody {
    email_an?: StringEmpty;
    email_cc?: StringEmpty;
    email_bcc?: StringEmpty;
    email_subject?: StringEmpty;
    email_body?: StringEmpty;
    email_signature: EmailSignature | undefined;
    email_uploadfiles?: StringEmpty;

    constructor (init?:Partial<EmailBody>) {
        Object.assign(this, init);
    }

}

export enum EmailSignature {
    JanineFranken = "JanineFranken",
    HansjoergDutler = "HansjoergDutler"
}