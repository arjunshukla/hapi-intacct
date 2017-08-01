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
const Joi = require("joi");
const paypal = require("paypal-rest-sdk");
const pkg = require("../package.json");
class HapiPayPal {
    constructor() {
        this.routes = new Map();
        this.register = (server, options, next) => {
            this.server = server;
            const promises = [];
            const sdkSchema = Joi.object().keys({
                client_id: Joi.string().min(10).required(),
                client_secret: Joi.string().min(10).required(),
                mode: Joi.string().valid("sandbox", "live").required(),
            });
            const sdkValidate = Joi.validate(options.sdk, sdkSchema);
            if (sdkValidate.error) {
                throw sdkValidate.error;
            }
            paypal.configure(options.sdk);
            this.server.expose("paypal", paypal);
            if (options.routes && options.routes.length > 0) {
                this.buildRoutes(options.routes);
            }
            if (options.webhook) {
                const webhooksSchema = Joi.object().keys({
                    event_types: Joi.array().min(1).required(),
                    url: Joi.string().uri({ scheme: ["https"] }).required(),
                });
                const validate = Joi.validate(options.webhook, webhooksSchema);
                if (validate.error) {
                    throw validate.error;
                }
                const webhookRoute = this.server.lookup("paypal_webhooks_listen");
                if (!webhookRoute) {
                    throw new Error("You enabled webhooks without a route listener.");
                }
                const wopts = Object.assign({}, options.webhook);
                wopts.url += webhookRoute.path;
                const test = this.enableWebhooks(wopts);
                promises.push(test);
            }
            Promise.all(promises).then(() => {
                next();
            });
        };
        this.register.attributes = {
            pkg,
        };
        this.routes.set("paypal_payment_create", {
            config: {
                id: "paypal_payment_create",
            },
            handler: (request, reply, ohandler) => {
                paypal.payment.create(request.payload, (error, response) => {
                    if (ohandler) {
                        ohandler.apply(this, [request, reply, error, response]);
                    }
                });
                return;
            },
            method: "POST",
            path: "/paypal/payment/create",
        });
        this.routes.set("paypal_webhooks_listen", {
            config: {
                id: "paypal_webhooks_listen",
            },
            handler: (request, reply, ohandler) => {
                paypal.notification.webhookEvent.verify(request.headers, request.payload, this.webhook.id, (error, response) => {
                    if (error || response.verification_status !== "SUCCESS") {
                        this.server.log("error", `PayPal Webhook not verified: ${JSON.stringify(request.payload)}`);
                    }
                    ohandler.apply(this, [request, reply, error, response]);
                });
            },
            method: "POST",
            path: "/paypal/webhooks/listen",
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
    enableWebhooks(webhook) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.webhookEvents = yield this.getWebhookEventTypes();
                const accountWebHooks = yield this.getAccountWebhooks();
                this.webhook = accountWebHooks.filter((hook) => hook.url === webhook.url)[0];
                this.webhook = !this.webhook ? yield this.createWebhook(webhook) : yield this.replaceWebhook(webhook);
            }
            catch (err) {
                throw err;
            }
        });
    }
    getWebhookEventTypes() {
        return new Promise((resolve, reject) => {
            paypal.notification.webhookEventType.list((error, webhooks) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(webhooks.event_types);
                }
            });
        });
    }
    getAccountWebhooks() {
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.list((error, webhooks) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(webhooks.webhooks);
                }
            });
        });
    }
    createWebhook(webhook) {
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.create(webhook, (error, response) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
    replaceWebhook(webhook) {
        return new Promise((resolve, reject) => {
            paypal.notification.webhook.replace(this.webhook.id, [{
                    op: "replace",
                    path: "/event_types",
                    value: webhook.event_types,
                }], (error, response) => {
                if (error && error.response.name !== "WEBHOOK_PATCH_REQUEST_NO_CHANGE") {
                    reject(error);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
}
exports.HapiPayPal = HapiPayPal;
//# sourceMappingURL=index.js.map