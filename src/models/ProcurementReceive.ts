import mongoose, { Schema, Model, models, InferSchemaType } from 'mongoose';

const ProcurementReceiveSchema = new Schema({
  procurementId: { type: Schema.Types.ObjectId, ref: 'ProcurementRequest', required: true },
  receivedQty: { type: Number, required: true },
  skuSuffix: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  stockedDate: { type: Date, required: true },
  costPrice: { type: Number, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

type ProcurementReceiveType = InferSchemaType<typeof ProcurementReceiveSchema>;
const ProcurementReceive: Model<ProcurementReceiveType> =
  models.ProcurementReceive || mongoose.model<ProcurementReceiveType>('ProcurementReceive', ProcurementReceiveSchema);

export default ProcurementReceive;

