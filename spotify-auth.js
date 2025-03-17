// Configuración de la API de Spotify
const CLIENT_ID = 'ba0e68fafbf441958bac79bb94d5412d'; // Reemplazar con tu Client ID de Spotify
const REDIRECT_URI = window.location.origin + window.location.pathname;
const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'playlist-read-private'
];

// Generación de un estado aleatorio para protección CSRF
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Función para obtener parámetros de URL
function getHashParams() {
    const hashParams = {};
    const hash = window.location.hash.substring(1);
    const params = hash.split('&');
    
    for (let i = 0; i < params.length; i++) {
        const pair = params[i].split('=');
        hashParams[pair[0]] = decodeURIComponent(pair[1]);
    }
    
    return hashParams;
}

// Iniciar sesión con Spotify
function loginWithSpotify() {
    const state = generateRandomString(16);
    localStorage.setItem('spotify_auth_state', state);
    
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('scope', SCOPES.join(' '));
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('state', state);
    
    window.location.href = authUrl.toString();
}

// Comprobar autenticación al cargar
function checkAuthentication() {
    const params = getHashParams();
    const accessToken = params.access_token || localStorage.getItem('spotify_access_token');
    const state = params.state || null;
    const storedState = localStorage.getItem('spotify_auth_state');
    
    // Limpiar URL después de obtener los tokens
    if (window.location.hash) {
        history.replaceState("", document.title, window.location.pathname);
    }
    
    // Validar estado y token
    if (accessToken) {
        // Si tenemos un nuevo token desde la redirección
        if (params.access_token) {
            if (state === null || state !== storedState) {
                console.error('Error de autenticación: los estados no coinciden');
                return false;
            }
            // Guardar token en localStorage con tiempo de expiración
            const expiresIn = params.expires_in || 3600; // Por defecto 1 hora
            const expiresAt = Date.now() + (expiresIn * 1000);
            
            localStorage.setItem('spotify_access_token', accessToken);
            localStorage.setItem('spotify_token_expiry', expiresAt);
        } else {
            // Verificar si el token almacenado ha expirado
            const tokenExpiry = localStorage.getItem('spotify_token_expiry');
            if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
                console.log('Token expirado, iniciando nueva autenticación');
                logout();
                return false;
            }
        }
        
        return {
            accessToken: accessToken,
            authenticated: true
        };
    }
    
    return {
        authenticated: false
    };
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_auth_state');
    window.location.reload();
}

// Obtener datos del perfil de usuario
async function getUserProfile(accessToken) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener el perfil de usuario');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        logout(); // Si hay un error de autenticación, cerramos sesión
        return null;
    }
}

// Obtener los artistas más escuchados
async function getTopArtists(accessToken, timeRange = 'medium_term', limit = 10) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener los artistas principales');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { items: [] };
    }
}

// Obtener las canciones más escuchadas
async function getTopTracks(accessToken, timeRange = 'medium_term', limit = 10) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener las canciones principales');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { items: [] };
    }
}

// Obtener géneros principales
async function getTopGenres(accessToken) {
    try {
        const topArtists = await getTopArtists(accessToken, 'medium_term', 50);
        
        // Contar géneros
        const genreCounts = {};
        topArtists.items.forEach(artist => {
            artist.genres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        });
        
        // Ordenar por conteo
        const sortedGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([genre, count]) => ({
                name: genre,
                count: count
            }));
        
        return sortedGenres;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener playlists del usuario
async function getUserPlaylists(accessToken, limit = 50) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener las playlists');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { items: [] };
    }
}

// Exportar funciones
window.SpotifyAuth = {
    loginWithSpotify,
    checkAuthentication,
    logout,
    getUserProfile,
    getTopArtists,
    getTopTracks,
    getTopGenres,
    getUserPlaylists
};