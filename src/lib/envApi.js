//  dev | uat | prod
const envType = import.meta.env.VITE_PUBLIC_env_type;
let envConfig;


switch (envType) {
  case "dev":
    envConfig = {
      wellness_leads: "wellness_leads_dev",
      volunteer_support: "volunteer_support_dev",
      profiles: "profiles_dev",
      heart_health_assessments: "heart_health_assessments_dev",
    };
    break;
  case "uat":
    envConfig = {
      wellness_leads: "wellness_leads_uat",
      volunteer_support: "volunteer_support_uat",
      profiles: "profiles_uat",
      heart_health_assessments: "heart_health_assessments_uat",
    };  
    break;
  case "prod":
    envConfig = {
      wellness_leads: "wellness_leads",
      volunteer_support: "volunteer_support",
      profiles: "profiles",
      heart_health_assessments: "heart_health_assessments",
    };
    break;
  default:
    throw new Error(`Unsupported environment type: ${envType}`);
}

export { envConfig };
