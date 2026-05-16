import { Injectable } from '@nestjs/common';
import { realpathSync, existsSync, mkdirSync } from 'fs';
import {
  version,
  author,
  description,
  name,
  config as pkgconfig,
} from '../../package.json';
import { ConfigDtoClass } from './dto/config.dto';
import { config } from './config.json';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConfigService {
  thisConfig: ConfigDtoClass = new ConfigDtoClass();
  private _version = version;
  private _author = author;
  private _description = description;
  private _name = name;
  private _email = pkgconfig.email;
  private _homepage = pkgconfig.homepage;
  private _params: Map<string, string> = new Map<string, string>();
  documents: string = '';
  public: string = '';
  uploads: string = '';
  exports: string = '';
  assets: string = '';
  log_dir: string = '';

  static _thisSingelton: ConfigService | null = null;

  static getThisSingelton(): ConfigService {
    if (this._thisSingelton == null) {
      this._thisSingelton = new ConfigService(new PrismaService());
    }
    return this._thisSingelton;
  }

  constructor(private prisma: PrismaService) {
    if (ConfigService._thisSingelton != null) {
      return ConfigService._thisSingelton;
    }
    ConfigService._thisSingelton = this;
    const defaultConfig = config.development;
    const environment = process.env.NODE_ENV ?? 'development';
    const environmentConfig =
      environment == 'development' ? defaultConfig : config.production;
    const finalConfig = { ...defaultConfig, ...environmentConfig };

    this.thisConfig = finalConfig;

    // DATABASE_URL bevorzugt aus Umgebungsvariable (z. B. .env, Docker secret).
    // Falls nicht gesetzt, aus config.json + DB_PASSWORD-Env zusammenbauen.
    if (!process.env.DATABASE_URL) {
      const dbPwd = process.env.DB_PASSWORD;
      if (!dbPwd) {
        throw new Error(
          'Database credentials missing: set DATABASE_URL or DB_PASSWORD environment variable.',
        );
      }
      process.env.DATABASE_URL =
        `${this.thisConfig.dbtype}://${this.thisConfig.db_user}:${dbPwd}` +
        `@${this.thisConfig.dbhost}:${this.thisConfig.port}/${this.thisConfig.database}?schema=public`;
    }

    const mainpath = realpathSync(__dirname + '/..');

    let path = mainpath + '/documents/';
    if (!existsSync(path)) mkdirSync(path);
    this.documents = path;

    path = mainpath + '/public/';
    if (!existsSync(path)) mkdirSync(path);
    this.public = path;

    path = mainpath + '/public/uploads/';
    if (!existsSync(path)) mkdirSync(path);
    this.uploads = path;

    path = mainpath + '/public/exports/';
    if (!existsSync(path)) mkdirSync(path);
    this.exports = path;

    path = mainpath + '/public/assets/';
    if (!existsSync(path)) mkdirSync(path);
    this.assets = path;

    path = mainpath + '/logs/';
    if (!existsSync(path)) mkdirSync(path);
    this.log_dir = path;
  }

  get version(): string {
    return this._version;
  }

  get config(): ConfigDtoClass {
    return this.thisConfig;
  }

  get author(): string {
    return this._author;
  }

  get description(): string {
    return this._description;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get homepage(): string {
    return this._homepage;
  }

  async loadParams(): Promise<Map<string, string>> {
    if (this._params.size === 0) {
      await this.prisma.$connect();
      const lstParams = await this.prisma.parameter.findMany();
      for (const param of lstParams) {
        this._params.set(param.key, param.value);
      }
    }
    return this._params;
  }

  get params(): Map<string, string> {
    return this._params;
  }

  public set params(value: Map<string, string>) {
    this._params = value;
  }

  get<T extends string | number | boolean | object>(
    key: string,
    defaultValue: T,
  ): T {
    const value = this.thisConfig[key] as T;
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return value;
  }

  /**
   * Liest das SMTP-Passwort einer Signatur aus der Umgebungsvariable,
   * die in `smtp_pwd_env` der jeweiligen Signatur in config.json steht.
   */
  getSmtpPassword(signature: string): string {
    const smtpCfg = this.thisConfig[signature] as
      | { smtp_pwd_env?: string }
      | undefined;
    const envName = smtpCfg?.smtp_pwd_env;
    if (!envName) {
      throw new Error(
        `SMTP configuration for "${signature}" is missing "smtp_pwd_env".`,
      );
    }
    const pwd = process.env[envName];
    if (!pwd) {
      throw new Error(
        `Environment variable "${envName}" is not set (required for SMTP signature "${signature}").`,
      );
    }
    return pwd;
  }
}
