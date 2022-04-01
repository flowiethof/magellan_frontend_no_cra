import React from "react";
import { useState, useEffect } from "react";
import { get_gsheet_data, write_to_gsheet, convert_sheet_to_objects, convert_objects_to_sheet } from "./GSheet";

const sheet = "1ongBRK_4CCyRG0YW21Wo4f8zEX8gNB7pfD49obuGx4A";



const beautify = {
  Category: "Category",
  funded_organization_description: "Description",
  funded_organization_funding_total: "Total funding",
  funded_organization_location: "Location",
  investor_identifiers: "Investors",
  lead_investor_identifiers: "Lead Investors",
  announced_on: "Announced on",
  investment_type: "Round stage",
  founded_on: "Founded on",
  categories: "Categories",
  URL: "URL",
};



export function Screening(props) {
  const [data, setData] = useState(false);
  const [index, setIndex] = useState(0);

  const { setPage, category } = props;

  useEffect(() => {
    get_gsheet_data(sheet, "screened_companies!A1:N300", (res) => {
      get_gsheet_data(sheet, "all_companies_filtered!A1:N300", (_res) => {
        let ex_temp = convert_sheet_to_objects(res, category, "all");
        console.log(ex_temp)
        let new_temp = convert_sheet_to_objects(_res, category, "relevant");
        console.log(new_temp)
        let temp = ex_temp.map((e) => e["URL"]);
        temp = new_temp.filter((e) => !temp.includes(e["URL"]));
        setData(temp);
      });
    });
  }, []);
  let rows = [];

  const handleSubmit = (type) => {
    let this_temp = data[index];
    if (type === "relevant") {
      this_temp["check"] = true;
      setIndex((prevIndex) => prevIndex + 1);
    } else if (type === "reject") {
      this_temp["check"] = false;
      setIndex((prevIndex) => prevIndex + 1);
    }
    this_temp["comment"] = document.getElementById("comment").value;
    this_temp["responsible"] = document.getElementById("responsible").value;

    document.getElementById("responsible").value = "";
    document.getElementById("comment").value = "";

    write_to_gsheet(sheet, "screened_companies!A:A", convert_objects_to_sheet([this_temp]) );
  };

  if (index === data.length) {
    setPage("finished");
  } else {
    if (data) {
      Object.keys(beautify).forEach((key) => {
        if (!["Category", "Link", "funded_organization_identifier", "category_groups", ].includes(key) ) {
          if (beautify[key] === "Description") {
            rows.push(<tr key={key} style={{ backgroundColor: "lightgray" }}> <th>{beautify[key]}</th> <td>{data[index][key]}</td></tr>);
          } else {
            rows.push( <tr key={key}> <th>{beautify[key]}</th> <td>{data[index][key]}</td> </tr> );
          }
        }
      });
    }
  }

  const team = ["", "Moritz", "Carina", "Stephan", "Florian", "Alex", "Philipp", "Lukas", "Niclas", "Sebastian", "Olli", "Kolja", "Mikko", "Paulina", "Leonie", "Lauritz"].sort().map(e => <option key={e}>{e}</option>)

  return (
    <>
      {data && index < data.length && (
        <>
          <h3 style={{ marginBottom: "30px" }}>
            <a href={data[index]["URL"]} style={{ color: "gray" }}>{data[index]["funded_organization_identifier"]}</a>
          </h3>
          <h5>{index + 1}/{data.length}</h5>
        </>
      )}
      <table>{rows}</table>
      <form id="profile-form">
        <div>
          <h4>Comment</h4>
          <textarea id="comment"></textarea>
        </div>
        <div>
          <h4>Responsible</h4>
          <select id="responsible">{team}</select>
        </div>
        <button className="btn btn-success" type="button" onClick={() => handleSubmit("relevant")} >Relevant</button>
        <button className="btn btn-secondary" type="button" onClick={() => handleSubmit("reject")} >Reject</button>
      </form>
    </>
  )
}
