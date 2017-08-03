import * as hapi from "hapi";
import * as intacctapi from "intacct-api";
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
                // tslint:disable-next-line:max-line-length

                const query = intacctapi.IntacctApi.readByQuery({ object: "ARINVOICE", query: request.query.query });
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

// read
        this.routes.set("intacct_invoice_read", {
            config: {
                id: "intacct_invoice_read",
            },
            handler: async (request, reply, ohandler) => {
                let error = null;
                let response = null;
                const recordno: number = +request.params.recordno;
                const intacctInvoiceArray = await this.read(recordno);

                if (intacctInvoiceArray.length === 0) {
                    response = [];
                } else {
                    response = intacctInvoiceArray;
                }
                if (ohandler) {
                    ohandler.apply(this, [request, reply, error, response]);
                } else {
                    reply(error || response);
                }
            },
            method: "GET",
            path: "/intacct/invoice/{recordno}",
        });

// update
        this.routes.set("intacct_invoice_update", {
            config: {
                id: "intacct_invoice_update",
            },
            handler: async (request, reply, ohandler) => {
                let error = null;
                let response = null;

                try {
                    // Update Intacct
                    this.update(request.payload);
                    response = "Invoice updated successfully!";
                } catch (err) {
                  error = err;
                }

                if (ohandler) {
                    ohandler.apply(this, [request, reply, error, response]);
                } else {
                    reply(error || response);
                }
            },
            method: "PUT",
            path: "/intacct/invoice/{recordno}",
        });

        // TODO: Add hapi routes for: arpayment, arpaymentdetail
    }

    private async read(RECORDNO : number){
        const cid = intacctapi.IntacctApi.read({ object: 'ARINVOICE', keys: RECORDNO });
        await this.intacct.request(cid);
        return cid.data.ARINVOICE[0] || [];
    }


    private async update(updateObj : object) {
        const cid = intacctapi.IntacctApi.update(updateObj);
        let result = await this.intacct.request(cid);
        if (!cid.isSuccessful()) {
            throw new Error(result.rawPayload);
        }
        return cid;
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

        this.initializeInvoice();

        next();
    }

    private async initializeInvoice() {
        const inspectInvoice = intacctapi.IntacctApi.inspect({ object: "ARINVOICE" });
        await this.intacct.request([inspectInvoice]);
        this.intacctInvoice = inspectInvoice.get();
        this.server.log("info", `Intacct Invoice ${JSON.stringify(this.intacctInvoice)}`);
    }

    private buildRoutes(routes: [Partial<IIntacctRouteConfiguration>]) {
        routes.forEach((route) =>  {
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
