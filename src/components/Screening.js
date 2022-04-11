import React, { useState, useEffect } from "react";
import { get_gsheet_data, write_to_gsheet, convert_sheet_to_objects, convert_objects_to_sheet } from "./GSheet";

const sheet = "1ongBRK_4CCyRG0YW21Wo4f8zEX8gNB7pfD49obuGx4A";
const columns = ["Description", "Funding", "Location", "Lead Investors", "Investors", "Company age", "Comment", "Categories", "Website", "Reason of passing", "Team score", "Business model score", "Market score", "Sourcing"];

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
		<div className="row">
			<div className="col-sm-4">
				<h6>Comment</h6>
				<textarea id="comment"></textarea>
			</div>
			<div className="col-sm-4">
				<h6>Responsible</h6>
				<select id="responsible">{team}</select>
			</div>
			<div className="col-sm-4">
				<button className="btn btn-success" type="button" onClick={() => handleSubmit("relevant")}>
					Relevant
				</button>
				<button className="btn btn-secondary" type="button" onClick={() => handleSubmit("reject")}>
					Reject
				</button>
			</div>
		</div>
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

export function Screening(props) {
	const [data, setData] = useState(false);
	const [index, setIndex] = useState(0);
	const { setPage, category, type } = props;
	let tabs = type === "meeting" ? ["screened_companies", "final_companies"] : ["test_companies", "test_companies_screened"];

	const handleSubmit = (type) => {
		let current = data[index];
		current["check"] = type === "relevant";
		["comment", "responsible"].forEach((e) => {
			current[e] = document.getElementById(e).value;
			document.getElementById(e).value = "";
		});
		write_to_gsheet(sheet, tabs[1] + "!A:A", convert_objects_to_sheet([current]));
		setIndex((prevIndex) => prevIndex + 1);
	};

	useEffect(() => {
		get_gsheet_data(sheet, tabs[1] + "!A1:Z300", (res) => {
			get_gsheet_data(sheet, tabs[0] + "!A1:Z300", (_res) => {
				let screened_list = convert_sheet_to_objects(res, category, "all");
				let open_list = convert_sheet_to_objects(_res, category, type);
				setData(open_list.filter((e) => !screened_list.map((e) => e["URL"]).includes(e["URL"])));
			});
		});
	}, []);

	let rows = [];

	if (index === data.length) {
		setPage("finished");
	} else {
		if (data) {
			columns.forEach((key) => {
				if (data[index][key] === "") {
				} else if (key === "Description") {
					rows.push(<CustomRow header={key} content={data[index][key]} color="lightgray" />);
				} else if (key === "Website") {
					rows.push(
						<CustomRow
							header="Websites"
							content={
								<>
									{data[index]["URL"] !== "" && (
										<>
											<a href="#" onClick={() => window.open(data[index][key])}>
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
				} else if (!data[index][key]) {
				} else {
					rows.push(<CustomRow header={key} content={data[index][key]} />);
				}
			});
		}
	}

	const team = ["", "Moritz", "Carina", "Stephan", "Florian", "Alex", "Philipp", "Lukas", "Niclas", "Sebastian", "Olli", "Kolja", "Mikko", "Paulina", "Leonie", "Lauritz"].sort().map((e) => <option key={e}>{e}</option>);

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
						<InfoTable rows={rows} />
						<Form team={team} handleSubmit={handleSubmit} />
					</div>
				</div>
			</>
		)
	);
}
