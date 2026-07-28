# Hotsou Server

This is the Cloudflare Worker API for Hotsou. It uses [Hono](https://hono.dev/) for routing and Zod for request validation.

## Get started

1. Sign up for [Cloudflare Workers](https://workers.dev). The free tier is more than enough for most use cases.
2. Clone this project and install dependencies with `npm install`
3. Run `wrangler login` to login to your Cloudflare account in wrangler
4. Run `wrangler deploy` to publish the API to Cloudflare Workers

## Project structure

1. Your main router is defined in `src/index.ts`.
2. Each endpoint has its own file in `src/endpoints/`.
3. Shared Zod schemas and binding types are defined in `src/types.ts`.

## Development

1. Run `wrangler dev` to start a local instance of the API.
2. The API is available at `http://localhost:8787/api`.
3. Changes made in the `src/` folder automatically reload the local Worker.
