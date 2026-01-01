import mongoose, { Schema, Model, models, InferSchemaType } from 'mongoose';

const InvoiceSchema = new Schema({
  procurementId: { type: Schema.Types.ObjectId, ref: 'ProcurementRequest', required: true },
  receiveId: { type: Schema.Types.ObjectId, ref: 'ProcurementReceive', required: true },
  files: [
    new Schema({
      fileName: { type: String, required: true },
      fileType: { type: String, required: true },
      fileSize: { type: Number, required: true },
      path: { type: String, required: true },
    }, { _id: false })
  ],
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

type InvoiceType = InferSchemaType<typeof InvoiceSchema>;
const Invoice: Model<InvoiceType> = models.Invoice || mongoose.model<InvoiceType>('Invoice', InvoiceSchema);

export default Invoice;
