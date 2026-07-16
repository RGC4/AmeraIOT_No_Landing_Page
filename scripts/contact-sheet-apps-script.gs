/**
 * Contact-form receiver for the Amera website — paste into the Google Sheet.
 *
 * One-time setup (done by the sheet owner):
 *   1. Open the Google Sheet → Extensions → Apps Script.
 *   2. Delete any starter code and paste this whole file.
 *   3. Replace PASTE_SHARED_SECRET_HERE below with the shared secret
 *      (the same value stored as CONTACT_FORM_TOKEN on the website).
 *   4. Click Deploy → New deployment → type "Web app".
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   5. Authorize when prompted, then copy the Web app URL (ends in /exec).
 *      That URL is stored as CONTACT_SHEET_WEBHOOK_URL on the website.
 *
 * Each submission appends a row: Timestamp | Name | Email | Company | Phone | Message
 */

var SHARED_SECRET = 'PASTE_SHARED_SECRET_HERE';

function doPost(e) {
  var out;
  try {
    var data = JSON.parse(e.postData.contents);
    if (!data || data.token !== SHARED_SECRET) {
      out = { ok: false, error: 'forbidden' };
    } else {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Timestamp', 'Name', 'Email', 'Company', 'Phone', 'Message']);
      }
      sheet.appendRow([
        new Date(),
        String(data.name || ''),
        String(data.email || ''),
        String(data.company || ''),
        String(data.phone || ''),
        String(data.message || ''),
      ]);
      out = { ok: true };
    }
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(
    ContentService.MimeType.JSON
  );
}
