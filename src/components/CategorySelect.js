import React from "react";
import Olli from "../img/olli.png";

export function CategorySelect(props) {
  const { setPage, setCategory } = props;

  const handleSelect = () => {
    setCategory(document.getElementById("category_select").value);
    setPage("loading");
  };

  const inv_categories = [
    "",
    "Other",
    "Robotics",
    "HR",
    "Travel",
    "Gaming",
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
    "Creator",
  ].sort();
  const options = inv_categories.map((e) => <option key={e}>{e}</option>);

  return (
    <>
      <h4>Select Category</h4>
      <select id="category_select" onChange={handleSelect}>
        {options}
      </select>
      <div style={{ textAlign: "right" }}>
        <img src={Olli} style={{ width: "200px" }} />
        <p>Olli's choice award 2022</p>
      </div>
    </>
  );
}
