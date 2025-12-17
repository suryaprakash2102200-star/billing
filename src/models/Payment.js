import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    totalAmount: {
        type: Number,
        required: [true, 'Please provide total amount'],
    },
    advancePaid: {
        type: Number,
        default: 0,
    },
    balanceAmount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['Pending', 'Partial', 'Paid'],
        default: 'Pending',
    },
    paymentMode: {
        type: String,
        enum: ['Cash', 'UPI'],
    },
    notes: {
        type: String,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to calculate balance and status before saving
PaymentSchema.pre('save', function () {
    this.balanceAmount = this.totalAmount - this.advancePaid;

    if (this.balanceAmount <= 0) {
        this.status = 'Paid';
        this.balanceAmount = 0; // Ensure no negative balance
    } else if (this.advancePaid === 0) {
        this.status = 'Pending';
    } else {
        this.status = 'Partial';
    }

    this.updatedAt = Date.now();
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
