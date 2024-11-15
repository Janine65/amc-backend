import { Sequelize } from 'sequelize';
import { version } from '../../package.json';
import config from '@config/config.json';
import { existsSync, mkdirSync, realpathSync } from 'node:fs';
        
class ConfigClass {
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
    JanineFranken!: {
        smtp: string;
        smtp_port: number;
        smtp_user: string;
        smtp_pwd: string;
        email_from: string;
    };
    HansjoergDutler!: {
        smtp: string;
        smtp_port: number;
        smtp_user: string;
        smtp_pwd: string;
        email_from: string;
    };

}

// Class for crypt passwords - access in global class

import crypto from 'node:crypto'
import { Parameter } from '@/models/parameter';
import { logger } from './logger';

class CIPHER {

    secret: string;
    iv: string;    

    constructor(secret: string) {

        this.secret = secret;
        this.iv = systemVal.gConfig.iv;
    }

    encrypt(decrypted: string): string {
        try {
            const key = Buffer.from(this.secret,'utf-8');            
            const iv = Buffer.from(this.iv, 'utf-8');
            const algorithm = 'aes-256-cbc'
            
            const cipher = crypto.createCipheriv(algorithm, key, iv);
            let retVal = cipher.update(decrypted, 'utf-8', 'hex');
            retVal += cipher.final('hex');

            return retVal
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    decrypt(encrypted: string): string {
        try {
            const key = Buffer.from(this.secret,'utf-8');
            const iv = Buffer.from(this.iv, 'utf-8');
            const algorithm = 'aes-256-cbc'
            
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


class SystemVal {

    private static _instance: SystemVal = new SystemVal();

    private _version: string;
    public get version(): string {
        return this._version;
    }
    private _sequelize!: Sequelize;
    public get sequelize(): Sequelize {
        return this._sequelize;
    }
    public set sequelize(value: Sequelize) {
        this._sequelize = value;
    }
    private _documents!: string;
    public get documents(): string {
        return this._documents;
    }
    public set documents(value: string) {
        this._documents = value;
    }
    private _uploads!: string;
    public get uploads(): string {
        return this._uploads;
    }
    public set uploads(value: string) {
        this._uploads = value;
    }
    private _exports!: string;
    public get exports(): string {
        return this._exports;
    }
    public set exports(value: string) {
        this._exports = value;
    }
    private _public!: string;
    public get public(): string {
        return this._public;
    }
    public set public(value: string) {
        this._public = value;
    }
    private _assets!: string;
    public get assets(): string {
        return this._assets;
    }
    public set assets(value: string) {
        this._assets = value;
    }
    private _log_dir!: string;
    public get log_dir(): string {
        return this._log_dir;
    }
    public set log_dir(value: string) {
        this._log_dir = value;
    }

    private _connected!: boolean;
    public get connected(): boolean {
        return this._connected;
    }
    public set connected(value: boolean) {
        this._connected = value;
    }
    private _Parameter!: Map<string, string>;
    public get Parameter(): Map<string, string> {
        return this._Parameter;
    }
    public set Parameter(value: Map<string, string>) {
        this._Parameter = value;
    }
    private _gConfig!: ConfigClass;
    public get gConfig(): ConfigClass {
        return this._gConfig;
    }
    public set gConfig(value: ConfigClass) {
        this._gConfig = value;
    }
    private _cipher!: CIPHER;
    public get cipher(): CIPHER {
        if (this._cipher)
            return this._cipher;
        else {
            this._cipher = new CIPHER(this._gConfig.secret);
            return this._cipher;
        }
    }
    public set cipher(value: CIPHER) {
        this._cipher = value;
    }

    constructor() {
        if (SystemVal._instance) {
            throw new Error("Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.");
        }
        SystemVal._instance = this;
        this._version = version;

        const defaultConfig = config.development;
        const environment = process.env.NODE_ENV ?? 'development';
        const environmentConfig = environment == 'development' ? defaultConfig : config.production;
        const finalConfig = {...defaultConfig, ...environmentConfig};
        
        this.gConfig = finalConfig;
        
        let mainpath = realpathSync(__dirname + "/..");
        
        let path =  mainpath + "/documents/"
        if (!existsSync(path)) 
          mkdirSync(path);
        this.documents = path
        
        path = mainpath + "/public/"
        if (!existsSync(path)) 
          mkdirSync(path);
        this.public = path
        
        path =  mainpath + "/public/uploads/"
        if (!existsSync(path)) 
          mkdirSync(path);
        this.uploads = path
        
        path = mainpath + "/public/exports/"
        if (!existsSync(path)) 
          mkdirSync(path);
        this.exports = path
        
        path = mainpath + "/public/assets/"
        if (!existsSync(path)) 
          mkdirSync(path);
        this.assets = path
        
        path =  mainpath + "/logs/"
        if (!existsSync(path)) 
          mkdirSync(path);
        this.log_dir = path        
    }

    public static getInstance(): SystemVal {
        return SystemVal._instance;
    }

    loadParams() {
        Parameter.findAll().then((retValue) => {
            this.Parameter = new Map();
            retValue.forEach(param => {
                this.Parameter.set(param.key, param.value)
            });    

            // log global.system.gConfig
            logger.info(`systemVal: ${JSON.stringify(this, undefined, this.gConfig.json_indentation)}`);
        });

    }
    getVersion(): string {
        return this._version;
    }

    getConfig(config: string) {
        if (config == 'JanineFranken')
            return this._gConfig.JanineFranken;
        else return this._gConfig.HansjoergDutler;
    }
}

const systemVal = SystemVal.getInstance();
export { systemVal }