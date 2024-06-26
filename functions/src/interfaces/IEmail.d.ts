export interface IEmailSender {
    email : string;
    name : string;
}

export interface IEmail {
    to: IEmailSender[];
    templateID: number;
}

export interface IEmailSchedule extends IEmail {
    scheduledAt: string;
}

export interface IEmailContact {
    email: string;
    attributes: {
        FIRSTNAME: string;
        LASTNAME: string;
    };
    updateEnabled: boolean;
}

