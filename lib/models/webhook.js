"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = {
    create_time: String,
    event_type: String,
    event_version: String,
    id: String,
    resource: Object,
    resource_type: String,
    summary: String,
};
const options = {
    timestamps: true,
};
const WebhookSchema = new mongoose.Schema(Schema, options);
exports.default = mongoose.model("Webhook", WebhookSchema);
//# sourceMappingURL=webhook.js.map