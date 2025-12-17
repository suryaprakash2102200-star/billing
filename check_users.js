
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
});
const User = mongoose.model('User', UserSchema);

async function checkUsers() {
    if (!process.env.MONGODB_URI) {
        console.log('No MONGODB_URI found');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
