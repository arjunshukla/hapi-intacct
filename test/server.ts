import * as dotenv from "dotenv";
import * as good from "good";
import * as hapi from "hapi";
import * as index from "../src";

dotenv.config();

export const config: index.IHapiIntacctOptions = {
    routes: [
        {
            config: {
                id: "intacct_invoice_query",
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

export const server = new hapi.Server();
server.connection({ port: process.env.PORT || 3000, host: process.env.IP || "0.0.0.0" });
const hapiPaypal = new index.HapiIntacct();

async function start() {
    await server.register([{
        options: {
            ...config,
        },
        register: hapiPaypal.register,
    },
    {
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
    }]);

    server.start((error) => {
        if (error) {
            throw error;
        }
        server.log("info", `Server running at: ${server.info.uri}`);
    });
}

if (!module.parent) {
    start();
}
