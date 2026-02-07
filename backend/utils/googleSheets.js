const { google } = require('googleapis');
require('dotenv').config();

// Initialize Auth
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newline in env var
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

async function appendToSheet(values) {
    if (!SPREADSHEET_ID) {
        console.warn('Skipping Google Sheets: No Sheet ID provided');
        return;
    }

    // Allow error to propagate so server.js can catch it and send to frontend
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A:E',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [values],
        },
    });
    console.log('Added to Google Sheet');
}

module.exports = { appendToSheet };
