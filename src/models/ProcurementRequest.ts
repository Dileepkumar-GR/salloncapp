import mongoose, { Schema, Model, models } from 'mongoose';

const ProcurementRequestSchema = new Schema({
  productGroupId: { type: Schema.Types.ObjectId, ref: 'ProductGroup', required: true },
  purpose: { type: String, enum: ['RETAIL', 'INHOUSE'], required: true },
  requestedQty: { type: Number, required: true },
  approvedQty: { type: Number, default: 0 },
  receivedQty: { type: Number, default: 0 },
  estimatedPrice: { type: Number },
  expectedDeliveryDate: { type: Date },
  remarks: { type: String },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED'], 
    default: 'PENDING' 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const ProcurementRequest: Model<any> = models.ProcurementRequest || mongoose.model('ProcurementRequest', ProcurementRequestSchema);

export default ProcurementRequest;
