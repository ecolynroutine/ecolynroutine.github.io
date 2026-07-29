export default {
  async fetch(request, env) {
    if (env?.ASSETS?.fetch) return env.ASSETS.fetch(request)
    return new Response('ECOLYN static assets are not bound.', { status: 503 })
  }
}
