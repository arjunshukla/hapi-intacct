"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = {
    id: String,
};
const options = {
    timestamps: true,
};
const PaymentSchema = new mongoose.Schema(Schema, options);
exports.default = mongoose.model("Payment", PaymentSchema);
//# sourceMappingURL=payment.js.map