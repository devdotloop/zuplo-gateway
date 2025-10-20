import { ZuploContext, ZuploRequest } from "@zuplo/runtime";

export default async function (
  request: ZuploRequest,
  context: ZuploContext
) {
  // Get the authenticated user from the API key policy
  const user = request.user;

  if (user) {
    // Add user metadata as headers to forward to backend
    request.headers.set("X-User-Id", user.data.userId || "");
    request.headers.set("X-User-Email", user.data.email || "");
    request.headers.set("X-Clerk-Id", user.data.clerkId || "");
    request.headers.set("X-Consumer-Id", user.sub || "");
  }

  return request;
}