import mongoose from 'mongoose';

// Generate unique Invoice ID
function generateInvoiceId() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}-${random}`;
}

const InvoiceItemSchema = new mongoose.Schema({
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

const InvoiceSchema = new mongoose.Schema({
    invoiceId: {
        type: String,
        unique: true,
        default: generateInvoiceId
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation'
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    // Customer details
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
    items: [InvoiceItemSchema],
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
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    // Payment tracking
    amountPaid: {
        type: Number,
        default: 0
    },
    amountDue: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Partial', 'Paid'],
        default: 'Unpaid'
    },
    dueDate: {
        type: Date
    },
    // Notes
    notes: {
        type: String
    },
    termsAndConditions: {
        type: String,
        default: 'Payment due within 7 days of invoice date.'
    },
    // Status
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
        default: 'Draft'
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
InvoiceSchema.pre('save', function () {
    this.updatedAt = Date.now();

    // Calculate subtotal from items
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    }

    // Calculate tax
    this.taxAmount = (this.subtotal - this.discount) * (this.taxRate / 100);

    // Calculate total
    this.total = this.subtotal - this.discount + this.taxAmount;

    // Calculate amount due
    this.amountDue = this.total - this.amountPaid;

    // Update payment status
    if (this.amountPaid >= this.total) {
        this.paymentStatus = 'Paid';
    } else if (this.amountPaid > 0) {
        this.paymentStatus = 'Partial';
    } else {
        this.paymentStatus = 'Unpaid';
    }
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
