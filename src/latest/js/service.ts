import { registerRoute, Route } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { precacheAndRoute } from 'workbox-precaching';
/// <reference lib="ES2020" />
/// <reference lib="WebWorker" />

type ManifestEntry = {
    integrity: string | undefined,
    revision: string,
    url: string,
};

// TS moment™
export type {};
declare let self: ServiceWorkerGlobalScope;

//@ts-expect-error Manifest injection
const manifest: ManifestEntry[] = self.__WB_MANIFEST;
precacheAndRoute(manifest);

const localScriptRoute = new Route(({request, sameOrigin}) => {
    return sameOrigin && request.destination === "script";
}, new CacheFirst({ cacheName: "scripts" }));

const remoteScriptRoute = new Route(({request, sameOrigin}) => {
    return !sameOrigin && request.destination === "script";
}, new NetworkFirst({ cacheName: "scripts" }));

const assetRoute = new Route(({request, sameOrigin}) => {
    return sameOrigin && request.destination in ["style", "image"];
}, new CacheFirst({ cacheName: "styles" }));

const textRoute = new Route(({request}) => {
    return request.url.endsWith(".txt");
}, new StaleWhileRevalidate());

const htmlRoute = new Route(({request, sameOrigin}) => {
    return sameOrigin && request.destination === "document";
}, new NetworkFirst());

registerRoute(localScriptRoute);
registerRoute(remoteScriptRoute);
registerRoute(assetRoute);
registerRoute(textRoute);
registerRoute(htmlRoute);