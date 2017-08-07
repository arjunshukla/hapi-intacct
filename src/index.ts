import * as boom from "boom";
import * as hapi from "hapi";
import * as intacctapi from "intacct-api";
// import { defaultControlFunction as controlFunction } from "intacct-api";
// const test = intacctapi.ControlFunction;
// const intacctControlFunction = require("intacct-api").ControlFunction;
// import { ControlFunction } from 'intacct-api/src/control_function';
// import * as intacctControlFunction from intacctapi.intacctControlFunction;
import * as Joi from "joi";
import * as pkg from "../package.json";

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface IHapiIntacctOptions {
  sdk: IntacctSDKConfiguration;
  routes?: [Partial<IIntacctRouteConfiguration>];
  cron?: any;  // For later
}

export interface IntacctSDKConfiguration {
  auth: {
    senderId: string;
    senderPassword: string;
    companyId: string;
    userId?: string;
    password?: string;
    sessionId?: string;
  };
  controlId?: string;
  uniqueId?: boolean;
  dtdVersion?: string;
}

export interface IIntacctRouteConfiguration extends hapi.RouteConfiguration {
  handler?: IIntacctRouteHandler;
  config: {
    id: string;
  };
}

export type IIntacctRouteHandler = (
  request: hapi.Request,
  reply: hapi.ReplyNoContinue,
  error: any,
  response: any,
) => void;

export interface InternalRouteConfiguration extends hapi.RouteConfiguration {
  handler?: InternalRouteHandler;
  config: {
    id: string;
  };
}

export type InternalRouteHandler = (
  request: hapi.Request,
  reply: hapi.ReplyNoContinue,
  ohandler: IIntacctRouteHandler,
) => void;

export class HapiIntacct {

  private server: hapi.Server;
  private intacct: any;
  private intacctInvoice: any;
  private routes: Map<string, InternalRouteConfiguration> = new Map();

  constructor() {
    this.register.attributes = {
      pkg,
    };

    this.routes.set("intacct_invoice_query", {
      config: {
        id: "intacct_invoice_query",
      },
      handler: async (request, reply, ohandler) => {
        let error = null;
        let response = null;
        const queryParams = {
          fields: request.query.fields || null,
          object: "ARINVOICE",
          query: request.query.query,
        };
        const query = intacctapi.IntacctApi.readByQuery(queryParams);
        await this.intacct.request(query);
        const temp = query.get();
        if (!query.isSuccessful()) {
          error = new Error(JSON.stringify(query.result.errors));
        } else {
          response = temp.arinvoice && temp.arinvoice.length > 0 ? temp.arinvoice : [];
        }
        if (ohandler) {
          ohandler.apply(this, [request, reply, error, response]);
        } else {
          reply(error || response);
        }

      },
      method: "GET",
      path: "/intacct/invoice",
    });

    this.routes.set("intacct_invoice_read", {
      config: {
        id: "intacct_invoice_read",
      },
      handler: async (request, reply, ohandler) => {
        let error = null;
        let response = null;
        const read = intacctapi.IntacctApi.read({ object: "ARINVOICE", keys: request.params.recordno });
        await this.intacct.request(read);
        if (!read.isSuccessful()) {
          error = new Error(JSON.stringify(read.result.errors));
        } else {
          response = read.get("ARINVOICE")[0];
        }

        if (ohandler) {
          ohandler.apply(this, [request, reply, error, response]);
        } else {
          return error ? reply(boom.badRequest(error.message)) : reply(response);
        }
      },
      method: "GET",
      path: "/intacct/invoice/{recordno}",
    });

    this.routes.set("intacct_invoice_update", {
      config: {
        id: "intacct_invoice_update",
      },
      handler: async (request, reply, ohandler) => {
        let error = null;
        let response = null;
        // tslint:disable-next-line:max-line-length
        const update = intacctapi.IntacctApi.update({ ARINVOICE: { RECORDNO: request.params.recordno, ...request.payload } });
        await this.intacct.request(update);
        if (!update.isSuccessful()) {
          error = new Error(JSON.stringify(update.result.errors));
        } else {
          response = update.get()[0].arinvoice[0];
        }

        if (ohandler) {
          ohandler.apply(this, [request, reply, error, response]);
        } else {
          return error ? reply(boom.badRequest(error.message)) : reply(response);
        }
      },
      method: "PUT",
      path: "/intacct/invoice/{recordno}",
    });

    // TODO: Add hapi routes for: arpayment, arpaymentdetail, arinvoice-inspect

    // arpayment
    this.routes.set("intacct_invoice_create_payment", {
      config: {
        id: "intacct_invoice_create_payment",
      },
      handler: async (request, reply, ohandler) => {
        let error = null;
        let response = null;

        const reqBody = request.payload;
        const date = new Date();
        const condtrolFunctionObj = {
          arpaymentitem: {
            amount: reqBody.amount,
            invoicekey: reqBody.invoicekey,
          },
          bankaccountid: reqBody.bankaccountid,
          basecurr: reqBody.basecurr,
          currency: reqBody.currency,
          customerid: reqBody.customerid,
          datereceived: {
            day: date.getDay(),
            month: date.getMonth(),
            year: date.getFullYear(),
          },
          exchratetype: reqBody.exchratetype,
          overpaydeptid: reqBody.overpaydeptid,
          overpaylocid: reqBody.overpaylocid,
          paymentamount: reqBody.paymentamount,
          paymentmethod: reqBody.paymentmethod,
          refid: reqBody.refid,
          translatedamount: reqBody.translatedamount,
        };

        const cid = new intacctapi.ControlFunction("create_arpayment", request.payload, null, true);
        // const cid = intacctapi.IntacctApi.create({ ARPAYMENT: { ...request.payload } });
        await this.intacct.request(cid);
        if (!cid.isSuccessful()) {
          error = new Error(JSON.stringify(cid.result.errors));
        } else {
          response = cid.get()[0].arinvoice[0];
        }

        if (ohandler) {
          ohandler.apply(this, [request, reply, error, response]);
        } else {
          return error ? reply(boom.badRequest(error.message)) : reply(response);
        }
      },
      method: "POST",
      path: "/intacct/invoice/payment",
    });

    // apply_arpayment
    this.routes.set("intacct_invoice_apply_payment", {
      config: {
        id: "intacct_invoice_apply_payment",
      },
      handler: async (request, reply, ohandler) => {
        let error = null;
        let response = null;

        const reqBody = request.payload;
        const date = new Date();
        const condtrolFunctionObj = {
          arpaymentitem: {
            amount: reqBody.amount,
            invoicekey: reqBody.invoicekey,
          },
          bankaccountid: reqBody.bankaccountid,
          basecurr: reqBody.basecurr,
          currency: reqBody.currency,
          customerid: reqBody.customerid,
          datereceived: {
            day: date.getDay(),
            month: date.getMonth(),
            year: date.getFullYear(),
          },
          exchratetype: reqBody.exchratetype,
          overpaydeptid: reqBody.overpaydeptid,
          overpaylocid: reqBody.overpaylocid,
          paymentamount: reqBody.paymentamount,
          paymentmethod: reqBody.paymentmethod,
          refid: reqBody.refid,
          translatedamount: reqBody.translatedamount,
        };

        const cid = new intacctapi.ControlFunction("apply_arpayment", request.payload, null, true);
        await this.intacct.request(cid);
        if (!cid.isSuccessful()) {
          error = new Error(JSON.stringify(cid.result.errors));
        } else {
          response = cid.get()[0].arinvoice[0];
        }

        if (ohandler) {
          ohandler.apply(this, [request, reply, error, response]);
        } else {
          return error ? reply(boom.badRequest(error.message)) : reply(response);
        }
      },
      method: "POST",
      path: "/intacct/invoice/applypayment",
    });

// add customer bank account
    this.routes.set("intacct_customer_add_bankaccount", {
      config: {
        id: "intacct_customer_add_bankaccount",
      },
      handler: async (request, reply, ohandler) => {
        let error = null;
        let response = null;

        const cid = new intacctapi.ControlFunction("create_customerbankaccount", request.payload, null, true);
        // const cid = intacctapi.IntacctApi.create({ ARPAYMENT: { ...request.payload } });
        await this.intacct.request(cid);
        if (!cid.isSuccessful()) {
          error = new Error(JSON.stringify(cid.result.errors));
        } else {
          response = cid.result;
        }

        if (ohandler) {
          ohandler.apply(this, [request, reply, error, response]);
        } else {
          return error ? reply(boom.badRequest(error.message)) : reply(response);
        }
      },
      method: "POST",
      path: "/intacct/customer/addbank",
    });

    // arpaymentdetail
    /* this.routes.set("intacct_invoice_update", {
         config: {
             id: "intacct_invoice_update",
         },
         handler: async (request, reply, ohandler) => {
             let error = null;
             let response = null;
             tslint:disable-next-line:max-line-length
             const update = intacctapi.IntacctApi.update
             ({ ARINVOICE: { RECORDNO: request.params.recordno, ...request.payload } });
             await this.intacct.request(update);
             if (!update.isSuccessful()) {
                 error = new Error(JSON.stringify(update.result.errors));
             } else {
                 response = update.get()[0].arinvoice[0];
             }

             if (ohandler) {
                 ohandler.apply(this, [request, reply, error, response]);
             } else {
                 return error ? reply(boom.badRequest(error.message)) : reply(response);
             }
         },
         method: "PUT",
         path: "/intacct/invoice/{recordno}",
     }); */

    // arinvoice-inspect
    this.routes.set("intacct_invoice_inspect", {
         config: {
             id: "intacct_invoice_inspect",
         },
         handler: async (request, reply, ohandler) => {
             let error = null;
             let response = null;
             // tslint:disable-next-line:max-line-length
             const inspect = intacctapi.IntacctApi.inspect({ object: "ARINVOICE" });
             await this.intacct.request(inspect);
             if (!inspect.isSuccessful()) {
                 error = new Error(JSON.stringify(inspect.result.errors));
             } else {
                 response = inspect.get();
             }

             if (ohandler) {
                 ohandler.apply(this, [request, reply, error, response]);
             } else {
                 return error ? reply(boom.badRequest(error.message)) : reply(response);
             }
         },
         method: "OPTIONS",
         path: "/intacct/invoice",
     });
  }

  // tslint:disable-next-line:max-line-length
  public register: hapi.PluginFunction<any> = (server: hapi.Server, options: IHapiIntacctOptions, next: hapi.ContinuationFunction) => {
    this.server = server;

    // TODO: add full validation
    const sdkSchema = Joi.object().keys({
      auth: Joi.object().keys({
        companyId: Joi.string().min(1).required(),
        password: Joi.string().min(1),
        senderId: Joi.string().min(1).required(),
        senderPassword: Joi.string().min(1).required(),
        sessionId: Joi.string().min(1),
        userId: Joi.string().min(1),
      }).required(),
      controlId: Joi.string(),
      dtdVersion: Joi.string(),
      uniqueId: Joi.bool(),
    });

    const sdkValidate = Joi.validate(options.sdk, sdkSchema);
    if (sdkValidate.error) {
      throw sdkValidate.error;
    }

    this.intacct = new intacctapi.IntacctApi(options.sdk);

    this.server.expose("intacct", this.intacct);

    if (options.routes && options.routes.length > 0) {
      this.buildRoutes(options.routes);
    }

    // this.initializeInvoice();

    next();
  }

  /*
  private async initializeInvoice() {
      const inspectInvoice = intacctapi.IntacctApi.inspect({ object: "ARINVOICE" });
      await this.intacct.request([inspectInvoice]);
      this.intacctInvoice = inspectInvoice.get();
      this.server.log("info", `Intacct Invoice ${JSON.stringify(this.intacctInvoice)}`);
  }
  */
  private buildRoutes(routes: [Partial<IIntacctRouteConfiguration>]) {
    routes.forEach((route) => {
      const dRoute = this.routes.get(route.config.id);
      const nRoute: hapi.RouteConfiguration = {
        handler: (request, reply) => {
          dRoute.handler(request, reply, route.handler);
        },
        method: route.method || dRoute.method,
        path: route.path || dRoute.path,
      };
      this.server.route({ ...route, ...nRoute });
    });
  }
}
