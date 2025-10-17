import { ZuploContext, ZuploRequest } from "@zuplo/runtime";

const ZUPLO_ACCOUNT_NAME = process.env.ZUPLO_ACCOUNT_NAME;
const ZUPLO_BUCKET_NAME = process.env.ZUPLO_BUCKET_NAME;
const ZUPLO_DEVELOPER_API_KEY = process.env.ZUPLO_DEVELOPER_API_KEY;
const ZUPLO_API_BASE = "https://dev.zuplo.com/v1";

/**
 * Create a new API key for a consumer
 */
export async function createApiKeyHandler(
  request: ZuploRequest,
  context: ZuploContext
) {
  try {
    const body = await request.json();
    const { name, description, managers, metadata } = body;

    if (!name || !managers || !Array.isArray(managers)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, managers" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `${ZUPLO_API_BASE}/accounts/${ZUPLO_ACCOUNT_NAME}/key-buckets/${ZUPLO_BUCKET_NAME}/consumers?with-api-key=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ZUPLO_DEVELOPER_API_KEY}`,
        },
        body: JSON.stringify({
          name,
          description,
          managers,
          metadata,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      context.log.error("Failed to create API key", {
        status: response.status,
        error: errorText,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to create API key",
          details: errorText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    context.log.error("Error in createApiKeyHandler", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Get all API keys for the authenticated user
 */
export async function getApiKeysHandler(
  request: ZuploRequest,
  context: ZuploContext
) {
  try {
    // Get user email from authentication context (e.g., from Clerk JWT)
    const user = request.user;
    let userEmail: string | undefined;

    if (user && typeof user === "object" && "data" in user) {
      const userData = user.data as any;
      userEmail = userData.email || userData.emailAddress;
    }

    const url = userEmail
      ? `${ZUPLO_API_BASE}/accounts/${ZUPLO_ACCOUNT_NAME}/key-buckets/${ZUPLO_BUCKET_NAME}/consumers?manager=${encodeURIComponent(userEmail)}&include-api-keys=true&key-format=visible`
      : `${ZUPLO_API_BASE}/accounts/${ZUPLO_ACCOUNT_NAME}/key-buckets/${ZUPLO_BUCKET_NAME}/consumers?include-api-keys=true&key-format=visible`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${ZUPLO_DEVELOPER_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      context.log.error("Failed to fetch API keys", {
        status: response.status,
        error: errorText,
      });
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const consumers = await response.json();
    return new Response(JSON.stringify(consumers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    context.log.error("Error in getApiKeysHandler", error);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Delete an API key
 */
export async function deleteApiKeyHandler(
  request: ZuploRequest,
  context: ZuploContext
) {
  try {
    const body = await request.json();
    const { consumerId, keyId } = body;

    if (!consumerId || !keyId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: consumerId, keyId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `${ZUPLO_API_BASE}/accounts/${ZUPLO_ACCOUNT_NAME}/key-buckets/${ZUPLO_BUCKET_NAME}/consumers/${consumerId}/keys/${keyId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${ZUPLO_DEVELOPER_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      context.log.error("Failed to delete API key", {
        status: response.status,
        error: errorText,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to delete API key",
          details: errorText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    context.log.error("Error in deleteApiKeyHandler", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Roll (regenerate) an API key
 */
export async function rollApiKeyHandler(
  request: ZuploRequest,
  context: ZuploContext
) {
  try {
    const body = await request.json();
    const { consumerId } = body;

    if (!consumerId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: consumerId" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      `${ZUPLO_API_BASE}/accounts/${ZUPLO_ACCOUNT_NAME}/key-buckets/${ZUPLO_BUCKET_NAME}/consumers/${consumerId}/keys/roll`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ZUPLO_DEVELOPER_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      context.log.error("Failed to roll API key", {
        status: response.status,
        error: errorText,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to roll API key",
          details: errorText,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    context.log.error("Error in rollApiKeyHandler", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
