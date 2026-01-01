import mongoose, { Schema, Model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['ADMIN', 'MANAGER', 'STAFF'], 
    default: 'STAFF' 
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User: Model<any> = models.User || mongoose.model('User', UserSchema);

export default User;
