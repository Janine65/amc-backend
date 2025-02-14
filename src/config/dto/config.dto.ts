export class ConfigSmtpDtoClass {
  smtp: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pwd: string;
  email_from: string;
}

export class ConfigDtoClass {
  config_id!: string;
  app_name!: string;
  app_desc!: string;
  node_port!: number;
  secret!: string;
  iv!: string;
  json_indentation!: number;
  dbhost!: string;
  webhost!: string;
  database!: string;
  db_user!: string;
  db_pwd!: string;
  port!: number;
  dbtype!: string;
  defaultEmail!: string;
  userEmail!: string;
  JanineFranken!: ConfigSmtpDtoClass;
  HansjoergDutler!: ConfigSmtpDtoClass;
}
