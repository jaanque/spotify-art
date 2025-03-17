// Configuración de la API de Spotify
const clientId = '97d973ea484b40d592cbf2e18ca5fd5c'; // Reemplazar con tu Client ID de Spotify
const redirectUri = window.location.origin + window.location.pathname;
const scope = 'user-top-read';

// Elementos del DOM
const loginButton = document.getElementById('login-button');
const loginSection = document.getElementById('login-section');
const gallerySection = document.getElementById('gallery-section');
const loadingSection = document.getElementById('loading-section');
const albumCollage = document.getElementById('album-collage');
const topArtistsList = document.getElementById('top-artists');
const downloadButton = document.getElementById('download-button');

// Listeners
loginButton.addEventListener('click', initiateSpotifyLogin);
downloadButton.addEventListener('click', downloadCollage);

// Verificar si ya hay un token de acceso en la URL al cargar la página
window.onload = function() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    
    if (accessToken) {
        // Limpiar URL
        history.replaceState({}, document.title, window.location.pathname);
        
        // Mostrar sección de carga
        loginSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        
        // Obtener datos de Spotify y crear collage
        fetchSpotifyData(accessToken);
    }
};

// Función para iniciar el login de Spotify
function initiateSpotifyLogin() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=token&show_dialog=true`;
    window.location.href = authUrl;
}

// Función para obtener datos de Spotify
async function fetchSpotifyData(token) {
    try {
        // Obtener los álbumes más escuchados
        const topTracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=medium_term', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const topTracksData = await topTracksResponse.json();
        
        // Obtener los artistas más escuchados
        const topArtistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const topArtistsData = await topArtistsResponse.json();
        
        // Crear el collage y mostrar la información
        createAlbumCollage(topTracksData.items);
        displayTopArtists(topArtistsData.items);
        
        // Mostrar sección de galería
        loadingSection.classList.add('hidden');
        gallerySection.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error al obtener datos de Spotify:', error);
        alert('Hubo un error al conectar con Spotify. Por favor, intenta de nuevo.');
        
        // Volver a mostrar pantalla de login
        loadingSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    }
}

// Función para crear el collage de álbumes
function createAlbumCollage(tracks) {
    // Limpiamos el contenedor
    albumCollage.innerHTML = '';
    
    // Creamos los elementos de álbum
    tracks.forEach((track, index) => {
        if (track.album && track.album.images && track.album.images.length > 0) {
            const albumImage = track.album.images[0].url;
            
            const albumElement = document.createElement('div');
            albumElement.classList.add('album-cover');
            albumElement.style.backgroundImage = `url(${albumImage})`;
            
            // Posición aleatoria dentro del contenedor
            const maxLeft = albumCollage.clientWidth - 120;
            const maxTop = albumCollage.clientHeight - 120;
            const left = Math.random() * maxLeft;
            const top = Math.random() * maxTop;
            
            // Rotación aleatoria
            const rotation = Math.random() * 40 - 20; // entre -20 y 20 grados
            
            // Aplicar estilos
            albumElement.style.left = `${left}px`;
            albumElement.style.top = `${top}px`;
            albumElement.style.transform = `rotate(${rotation}deg)`;
            albumElement.style.zIndex = index;
            
            // Añadir al collage
            albumCollage.appendChild(albumElement);
        }
    });
}

// Función para mostrar los artistas más escuchados
function displayTopArtists(artists) {
    // Limpiamos la lista
    topArtistsList.innerHTML = '';
    
    // Creamos los elementos de artista
    artists.forEach((artist, index) => {
        const artistElement = document.createElement('li');
        artistElement.classList.add('artist-item');
        
        const artistImage = artist.images && artist.images.length > 0 
            ? `<img src="${artist.images[0].url}" alt="${artist.name}" class="artist-image">` 
            : '';
        
        artistElement.innerHTML = `
            ${artistImage}
            <span class="artist-name">${index + 1}. ${artist.name}</span>
        `;
        
        topArtistsList.appendChild(artistElement);
    });
}

// Función para descargar el collage
function downloadCollage() {
    const museumFrame = document.querySelector('.museum-frame');
    
    html2canvas(museumFrame).then(canvas => {
        const link = document.createElement('a');
        link.download = 'mi-museo-musical.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// Función para añadir pequeños movimientos a los álbumes
function addHoverEffects() {
    const albumCovers = document.querySelectorAll('.album-cover');
    
    albumCovers.forEach(album => {
        album.addEventListener('mouseover', () => {
            const randomMove = Math.random() * 5 - 2.5; // entre -2.5 y 2.5 px
            const currentRotation = album.style.transform.match(/-?\d+/)[0];
            album.style.transform = `rotate(${parseInt(currentRotation) + randomMove}deg)`;
        });
    });
}

// Observador para ejecutar efectos después de que se cree el collage
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            addHoverEffects();
        }
    });
});

// Iniciar observador cuando se muestre el collage
observer.observe(albumCollage, { childList: true });

// Función para manejar errores de autenticación
function handleAuthError() {
    alert('Hubo un error al autenticar con Spotify. Por favor, intenta nuevamente.');
    loadingSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
}

// Función para actualizar posición de los álbumes al redimensionar la ventana
window.addEventListener('resize', function() {
    // Sólo actualizar si el collage está visible
    if (!gallerySection.classList.contains('hidden')) {
        const albumCovers = document.querySelectorAll('.album-cover');
        const maxLeft = albumCollage.clientWidth - 120;
        const maxTop = albumCollage.clientHeight - 120;
        
        albumCovers.forEach(album => {
            const left = Math.random() * maxLeft;
            const top = Math.random() * maxTop;
            album.style.left = `${left}px`;
            album.style.top = `${top}px`;
        });
    }
});

// Añadir efecto de profundidad al collage
function addDepthEffect() {
    const albumCovers = document.querySelectorAll('.album-cover');
    
    albumCovers.forEach((album, index) => {
        // Añadir sombras más intensas para crear sensación de profundidad
        const shadowIntensity = Math.random() * 10 + 5; // Entre 5 y 15px
        album.style.boxShadow = `0 ${shadowIntensity}px ${shadowIntensity * 2}px rgba(0, 0, 0, 0.${Math.floor(Math.random() * 5) + 2})`;
        
        // Añadir un poco de escala aleatoria
        const scale = 0.8 + Math.random() * 0.4; // Entre 0.8 y 1.2
        const currentTransform = album.style.transform;
        album.style.transform = `${currentTransform} scale(${scale})`;
        
        // Añadir transición personalizada
        album.style.transition = `all ${0.2 + Math.random() * 0.3}s ease-out`;
    });
}

// Función para verificar la validez del token
async function checkTokenValidity(token) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return response.status === 200;
    } catch (error) {
        console.error('Error al verificar token:', error);
        return false;
    }
}

// Actualizar la función fetchSpotifyData para verificar la validez del token
async function fetchSpotifyData(token) {
    // Verificar validez del token antes de continuar
    const isTokenValid = await checkTokenValidity(token);
    
    if (!isTokenValid) {
        handleAuthError();
        return;
    }
    
    try {
        // Resto del código para obtener datos...
        const topTracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=medium_term', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!topTracksResponse.ok) {
            throw new Error(`Error al obtener canciones: ${topTracksResponse.status}`);
        }
        
        const topTracksData = await topTracksResponse.json();
        
        const topArtistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!topArtistsResponse.ok) {
            throw new Error(`Error al obtener artistas: ${topArtistsResponse.status}`);
        }
        
        const topArtistsData = await topArtistsResponse.json();
        
        createAlbumCollage(topTracksData.items);
        displayTopArtists(topArtistsData.items);
        addDepthEffect(); // Añadir efecto de profundidad
        
        loadingSection.classList.add('hidden');
        gallerySection.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error al obtener datos de Spotify:', error);
        handleAuthError();
    }
}