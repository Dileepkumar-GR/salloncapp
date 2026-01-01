import mongoose, { Schema, Model, models } from 'mongoose';

const ProductGroupSchema = new Schema({
  brandName: { type: String, required: true },
  subCategory: { type: String, required: true },
  productName: { type: String, required: true },
  quantityPerItem: { type: Number, required: true },
  unit: { type: String, enum: ['ml', 'g', 'piece'], required: true },
  sellingPrice: { type: Number, required: true },
  lowStockThreshold: { type: Number, default: 10 },
}, { timestamps: true });

// Compound index to ensure uniqueness as per requirements
ProductGroupSchema.index({ brandName: 1, subCategory: 1, productName: 1, quantityPerItem: 1, unit: 1, sellingPrice: 1 }, { unique: true });

const ProductGroup: Model<any> = models.ProductGroup || mongoose.model('ProductGroup', ProductGroupSchema);

export default ProductGroup;
