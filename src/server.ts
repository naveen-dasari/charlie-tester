import * as express from 'express';
import * as bodyParser from "body-parser";
import {Server} from 'typescript-rest';
import {Inject} from 'typescript-ioc';
import {AddressInfo} from 'net';

import * as npmPackage from '../package.json';
import {parseCsvString} from './util/string-util';
import {LoggerApi} from './logger';
import {TracerApi} from './tracer';
import {opentracingMiddleware} from './util/opentracing/express-middleware';
import fs = require('fs');
import http = require('http');
import path = require('path');
import cors = require('cors');
import { Routes } from "./routes/crmRoutes";

const config = npmPackage.config || {
  protocol: 'http',
  host: 'localhost',
  port: 3000,
  'context-root': '/'
};
const configApiContext = config['context-root'];

export class ApiServer {
  @Inject
  logger: LoggerApi;
  @Inject
  tracer: TracerApi;

  // private readonly app: express.Application;
  private server: http.Server = null;
  public PORT: number = +process.env.PORT || npmPackage.config.port;
  public routePrv: Routes = new Routes();

  constructor(private readonly app: express.Application = express(), apiContext = configApiContext) {

    this.app.use(opentracingMiddleware({tracer: this.tracer}));
    this.logger.apply(this.app);
    this.app.use(cors());
	this.config(); //added by ben
	this.routePrv.routes(this.app);   //ben

    if (!apiContext || apiContext === '/') {
      this.app.use(express.static(path.join(process.cwd(), 'public'), { maxAge: 31557600000 }));
    } else {
      this.app.use(apiContext, express.static(path.join(process.cwd(), 'public'), { maxAge: 31557600000 }));
    }

    const apiRouter: express.Router = express.Router();
    Server.loadServices(
      apiRouter,
      [
        'controllers/*',
      ],
      __dirname,
    );

    const swaggerPath = path.join(process.cwd(), 'dist/swagger.json');
    if (fs.existsSync(swaggerPath)) {
      Server.swagger(
        apiRouter,
        {
          filePath: swaggerPath,
          schemes: this.swaggerProtocols,
          host: this.swaggerHost,
          endpoint: '/api-docs'
        },
      );
    }

    if (!apiContext || apiContext === '/') {
      this.app.use(apiRouter);
    } else {
      this.app.use(apiContext, apiRouter);
    }
  }
  
  private config(): void{
        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

  /**
   * Start the server
   * @returns {Promise<any>}
   */
  public async start(): Promise<ApiServer> {
    return new Promise<ApiServer>((resolve, reject) => {
      this.server = this.app.listen(this.PORT, (err: any) => {
        if (err) {
          return reject(err);
        }

        const addressInfo = this.server.address() as AddressInfo;

        const address = addressInfo.address === '::' ? 'localhost' : addressInfo.address;

        // tslint:disable-next-line:no-console
        console.log(`Listening to http://${address}:${addressInfo.port}`);

        return resolve(this);
      });
    });
  }

  /**
   * Stop the server (if running).
   * @returns {Promise<boolean>}
   */
  public async stop(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (this.server) {
        this.server.close(() => {
          return resolve(true);
        });
      } else {
        return resolve(false);
      }
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  get swaggerProtocols(): string[] {
    return parseCsvString(process.env.PROTOCOLS, '');
  }

  get swaggerHost(): string {
    return process.env.INGRESS_HOST || '';
  }
}
