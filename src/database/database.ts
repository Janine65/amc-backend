import Sequelize from 'sequelize';
import { logger } from '@utils/logger';
import { systemVal } from "@utils/system"
import { initModels } from '@models/init-models';

class DB {
    public sequelize;
    public dbModels;
    private static _instance: DB = new DB();

    constructor() {
        if (DB._instance)
            throw new Error("Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.");

        DB._instance = this;

        let passwd = ''
        passwd = systemVal.cipher.decrypt(systemVal.gConfig.db_pwd);

        this.sequelize = new Sequelize.Sequelize(systemVal.gConfig.database,
            systemVal.gConfig.db_user,
            passwd, {
            dialect: 'postgres',
            host: systemVal.gConfig.dbhost,
            port: systemVal.gConfig.port,
            timezone: 'Europe/Zurich',
            ssl: true,
            define: {
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                underscored: false,
                freezeTableName: true,
                timestamps: true
            },
            pool: {
                min: 0,
                max: 5,
            },
            logQueryParameters: systemVal.gConfig.config_id === 'development',
            logging: (query, time) => {
                logger.info(time + 'ms' + ' ' + query);
            },
            benchmark: true,
        });
        
        this.sequelize.authenticate();
        this.dbModels = initModels(this.sequelize);
    }
    public static getInstance():DB
    {
        return DB._instance;
    }
}

const db = DB.getInstance();;
export { db };
