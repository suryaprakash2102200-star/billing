console.log('Script started...');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'reset.log');
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

log('Starting reset process...');

// FORCE URI for debugging
const FINAL_URI = 'mongodb://localhost:27017/photo_frame_business';
log('Using Forced URI: ' + FINAL_URI);

async function resetData() {
    log('Connecting...');
    try {
        await mongoose.connect(FINAL_URI);
        log('Connected.');

        const db = mongoose.connection.db;

        const collectionsToClear = ['leads', 'inquiries', 'quotations', 'orders', 'invoices'];

        for (const name of collectionsToClear) {
            try {
                const collection = db.collection(name);
                const count = await collection.countDocuments();
                if (count > 0) {
                    await collection.deleteMany({});
                    log(`✅ Cleared ${count} documents from '${name}'`);
                } else {
                    log(`ℹ️ Collection '${name}' is already empty`);
                }
            } catch (err) {
                log(`⚠️ Could not clear '${name}': ${err.message}`);
            }
        }

        log('Data reset complete.');
        process.exit(0);
    } catch (error) {
        log('❌ Error during reset: ' + error);
        process.exit(1);
    }
}

resetData();
