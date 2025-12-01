//  dev | uat | prod
const envType = import.meta.env.VITE_PUBLIC_env_type;
let envConfig;


switch (envType) {
  case "dev":
    envConfig = {
      wellness_leads: "wellness_leads_dev",
    };
    break;
  case "uat":
    envConfig = {
      wellness_leads: "wellness_leads_uat",
    };
    break;
  case "prod":
    envConfig = {
      wellness_leads: "wellness_leads",
    };
    break;
  default:
    throw new Error(`Unsupported environment type: ${envType}`);
}

export { envConfig };
