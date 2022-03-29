import { gapi } from "gapi-script";

var CLIENT_ID =
  "701917520053-vjtejg9m2844ohs6is7q5mib2t85bkq8.apps.googleusercontent.com";

var API_KEY = "AIzaSyBjXWZLhFk2iPnNYQwENxiuOMQug7Au7oI";
var DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
];

var SCOPES = "https://www.googleapis.com/auth/drive";

function handleClientLoad(sheet_id, range, callback) {
  console.log("Handle Client Load");
  gapi.load("client:auth2", initClient(sheet_id, range, callback));
}

function initClient(sheet_id, range, callback) {
  console.log("Init Client");
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(
      (res) => {
        console.log("Client Initiated");
      },
      (error) => {
        console.log(error);
      }
    );
  setTimeout(() => {
    console.log(gapi.auth2.getAuthInstance().isSignedIn.get());
    gapi.auth2.getAuthInstance().isSignedIn.listen(() => {
      if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        get_gsheet_data(sheet_id, range, callback);
      }
    });
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      gapi.auth2.getAuthInstance().signIn();
    } else {
      get_gsheet_data(sheet_id, range, callback);
    }
  }, 1000);
}

function get_gsheet_data(sheet_id, cell_range, callback) {
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: sheet_id,
      range: cell_range,
    })
    .then(
      (res) => {
        callback(res.result.values);
      },
      (err) => {
        console.log(err);
      }
    );
}

export function write_to_gsheet(sheet_id, cell_range, values) {
  var body = {
    values: values,
  };

  gapi.client.sheets.spreadsheets.values
    .update({
      spreadsheetId: sheet_id,
      range: cell_range,
      valueInputOption: "USER_ENTERED",
      resource: body,
    })
    .then((response) => {
      var result = response.result;
      console.log(`${result.totalUpdatedCells} cells updated.`);
    });
}

export function get_data(sheet_id, range, callback) {
  setTimeout(() => {
    handleClientLoad(sheet_id, range, callback);
  }, 1000);
}

export function GSheet() {
  return <></>;
}
export default GSheet;
