"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const boom = require("boom");
const intacctapi = require("intacct-api");
const Joi = require("joi");
const pkg = require("../package.json");
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
                let error = null;
                let response = null;
                const query = intacctapi.IntacctApi.readByQuery({ object: "ARINVOICE", query: request.query.query });
                yield this.intacct.request(query);
                const temp = query.get();
                if (!query.isSuccessful()) {
                    error = new Error(JSON.stringify(query.result.errors));
                }
                else {
                    response = temp.arinvoice && temp.arinvoice.length > 0 ? temp.arinvoice : [];
                }
                if (ohandler) {
                    ohandler.apply(this, [request, reply, error, response]);
                }
                else {
                    reply(error || response);
                }
            }),
            method: "GET",
            path: "/intacct/invoice",
        });
        this.routes.set("intacct_invoice_read", {
            config: {
                id: "intacct_invoice_read",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                let error = null;
                let response = null;
                const read = intacctapi.IntacctApi.read({ object: "ARINVOICE", keys: request.params.recordno });
                yield this.intacct.request(read);
                if (!read.isSuccessful()) {
                    error = new Error(JSON.stringify(read.result.errors));
                }
                else {
                    response = read.get("ARINVOICE")[0];
                }
                if (ohandler) {
                    ohandler.apply(this, [request, reply, error, response]);
                }
                else {
                    return error ? reply(boom.badRequest(error.message)) : reply(response);
                }
            }),
            method: "GET",
            path: "/intacct/invoice/{recordno}",
        });
        this.routes.set("intacct_invoice_update", {
            config: {
                id: "intacct_invoice_update",
            },
            handler: (request, reply, ohandler) => __awaiter(this, void 0, void 0, function* () {
                let error = null;
                let response = null;
                const update = intacctapi.IntacctApi.update({ ARINVOICE: Object.assign({ RECORDNO: request.params.recordno }, request.payload) });
                yield this.intacct.request(update);
                if (!update.isSuccessful()) {
                    error = new Error(JSON.stringify(update.result.errors));
                }
                else {
                    response = update.get()[0].arinvoice[0];
                }
                if (ohandler) {
                    ohandler.apply(this, [request, reply, error, response]);
                }
                else {
                    return error ? reply(boom.badRequest(error.message)) : reply(response);
                }
            }),
            method: "PUT",
            path: "/intacct/invoice/{recordno}",
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
}
exports.HapiIntacct = HapiIntacct;
//# sourceMappingURL=index.js.map