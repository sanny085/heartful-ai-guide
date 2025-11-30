import React from "react";
import HealthCheckup from "./HealthCheckup";

// Thin wrapper to keep existing routes working without changing logic elsewhere
const HeartHealthAssessment = (props) => {
  return <HealthCheckup {...props} />;
};

export default HeartHealthAssessment;


