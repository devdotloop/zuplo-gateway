#!/usr/bin/env node

/**
 * Script to add x-zuplo-route configuration to all routes in routes.oas.json
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/routes.oas.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Default x-zuplo-route configuration
const defaultRouteConfig = {
  corsPolicy: "anything-goes",
  handler: {
    export: "urlForwardHandler",
    module: "$import(@zuplo/runtime)",
    options: {
      baseUrl: "$env(BASE_URL)"
    }
  },
  policies: {
    inbound: ["api-key-inbound"]
  }
};

let updatedCount = 0;

// Iterate through all paths
for (const pathKey in config.paths) {
  const pathObj = config.paths[pathKey];

  // Iterate through all HTTP methods (get, post, put, delete, etc.)
  for (const method in pathObj) {
    if (method === 'x-zuplo-path') continue; // Skip x-zuplo-path

    const operation = pathObj[method];

    // Skip if not an operation object
    if (typeof operation !== 'object' || !operation.operationId) continue;

    // Add x-zuplo-route if it doesn't exist
    if (!operation['x-zuplo-route']) {
      operation['x-zuplo-route'] = defaultRouteConfig;
      updatedCount++;
      console.log(`✅ Added x-zuplo-route to ${method.toUpperCase()} ${pathKey}`);
    } else {
      console.log(`⏭️  Skipped ${method.toUpperCase()} ${pathKey} (already configured)`);
    }
  }
}

// Write updated config back to file
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log(`\n✨ Done! Updated ${updatedCount} routes.`);
console.log(`📄 File saved: ${configPath}`);
