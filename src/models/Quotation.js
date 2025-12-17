import mongoose from 'mongoose';

// Generate unique Quotation ID
function generateQuotationId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `QT-${year}-${random}`;
}

const QuotationItemSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    description: String,
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true
    }
});

const QuotationSchema = new mongoose.Schema({
    quotationId: {
        type: String,
        unique: true,
        default: generateQuotationId
    },
    inquiry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inquiry'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    // Customer details (copied for quick access)
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
    customerAddress: {
        type: String,
        trim: true
    },
    // Line items
    items: [QuotationItemSchema],
    // Totals
    subtotal: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 0 // Percentage
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    // Terms and notes
    termsAndConditions: {
        type: String,
        default: '1. Prices valid for 7 days from quotation date\n2. 50% advance required to confirm order\n3. Balance due before delivery'
    },
    notes: {
        type: String
    },
    // Validity
    validUntil: {
        type: Date
    },
    // Status
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired'],
        default: 'Draft'
    },
    // Conversion
    convertedToOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
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

// Calculate totals before saving
QuotationSchema.pre('save', function () {
    this.updatedAt = Date.now();

    // Calculate subtotal from items
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    }

    // Calculate tax
    this.taxAmount = (this.subtotal - this.discount) * (this.taxRate / 100);

    // Calculate total
    this.total = this.subtotal - this.discount + this.taxAmount;
});

export default mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);
