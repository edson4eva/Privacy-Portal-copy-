import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        ...nxE2EPreset(__filename, {
            cypressDir: 'src',
            webServerCommands: {
                default: 'nx run account-history:serve',
                production: 'nx run account-history:preview',
            },
            ciWebServerCommand: 'nx run account-history:serve-static',
            webServerConfig:{
              reuseExistingServer: false
            }
        }),
        baseUrl: 'http://localhost:3000',
        env: {
            NX_PUBLIC_API_URL: 'http://localhost:6011/api/',
            NX_PUBLIC_BASE_HREF: '/',
        },
    },
});
