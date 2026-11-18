/**
 * RSVP receiver for the wedding site. Paste into a Google Sheet's Apps Script
 * (Extensions > Apps Script). Setup steps are in README.md next to this file.
 *
 * One POST = one party of 1 or 2 guests. It becomes one sheet row per guest,
 * all sharing a Party ID, so meals can be counted per person.
 */
var SHEET_NAME = "RSVP";
var HEADERS = [
  "Received",
  "Party ID",
  "Guest",
  "Party size",
  "Name",
  "Attending",
  "Entree",
  "Dietary",
  "Car",
  "Language",
];

function doPost(e) {
  var p = (e && e.parameter) || {};
  var size = p.party === "2" ? 2 : 1;

  // every guest in the party needs a name and an answer, otherwise ignore it all
  for (var i = 1; i <= size; i++) {
    if (!p["p" + i + "_name"] || !p["p" + i + "_attending"]) {
      return ContentService.createTextOutput("ignored");
    }
  }

  var now = new Date();
  var partyId = Utilities.getUuid().slice(0, 8);
  var rows = [];
  for (var g = 1; g <= size; g++) {
    var k = "p" + g + "_";
    rows.push([
      now,
      partyId,
      g === 1 ? "Main" : "+1",
      size,
      clean(p[k + "name"]),
      clean(p[k + "attending"]),
      clean(p[k + "entree"]),
      clean(p[k + "dietary"]),
      clean(p.car),
      clean(p.lang),
    ]);
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    // one write, so a party's rows always sit together
    var range = sheet.getRange(
      sheet.getLastRow() + 1,
      1,
      rows.length,
      HEADERS.length,
    );
    // plain text for the Guest column, or Sheets turns "+1" into the number 1
    range.offset(0, 2, rows.length, 1).setNumberFormat("@");
    range.setValues(rows);
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput("ok");
}

// Cap length and stop spreadsheet formula injection (=, +, -, @ at the start).
function clean(v) {
  var s = String(v || "").slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
