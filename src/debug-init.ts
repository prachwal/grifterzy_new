// Browser environment logger - loguje wszystkie URL parametry i zmiany
console.group('🌍 Browser Environment Initialization')
console.log('🌐 User Agent:', navigator.userAgent)
console.log('📍 Current URL:', window.location.href)
console.log('🔗 Origin:', window.location.origin)
console.log('📁 Pathname:', window.location.pathname)
console.log('🔍 Search:', window.location.search)
console.log('⚓ Hash:', window.location.hash)
console.log('🏠 Host:', window.location.host)
console.log('🚪 Port:', window.location.port)
console.log('📋 Protocol:', window.location.protocol)

// Parse query parameters
const urlParams = new URLSearchParams(window.location.search)
const params: Record<string, string> = {}
urlParams.forEach((value, key) => {
    params[key] = value
})
console.log('📊 URL Parameters:', params)

// Check for Auth0 specific parameters
const auth0Params = ['code', 'state', 'error', 'error_description']
const foundAuth0Params: Record<string, string> = {}
auth0Params.forEach(param => {
    const value = urlParams.get(param)
    if (value) {
        foundAuth0Params[param] = value
    }
})

if (Object.keys(foundAuth0Params).length > 0) {
    console.group('🔐 Auth0 URL Parameters Detected')
    console.log('Found parameters:', foundAuth0Params)
    console.groupEnd()
}

// Check localStorage and sessionStorage for Auth0 data
console.group('💾 Storage State')
const localStorageAuth0 = Object.keys(localStorage).filter(key =>
    key.includes('auth0') || key.includes('@@auth0')
)
const sessionStorageAuth0 = Object.keys(sessionStorage).filter(key =>
    key.includes('auth0') || key.includes('@@auth0')
)

console.log('📦 LocalStorage Auth0 keys:', localStorageAuth0)
console.log('📦 SessionStorage Auth0 keys:', sessionStorageAuth0)

localStorageAuth0.forEach(key => {
    try {
        const value = localStorage.getItem(key)
        console.log(`📦 ${key}:`, value)
    } catch (e) {
        console.error(`❌ Error reading ${key}:`, e)
    }
})

sessionStorageAuth0.forEach(key => {
    try {
        const value = sessionStorage.getItem(key)
        console.log(`📦 ${key}:`, value)
    } catch (e) {
        console.error(`❌ Error reading ${key}:`, e)
    }
})
console.groupEnd()

console.groupEnd()

// Monitor URL changes
let previousUrl = window.location.href
const urlObserver = new MutationObserver(() => {
    if (window.location.href !== previousUrl) {
        console.group('🔄 URL Changed')
        console.log('From:', previousUrl)
        console.log('To:', window.location.href)
        console.log('New search params:', window.location.search)
        previousUrl = window.location.href
        console.groupEnd()
    }
})

urlObserver.observe(document, { subtree: true, childList: true })

// Monitor window events
window.addEventListener('popstate', (event) => {
    console.group('↩️ Popstate Event')
    console.log('Event:', event)
    console.log('New URL:', window.location.href)
    console.groupEnd()
})

window.addEventListener('hashchange', (event) => {
    console.group('#️⃣ Hash Change Event')
    console.log('Old URL:', event.oldURL)
    console.log('New URL:', event.newURL)
    console.groupEnd()
})

export { }
