import React, {useState} from "react";

import { CategorySelect, Finished, Screening, Loading, Header, GSheet } from "./components";

function App() {
  const [page, setPage] = useState("select");
  const [category, setCategory] = useState("");

  let el
  switch(page) {
    case "select": el = <CategorySelect setPage={setPage} setCategory={setCategory} />; break
    case "loading": el = <><GSheet setPage={setPage} /><Loading /></>; break
    case "screen": el = <Screening setPage={setPage} category={category} />; break
    case "finished": el = <Finished />; break
  }

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: 50 }}>{el}</div>
    </>
  );
}

export default App;
