import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  business: {
    shopName: string;
    contactNumber: string;
    email: string;
    address: string;
    businessType: 'Salon' | 'Barbershop' | 'Spa';
    gstNumber: string;
    defaultTaxPercent: number;
    taxType: 'Inclusive' | 'Exclusive';
    invoicePrefix: string;
    invoiceFooterMessage: string;
    logoUrl?: string;
    currency: string;
    timezone: string;
    dateFormat: string;
  };
  workingHours: {
    openingTime: string;
    closingTime: string;
    weeklyOffDay: string;
  };
  inventory: {
    lowStockThreshold: number;
    expiryAlertDays: number;
    enableExpiryTracking: boolean;
    fifoMode: boolean; // Read-only
    allowNegativeStock: boolean;
  };
  procurement: {
    requireAdminApproval: boolean;
    allowPartialReceive: boolean;
    maxReceiveQuantity: number;
    invoiceMandatory: boolean;
  };
  alerts: {
    enableLowStockAlerts: boolean;
    enableExpiryAlerts: boolean;
    enableProcurementReminders: boolean;
    enableDailySummary: boolean;
    notificationChannels: {
      dashboard: boolean;
      email: boolean;
    };
    alertFrequency: 'daily' | 'weekly';
  };
  permissions: {
    defaultManagerPermissions: string[];
    defaultStaffPermissions: string[];
    maxStaffCount: number;
    maxManagerCount: number;
  };
  ui: {
    theme: 'dark' | 'light';
    accentColor: string;
    layoutDensity: 'compact' | 'comfortable';
    enableAnimations: boolean;
  };
  security: {
    autoLogoutMinutes: number;
    sessionTimeout: number;
    enable2FA: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    business: {
      shopName: { type: String, default: 'My Salon' },
      contactNumber: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      businessType: { type: String, enum: ['Salon', 'Barbershop', 'Spa'], default: 'Salon' },
      gstNumber: { type: String, default: '' },
      defaultTaxPercent: { type: Number, default: 0 },
      taxType: { type: String, enum: ['Inclusive', 'Exclusive'], default: 'Inclusive' },
      invoicePrefix: { type: String, default: 'SAL' },
      invoiceFooterMessage: { type: String, default: '' },
      logoUrl: { type: String, default: '' },
      currency: { type: String, default: '₹' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
    },
    workingHours: {
      openingTime: { type: String, default: '09:00' },
      closingTime: { type: String, default: '21:00' },
      weeklyOffDay: { type: String, default: 'Sunday' },
    },
    inventory: {
      lowStockThreshold: { type: Number, default: 10 },
      expiryAlertDays: { type: Number, default: 30 },
      enableExpiryTracking: { type: Boolean, default: true },
      fifoMode: { type: Boolean, default: true, immutable: true }, // Read-only
      allowNegativeStock: { type: Boolean, default: false },
    },
    procurement: {
      requireAdminApproval: { type: Boolean, default: true },
      allowPartialReceive: { type: Boolean, default: true },
      maxReceiveQuantity: { type: Number, default: 100 },
      invoiceMandatory: { type: Boolean, default: true },
    },
    alerts: {
      enableLowStockAlerts: { type: Boolean, default: true },
      enableExpiryAlerts: { type: Boolean, default: true },
      enableProcurementReminders: { type: Boolean, default: true },
      enableDailySummary: { type: Boolean, default: false },
      notificationChannels: {
        dashboard: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
      },
      alertFrequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    },
    permissions: {
      defaultManagerPermissions: { type: [String], default: ['procurement.create', 'inventory.receive'] },
      defaultStaffPermissions: { type: [String], default: ['inventory.view'] },
      maxStaffCount: { type: Number, default: 50 },
      maxManagerCount: { type: Number, default: 10 },
    },
    ui: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      accentColor: { type: String, default: '#3b82f6' },
      layoutDensity: { type: String, enum: ['compact', 'comfortable'], default: 'comfortable' },
      enableAnimations: { type: Boolean, default: true },
    },
    security: {
      autoLogoutMinutes: { type: Number, default: 30 },
      sessionTimeout: { type: Number, default: 60 },
      enable2FA: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
