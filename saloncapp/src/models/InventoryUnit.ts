import mongoose, { Schema, Model, models } from 'mongoose';

const InventoryUnitSchema = new Schema({
  productGroupId: { type: Schema.Types.ObjectId, ref: 'ProductGroup', required: true },
  sku: { type: String, required: true, unique: true },
  expiryDate: { type: Date, required: true },
  stockedDate: { type: Date, required: true, default: Date.now },
  costPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'EXPIRED', 'CONSUMED'], 
    default: 'ACTIVE' 
  },
  consumedAt: { type: Date },
  consumedReason: { type: String },
}, { timestamps: true });

const InventoryUnit: Model<any> = models.InventoryUnit || mongoose.model('InventoryUnit', InventoryUnitSchema);

export default InventoryUnit;
