import React from "react";
import HealthCheckup from "./HealthCheckup";

// Placeholder wrapper so existing imports and routes continue to work
// You can replace the inner component later if you design a dedicated results page
const HeartHealthResults = (props) => {
  return <HealthCheckup {...props} />;
};

export default HeartHealthResults;


