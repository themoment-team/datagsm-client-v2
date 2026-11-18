import { defineConfig, devices } from '@playwright/test';

const port = 3001;
const baseURL = `http://localhost:${port}`;
const apiBaseURL = 'http://localhost:8080';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: 'list',
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], baseURL },
    },
  ],
  // 배포와 같은 조건으로 확인하려고 빌드한 뒤 띄운다. 현재 검사는 백엔드 없이 통과하는 화면만 다룬다.
  // 셸이나 .env.local의 값과 상관없이 같은 조건이 되도록 API 주소와 포트를 직접 넘긴다.
  webServer: {
    command: `pnpm build && pnpm start --port ${port}`,
    url: baseURL,
    env: {
      API_BASE_URL: apiBaseURL,
      OAUTH_AUTHORIZATION_BASE_URL: 'http://localhost:8083',
      OAUTH_CLIENT_ID: 'e2e-client-id',
      OAUTH_CLIENT_SECRET: 'e2e-client-secret',
    },
    reuseExistingServer: false,
    timeout: 180 * 1000,
  },
});
