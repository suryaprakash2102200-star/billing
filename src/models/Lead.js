import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters']
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    source: {
        type: String,
        enum: ['Instagram', 'WhatsApp', 'Walk-in', 'Referral', 'Website', 'Other'],
        required: [true, 'Please specify the lead source']
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Dropped'],
        default: 'New'
    },
    notes: {
        type: String
    },
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
    convertedToInquiry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inquiry'
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

// Update the updatedAt timestamp before saving
LeadSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
