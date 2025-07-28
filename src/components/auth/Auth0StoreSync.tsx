import { useAuth0Sync } from '../../hooks/useAuth0Sync'

/**
 * Komponent do synchronizacji Auth0 z Redux store
 * Musi być renderowany wewnątrz Auth0Provider
 */
export const Auth0StoreSync = () => {
    useAuth0Sync()
    return null // Ten komponent nic nie renderuje, tylko synchronizuje
}
