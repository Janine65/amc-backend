import express from "express";
import { systemVal } from "@utils/system";
import { db } from "./database/database";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import session from "express-session";
import { ErrorMiddleware } from "./interfaces/error.middleware";
import Controller from "./interfaces/controller.interface";
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "@utils/swagger_output.json";
import formidable from "formidable";
import * as pkg from "../package.json";
import { RetData } from "./models/generel";

class App {
  public app: express.Application;

  constructor(controllers: Controller[]) {
    // Create an Express application
    this.app = express();
    this.initializeMiddleware();
    this.initialzieMainFunctions();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public async start(): Promise<void> {
    await this.connectDb();
  }

  public listen() {
    this.app.listen(systemVal.gConfig.node_port, () => {});
    console.log(`app listen on port ${systemVal.gConfig.node_port}`)
  }

  private async connectDb(): Promise<void> {
    return new Promise<void>( (resolve, reject) => {
        db.sequelize
        .query("select now()")
        .then(() => {
            console.log("Database connected");
            resolve();
        })
        .catch((err) => {
            console.log(err);
            reject(err);
        });

    });
  }

  // init middleware
  private initializeMiddleware() {
    this.app.use(compression());
    this.app.use(express.json({ limit: 52428800 }));
    this.app.use(express.urlencoded({ extended: true, limit: 52428800 }));
    this.app.use(cookieParser());
    this.app.use(cors());
    this.app.use(
      session({
        secret: systemVal.gConfig.secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true },
      })
    );
  }

  // init error handling
  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }

  private initialzieMainFunctions() {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));
    this.app.get("/health", function (req, res) {
      res.json({ status: "ok", message: "Im alive" });
    });
    this.app.post("/upload", function (req, res, next) {
      const form = formidable({
        multiples: true,
        maxFileSize: 500 * 1024 * 1024,
        keepExtensions: true,
        uploadDir: systemVal.uploads,
        // Use it to control newFilename.
        filename: (name, ext, part) => part.originalFilename!, // Will be joined with options.uploadDir.
      });

      form.parse(req, (err, fields, files) => {
        if (err) {
          next(err);
          return;
        }
        const retData: RetData = {
          type: "info",
          message: "file uploaded",
          data: files,
        };

        res.json(retData);
      });
    });
    this.app.get("/download", function (req, res) {
      const filename = systemVal.exports + "/" + req.query.filename;
      res.sendFile(filename);
    });
    this.app.get("/about", function (req, res) {
      res.json(pkg);
    });
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }
}

export default App;
