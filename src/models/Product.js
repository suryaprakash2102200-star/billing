import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: 0
    },
    unit: {
        type: String,
        default: 'piece', // piece, sqft, inch, etc.
        trim: true
    },
    // Size variants
    hasVariants: {
        type: Boolean,
        default: false
    },
    variants: [{
        name: String,
        size: String, // e.g., "12x18", "A4", "Large"
        price: Number
    }],
    // Customization options
    customizable: {
        type: Boolean,
        default: true
    },
    // For quick reference
    sku: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
ProductSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
