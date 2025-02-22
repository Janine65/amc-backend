import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
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
  documents: string;
  public: string;
  uploads: string;
  exports: string;
  assets: string;
  log_dir: string;

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

    // DATABASE_URL="${db_type}://${db_user}:${db_pwd}@${dbhost}:${db_port}/${database}?schema=public"
    const database_url =
      this.thisConfig.dbtype +
      '://' +
      this.thisConfig.db_user +
      ':' +
      this.decrypt(this.thisConfig.db_pwd) +
      '@' +
      this.thisConfig.dbhost +
      ':' +
      this.thisConfig.port +
      '/' +
      this.thisConfig.database +
      '?schema=public';
    process.env.DATABASE_URL = database_url;

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
      console.debug('DATABASE_URL:', process.env.DATABASE_URL);
      await this.prisma.$connect();
      console.debug('Connected to database');
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

  encrypt(decrypted: string): string {
    try {
      const key = Buffer.from(this.thisConfig.secret, 'utf-8');
      const iv = Buffer.from(this.thisConfig.iv, 'utf-8');
      const algorithm = 'aes-256-cbc';

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let retVal = cipher.update(decrypted, 'utf-8', 'hex');
      retVal += cipher.final('hex');

      return retVal;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  decrypt(encrypted: string): string {
    try {
      const key = Buffer.from(this.thisConfig.secret, 'utf-8');
      const iv = Buffer.from(this.thisConfig.iv, 'utf-8');
      const algorithm = 'aes-256-cbc';

      const cipher = crypto.createDecipheriv(algorithm, key, iv);

      let retVal = cipher.update(encrypted, 'hex', 'utf-8');
      retVal += cipher.final('utf-8');
      return retVal;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
