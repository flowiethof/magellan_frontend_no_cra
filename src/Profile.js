import React from "react";
import { useState, useEffect } from "react";
import { get_data, write_to_gsheet } from "./GSheet";
import Image from "./picus_logo.jpg";

const result = [];

const sheets = {
  read: "1ongBRK_4CCyRG0YW21Wo4f8zEX8gNB7pfD49obuGx4A",
  write: "1ongBRK_4CCyRG0YW21Wo4f8zEX8gNB7pfD49obuGx4A",
};

function convert_sheet_to_objects(table) {
  let keys = table[0];
  let result = [];
  table.slice(1, table.length).forEach((row) => {
    let temp = {};
    keys.forEach((key, idx) => {
      temp[key] = row[idx];
    });
    result.push(temp);
  });
  return result;
}

function convert_objects_to_sheet(objects) {
  let keys = Object.keys(objects[0]);
  let table = [keys];
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
  const [data, setData] = useState(false);
  const [index, setIndex] = useState(0);
  //   console.log("== START ==");
  useEffect(() => {
    get_data(sheets["read"], "frontend_companies!A1:H70", (res) => {
      setData(convert_sheet_to_objects(res));
    });
  }, []);
  let rows = [];

  console.log(index);
  if (index === 3) {
    console.log(convert_objects_to_sheet(data));
    let temp = convert_objects_to_sheet(data);
    write_to_gsheet(
      sheets["write"],
      "screening_result!A1:" +
        String.fromCharCode(64 + temp[0].length) +
        "" +
        temp.length,
      convert_objects_to_sheet(result)
    );
    rows = (
      <tr>
        <td>Done</td>
      </tr>
    );
  } else {
    if (data) {
      Object.keys(data[index]).forEach((key) => {
        if (!["Link", "funded_organization_identifier"].includes(key)) {
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

  function handleSubmit(type) {
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

    result.push(this_temp);
    console.log(result);
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
        {data && (
          <h3 style={{ marginBottom: "30px" }}>
            <a href={data[index]["Link"]} style={{ color: "gray" }}>
              {data[index]["funded_organization_identifier"]}
            </a>
          </h3>
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
      </div>
    </>
  );
}

export default Profile;
