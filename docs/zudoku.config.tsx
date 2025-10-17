import type { ZudokuConfig } from "zudoku";

/**
 * Developer Portal Configuration
 * For more information, see:
 * https://zuplo.com/docs/dev-portal/zudoku/configuration/overview
 */
const config: ZudokuConfig = {
  site: {
    title: "9Squid Developer Portal",
    logo: {
      src: {
        light: "https://cdn.zuplo.com/assets/my-dev-portal-light.svg",
        dark: "https://cdn.zuplo.com/assets/my-dev-portal-dark.svg",
      },
    },
  },
  metadata: {
    title: "Developer Portal",
    description: "Developer Portal",
  },
  navigation: [
    {
      type: "category",
      label: "Documentation",
      items: [
        {
          type: "category",
          label: "Getting Started",
          icon: "sparkles",
          items: [
            {
              type: "doc",
              file: "introduction",
            },
            {
              type: "doc",
              file: "markdown",
            },
          ],
        },
        {
          type: "category",
          label: "Useful Links",
          collapsible: false,
          icon: "link",
          items: [
            {
              type: "link",
              label: "Zuplo Docs",
              to: "https://zuplo.com/docs/dev-portal/introduction",
            },
            {
              type: "link",
              label: "Developer Portal Docs",
              to: "https://zuplo.com/docs/dev-portal/introduction",
            },
          ],
        },
      ],
    },
    {
      type: "link",
      to: "/api",
      label: "API Reference",
    },
  ],
  redirects: [{ from: "/", to: "/api" }],
  apis: [
    {
      type: "file",
      input: "../config/routes.oas.json",
      // input: "../config/swagger.json",
      path: "api",
    },
  ],
  authentication: {
    type: "clerk",
    // Use environment variables
    clerkPubKey: 'pk_test_b3JnYW5pYy1nb3BoZXItNjAuY2xlcmsuYWNjb3VudHMuZGV2JA',//process.env.ZUPLO_PUBLIC_CLERK_PUBLISHABLE_KEY! as `pk_test_${string}`,
    jwtTemplateName: 'zuplo-api'
    
  },
  apiKeys: {
    enabled: true,
      // Retrieve all API consumers and their keys
    //   getKeys: async (context) => {
    //     // Implement fetching consumers from your storage
    //     // Each consumer can have multiple API keys
    //     return [];
    //   },
    //   createKey: async ({ apiKey, context, auth }) => {
    //     const newKey = {
    //       id: crypto.randomUUID(),
    //       key: `key-${crypto.randomUUID()}`,
    //       description: apiKey.description,
    //       createdOn: new Date().toISOString(),
    //       expiresOn: apiKey.expiresOn,
    //     };
    //   // Save the new key to your storage
    //   // Associate it with the current user/consumer
    // },
     createKey: async ({ apiKey, context, auth }) => {
      const user = auth.profile;
      if (!user) throw new Error("Not authenticated");

      // Create consumer + key via Zuplo Developer API
      // Note: You need to implement a backend endpoint that calls the Zuplo API
      // because browser clients can't safely store API credentials
      try {
        const response = await fetch('/api/create-api-key', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: user.name || user.email,
            description: apiKey.description,
            managers: [user.email],
            metadata: {
              userId: user.sub,
              email: user.email,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Create key failed:', response.status, errorText);
          throw new Error(`Failed to create API key: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        console.log('API key created successfully:', result);
      } catch (error) {
        console.error('Error creating API key:', error);
        throw error;
      }
    },

    // Fetch existing keys for logged-in user
    // Note: getKeys should return a flat array of ApiKey[], not consumers
    // This is a workaround since Zuplo API uses consumers
    getKeys: async (context) => {
      try {
        const response = await fetch('/api/get-api-keys');

        if (!response.ok) {
          console.error('Get keys failed:', response.status);
          return [];
        }

        const consumers = await response.json();

        // Flatten all keys from all consumers into a single array
        const allKeys: any[] = [];
        for (const consumer of consumers) {
          if (consumer.apiKeys) {
            for (const key of consumer.apiKeys) {
              allKeys.push({
                id: `${consumer.id}:${key.id}`, // Encode both IDs for later use
                key: key.key,
                description: key.description || consumer.name,
                createdOn: key.createdOn,
                expiresOn: key.expiresOn,
              });
            }
          }
        }

        return allKeys;
      } catch (error) {
        console.error('Error fetching API keys:', error);
        return [];
      }
    },

    // Delete API key - Also returns void
    // The id parameter is the combined "consumerId:keyId" string from getKeys
    deleteKey: async (id, context) => {
      const [consumerId, keyId] = id.split(':');
      if (!consumerId || !keyId) {
        throw new Error('Invalid key ID format');
      }

      const response = await fetch('/api/delete-api-key', {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ consumerId, keyId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete key failed:', response.status, errorText);
        throw new Error(`Failed to delete API key: ${response.status}`);
      }
    },

    // Roll (regenerate) API key - Also returns void
    // The id parameter is the combined "consumerId:keyId" string from getKeys
    rollKey: async (id, context) => {
      const [consumerId] = id.split(':');
      if (!consumerId) {
        throw new Error('Invalid key ID format');
      }

      const response = await fetch('/api/roll-api-key', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ consumerId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Roll key failed:', response.status, errorText);
        throw new Error(`Failed to roll API key: ${response.status}`);
      }
    },
    
  },
};

export default config;
