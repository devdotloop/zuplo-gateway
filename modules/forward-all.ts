import { ZuploContext, ZuploRequest, environment } from "@zuplo/runtime";

/**
 * Forwards all requests to the backend server
 */
export default async function (request: ZuploRequest, context: ZuploContext) {
  const backendUrl = environment.BASE_URL;

  if (!backendUrl) {
    return new Response("Backend URL not configured", { status: 500 });
  }

  // Create new URL with backend base and original path/query
  const url = new URL(request.url);
  const backendRequestUrl = `${backendUrl}${url.pathname}${url.search}`;

  // Forward the request
  const backendRequest = new Request(backendRequestUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
  });

  return fetch(backendRequest);
}
