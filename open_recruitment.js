const admin = require('firebase-admin');
const fs = require('fs');

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in environment');
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function extractFailedEmails() {
    console.log('Fetching audit logs...');
    const snapshot = await db.collection('audit_logs')
        .where('type', '==', 'bulk_dispatch')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

    if (snapshot.empty) {
        console.log('No bulk dispatch logs found.');
        return;
    }

    // Since the previous code didn't log the specific failed emails, 
    // we need to cross-reference 'users' with 'audit_logs' if possible,
    // or if we have the list of all recipients from the user's report.
    // However, the user said "Success: 91 | Failures: 35".
    // If we can't find the specific failures in the logs (because we weren't logging them yet),
    // we might need to look at who HASN'T received a specific subject recently.

    const latestLog = snapshot.docs[0].data();
    console.log(`Latest Dispatch: ${latestLog.subject} at ${latestLog.timestamp}`);
    console.log(`Success: ${latestLog.successCount}, Failed: ${latestLog.failedCount}`);

    // Let's try to find users who DON'T have a 'dispatch' or 'bulk_dispatch' log 
    // for this specific subject in the last 24 hours.
    
    const subject = latestLog.subject;
    const since = new Date(new Date(latestLog.timestamp).getTime() - 1000 * 60 * 60).toISOString(); // 1 hour before the dispatch

    console.log(`Searching for successful dispatches for subject: "${subject}" since ${since}`);
    
    // This is tricky because bulk_dispatch didn't log individual emails.
    // BUT 'dispatch' (single) does. 
    // If the user used 'All Accounts', we can get all users and subtract those we know were successful
    // IF we had the success list.
    
    // Since we DON'T have the success list for the 91, we have a problem.
    // The best we can do is give the user a way to SEE the errors IF they happen again, 
    // OR if there's another collection tracking these.
}

// Alternative: Check if we can find the 35 emails by looking at the 'users' collection 
// and comparing with ANY successful logs.

extractFailedEmails().catch(console.error);
