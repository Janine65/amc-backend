export class Alert {
    id?: string;
    type: AlertType = 0;
    message?: string;
    autoClose = false;
    keepAfterRouteChange = false;
    fade = false;

    constructor(init?:Partial<Alert>) {
        Object.assign(this, init);
    }
}

export enum AlertType {
    Success,
    Error,
    Info,
    Warning
}