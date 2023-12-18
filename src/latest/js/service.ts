import { registerRoute, Route } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { clientsClaim } from "workbox-core";
/// <reference lib="ES2020" />
/// <reference lib="WebWorker" />

// type ManifestEntry = {
//     integrity: string | undefined,
//     revision: string,
//     url: string,
// };

clientsClaim();

const localScriptRoute = new Route(({ request, sameOrigin }) => {
    return sameOrigin && request.destination === "script";
}, new CacheFirst({ cacheName: "scripts" }));

const remoteScriptRoute = new Route(({ request, sameOrigin }) => {
    return !sameOrigin && request.destination === "script";
}, new NetworkFirst({ cacheName: "scripts" }));

const assetRoute = new Route(({ request, sameOrigin }) => {
    return sameOrigin && request.destination in ["style", "image"];
}, new CacheFirst({ cacheName: "styles" }));

const textRoute = new Route(({ request }) => {
    return request.url.endsWith(".txt");
}, new StaleWhileRevalidate());

const htmlRoute = new Route(({ request, sameOrigin }) => {
    return sameOrigin && request.destination === "document";
}, new NetworkFirst());

registerRoute(localScriptRoute);
registerRoute(remoteScriptRoute);
registerRoute(assetRoute);
registerRoute(textRoute);
registerRoute(htmlRoute);