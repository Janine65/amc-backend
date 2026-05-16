export class ConfigSmtpDtoClass {
  smtp: string;
  smtp_port: number;
  smtp_user: string;
  /**
   * Name der Environment-Variable, die das SMTP-Passwort enthält.
   * Beispiel: "SMTP_PWD_JANINEFRANKEN"
   */
  smtp_pwd_env: string;
  email_from: string;
}

export class ConfigDtoClass {
  config_id!: string;
  app_name!: string;
  app_desc!: string;
  node_port!: number;
  json_indentation!: number;
  dbhost!: string;
  webhost!: string;
  database!: string;
  db_user!: string;
  port!: number;
  dbtype!: string;
  defaultEmail!: string;
  userEmail!: string;
  JanineFranken!: ConfigSmtpDtoClass;
  HansjoergDutler!: ConfigSmtpDtoClass;
}
