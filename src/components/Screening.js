import React, { useState, useEffect } from "react";
import { get_gsheet_data, write_to_gsheet, convert_sheet_to_objects, convert_objects_to_sheet } from "./GSheet";

const sheet = "1ongBRK_4CCyRG0YW21Wo4f8zEX8gNB7pfD49obuGx4A";
const columns = ["Comment", "Category", "Description", "Funding", "Location", "Lead Investors", "Investors", "Company age", "Categories", "Website", "Reason of passing", "Team score", "Business model score", "Market score", "Source", "Check"];
const inv_categories = {
	Other: "Philipp",
	Robotics: "Lukas",
	HR: "Alex",
	Travel: "Lukas",
	Gaming: "Lukas",
	Healthcare: "Philipp",
	Climatech: "Philipp",
	Software: "Lukas",
	ECommerce: "Lukas",
	Edtech: "Lukas",
	Devtools: "Kolja",
	Blockchain: "Alex",
	Logistics: "Lukas",
	RE: "Niclas",
	Cyber: "Moritz",
	Fintech: "Niclas",
	Biotech: "Philipp",
	Marketplaces: "Niclas",
	Creator: "Alex",
};

function CustomRow(props) {
	const { header, content, color } = props;
	return (
		<tr key={header} style={{ backgroundColor: color }}>
			<th>{header}</th>
			<td>{content}</td>
		</tr>
	);
}

function Form(props) {
	const { team, handleSubmit } = props;
	return (
		<>
			<div className="row">
				<div className="col-sm-4">
					<h6>Comment</h6>
					<textarea id="comment"></textarea>
				</div>
				<div className="col-sm-4">
					<h6>Responsible</h6>
					<select id="responsible">{team}</select>
				</div>
			</div>
			<div className="row">
				<div className="col-sm-4">
					<button style={{ width: "100%" }} className="btn btn-success" type="button" onClick={() => handleSubmit("relevant")}>
						Relevant
					</button>
				</div>
				<div className="col-sm-4">
					<button style={{ width: "100%" }} className="btn btn-secondary" type="button" onClick={() => handleSubmit("reject")}>
						Reject
					</button>
				</div>
				<div className="col-sm-4">
					<button style={{ width: "100%" }} className="btn btn-warning" type="button" onClick={() => handleSubmit("fyi")}>
						FYI
					</button>
				</div>
			</div>
		</>
	);
}

function InfoTable(props) {
	const { rows } = props;
	return (
		<table>
			<colgroup>
				<col span="1" style={{ width: "20%" }} />
				<col span="1" style={{ width: "80%" }} />
			</colgroup>
			{rows}
		</table>
	);
}

function sortCompanies(a, b) {
	const keys = { Check: "desc", Category: "asc", Source: "asc" };
	let result = 0;
	Object.keys(keys).forEach((key) => {
		if (keys[key] === "asc") {
			if (a[key] > b[key]) {
				result = 1;
				return;
			} else if (a[key] < b[key]) {
				result = -1;
				return;
			}
		} else if (keys[key] === "desc") {
			if (a[key] < b[key]) {
				result = 1;
				return;
			} else if (a[key] > b[key]) {
				result = -1;
				return;
			}
		}
	});
	return result;
}

function Timer(props) {
	let { seconds } = props;
	let color = "";
	if (seconds > 30) {
		color = "red";
	}
	let minutes = Math.floor(seconds / 60);
	seconds = seconds % 60;
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	return <span style={{ color: color }}>{minutes + ":" + seconds}</span>;
}

export function Screening(props) {
	const [data, setData] = useState(false);
	const [index, setIndex] = useState(0);
	const [seconds, setSeconds] = useState(0);
	const { setPage, category, type } = props;

	let tabs = type === "meeting" ? ["screened_companies", "final_companies"] : ["all_companies_filtered", "screened_companies"];

	const handleSubmit = (type) => {
		let current = data[index];
		if (type === "relevant") {
			current["check"] = true;
		} else if (type === "reject") {
			current["check"] = false;
		} else {
			current["check"] = "FYI";
		}

		if (current["check"] === "FYI" && document.getElementById("responsible").value === "") {
			window.alert("You have to enter a contact (responsible) person for an FYI");
		} else {
			current["comment"] = document.getElementById("comment").value;
			document.getElementById("comment").value = "";
			current["responsible"] = document.getElementById("responsible").value;
			document.getElementById("responsible").value = "";
			write_to_gsheet(sheet, tabs[1] + "!A:A", convert_objects_to_sheet([current]));
			setIndex((prevIndex) => prevIndex + 1);
			setSeconds(0);
		}
	};

	let interval;
	useEffect(() => {
		interval = setInterval(() => {
			setSeconds((prev) => prev + 1);
		}, 1000);
		get_gsheet_data(sheet, tabs[1] + "!A1:U500", (res) => {
			get_gsheet_data(sheet, tabs[0] + "!A1:U500", (_res) => {
				let screened_list = convert_sheet_to_objects(res, category, "all");
				let open_list = convert_sheet_to_objects(_res, category, type);
				open_list = open_list.filter((e) => e["Date"] === "10.05.2022");
				open_list = open_list.filter((e) => !screened_list.map((e) => e["URL"]).includes(e["URL"]));
				open_list = open_list.sort((a, b) => sortCompanies(a, b));
				console.log(open_list);
				setData(open_list);
			});
		});
	}, []);

	let rows = [];

	if (index === data.length) {
		clearInterval(interval);
		setPage("finished");
	} else {
		if (data) {
			columns.forEach((key) => {
				if (data[index][key] === "") {
				} else if (key === "Description") {
					rows.push(<CustomRow header={key} content={data[index][key]} color="lightgray" />);
				} else if (key === "Category") {
					if (type === "meeting") {
						rows.push(<CustomRow header={key} content={data[index][key] + " - " + inv_categories[data[index][key]]} color="lightcoral" />);
					}
				} else if (key === "Website") {
					if (type !== "meeting") {
						rows.push(
							<CustomRow
								header="Websites"
								content={
									<>
										{data[index]["URL"].startsWith("http") && (
											<>
												<a href="#" onClick={() => window.open(data[index]["URL"])}>
													Crunchbase
												</a>
												{" - "}
											</>
										)}
										<a href="#" onClick={() => window.open(data[index]["Website"])}>
											Website
										</a>
									</>
								}
							/>
						);
					}
				} else if (key === "Funding") {
					if (data[index]["Round Size"] !== "" || data[index]["Total Funding"] !== "") {
						rows.push(
							<CustomRow
								header="Funding"
								content={
									<>
										<b>Round:</b> {data[index]["Round Size"]}, <b>Total:</b> {data[index]["Total Funding"]}
									</>
								}
							/>
						);
					}
				} else if (key === "Check") {
					if (data[index]["Check"] === "FYI") {
						rows.push(<CustomRow header={key} content={data[index][key]} color="lightyellow" />);
					}
				} else if (!data[index][key]) {
				} else {
					rows.push(<CustomRow header={key} content={data[index][key]} />);
				}
			});
		}
	}

	const team = ["", "Arian", "Moritz", "Carina", "Stephan", "Florian", "Alex", "Philipp", "Lukas", "Niclas", "Sebastian", "Olli", "Kolja", "Mikko", "Paulina", "Leonie", "Lauritz"].sort().map((e) => <option key={e}>{e}</option>);

	return (
		data &&
		index < data.length && (
			<>
				<div className="row">
					<div className="col-sm-6">
						<iframe src={data[index]["Website"]} style={{ width: "100%", height: "100%" }}></iframe>
					</div>

					<div className="col-sm-6">
						<h4 style={{ textAlign: "center" }}>{data[index]["Company Name"]}</h4>
						{index + 1}/{data.length}
						{" - "}
						<Timer seconds={seconds} />
						<InfoTable rows={rows} />
						<Form team={team} handleSubmit={handleSubmit} />
					</div>
				</div>
			</>
		)
	);
}
