import React from "react";
const accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
  window.location.href = "/login";
}
