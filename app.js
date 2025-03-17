// Elementos del DOM
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const shareBtn = document.getElementById('share-btn');
const userProfile = document.getElementById('user-profile');
const userImage = document.getElementById('user-image');
const userName = document.getElementById('user-name');
const loginContainer = document.getElementById('login-container');
const planetContainer = document.getElementById('planet-container');
const planetScene = document.getElementById('planet-scene');
const musicData = document.getElementById('music-data');
const topArtists = document.getElementById('top-artists');
const topTracks = document.getElementById('top-tracks');
const loading = document.getElementById('loading');
const shareModal = document.getElementById('share-modal');
const closeModal = document.querySelector('.close-modal');
const planetSnapshot = document.getElementById('planet-snapshot');
const downloadBtn = document.getElementById('download-btn');
const twitterShare = document.getElementById('twitter-share');
const facebookShare = document.getElementById('facebook-share');

// Variable global para el generador de planetas
let planetGenerator;

// Datos de usuario
let userData = {
    profile: null,
    topArtists: null,
    topTracks: null,
    topGenres: null,
    playlists: null
};

// Inicializar aplicación
async function init() {
    // Comprobar autenticación
    const auth = SpotifyAuth.checkAuthentication();
    
    if (auth.authenticated) {
        showLoading(true);
        
        try {
            // Obtener datos del usuario
            await loadUserData(auth.accessToken);
            
            // Mostrar perfil de usuario
            displayUserProfile();
            
            // Generar planeta
            createPlanet();
            
            // Mostrar datos musicales
            displayMusicData();
            
            // Mostrar contenido principal
            showMainContent();
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            alert('Ha ocurrido un error al cargar tus datos. Por favor, inténtalo de nuevo.');
        } finally {
            showLoading(false);
        }
    } else {
        // Mostrar vista de login
        loginContainer.classList.remove('hidden');
        userProfile.classList.add('hidden');
        planetContainer.classList.add('hidden');
        musicData.classList.add('hidden');
    }
}

// Cargar datos del usuario
async function loadUserData(accessToken) {
    // Obtener perfil de usuario
    userData.profile = await SpotifyAuth.getUserProfile(accessToken);
    
    // Obtener artistas más escuchados
    userData.topArtists = await SpotifyAuth.getTopArtists(accessToken);
    
    // Obtener canciones más escuchadas
    userData.topTracks = await SpotifyAuth.getTopTracks(accessToken);
    
    // Obtener géneros principales
    userData.topGenres = await SpotifyAuth.getTopGenres(accessToken);
    
    // Obtener playlists
    userData.playlists = await SpotifyAuth.getUserPlaylists(accessToken);
}

// Mostrar perfil de usuario
function displayUserProfile() {
    if (userData.profile) {
        // Mostrar imagen de perfil
        if (userData.profile.images && userData.profile.images.length > 0) {
            userImage.src = userData.profile.images[0].url;
        } else {
            userImage.src = 'default-profile.png'; // Imagen por defecto
        }
        
        // Mostrar nombre de usuario
        userName.textContent = userData.profile.display_name || userData.profile.id;
        
        // Mostrar perfil
        userProfile.classList.remove('hidden');
    }
}

// Crear planeta
function createPlanet() {
    // Inicializar generador de planetas
    planetGenerator = new PlanetGenerator(planetScene, userData);
    
    // Generar planeta
    planetGenerator.generatePlanet();
}

// Mostrar datos musicales
function displayMusicData() {
    // Mostrar artistas principales
    if (userData.topArtists && userData.topArtists.items) {
        topArtists.innerHTML = '';
        
        userData.topArtists.items.slice(0, 5).forEach(artist => {
            const artistElement = document.createElement('li');
            
            // Imagen del artista
            const artistImage = artist.images && artist.images.length > 0 
                ? artist.images[0].url 
                : 'default-artist.png';
            
            artistElement.innerHTML = `
                <img class="artist-img" src="${artistImage}" alt="${artist.name}">
                <div class="artist-info">
                    <div class="artist-name">${artist.name}</div>
                    <div class="artist-genre">${artist.genres.slice(0, 2).join(', ')}</div>
                </div>
            `;
            
            topArtists.appendChild(artistElement);
        });
    }
    
    // Mostrar canciones principales
    if (userData.topTracks && userData.topTracks.items) {
        topTracks.innerHTML = '';
        
        userData.topTracks.items.slice(0, 5).forEach(track => {
            const trackElement = document.createElement('li');
            
            // Imagen del álbum
            const trackImage = track.album.images && track.album.images.length > 0 
                ? track.album.images[0].url 
                : 'default-album.png';
            
                trackElement.innerHTML = `
                <img class="track-img" src="${trackImage}" alt="${track.name}">
                <div class="track-info">
                    <div class="track-name">${track.name}</div>
                    <div class="track-artist">${track.artists.map(a => a.name).join(', ')}</div>
                </div>
            `;
            
            topTracks.appendChild(trackElement);
        });
    }
}

// Mostrar contenido principal
function showMainContent() {
    loginContainer.classList.add('hidden');
    planetContainer.classList.remove('hidden');
    musicData.classList.remove('hidden');
}

// Mostrar/ocultar indicador de carga
function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// Capturar y mostrar imagen del planeta para compartir
function captureAndShowPlanetImage() {
    if (!planetGenerator) return;
    
    // Capturar imagen del planeta
    const imageData = planetGenerator.captureImage();
    
    // Mostrar imagen en el modal
    const context = planetSnapshot.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // Configurar canvas para la imagen
        planetSnapshot.width = img.width;
        planetSnapshot.height = img.height;
        
        // Dibujar imagen
        context.drawImage(img, 0, 0);
        
        // Mostrar modal
        shareModal.classList.remove('hidden');
    };
    
    img.src = imageData;
}

// Descargar imagen del planeta
function downloadPlanetImage() {
    const link = document.createElement('a');
    link.download = `mi-planeta-musical-${Date.now()}.png`;
    link.href = planetSnapshot.toDataURL('image/png');
    link.click();
}

// Compartir en Twitter
function shareOnTwitter() {
    const text = `¡Descubre mi planeta musical único basado en mis datos reales de Spotify! #ExploraTuPlanetaMusical`;
    const url = 'https://exploraturplanetamusical.com'; // URL de la aplicación
    
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

// Compartir en Facebook
function shareOnFacebook() {
    const url = 'https://exploraturplanetamusical.com'; // URL de la aplicación
    
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar aplicación
    init();
    
    // Botón de login
    loginBtn.addEventListener('click', () => {
        SpotifyAuth.loginWithSpotify();
    });
    
    // Botón de logout
    logoutBtn.addEventListener('click', () => {
        SpotifyAuth.logout();
    });
    
    // Botón de compartir
    shareBtn.addEventListener('click', () => {
        captureAndShowPlanetImage();
    });
    
    // Cerrar modal
    closeModal.addEventListener('click', () => {
        shareModal.classList.add('hidden');
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === shareModal) {
            shareModal.classList.add('hidden');
        }
    });
    
    // Botón de descargar imagen
    downloadBtn.addEventListener('click', downloadPlanetImage);
    
    // Botón de compartir en Twitter
    twitterShare.addEventListener('click', shareOnTwitter);
    
    // Botón de compartir en Facebook
    facebookShare.addEventListener('click', shareOnFacebook);
});

// Crear estrellas de fondo dinámicas
function createStars() {
    const stars = document.getElementById('stars');
    const starsCount = 200;
    
    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Posición aleatoria
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Tamaño aleatorio
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Brillo aleatorio
        star.style.opacity = Math.random() * 0.8 + 0.2;
        
        // Animación aleatoria
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        stars.appendChild(star);
    }
}

// Crear estrellas al cargar
window.addEventListener('load', createStars);