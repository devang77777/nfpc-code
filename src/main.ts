import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as Sentry from "@sentry/angular";
import { Integrations } from "@sentry/tracing";

if (environment.production) {
  enableProdMode();
}
// Sentry.init({
//   dsn: "https://47fceed9b79d4a7fb2c0fd92f07b5193@o486318.ingest.sentry.io/5543397",
//   autoSessionTracking: true,
//   integrations: [
//     new Integrations.BrowserTracing({
//       tracingOrigins: ["localhost:4200", "https://mobiato-msfa.com/application-backend/public/api", "https://nfpc.mobiato-msfa.com/application-backend/public/api"],
//       routingInstrumentation: Sentry.routingInstrumentation,
//     }),
//   ],

//   // We recommend adjusting this value in production, or using tracesSampler
//   // for finer control
//   tracesSampleRate: 1.0,
// });

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
