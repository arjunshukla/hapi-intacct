"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const boom = require("boom");
const intacctapi = require("intacct-api");
const Joi = require("joi");
const pkg = require("../package.json");
__export(require("./joi"));
class HapiIntacct {
    constructor() {
        this.routes = new Map();
        this.register = (server, options, next) => {
            this.server = server;
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
        };
        this.register.attributes = {
            pkg,
        };
        this.routes.set("intacct_invoice_query", {
            config: {
                id: "intacct_invoice_query",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                this.callReadByQuery(request, reply, ohandler);
            }),
            method: "GET",
            path: "/intacct/invoice",
        });
        this.routes.set("intacct_invoice_read", {
            config: {
                id: "intacct_invoice_read",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                const read = intacctapi.IntacctApi.read({ object: "ARINVOICE", keys: request.params.recordno });
                this.commonResponseHandler(read, request, reply, ohandler);
            }),
            method: "GET",
            path: "/intacct/invoice/{recordno}",
        });
        this.routes.set("intacct_invoice_update", {
            config: {
                id: "intacct_invoice_update",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                const update = intacctapi.IntacctApi.update({ ARINVOICE: Object.assign({ RECORDNO: request.params.recordno }, request.payload) });
                this.commonResponseHandler(update, request, reply, ohandler);
            }),
            method: "PUT",
            path: "/intacct/invoice/{recordno}",
        });
        this.routes.set("intacct_payment_create", {
            config: {
                id: "intacct_payment_create",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                const cid = new intacctapi.ControlFunction("create_arpayment", request.payload, null, true);
                this.commonResponseHandler(cid, request, reply, ohandler);
            }),
            method: "POST",
            path: "/intacct/payment",
        });
        this.routes.set("intacct_invoice_apply_payment", {
            config: {
                id: "intacct_invoice_apply_payment",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                const cid = new intacctapi.ControlFunction("apply_arpayment", request.payload, null, true);
                this.commonResponseHandler(cid, request, reply, ohandler);
            }),
            method: "POST",
            path: "/intacct/invoice/applypayment",
        });
        this.routes.set("intacct_customer_add_bankaccount", {
            config: {
                id: "intacct_customer_add_bankaccount",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                const cid = new intacctapi.ControlFunction("create_customerbankaccount", request.payload, null, true);
                this.commonResponseHandler(cid, request, reply, ohandler);
            }),
            method: "POST",
            path: "/intacct/customer/addbank",
        });
        this.routes.set("intacct_glaccount_query", {
            config: {
                id: "intacct_glaccount_query",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                this.callReadByQuery(request, reply, ohandler);
            }),
            method: "GET",
            path: "/intacct/glaccount",
        });
        this.routes.set("intacct_checkingaccount_query", {
            config: {
                id: "intacct_checkingaccount_query",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                this.callReadByQuery(request, reply, ohandler);
            }),
            method: "GET",
            path: "/intacct/checkingaccount",
        });
        this.routes.set("intacct_invoice_inspect", {
            config: {
                id: "intacct_invoice_inspect",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                const inspect = intacctapi.IntacctApi.inspect({ object: "ARINVOICE" });
                this.commonResponseHandler(inspect, request, reply, ohandler);
            }),
            method: "OPTIONS",
            path: "/intacct/invoice",
        });
    }
    buildRoutes(routes) {
        routes.forEach((route) => {
            const dRoute = this.routes.get(route.config.id);
            const nRoute = {
                handler: (request, reply) => {
                    dRoute.handler(request, reply, route.handler);
                },
                method: route.method || dRoute.method,
                path: route.path || dRoute.path,
            };
            this.server.route(Object.assign({}, route, nRoute));
        });
    }
    callReadByQuery(request, reply, ohandler) {
        return __awaiter(this, void 0, void 0, function* () {
            const values = this.getReadByQueryPathValues(request.path);
            let error = null;
            let response = null;
            const queryParams = {
                fields: request.query.fields || null,
                object: values.queryObject,
                query: request.query.query,
            };
            const query = intacctapi.IntacctApi.readByQuery(queryParams);
            yield this.intacct.request(query);
            const temp = query.get();
            if (!query.isSuccessful()) {
                error = new Error(JSON.stringify(query.result.errors));
            }
            else {
                const arrResult = temp[values.intacctObject];
                response = arrResult && arrResult.length > 0 ? arrResult : [];
            }
            if (ohandler) {
                ohandler.apply(this, [request, reply, error, response]);
            }
            else {
                reply(error || response);
            }
        });
    }
    getReadByQueryPathValues(path) {
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
    commonResponseHandler(cid, request, reply, ohandler) {
        return __awaiter(this, void 0, void 0, function* () {
            let error = null;
            let response = null;
            yield this.intacct.request(cid);
            if (!cid.isSuccessful()) {
                error = new Error(JSON.stringify(cid.result.errors));
            }
            else {
                response = cid;
            }
            if (ohandler) {
                ohandler.apply(this, [request, reply, error, response]);
            }
            else {
                return error ? reply(boom.badRequest(error.message)) : reply(response);
            }
        });
    }
}
exports.HapiIntacct = HapiIntacct;
//# sourceMappingURL=index.js.map