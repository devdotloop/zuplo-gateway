#!/usr/bin/env node

/**
 * Script to replace $env(BASE_URL) with actual backend URL
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/routes.oas.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Your backend URL
const BACKEND_URL = "https://dev-api.9squid.com";

let updatedCount = 0;

// Iterate through all paths
for (const pathKey in config.paths) {
  const pathObj = config.paths[pathKey];

  for (const method in pathObj) {
    if (method === 'x-zuplo-path') continue;

    const operation = pathObj[method];
    if (typeof operation !== 'object' || !operation['x-zuplo-route']) continue;

    const route = operation['x-zuplo-route'];
    if (route.handler?.options?.baseUrl === "$env(BASE_URL)") {
      route.handler.options.baseUrl = BACKEND_URL;
      updatedCount++;
      console.log(`✅ Updated ${method.toUpperCase()} ${pathKey}`);
    }
  }
}

// Write updated config back to file
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

console.log(`\n✨ Done! Updated ${updatedCount} routes to use ${BACKEND_URL}`);
console.log(`📄 File saved: ${configPath}`);
