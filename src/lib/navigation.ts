export type AppRoute = 'home' | 'thank-you' | 'admin-login' | 'admin'

export function getAppBasePath(pathname = window.location.pathname) {
  const marker = pathname.match(/\/(?:admin(?:\/login)?|merci)\/?$/)
  if (marker?.index !== undefined) {
    const prefix = pathname.slice(0, marker.index)
    return `${prefix || ''}/`.replace(/\/+/g, '/')
  }

  const packMarker = pathname.match(/\/pack\/?(?:index\.html)?$/)
  if (packMarker?.index !== undefined) {
    const prefix = pathname.slice(0, packMarker.index)
    return `${prefix || ''}/`.replace(/\/+/g, '/')
  }

  if (pathname.endsWith('/index.html')) {
    return pathname.slice(0, -'index.html'.length)
  }
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

export function getAppRoute(): AppRoute {
  const queryRoute = new URLSearchParams(window.location.search).get('ecolyn_route')
  if (queryRoute === 'merci') return 'thank-you'
  if (queryRoute === 'admin-login') return 'admin-login'
  if (queryRoute === 'admin') return 'admin'

  const path = window.location.pathname.replace(/\/+$/, '')
  if (/\/admin\/login$/.test(path)) return 'admin-login'
  if (/\/admin$/.test(path)) return 'admin'
  if (/\/merci$/.test(path)) return 'thank-you'
  return 'home'
}

export function routeUrl(route: AppRoute, params: Record<string, string> = {}) {
  const base = getAppBasePath()
  const relative = route === 'home'
    ? ''
    : route === 'thank-you'
      ? 'merci'
      : route === 'admin-login'
        ? 'admin/login'
        : 'admin'

  if (window.location.protocol === 'file:') {
    const query = new URLSearchParams(params)
    if (route !== 'home') query.set('ecolyn_route', route === 'thank-you' ? 'merci' : route)
    return `${base}index.html${query.size ? `?${query}` : ''}`
  }

  const query = new URLSearchParams(params)
  return `${base}${relative}${query.size ? `?${query}` : ''}`
}

export function navigate(route: AppRoute, params: Record<string, string> = {}, replace = false) {
  const url = routeUrl(route, params)
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'auto' })
}

export function packUrl() {
  return window.location.protocol === 'file:'
    ? `${getAppBasePath()}pack/index.html`
    : `${getAppBasePath()}pack/`
}
