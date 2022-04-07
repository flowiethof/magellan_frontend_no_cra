import React from "react";
import { useState, useEffect } from "react";
import {
  get_gsheet_data,
  write_to_gsheet,
  convert_sheet_to_objects,
  convert_objects_to_sheet,
} from "./GSheet";

const sheet = "1ongBRK_4CCyRG0YW21Wo4f8zEX8gNB7pfD49obuGx4A";

const beautify = {
  Category: "Category",
  description: "Description",
  URL: "URL",
  money_raised: "Round size",
  funded_organization_funding_total: "Total funding",
  funded_organization_location: "Location",
  lead_investor_identifiers: "Lead Investors",
  investor_identifiers: "Investors",
  announced_on: "Announced on",
  investment_type: "Round stage",
  founded_on: "Company age",
  categories: "Categories",
  website_url: "Website URL",
};

export function Screening(props) {
  const [data, setData] = useState(false);
  const [index, setIndex] = useState(0);

  const { setPage, category } = props;

  useEffect(() => {
    get_gsheet_data(sheet, "screened_companies!A1:P300", (res) => {
      get_gsheet_data(sheet, "all_companies_filtered!A1:P300", (_res) => {
        let ex_temp = convert_sheet_to_objects(res, category, "all");
        console.log(ex_temp);
        let new_temp = convert_sheet_to_objects(_res, category, "relevant");
        console.log(new_temp);
        let temp = ex_temp.map((e) => e["URL"]);
        temp = new_temp.filter((e) => !temp.includes(e["URL"]));
        temp = temp.filter((e) => parseInt(e["founded_on"]) < 10);
        temp.forEach((e) => {
          let funding_total = e["funded_organization_funding_total"];
          e["funded_organization_funding_total"] =
            Math.round((funding_total / 1e6) * 100) / 100 + "M";
          let round_size = e["money_raised"];
          e["money_raised"] = Math.round((round_size / 1e6) * 100) / 100 + "M";
          let founded_on = e["founded_on"];
          if (founded_on === "1") {
            e["founded_on"] = "1 year";
          } else if (founded_on === 0) {
            e["founded_on"] = "<1 year";
          } else {
            e["founded_on"] = founded_on + " years";
          }
          e["funded_organization_location"] =
            e["funded_organization_location"].split(",")[2];
        });
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
    console.log(this_temp);
    console.log(convert_objects_to_sheet([this_temp]));
    write_to_gsheet(
      sheet,
      "screened_companies!A:A",
      convert_objects_to_sheet([this_temp])
    );
  };

  if (index === data.length) {
    setPage("finished");
  } else {
    if (data) {
      Object.keys(beautify).forEach((key) => {
        if (
          ![
            "Category",
            "Link",
            "funded_organization_identifier",
            "category_groups",
            "announced_on",
            "investment_type",
            "website_url",
            "money_raised",
          ].includes(key)
        ) {
          switch (beautify[key]) {
            case "Description":
              rows.push(
                <tr key={key} style={{ backgroundColor: "lightgray" }}>
                  <th>{beautify[key]}</th> <td>{data[index][key]}</td>
                </tr>
              );
              break;
            case "URL":
              rows.push(
                <tr key={key}>
                  <th>Websites</th>
                  <td>
                    <a href="#" onClick={() => window.open(data[index][key])}>
                      Crunchbase
                    </a>
                    {" - "}
                    <a
                      href="#"
                      onClick={() => window.open(data[index]["website_url"])}
                    >
                      Website
                    </a>
                  </td>
                </tr>
              );
              break;
            case "Total funding":
              rows.push(
                <tr key={key}>
                  <th>Funding</th>
                  <td>
                    <b>Round:</b> {data[index]["money_raised"]}
                    <br />
                    <b>Total:</b> {data[index][key]}
                  </td>
                </tr>
              );
              break;
            default:
              rows.push(
                <tr key={key}>
                  {" "}
                  <th>{beautify[key]}</th> <td>{data[index][key]}</td>{" "}
                </tr>
              );
          }
        }
      });
    }
  }

  const team = [
    "",
    "Moritz",
    "Carina",
    "Stephan",
    "Florian",
    "Alex",
    "Philipp",
    "Lukas",
    "Niclas",
    "Sebastian",
    "Olli",
    "Kolja",
    "Mikko",
    "Paulina",
    "Leonie",
    "Lauritz",
  ]
    .sort()
    .map((e) => <option key={e}>{e}</option>);

  return (
    data &&
    index < data.length && (
      <>
        <div className="row">
          <div className="col-sm-6">
            <iframe
              src={data[index]["website_url"]}
              style={{ width: "100%", height: "100%" }}
            ></iframe>
          </div>
          <div className="col-sm-6">
            <>
              <h3 style={{ marginBottom: "30px" }}>
                <a
                  href="#"
                  onClick={() => window.open(data[index]["URL"])}
                  style={{ color: "gray" }}
                >
                  {data[index]["funded_organization_identifier"]}
                </a>
              </h3>
              <h5>
                {index + 1}/{data.length}
              </h5>
            </>
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
              <button
                className="btn btn-success"
                type="button"
                onClick={() => handleSubmit("relevant")}
              >
                Relevant
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => handleSubmit("reject")}
              >
                Reject
              </button>
            </form>
          </div>
        </div>
      </>
    )
  );
}
