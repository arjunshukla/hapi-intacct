import * as mongoose from "mongoose";

const Schema = {
  BASECURR: String,
  CURRENCY: String,
  CUSTOMERNAME: String,
  DELIVERY_OPTIONS: String,
  DESCRIPTION: String,
  DESCRIPTION2: String,
  PAYPALINVOICEID: String,
  RAWSTATE: String,
  RECORDID: String,
  RECORDNO: {
    dropDups: true,
    required: true,
    type: String,
    unique: true,
  },
  RECORDTYPE: String,
  STATE: String,
  TERMKEY: String,
  TERMNAME: String,
  TOTALDUE: Number,
  TOTALENTERED: Number,
  TOTALPAID: Number,
  TOTALSELECTED: Number,
  TRX_TOTALDUE: Number,
  TRX_TOTALENTERED: Number,
  TRX_TOTALPAID: Number,
  TRX_TOTALSELECTED: Number,
  WHENCREATED: Date,
  WHENDISCOUNT: Date,
  WHENDUE: Date,
  WHENPAID: Date,
  WHENPOSTED: Date,
};

const options = {
  timestamps: true,
};

const InvoiceSchema = new mongoose.Schema(Schema, options);
export default mongoose.model("IntacctInvoice", InvoiceSchema);
