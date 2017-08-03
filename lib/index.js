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
                const recordno = +request.params.recordno;
                const intacctInvoiceArray = yield this.read(recordno);
                if (intacctInvoiceArray.length === 0) {
                    response = [];
                }
                else {
                    response = intacctInvoiceArray;
                }
                if (ohandler) {
                    ohandler.apply(this, [request, reply, error, response]);
                }
                else {
                    reply(error || response);
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
                try {
                    this.update(request.payload);
                    response = "Invoice updated successfully!";
                }
                catch (err) {
                    error = err;
                }
                if (ohandler) {
                    ohandler.apply(this, [request, reply, error, response]);
                }
                else {
                    reply(error || response);
                }
            }),
            method: "PUT",
            path: "/intacct/invoice/{recordno}",
        });
    }
    read(RECORDNO) {
        return __awaiter(this, void 0, void 0, function* () {
            const cid = intacctapi.IntacctApi.read({ object: 'ARINVOICE', keys: RECORDNO });
            yield this.intacct.request(cid);
            return cid.data.ARINVOICE[0] || [];
        });
    }
    update(updateObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const cid = intacctapi.IntacctApi.update(updateObj);
            let result = yield this.intacct.request(cid);
            if (!cid.isSuccessful()) {
                throw new Error(result.rawPayload);
            }
            return cid;
        });
    }
    initializeInvoice() {
        return __awaiter(this, void 0, void 0, function* () {
            const inspectInvoice = intacctapi.IntacctApi.inspect({ object: "ARINVOICE" });
            yield this.intacct.request([inspectInvoice]);
            this.intacctInvoice = inspectInvoice.get();
            this.server.log("info", `Intacct Invoice ${JSON.stringify(this.intacctInvoice)}`);
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