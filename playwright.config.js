import { defineConfig } from '@playwright/test';
const port = process.env.TEST_PORT || '4173';
export default defineConfig({
 testDir:'tests/browser',
 fullyParallel:false,
 use:{baseURL:`http://127.0.0.1:${port}`,headless:true,launchOptions:process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}},
 webServer:{command:`PORT=${port} node scripts/serve.mjs`,url:`http://127.0.0.1:${port}`,reuseExistingServer:!process.env.CI},
 reporter:'list',
});
