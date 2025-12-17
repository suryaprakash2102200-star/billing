
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({ name: String });
const User = mongoose.model('User', UserSchema);

async function clearUsers() {
    if (!process.env.MONGODB_URI) {
        console.error('No MONGODB_URI found');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const result = await User.deleteMany({});
        console.log(`Deleted ${result.deletedCount} users. You can now Signup again.`);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

clearUsers();
