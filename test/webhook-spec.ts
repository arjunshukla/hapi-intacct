import * as tape from "blue-tape";
import * as hapi from "hapi";
import * as paypal from "paypal-rest-sdk";
import * as sinon from "sinon";
import * as index from "../src";
import { config } from "./server";

const nconfig = {
    routes: config.routes,
    sdk: {
        client_id: "asdfsadfasdfasdfsadfdsafasdfdsaf",
        client_secret: "asdfsadfasdfasdfsadfdsafasdfdsaf",
        mode: "sandbox",
    },
    webhook: config.webhook,
};

tape("create webhook", async (t) => {
    const sandbox = sinon.sandbox.create();
    const eventsStub = sandbox.stub(paypal.notification.webhookEventType, "list").yields(null, { event_types: [] });
    const webhookStub = sandbox.stub(paypal.notification.webhook, "list").yields(null, { webhooks: [] });
    const createWebhookStub = sandbox.stub(paypal.notification.webhook, "create").yields(null, { id: "webhookid" });
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    const hapiPaypal = new index.HapiPayPal();
    try {
        await server.register({
            options: nconfig,
            register: hapiPaypal.register,
        });
        // tslint:disable-next-line:max-line-length
        t.equal(createWebhookStub.calledWith({ ...config.webhook, ...{ url: "https://www.youneedtochangethis.com/paypal/webhooks/listen" } }), true, "should call create webhook api with config");
    } catch (err) {
        t.fail("should not fail");
    }
    sandbox.restore();
 });

tape("replace webhook", async (t) => {
    const sandbox = sinon.sandbox.create();
    const eventsStub = sandbox.stub(paypal.notification.webhookEventType, "list").yields(null, { event_types: [] });
    // tslint:disable-next-line:max-line-length
    const webhookStub = sandbox.stub(paypal.notification.webhook, "list").yields(null, { webhooks: [{ id: "testid", url: "https://www.youneedtochangethis.com/paypal/webhooks/listen" }] });
    const replaceWebhookStub = sandbox.stub(paypal.notification.webhook, "replace").yields(null, { id: "webhookid" });
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    const hapiPaypal = new index.HapiPayPal();
    try {
        await server.register({
            options: nconfig,
            register: hapiPaypal.register,
        });
        const replaceRequest = [{
            op: "replace",
            path: "/event_types",
            value: config.webhook.event_types,
        }];
        // tslint:disable-next-line:max-line-length
        t.equal(replaceWebhookStub.calledWith("testid", replaceRequest), true, "should call replace webhook api with config");
    } catch (err) {
        t.fail("should not fail");
    }
    sandbox.restore();
 });

tape("paypal_webhook_listen route", async (t) => {
    const sandbox = sinon.sandbox.create();
    const eventsStub = sandbox.stub(paypal.notification.webhookEventType, "list").yields(null, { event_types: [] });
    const verifyStub = sandbox.stub(paypal.notification.webhookEvent, "verify").yields(null, {verification: "success"});
    // tslint:disable-next-line:max-line-length
    const webhookStub = sandbox.stub(paypal.notification.webhook, "list").yields(null, { webhooks: [{ id: "testid", url: "https://www.youneedtochangethis.com/paypal/webhooks/listen" }] });
    const replaceWebhookStub = sandbox.stub(paypal.notification.webhook, "replace").yields(null, { id: "webhookid" });
    const server = new hapi.Server();
    server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
    const hapiPaypal = new index.HapiPayPal();
    try {
        await server.register({
            options: nconfig,
            register: hapiPaypal.register,
        });
        const res = await server.inject({
            method: "POST",
            payload: { id: "testid" },
            url: "/paypal/webhooks/listen",
        });
        // tslint:disable-next-line:max-line-length
        t.equal(res.payload, "GOT IT!", "Should respond with got it.");
    } catch (err) {
        t.fail("should not fail");
    }
    sandbox.restore();
 });
