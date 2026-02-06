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

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:E', // Adjust Sheet name if needed
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [values],
            },
        });
        console.log('Added to Google Sheet');
    } catch (error) {
        console.error('Google Sheets Error:', error.message);
    }
}

module.exports = { appendToSheet };
