#!/usr/bin/env node

/**
 * Email Import Script for MyHustle Tester Validation
 *
 * This script imports email addresses from a CSV file into Firestore's 'allowedEmails' collection.
 * Each email will be stored in lowercase with an 'active' field set to true.
 *
 * Usage:
 *   node scripts/import-tester-emails.js emails.csv
 */

const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Update this to your service account key filename
const serviceAccountPath = path.join(__dirname, '..', 'myhustle-39688-firebase-adminsdk-fbsvc-e828b71794.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account key not found!');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/import-tester-emails.js emails.csv');
  process.exit(1);
}

const emails = new Set();

fs.createReadStream(file)
  .pipe(csv())
  .on('data', (row) => {
    if (row.email) {
      // Split by ; if multiple emails in one row
      row.email.split(';').forEach(e => {
        const email = e.trim().toLowerCase();
        if (email) emails.add(email);
      });
    }
  })
  .on('end', async () => {
    console.log(`Found ${emails.size} emails. Importing...`);
    const batch = db.batch();
    let count = 0;
    for (const email of emails) {
      const docRef = db.collection('allowedEmails').doc(email);
      batch.set(docRef, { email, active: true });
      count++;
      if (count % 400 === 0) {
        await batch.commit();
        console.log(`Committed ${count} emails...`);
      }
    }
    if (count % 400 !== 0) {
      await batch.commit();
    }
    console.log('✅ Import complete!');
    process.exit(0);
  });
