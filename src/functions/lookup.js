function lookup(method, url, long_url, data, callback) {
  if (long_url === false) {
    url = process.env.REACT_APP_BACKEND_LOCATION + `/api${url}`;
  }
  const xhr = new XMLHttpRequest();
  const jsonData = JSON.stringify(data);
  xhr.responseType = "json";
  xhr.open(method, url);
  if (method === "POST" || method === "DELETE") {
    const csrftoken = getCookie("csrftoken");
    xhr.setRequestHeader("Content-Type", "application/json");
    // xhr.setRequestHeader("X-CSRFToken", csrftoken);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  }
  localStorage.getItem("token") !== "undefined" &&
    localStorage.getItem("token") !== null &&
    xhr.setRequestHeader(
      "Authorization",
      `JWT ${localStorage.getItem("token")}`
    );
  xhr.onload = function () {
    callback(xhr.response, xhr.status);
  };
  xhr.send(jsonData);
}
export default lookup;

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
