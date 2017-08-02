import * as hapi from "hapi";
export declare type Partial<T> = {
    [P in keyof T]?: T[P];
};
export interface IHapiIntacctOptions {
    sdk: IntacctSDKConfiguration;
    routes?: [Partial<IIntacctRouteConfiguration>];
    cron?: any;
}
export interface IntacctSDKConfiguration {
    auth: {
        senderId: string;
        senderPassword: string;
        companyId: string;
        userId?: string;
        password?: string;
        sessionId?: string;
    };
    controlId?: string;
    uniqueId?: boolean;
    dtdVersion?: string;
}
export interface IIntacctRouteConfiguration extends hapi.RouteConfiguration {
    handler?: IIntacctRouteHandler;
    config: {
        id: string;
    };
}
export declare type IIntacctRouteHandler = (request: hapi.Request, reply: hapi.ReplyNoContinue, error: any, response: any) => void;
export interface InternalRouteConfiguration extends hapi.RouteConfiguration {
    handler?: InternalRouteHandler;
    config: {
        id: string;
    };
}
export declare type InternalRouteHandler = (request: hapi.Request, reply: hapi.ReplyNoContinue, ohandler: IIntacctRouteHandler) => void;
export declare class HapiIntacct {
    private server;
    private intacct;
    private intacctInvoice;
    private routes;
    constructor();
    private read(RECORDNO);
    private update(updateObj);
    register: hapi.PluginFunction<any>;
    private initializeInvoice();
    private buildRoutes(routes);
}
