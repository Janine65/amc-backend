import express from 'express';
import { systemVal } from '@utils/system'
import { logger } from '@utils/logger';
import { db } from "./database/database";
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors'
import session from 'express-session'
import { ErrorMiddleware } from './interfaces/error.middleware';
import Controller from './interfaces/controller.interface';
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "@utils/swagger_output.json";
import { Parameter } from './models/parameter';
import formidable from 'formidable';
import * as pkg from '../package.json';
import { RetData } from './models/generel';

class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        // Create an Express application
        this.app = express();
        this.connectDb();
        this.initializeMiddleware();
        this.initialzieMainFunctions();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(systemVal.gConfig.node_port, () => {
            // Log a message when the server is successfully running
            logger.info("Server is running on http://localhost:" + systemVal.gConfig.node_port);
        })
    }

    private async connectDb() {
        db.sequelize.query("select count(*) from parameter")
            .then(async (result) => {
                console.log('Database connected');
                const retValue = await Parameter.findAll();
                systemVal.Parameter = new Map();
                retValue.forEach(param => {
                    systemVal.Parameter.set(param.key, param.value)
                });

            })
            .catch((err) => {
                console.log(err);
            })
    }

    // init middleware
    private initializeMiddleware() {
        this.app.use(compression());
        this.app.use(express.json({ limit: 52428800 }));
        this.app.use(express.urlencoded({ extended: true, limit: 52428800 }));
        this.app.use(cookieParser())
        this.app.use(cors())
        this.app.use(session({
            secret: systemVal.gConfig.secret,
            resave: false,
            saveUninitialized: true,
            cookie: { secure: true }
        }))
    }

    // init error handling
    private initializeErrorHandling() {
        this.app.use(ErrorMiddleware);
    }

    private initialzieMainFunctions() {
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
        this.app.get('/health', function(req, res, next) { res.json({status: 'ok', message: 'I\m alive'})});
        this.app.post('/upload', function (req, res, next) {
            const form = formidable({
                multiples: true,
                maxFileSize: 500 * 1024 * 1024,
                keepExtensions: true,
                uploadDir: systemVal.uploads,
                // Use it to control newFilename.              
                filename: (name, ext, part, form) => part.originalFilename! // Will be joined with options.uploadDir.
            });

            form.parse(req, (err, fields, files) => {
                if (err) {
                    next(err);
                    return;
                }
                const retData: RetData = {type: 'info', message: 'file uploaded', data: files}

                res.json(retData);
            });
        });
        this.app.get('/download', function(req, res, next) {
            const filename = systemVal.exports + '/' + req.query.filename;  
            res.sendFile(filename);
        });
        this.app.get('/about', function(req, res, next) {
            res.json(pkg);
          
        });
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }
}

export default App;

