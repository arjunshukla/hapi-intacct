import * as joi from "joi";

export const intacctPaymentItemSchema = joi.object().keys({
    amount: joi.string().required(),
    invoicekey: joi.string().required(),
});

export const intacctPaymentSchema = joi.object().keys({
    arpaymentitem: joi.array().items(intacctPaymentItemSchema).optional(),
    authcode: joi.string().optional(),
    bankaccountid: joi.string().optional(),
    basecurr: joi.string().optional(),
    batchkey: joi.string().optional(),
    cctype: joi.string().optional(),
    currency: joi.string().optional(),
    customerid: joi.string().required(),
    datereceived: joi.object().keys({
        day: joi.string().required(),
        month: joi.string().required(),
        year: joi.string().required(),
    }).optional(),
    exchrate: joi.string().optional(),
    exchratedate: joi.object().keys({
        day: joi.string().required(),
        month: joi.string().required(),
        year: joi.string().required(),
    }).optional(),
    exchratetype: joi.string().optional(),
    onlineachpayment: joi.object().optional(),
    overpaydeptid: joi.string().optional(),
    overpaylocid: joi.string().optional(),
    paymentamount: joi.string().required(),
    paymentmethod: joi.string().valid([
        "Printed Check",
        "Cash",
        "EFT",
        "Credit Card",
        "Online Charge Card",
        "Online ACH Debit"]).optional(),
    refid: joi.string().optional(),
    translatedamount: joi.string().optional(),
    undepfundsacct: joi.string().optional(),
});
