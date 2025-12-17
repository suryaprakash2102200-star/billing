const { fetch } = require('undici'); // In newer Node this isn't needed, but just in case
// Or just use built-in fetch if Node 18+. Assuming Node 18+ based on Next.js 14+ req.

async function check() {
    try {
        const res = await fetch('http://localhost:3000/api/debug');
        const data = await res.json();
        console.log('DEBUG DATA:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('FETCH ERROR:', e);
    }
}
check();
