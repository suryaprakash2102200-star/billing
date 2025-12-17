const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/photo_frame_business';

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

async function resetUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const UserSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const result = await User.deleteMany({});
        console.log(`Deleted ${result.deletedCount} users.`);
        console.log('You can now sign up as the first admin.');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

resetUsers();
