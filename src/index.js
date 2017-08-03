"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var intacctapi = require("intacct-api");
var Joi = require("joi");
var pkg = require("../package.json");
var HapiIntacct = (function () {
    function HapiIntacct() {
        var _this = this;
        this.routes = new Map();
        // tslint:disable-next-line:max-line-length
        this.register = function (server, options, next) {
            _this.server = server;
            // TODO: add full validation
            var sdkSchema = Joi.object().keys({
                auth: Joi.object().keys({
                    companyId: Joi.string().min(1).required(),
                    password: Joi.string().min(1),
                    senderId: Joi.string().min(1).required(),
                    senderPassword: Joi.string().min(1).required(),
                    sessionId: Joi.string().min(1),
                    userId: Joi.string().min(1)
                }).required()
            });
            var sdkValidate = Joi.validate(options.sdk, sdkSchema);
            if (sdkValidate.error) {
                throw sdkValidate.error;
            }
            _this.intacct = new intacctapi.IntacctApi(options.sdk);
            _this.server.expose("intacct", _this.intacct);
            if (options.routes && options.routes.length > 0) {
                _this.buildRoutes(options.routes);
            }
            _this.initializeInvoice();
            next();
        };
        this.register.attributes = {
            pkg: pkg
        };
        this.routes.set("intacct_invoice_query", {
            config: {
                id: "intacct_invoice_query"
            },
            handler: function (request, reply, ohandler) { return __awaiter(_this, void 0, void 0, function () {
                var error, response, query, temp;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            error = null;
                            response = null;
                            query = intacctapi.IntacctApi.readByQuery({ object: "ARINVOICE", query: request.query.query });
                            return [4 /*yield*/, this.intacct.request(query)];
                        case 1:
                            _a.sent();
                            temp = query.get();
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
                            return [2 /*return*/];
                    }
                });
            }); },
            method: "GET",
            path: "/intacct/invoice"
        });
        // read
        this.routes.set("intacct_invoice_read", {
            config: {
                id: "intacct_invoice_read"
            },
            handler: function (request, reply, ohandler) { return __awaiter(_this, void 0, void 0, function () {
                var error, response, recordno, intacctInvoiceArray;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            error = null;
                            response = null;
                            recordno = +request.params.recordno;
                            return [4 /*yield*/, this.read(recordno)];
                        case 1:
                            intacctInvoiceArray = _a.sent();
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
                            return [2 /*return*/];
                    }
                });
            }); },
            method: "GET",
            path: "/intacct/invoice/{recordno}}"
        });
        // update
        this.routes.set("intacct_invoice_update", {
            config: {
                id: "intacct_invoice_update"
            },
            handler: function (request, reply, ohandler) { return __awaiter(_this, void 0, void 0, function () {
                var error, response;
                return __generator(this, function (_a) {
                    error = null;
                    response = null;
                    try {
                        // Update Intacct
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
                    return [2 /*return*/];
                });
            }); },
            method: "PUT",
            path: "/intacct/invoice/{recordno}}"
        });
        // TODO: Add hapi routes for: arpayment, arpaymentdetail
    }
    HapiIntacct.prototype.read = function (RECORDNO) {
        return __awaiter(this, void 0, void 0, function () {
            var cid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cid = intacctapi.IntacctApi.read({ object: 'ARINVOICE', keys: RECORDNO });
                        return [4 /*yield*/, this.intacct.request(cid)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, cid.data.ARINVOICE[0] || []];
                }
            });
        });
    };
    HapiIntacct.prototype.update = function (updateObj) {
        return __awaiter(this, void 0, void 0, function () {
            var cid, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cid = intacctapi.IntacctApi.update(updateObj);
                        return [4 /*yield*/, this.intacct.request(cid)];
                    case 1:
                        result = _a.sent();
                        if (!cid.isSuccessful()) {
                            throw new Error(result.rawPayload);
                        }
                        return [2 /*return*/, cid];
                }
            });
        });
    };
    HapiIntacct.prototype.initializeInvoice = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inspectInvoice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inspectInvoice = intacctapi.IntacctApi.inspect({ object: "ARINVOICE" });
                        return [4 /*yield*/, this.intacct.request([inspectInvoice])];
                    case 1:
                        _a.sent();
                        this.intacctInvoice = inspectInvoice.get();
                        this.server.log("info", "Intacct Invoice " + JSON.stringify(this.intacctInvoice));
                        return [2 /*return*/];
                }
            });
        });
    };
    HapiIntacct.prototype.buildRoutes = function (routes) {
        var _this = this;
        routes.forEach(function (route) {
            var dRoute = _this.routes.get(route.config.id);
            var nRoute = {
                handler: function (request, reply) {
                    dRoute.handler(request, reply, route.handler);
                },
                method: route.method || dRoute.method,
                path: route.path || dRoute.path
            };
            _this.server.route(__assign({}, route, nRoute));
        });
    };
    return HapiIntacct;
}());
exports.HapiIntacct = HapiIntacct;
