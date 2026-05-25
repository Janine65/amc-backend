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

  /**
   * Ersetzt rekursiv ENV-Referenzen in einem Objekt (in-place).
   * Unterstützt zwei Formen:
   *  - "${VAR}" innerhalb eines Strings -> process.env.VAR
   *  - Strings, die genau einem ENV-Variablennamen entsprechen
   *    (UPPER_SNAKE_CASE, in process.env vorhanden) -> deren Wert
   */
  private static resolveEnvRefs(obj: Record<string, unknown>): void {
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value === null || value === undefined) continue;
      if (typeof value === 'string') {
        obj[key] = ConfigService.resolveEnvString(value);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        ConfigService.resolveEnvRefs(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const item = value[i] as unknown;
          if (typeof item === 'string') {
            value[i] = ConfigService.resolveEnvString(item);
          } else if (item !== null && typeof item === 'object') {
            ConfigService.resolveEnvRefs(item as Record<string, unknown>);
          }
        }
      }
    }
  }

  private static resolveEnvString(value: string): string {
    // ${VAR}-Platzhalter ersetzen (auch mehrfach pro String).
    let result = value.replace(
      /\$\{([A-Z_][A-Z0-9_]*)\}/g,
      (_, name: string) =>
        process.env[name] !== undefined ? (process.env[name] ?? '') : '',
    );
    // Reiner ENV-Variablenname (z. B. "SMTP_PWD_JANINEFRANKEN").
    if (
      /^[A-Z_][A-Z0-9_]*$/.test(result) &&
      process.env[result] !== undefined
    ) {
      result = process.env[result] ?? '';
    }
    return result;
  }

  /** Schlüssel, deren Werte beim Debug-Log maskiert werden. */
  private static readonly SENSITIVE_KEY_RE =
    /(password|passwd|pwd|secret|token|api[_-]?key)/i;

  /**
   * Liefert eine flache Kopie des Config-Objekts, in der Werte unter
   * sensiblen Schlüsseln durch "***" ersetzt sind. Wird ausschließlich für
   * Debug-Ausgaben verwendet, das Original bleibt unverändert.
   */
  private static maskSensitive(input: unknown): unknown {
    if (input === null || input === undefined) return input;
    if (Array.isArray(input)) {
      return input.map((v) => ConfigService.maskSensitive(v));
    }
    if (typeof input === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
        if (typeof v === 'string' && ConfigService.SENSITIVE_KEY_RE.test(k)) {
          out[k] = v ? '***' : v;
        } else {
          out[k] = ConfigService.maskSensitive(v);
        }
      }
      return out;
    }
    return input;
  }

  constructor(private prisma: PrismaService) {
    if (ConfigService._thisSingelton != null) {
      return ConfigService._thisSingelton;
    }
    ConfigService._thisSingelton = this;
    const defaultConfig = config.development;
    const environment = process.env.NODE_ENV ?? 'development';
    const sections: Record<string, Partial<typeof defaultConfig>> = {
      development: defaultConfig,
      test: config.test,
      production: config.production,
    };
    const environmentConfig = sections[environment] ?? defaultConfig;
    const finalConfig = { ...defaultConfig, ...environmentConfig };

    // ENV-Variablen überschreiben gleichnamige Keys in config.json.
    // Konvention: Key in config.json -> UPPER_SNAKE_CASE in process.env.
    // Verschachtelte Objekte (z. B. SMTP-Signaturen) werden nicht überschrieben.
    for (const key of Object.keys(finalConfig)) {
      const envKey = key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
      const envVal = process.env[envKey];
      if (envVal === undefined || envVal === '') continue;
      const current = (finalConfig as Record<string, unknown>)[key];
      if (current !== null && typeof current === 'object') continue;
      let coerced: unknown = envVal;
      if (typeof current === 'number') {
        const n = Number(envVal);
        if (!Number.isNaN(n)) coerced = n;
      } else if (typeof current === 'boolean') {
        coerced = envVal === 'true' || envVal === '1';
      }
      (finalConfig as Record<string, unknown>)[key] = coerced;
    }

    // Rekursive Ersetzung von ENV-Referenzen in allen String-Werten:
    //  - "${VAR}" wird durch process.env.VAR ersetzt (auch als Teil eines Strings)
    //  - reine UPPER_SNAKE_CASE-Strings, die einer existierenden ENV-Variable
    //    entsprechen, werden komplett durch deren Wert ersetzt.
    ConfigService.resolveEnvRefs(finalConfig);

    this.thisConfig = finalConfig;
    console.info(`Configuration loaded for environment: ${environment}`);
    console.debug(
      'Effective configuration:',
      ConfigService.maskSensitive(finalConfig),
    );

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
   * Liest das SMTP-Passwort einer Signatur. `smtp_pwd_env` enthält in
   * config.json den Namen der ENV-Variable, der beim Laden bereits durch
   * deren Wert ersetzt wurde (vgl. resolveEnvRefs). Ist die ENV-Variable
   * nicht gesetzt, bleibt der ursprüngliche Name stehen — dann werfen wir
   * einen sprechenden Fehler.
   */
  getSmtpPassword(signature: string): string {
    const smtpCfg = this.thisConfig[signature] as
      | { smtp_pwd_env?: string }
      | undefined;
    const value = smtpCfg?.smtp_pwd_env;
    if (!value) {
      throw new Error(
        `SMTP configuration for "${signature}" is missing "smtp_pwd_env".`,
      );
    }
    // Wenn der Wert noch wie ein ENV-Variablenname aussieht, wurde er nicht
    // aufgelöst => ENV-Variable fehlt.
    if (/^[A-Z_][A-Z0-9_]*$/.test(value)) {
      throw new Error(
        `Environment variable "${value}" is not set (required for SMTP signature "${signature}").`,
      );
    }
    return value;
  }
}
