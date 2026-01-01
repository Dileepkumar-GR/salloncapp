import mongoose, { Schema, Model, models } from 'mongoose';

const ProductSchema = new Schema(
  {
    product_name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    cost_price: { type: Number, default: 0 },
    selling_price: { type: Number, default: 0 },
    tax_rate: { type: Number, default: 0 },
    stock_qty: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

const Product: Model<any> = models.Product || mongoose.model('Product', ProductSchema);

export default Product;
