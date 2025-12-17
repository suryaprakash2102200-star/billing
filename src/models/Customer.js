import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        trim: true
    },
    // Link to original lead (if came through CRM flow)
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    // Source tracking
    source: {
        type: String,
        enum: ['Lead', 'Walk-in', 'Direct', 'Referral', 'Other'],
        default: 'Direct'
    },
    // Social handles
    instagramId: {
        type: String,
        trim: true
    },
    whatsappNumber: {
        type: String,
        trim: true
    },
    // Stats
    totalOrders: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    lastOrderDate: {
        type: Date
    },
    // Notes
    notes: {
        type: String
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp before saving
CustomerSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Static method to find or create customer
CustomerSchema.statics.findOrCreateFromInquiry = async function (inquiry, userId) {
    // Try to find existing customer by phone
    let customer = await this.findOne({ phone: inquiry.customerPhone });

    if (!customer) {
        // Create new customer from inquiry data
        customer = await this.create({
            name: inquiry.customerName,
            phone: inquiry.customerPhone,
            email: inquiry.customerEmail,
            lead: inquiry.lead,
            source: inquiry.lead ? 'Lead' : 'Direct'
        });
    }

    return customer;
};

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
