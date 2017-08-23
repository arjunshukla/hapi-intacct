import * as tape from "blue-tape";
import * as hapi from "hapi";
import * as intacct from "intacct-api";
import * as sinon from "sinon";
import * as index from "../src";

// Add tests here
// const hapiPaypal = new index.HapiPayPal();

// tape("should register plugin", async (t) => {
//     const server = new hapi.Server();
//     server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
//     const sandbox = sinon.sandbox.create();
//     const configSpy = sandbox.spy(paypal, "configure");
//     const exposeSpy = sandbox.spy(server, "expose");
//     const configuration = {
//         client_id: "clientidasdfasdfasdfasdf",
//         client_secret: "clientsecretasdfasdfasfsadf",
//         mode: "sandbox",
//     };
//     await server.register({
//         options: {
//             sdk: configuration,
//          },
//         register: hapiPaypal.register,
//     });
//     t.equal(configSpy.calledWith(configuration), true, "should call paypal configuration");
//     t.equal(server.plugins["hapi-paypal"].paypal, paypal, "should expose paypal library");
//     sandbox.restore();
// });

// tape("register should throw error", async (t) => {
//     const server = new hapi.Server();
//     server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
//     const sandbox = sinon.sandbox.create();
//     const configSpy = sandbox.spy(paypal, "configure");
//     const configuration = {
//         client_id: "clientid",
//         client_secret: "client",
//         mode: "sandbox",
//     };
//     try {
//         await server.register({
//             options: {
//                 sdk: configuration,
//             },
//             register: hapiPaypal.register,
//         });
//         t.fail("throws error");
//     } catch (err) {
//         t.pass("throws error");
//     }
//     sandbox.restore();
// });

/*
tape("server register webhooks", async (t) => {
    try {
        const sandbox = sinon.sandbox.create();
        const configStub = sandbox.stub(paypal, "configure");
        const eventsStub = sandbox.stub(paypal.notification.webhookEventType, "list").yields(null, { event_types: [] });
        const webhookStub = sandbox.stub(paypal.notification.webhook, "list").yields(null, { webhooks: [] });
        const createWebhookStub = sandbox.stub(paypal.notification.webhook, "create").yields(null, { id: "webhookid" });
        const server = await createHapiServer();
        t.equal(configStub.calledWith(defaultOptions.sdk), true);
        t.deepEqual(
            createWebhookStub.calledWith(
                { ...defaultOptions.webhook, ...{ url: defaultOptions.webhook.url + "/paypal/webhooks/listen" } },
            ),
        true);
        sandbox.restore();
    } catch (err) {
        throw err;
    }
});

tape("server register webhook replace", async (t) => {
    const sandbox = sinon.sandbox.create();
    const mockHook = { webhooks: [{id: "webhookid", url: "https://test.com/test/paypal/webhooks/listen"}]};
    const configStub = sandbox.stub(paypal, "configure");
    const eventsStub = sandbox.stub(paypal.notification.webhookEventType, "list").yields(null, { event_types: [] });
    const webhookStub = sandbox.stub(paypal.notification.webhook, "list").yields(null, mockHook);
    const replaceWebhookStub = sandbox.stub(paypal.notification.webhook, "replace").yields(null, { id: "webhookid" });
    try {
        const server = await createHapiServer();
        t.equal(configStub.calledWith(defaultOptions.sdk), true);
        t.equal(replaceWebhookStub.calledWith("webhookid"), true);
        sandbox.restore();
    } catch (err) {
        throw err;
    }
});
*/
