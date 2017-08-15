import * as glue from "glue";
import * as good from "good";
import * as hapi from "hapi";
import * as index from "../src";

export const config: index.IHapiIntacctOptions = {
    routes: [
        {
            config: {
                id: "intacct_invoice_query",
            },
        },
        {
            config: {
                id: "intacct_invoice_read",
            },
        },
        {
            config: {
                id: "intacct_invoice_update",
            },
        },
        {
            config: {
                id: "intacct_invoice_create_payment",
            },
        },
        {
            config: {
                id: "intacct_customer_add_bankaccount",
            },
        },
        {
            config: {
                id: "intacct_invoice_apply_payment",
            },
        },
          {
            config: {
                id: "intacct_invoice_inspect",
            },
        },
          {
            config: {
              id: "intacct_glaccount_query",
            },
          },
          {
            config: {
              id: "intacct_checkingaccount_query",
            },
          },
    ],
    sdk: {
        auth: {
            companyId: process.env.INTACCT_COMPANY_ID,
            password: process.env.INTACCT_USER_PASSWORD,
            senderId: process.env.INTACCT_SENDER_ID,
            senderPassword: process.env.INTACCT_SENDER_PASSWORD,
            userId: process.env.INTACCT_USER_ID,
        },
    },
};

const manifest = {
    connections: [
        {
            host: process.env.IP || "0.0.0.0",
            port: process.env.PORT || 3000,
        },
    ],
    registrations: [
        {
            plugin: {
                options: {
                    reporters: {
                        console: [{
                            args: [{
                                log: "*",
                                response: "*",
                            }],
                            module: "good-squeeze",
                            name: "Squeeze",
                        }, {
                            module: "good-console",
                        }, "stdout"],
                    },
                },
                register: good.register,
            },
        },
        {
            plugin: {
                options: config,
                register: new index.HapiIntacct().register,
            },
        },
    ],
};

if (!module.parent) {
    glue.compose(manifest).then((server: hapi.Server) => server.start());
}
