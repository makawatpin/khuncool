/**
 * Stands in for the `server-only` package under `npm test`.
 *
 * That package's main entry throws the moment it is imported; it only
 * resolves to a harmless no-op under the `react-server` export condition,
 * which Next applies to Server Components and a plain node test run does
 * not. Its own empty.js is not reachable as a subpath (the package exports
 * "." only), so the stub lives here instead.
 *
 * Aliased in vitest.config.mts. This changes nothing about the real build:
 * Next resolves the actual package, so importing a `server-only` module from
 * a client component still fails exactly as it did before.
 */
export {};
