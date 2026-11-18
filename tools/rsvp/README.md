# RSVP receiver (Google Sheet)

1. Create a Google Sheet. Open Extensions > Apps Script and paste `Code.gs`.
2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
3. Copy the web app URL into `RSVP_ENDPOINT` at the top of `rsvp.js`.

## Data format

`rsvp.js` sends one form-encoded POST (`mode: "no-cors"`) per party:

| Field | Value |
| --- | --- |
| `party` | `1` or `2` |
| `p1_name`, `p1_attending`, `p1_entree`, `p1_dietary` | main guest |
| `p2_name`, `p2_attending`, `p2_entree`, `p2_dietary` | +1, only when `party=2` |
| `car` | `yes` or `no`, one answer per party; empty when nobody attends |
| `lang` | `en` or `ko` |

`attending` is `yes` or `no`. `entree` is `beef`, `chicken`, `fish` or
`vegetarian`, empty for a guest who declines.

`doPost` writes one row per guest. Both rows share a `Party ID` (8 characters,
made by the script), so a +1 is always linked to the main guest.

Columns: Received, Party ID, Guest ("Main" or "+1"), Party size, Name,
Attending, Entree, Dietary, Car, Language. There is no email column.

If you change the columns, start a fresh sheet tab (or clear the old header
row) so the header matches.
