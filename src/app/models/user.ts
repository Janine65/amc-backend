import { TableData } from "@app/components/shared/basetable/basetable.component";

export class User extends TableData {
    email!: string;
    password!: string;
    name!: string;
    token!: string;
    role!: string;
    last_login!: Date;
}