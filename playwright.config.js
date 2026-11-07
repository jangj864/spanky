import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'tests/browser',
 fullyParallel:false,
 use:{baseURL:'http://127.0.0.1:4173',headless:true,launchOptions:process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}},
 webServer:{command:'node scripts/serve.mjs',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},
 reporter:'list',
});
