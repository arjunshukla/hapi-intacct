import * as mongoose from "mongoose";

const Schema = {
    id: String,
};

const options = {
  timestamps: true,
};

const InvoiceSchema = new mongoose.Schema(Schema, options);
export default mongoose.model("Invoice", InvoiceSchema);
