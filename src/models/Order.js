import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    customerName: {
        type: String,
        required: [true, 'Please provide customer name'],
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
    },
    instagramId: {
        type: String,
    },
    productType: {
        type: String,
        enum: ['Photo Frame', 'Digital Photo', 'Album'],
        required: [true, 'Please specify product type'],
    },
    size: {
        type: String,
        required: [true, 'Please specify size'],
    },
    quantity: {
        type: Number,
        default: 1,
    },
    photoReceived: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['New', 'Designing', 'Printing', 'Ready', 'Delivered'],
        default: 'New',
    },
    notes: {
        type: String,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    deliveryDate: {
        type: Date,
    },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
