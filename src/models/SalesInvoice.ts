import mongoose, { Schema, Model, models, InferSchemaType } from 'mongoose';

const SalesInvoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  items: [
    {
      description: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      lineTotal: { type: Number, required: true },
    },
  ],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

type SalesInvoiceType = InferSchemaType<typeof SalesInvoiceSchema>;
const SalesInvoice: Model<SalesInvoiceType> = models.SalesInvoice || mongoose.model<SalesInvoiceType>('SalesInvoice', SalesInvoiceSchema);

export default SalesInvoice;
