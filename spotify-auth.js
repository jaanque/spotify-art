// Configuración de la API de Spotify
const CLIENT_ID = '97d973ea484b40d592cbf2e18ca5fd5c'; // Reemplazar con tu Client ID de Spotify
const REDIRECT_URI = window.location.origin + window.location.pathname;
const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played' // Añadido permiso para canciones recientes
];

// Genera un estado aleatorio para prevenir ataques CSRF
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Iniciar el proceso de autenticación de Spotify
function loginWithSpotify() {
    const state = generateRandomString(16);
    localStorage.setItem('spotify_auth_state', state);

    const authUrl = 'https://accounts.spotify.com/authorize' +
        '?response_type=token' +
        '&client_id=' + encodeURIComponent(CLIENT_ID) +
        '&scope=' + encodeURIComponent(SCOPES.join(' ')) +
        '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
        '&state=' + encodeURIComponent(state);

    window.location = authUrl;
}

// Obtener el token de acceso del hash de la URL
function getAccessTokenFromHash() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    if (params.has('access_token')) {
        const accessToken = params.get('access_token');
        const state = params.get('state');
        const storedState = localStorage.getItem('spotify_auth_state');
        
        if (state === null || state !== storedState) {
            console.error('Error de estado: posible ataque CSRF');
            return null;
        }
        
        // Limpiar el hash para que no quede visible en la URL
        window.location.hash = '';
        
        // Guardar el token en sessionStorage y configurar su tiempo de expiración
        const expiresIn = params.get('expires_in');
        const expirationTime = Date.now() + parseInt(expiresIn) * 1000;
        
        sessionStorage.setItem('spotify_access_token', accessToken);
        sessionStorage.setItem('spotify_token_expiration', expirationTime.toString());
        
        return accessToken;
    }
    return null;
}

// Verificar si el token está guardado y es válido
function getValidAccessToken() {
    const accessToken = sessionStorage.getItem('spotify_access_token');
    const expirationTime = sessionStorage.getItem('spotify_token_expiration');
    
    if (accessToken && expirationTime) {
        // Verificar si el token ha expirado
        if (Date.now() < parseInt(expirationTime)) {
            return accessToken;
        }
    }
    
    // Si no hay token o ha expirado, intentar obtenerlo del hash
    return getAccessTokenFromHash();
}

// Cerrar sesión eliminando el token
function logout() {
    sessionStorage.removeItem('spotify_access_token');
    sessionStorage.removeItem('spotify_token_expiration');
    window.location.href = REDIRECT_URI;
}

// Obtener los datos del usuario de Spotify
async function getUserData(accessToken) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener datos del usuario');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        logout(); // Si hay un error de autenticación, cerrar sesión
        return null;
    }
}

// Obtener los artistas más escuchados del usuario
async function getTopArtists(accessToken) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener los artistas más escuchados');
        }
        
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener los álbumes más escuchados del usuario
async function getTopTracks(accessToken, limit = 20) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=medium_term`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener las canciones más escuchadas');
        }
        
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Obtener canciones reproducidas recientemente
async function getRecentlyPlayedTracks(accessToken, limit = 30) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener las canciones reproducidas recientemente');
        }
        
        const data = await response.json();
        // Transformar el formato para que sea similar a getTopTracks
        return data.items.map(item => item.track);
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}