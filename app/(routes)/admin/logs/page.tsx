"use client";
import React, { useEffect } from "react";
import axios from "axios";

const Logs = () => {
  useEffect(() => {
    const fetchData = async () => {
      await axios.get(`/api/updates/`).then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    };
    fetchData();
  });
  return <div>page</div>;
};

export default Logs;
