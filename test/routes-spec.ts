// import * as tape from "blue-tape";
// import * as hapi from "hapi";
// import * as paypal from "paypal-rest-sdk";
// import * as sinon from "sinon";
// import * as index from "../src";
// import { config } from "./server";

// const nconfig = {
//     routes: config.routes,
//     sdk: {
//         client_id: "asdfsadfasdfasdfsadfdsafasdfdsaf",
//         client_secret: "asdfsadfasdfasdfsadfdsafasdfdsaf",
//         mode: "sandbox",
//     },
// };

// const payload = { id: "test", payload: "test" };

// const server = new hapi.Server();
// server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
// const hapiPaypal = new index.HapiPayPal();
// server.register({
//     options: {
//         ...nconfig,
//     },
//     register: hapiPaypal.register,
// });

// tape("paypal_payment_create route", async (t) => {
//     const sandbox = sinon.sandbox.create();
//     const configStub = sandbox.stub(paypal.payment, "create").yields(null, payload);
//     const res = await server.inject({
//         method: "POST",
//         payload,
//         url: "/paypal/payment/create",
//     });
//     t.equal(res.payload, JSON.stringify(payload));
//     sandbox.restore();
//  });
