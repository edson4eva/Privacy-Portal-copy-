import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        ...nxE2EPreset(__filename, {
            cypressDir: 'src',
            webServerCommands: {
                default: 'nx run complaints:serve',
                production: 'nx run complaints:preview',
            },
            ciWebServerCommand: 'nx run complaints:serve-static',
            webServerConfig:{
              reuseExistingServer: true
            }
        }),
        baseUrl: 'http://localhost:3000',
        env: {
            NX_PUBLIC_API_URL: 'http://localhost:6010/api/',
            NX_PUBLIC_BASE_HREF: '/',
        },
    },
});
