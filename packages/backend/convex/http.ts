import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { oauthCallbackHandler } from "./connections/oauth/httpRoutes";
import {
  webhookHandler as integrationsWebhookHandler,
  webhookHandlerByConnection as integrationsWebhookHandlerByConnection,
} from "./connections/sync/httpRoutes";
import {
  captureFileHandler,
  captureNoteHandler,
  captureWebsiteHandler,
  listResourcesHandler,
  meHandler,
  uploadUrlHandler,
} from "./extensionAuth/http";
import { healthHandler } from "./health";
import { mcpHandler } from "./mcp/server";
import { oauthCallbackHandler as mcpClientOauthCallbackHandler } from "./mcpClient/oauthHttp";

const http = httpRouter();
http.route({
  path: "/health",
  method: "GET",
  handler: healthHandler,
});
authComponent.registerRoutes(http, createAuth);
for (const provider of [
  "notion",
  "google_drive",
  "github",
  "linear",
] as const) {
  http.route({
    path: `/api/oauth/${provider}/callback`,
    method: "GET",
    handler: oauthCallbackHandler,
  });
}
for (const provider of ["notion", "google_drive"] as const) {
  http.route({
    path: `/api/integrations/${provider}/webhook`,
    method: "POST",
    handler: integrationsWebhookHandler,
  });
}
for (const provider of ["github", "linear"] as const) {
  http.route({
    pathPrefix: `/api/integrations/${provider}/webhook/`,
    method: "POST",
    handler: integrationsWebhookHandlerByConnection,
  });
}
http.route({
  path: "/api/ext/me",
  method: "GET",
  handler: meHandler,
});
http.route({
  path: "/api/ext/resources",
  method: "GET",
  handler: listResourcesHandler,
});
http.route({
  path: "/api/ext/upload-url",
  method: "POST",
  handler: uploadUrlHandler,
});
http.route({
  path: "/api/ext/capture/website",
  method: "POST",
  handler: captureWebsiteHandler,
});
http.route({
  path: "/api/ext/capture/note",
  method: "POST",
  handler: captureNoteHandler,
});
http.route({
  path: "/api/ext/capture/file",
  method: "POST",
  handler: captureFileHandler,
});
for (const method of ["POST", "GET", "DELETE"] as const) {
  http.route({
    path: "/api/mcp",
    method,
    handler: mcpHandler,
  });
}
http.route({
  path: "/api/mcp-client/oauth/callback",
  method: "GET",
  handler: mcpClientOauthCallbackHandler,
});
export default http;
