import * as boom from "boom";
import * as hapi from "hapi";
import * as intacctapi from "intacct-api";
import * as Joi from "joi";
import * as pkg from "../package.json";
export * from "./joi";

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface IHapiIntacctOptions {
  sdk: IntacctSDKConfiguration;
  routes?: Array<Partial<IIntacctRouteConfiguration>>;
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

export interface IIntacctRouteConfigurationAdditional extends hapi.RouteAdditionalConfigurationOptions {
  id: string;
}

export interface IIntacctRouteConfiguration extends hapi.RouteConfiguration {
  handler?: IIntacctRouteHandler;
  config: IIntacctRouteConfigurationAdditional;
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
        this.callReadByQuery(request, reply, ohandler);
      },
      method: "GET",
      path: "/intacct/invoice",
    });

    this.routes.set("intacct_invoice_read", {
      config: {
        id: "intacct_invoice_read",
      },
      handler: async (request, reply, ohandler) => {
        const read = intacctapi.IntacctApi.read({ object: "ARINVOICE", keys: request.params.recordno });
        this.commonResponseHandler(read, request, reply, ohandler);
      },
      method: "GET",
      path: "/intacct/invoice/{recordno}",
    });

    this.routes.set("intacct_invoice_update", {
      config: {
        id: "intacct_invoice_update",
      },
      handler: async (request, reply, ohandler) => {
        // tslint:disable-next-line:max-line-length
        const update = intacctapi.IntacctApi.update({ ARINVOICE: { RECORDNO: request.params.recordno, ...request.payload } });
        this.commonResponseHandler(update, request, reply, ohandler);
      },
      method: "PUT",
      path: "/intacct/invoice/{recordno}",
    });

    // TODO: Add hapi routes for: arpaymentdetail

    this.routes.set("intacct_payment_create", {
      config: {
        id: "intacct_payment_create",
      },
      handler: async (request, reply, ohandler) => {
        const cid = new intacctapi.ControlFunction("create_arpayment", request.payload, null, true);
        this.commonResponseHandler(cid, request, reply, ohandler);
      },
      method: "POST",
      path: "/intacct/payment",
    });

    this.routes.set("intacct_invoice_apply_payment", {
      config: {
        id: "intacct_invoice_apply_payment",
      },
      handler: async (request, reply, ohandler) => {
        const cid = new intacctapi.ControlFunction("apply_arpayment", request.payload, null, true);
        this.commonResponseHandler(cid, request, reply, ohandler);
      },
      method: "POST",
      path: "/intacct/invoice/applypayment",
    });

    this.routes.set("intacct_customer_add_bankaccount", {
      config: {
        id: "intacct_customer_add_bankaccount",
      },
      handler: async (request, reply, ohandler) => {
        const cid = new intacctapi.ControlFunction("create_customerbankaccount", request.payload, null, true);
        this.commonResponseHandler(cid, request, reply, ohandler);
      },
      method: "POST",
      path: "/intacct/customer/addbank",
    });

    this.routes.set("intacct_glaccount_query", {
      config: {
        id: "intacct_glaccount_query",
      },
      handler: async (request, reply, ohandler) => {
        this.callReadByQuery(request, reply, ohandler);
      },
      method: "GET",
      path: "/intacct/glaccount",
    });

    this.routes.set("intacct_checkingaccount_query", {
      config: {
        id: "intacct_checkingaccount_query",
      },
      handler: async (request, reply, ohandler) => {
        this.callReadByQuery(request, reply, ohandler);
      },
      method: "GET",
      path: "/intacct/checkingaccount",
    });

    this.routes.set("intacct_invoice_inspect", {
      config: {
        id: "intacct_invoice_inspect",
      },
      handler: async (request, reply, ohandler) => {
        const inspect = intacctapi.IntacctApi.inspect({ object: "ARINVOICE" });
        this.commonResponseHandler(inspect, request, reply, ohandler);
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
    next();
  }

  private buildRoutes(routes: Array<Partial<IIntacctRouteConfiguration>>) {
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

  private async  callReadByQuery(request: hapi.Request, reply: hapi.ReplyNoContinue, ohandler: IIntacctRouteHandler) {
    const values: any = this.getReadByQueryPathValues(request.path);

    let error = null;
    let response = null;
    const queryParams = {
      fields: request.query.fields || null,
      object: values.queryObject,
      query: request.query.query,
    };

    const query = intacctapi.IntacctApi.readByQuery(queryParams);
    await this.intacct.request(query);
    const temp = query.get();
    if (!query.isSuccessful()) {
      error = new Error(JSON.stringify(query.result.errors));
    } else {
      const arrResult = temp[values.intacctObject];
      response = arrResult && arrResult.length > 0 ? arrResult : [];
    }
    if (ohandler) {
      ohandler.apply(this, [request, reply, error, response]);
    } else {
      reply(error || response);
    }
  }

  private getReadByQueryPathValues(path: string) {
    switch (path) {
      case "/intacct/checkingaccount":
        return { queryObject: "CHECKINGACCOUNT", intacctObject: "checkingaccount" };

      case "/intacct/invoice":
        return { queryObject: "ARINVOICE", intacctObject: "arinvoice" };

      case "/intacct/glaccount":
        return { queryObject: "GLACCOUNT", intacctObject: "glaccount" };

      default:
        return {};
    }
  }

  // tslint:disable-next-line:max-line-length
  private async commonResponseHandler(cid: any /*intacctapi.IntacctApi.ControlFunction*/, request: hapi.Request, reply: hapi.ReplyNoContinue, ohandler: IIntacctRouteHandler) {
    let error = null;
    let response = null;
    await this.intacct.request(cid);
    if (!cid.isSuccessful()) {
      error = new Error(JSON.stringify(cid.result.errors));
    } else {
      response = cid;
    }

    if (ohandler) {
      ohandler.apply(this, [request, reply, error, response]);
    } else {
      if (error) {
        return error ? reply(boom.badRequest(error.message)) : reply(response);
      }

      response = this.filterIntacctResponse(cid);

      return reply(response);
    }
  }

  private filterIntacctResponse(cid: any) {
    switch (cid.name) {
      case "read":
        return cid.get("ARINVOICE")[0];

      case "update":
        return cid.get()[0].arinvoice[0];

      case "create_arpayment":
        return cid;

      case "apply_arpayment":
        return cid.get()[0].arinvoice[0];

      case "create_customerbankaccount":
       return cid.result;

      case "inspect":
       return cid.get();

      default:
        return cid;
    }
  }
}
