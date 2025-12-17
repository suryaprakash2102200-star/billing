import mongoose from 'mongoose';

// Generate unique Inquiry ID
function generateInquiryId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INQ-${year}-${random}`;
}

const InquirySchema = new mongoose.Schema({
    inquiryId: {
        type: String,
        unique: true,
        default: generateInquiryId
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    // Copied from lead for quick access
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    customerPhone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true
    },
    customerEmail: {
        type: String,
        trim: true
    },
    product: {
        type: String,
        required: [true, 'Product/service is required'],
        trim: true
    },
    customRequirement: {
        type: String,
        trim: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
    estimatedValue: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['New', 'Follow-up', 'Quoted', 'Negotiation', 'Converted', 'Closed'],
        default: 'New'
    },
    notes: [{
        text: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    timeline: [{
        action: {
            type: String,
            required: true
        },
        description: String,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    convertedToOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
InquirySchema.pre('save', function () {
    this.updatedAt = Date.now();
});

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
