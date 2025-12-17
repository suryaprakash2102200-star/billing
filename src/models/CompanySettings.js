import mongoose from 'mongoose';

const CompanySettingsSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        default: 'Your Company Name'
    },
    tagline: {
        type: String,
        default: ''
    },
    logo: {
        type: String, // URL to logo image
        default: ''
    },
    // Contact info
    phone: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    // Address
    address: {
        line1: { type: String, default: '' },
        line2: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
        country: { type: String, default: 'India' }
    },
    // Tax settings
    gstNumber: {
        type: String,
        default: ''
    },
    panNumber: {
        type: String,
        default: ''
    },
    defaultTaxRate: {
        type: Number,
        default: 18 // GST 18%
    },
    // Invoice settings
    invoicePrefix: {
        type: String,
        default: 'INV'
    },
    quotationPrefix: {
        type: String,
        default: 'QT'
    },
    defaultPaymentTerms: {
        type: String,
        default: 'Payment due within 7 days of invoice date.'
    },
    defaultQuotationTerms: {
        type: String,
        default: '1. Prices valid for 7 days from quotation date\n2. 50% advance required to confirm order\n3. Balance due before delivery'
    },
    // Bank details for invoices
    bankName: {
        type: String,
        default: ''
    },
    accountNumber: {
        type: String,
        default: ''
    },
    ifscCode: {
        type: String,
        default: ''
    },
    upiId: {
        type: String,
        default: ''
    },
    // Social media
    instagram: {
        type: String,
        default: ''
    },
    facebook: {
        type: String,
        default: ''
    },
    whatsapp: {
        type: String,
        default: ''
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure only one company settings document exists
CompanySettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

export default mongoose.models.CompanySettings || mongoose.model('CompanySettings', CompanySettingsSchema);
