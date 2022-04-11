import React from "react";
import { gapi } from "gapi-script";

const config = {
	clientId: "701917520053-caau6m9id6dau3oajq4mg0qpb175kg69.apps.googleusercontent.com",
	apiKey: "AIzaSyBjXWZLhFk2iPnNYQwENxiuOMQug7Au7oI",
	discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
	scope: "https://www.googleapis.com/auth/drive",
};

export function convert_objects_to_sheet(objects) {
	let keys = Object.keys(objects[0]);
	let table = [];
	objects.forEach((obj) => {
		let temp = [];
		keys.forEach((key) => {
			temp.push(obj[key]);
		});
		table.push(temp);
	});
	return table;
}

export function convert_sheet_to_objects(table, category, type) {
	let keys = table[0];
	let result = [];
	table.slice(1, table.length).forEach((row) => {
		let temp = {};
		keys.forEach((key, idx) => {
			temp[key] = row[idx];
		});
		if ((temp["Category"] === category && temp["Relevant"] === "relevant") || type === "meeting" || type === "all") {
			result.push(temp);
		}
	});
	return result;
}

export function get_gsheet_data(sheet_id, cell_range, callback) {
	gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: sheet_id, range: cell_range }).then(
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
		.append({
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

export function GSheet(props) {
	const { setPage, type } = props;

	function handleClientLoad() {
		console.log("Handle Client Load");
		gapi.load("client:auth2", initClient());
	}

	function initClient() {
		console.log("Init Client");
		setTimeout(() => {
			gapi.client.init(config).then(
				(res) => {
					let login_check = gapi.auth2.getAuthInstance().isSignedIn.get();
					console.log(login_check);

					gapi.auth2.getAuthInstance().isSignedIn.listen(() => {
						login_check = gapi.auth2.getAuthInstance().isSignedIn.get();
						console.log("Login changed to: " + login_check);
					});
					if (!login_check) {
						gapi.auth2.getAuthInstance().signIn();
					} else {
						if (type === "meeting") {
							setPage("screen-meeting");
						} else {
							setPage("screen");
						}
					}
				},
				(error) => {
					console.log(error);
				}
			);
		}, 1000);
	}

	handleClientLoad();

	return <></>;
}
