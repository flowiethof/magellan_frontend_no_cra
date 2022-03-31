import React from "react";
import { useState, useEffect } from "react";
import { get_data, write_to_gsheet } from "./GSheet";
import Image from "./picus_logo.jpg";
import Loading from "./loading.gif";

const sheets = {
  read: "1ongBRK_4CCyRG0YW21Wo4f8zEX8gNB7pfD49obuGx4A",
  write: "1ongBRK_4CCyRG0YW21Wo4f8zEX8gNB7pfD49obuGx4A",
};

function convert_sheet_to_objects(table, category) {
  console.log("here");
  console.log(category);
  let keys = table[0];
  let result = [];
  table.slice(1, table.length).forEach((row) => {
    let temp = {};
    keys.forEach((key, idx) => {
      temp[key] = row[idx];
    });
    if (temp["Category"] === category) {
      result.push(temp);
    }
  });
  console.log(result);
  return result;
}

function convert_objects_to_sheet(objects) {
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

function Profile() {
  const [page, setPage] = useState("select");
  const [category, setCategory] = useState("");

  let el;
  switch (page) {
    case "select":
      el = <Select setPage={setPage} setCategory={setCategory} />;
      break;
    case "screen":
      el = <Screening category={category} />;
      break;
    default:
      el = "";
  }

  return (
    <>
      <header
        id="header"
        style={{
          backgroundColor: "black",
          height: "80px",
          color: "white",
        }}
      >
        <div style={{ paddingLeft: "30px" }}>
          <img src={Image} alt="Picus" style={{ height: "80px" }} />
        </div>
      </header>
      <div className="container" style={{ marginTop: 50 }}>
        {el}
      </div>
    </>
  );
}

function Screening(props) {
  const [data, setData] = useState(false);
  const [index, setIndex] = useState(0);

  const { category } = props;

  useEffect(() => {
    get_data(sheets["read"], "screened_companies!A1:M300", (res) => {
      get_data(sheets["read"], "all_companies!A1:M300", (_res) => {
        let ex_temp = convert_sheet_to_objects(res, category);
        let new_temp = convert_sheet_to_objects(_res, category);
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

    write_to_gsheet(
      sheets["write"],
      "screened_companies!A:A",
      convert_objects_to_sheet([this_temp])
    );
  };

  if (index === data.length) {
    rows = (
      <tr>
        <td>Done</td>
      </tr>
    );
  } else {
    if (data) {
      Object.keys(data[index]).forEach((key) => {
        if (
          ![
            "Link",
            "funded_organization_identifier",
            "category_groups",
          ].includes(key)
        ) {
          rows.push(
            <tr key={key}>
              <th>{key}</th>
              <td>{data[index][key]}</td>
            </tr>
          );
        }
      });
    }
  }

  return data.length > 0 ? (
    <>
      {data && index < data.length && (
        <>
          <h3 style={{ marginBottom: "30px" }}>
            <a href={data[index]["Link"]} style={{ color: "gray" }}>
              {data[index]["funded_organization_identifier"]}
            </a>
          </h3>
          <h5>
            {index + 1}/{data.length}
          </h5>
        </>
      )}
      <table>{rows}</table>
      <form id="profile-form">
        <h4>Comment</h4>
        <div>
          <textarea id="comment"></textarea>
        </div>
        <div>
          <h4>Responsible</h4>
          <select id="responsible">
            <option></option>
            <option>Moritz</option>
            <option>Carina</option>
            <option>Stephan</option>
            <option>Florian</option>
            <option>Alex</option>
            <option>Philipp</option>
            <option>Lukas</option>
            <option>Niclas</option>
            <option>Sebastian</option>
            <option>Olli</option>
          </select>
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
    </>
  ) : index === data.length ? (
    <>
      <p>No more companies to screen.</p>
    </>
  ) : (
    <>
      <img src={Loading} style={{ height: "100px" }} />
    </>
  );
}

function Select(props) {
  const { setPage, setCategory } = props;

  const handleSelect = () => {
    setCategory(document.getElementById("category_select").value);
    setPage("screen");
  };

  const inv_categories = [
    "",
    "Healthcare",
    "Climatech",
    "Software",
    "ECommerce",
    "Edtech",
    "Devtools",
    "Blockchain",
    "Logistics",
    "RE",
    "Cyber",
    "Fintech",
    "Biotech",
    "Marketplaces",
  ];
  const options = inv_categories.map((e) => <option>{e}</option>);

  return (
    <>
      <h4>Select Category</h4>
      <select id="category_select" onChange={handleSelect}>
        {options}
      </select>
    </>
  );
}

export default Profile;
