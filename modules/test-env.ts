import { ZuploContext, ZuploRequest, environment } from "@zuplo/runtime";

/**
 * Debug endpoint to check environment variables
 */
export default async function (request: ZuploRequest, context: ZuploContext) {
  return Response.json({
    BASE_URL: environment.BASE_URL || "NOT SET",
    BACKEND_URL: environment.BACKEND_URL || "NOT SET",
    allEnvKeys: Object.keys(environment),
  });
}
