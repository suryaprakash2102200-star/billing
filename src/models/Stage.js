import mongoose from 'mongoose';

const StageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a stage name'],
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    color: {
        type: String,
        default: 'bg-gray-100 text-gray-800', // Tailwind classes or hex
    },
    isQualified: {
        type: Boolean,
        default: false, // Usage: if true, this stage counts as "completed"/success
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default mongoose.models.Stage || mongoose.model('Stage', StageSchema);
