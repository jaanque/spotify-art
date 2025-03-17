// Elementos del DOM
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const downloadButton = document.getElementById('download-button');
const loginContainer = document.getElementById('login-container');
const museumContainer = document.getElementById('museum-container');
const topArtistsList = document.getElementById('top-artists');
const loadingElement = document.getElementById('loading');
const museumSceneElement = document.getElementById('museum-scene');

// Instancia de la escena del museo
let museumScene = null;

// Función para inicializar la aplicación
function initApp() {
    // Eventos de los botones
    loginButton.addEventListener('click', loginWithSpotify);
    logoutButton.addEventListener('click', logout);
    downloadButton.addEventListener('click', downloadArtwork);
    
    // Comprobar si hay un token de acceso válido
    const accessToken = getValidAccessToken();
    
    if (accessToken) {
        // Si hay un token válido, cargar la experiencia del museo
        loadMuseumExperience(accessToken);
    } else {
        // Mostrar la pantalla de inicio de sesión
        loginContainer.classList.remove('hidden');
        museumContainer.classList.add('hidden');
    }
}

// Cargar la experiencia del museo
async function loadMuseumExperience(accessToken) {
    try {
        // Ocultar la pantalla de inicio de sesión y mostrar la carga
        loginContainer.classList.add('hidden');
        museumContainer.classList.remove('hidden');
        loadingElement.classList.remove('hidden');
        
        // Obtener datos del usuario
        const userData = await getUserData(accessToken);
        
        if (!userData) {
            throw new Error('No se pudieron obtener los datos del usuario');
        }
        
        // Obtener los artistas más escuchados
        const topArtists = await getTopArtists(accessToken);
        
        // Obtener las canciones más escuchadas (para las portadas de álbumes)
        // Ahora solicitamos 50 canciones en lugar de 20 para tener más portadas
        const topTracks = await getTopTracks(accessToken, 50);
        
        // Agregar también canciones de diferentes períodos de tiempo para mayor variedad
        const recentTracks = await getRecentlyPlayedTracks(accessToken, 30);
        
        // Combinar todos los tracks para tener mayor variedad de portadas
        const allTracks = [...topTracks, ...recentTracks];
        
        // Mostrar los artistas favoritos
        displayTopArtists(topArtists);
        
        // Inicializar la escena del museo
        museumScene = new MuseumScene(museumSceneElement);
        
        // Cargar las portadas de los álbumes
        museumScene.loadAlbumCovers(allTracks);
        
        // Ocultar la carga una vez que todo esté listo
        loadingElement.classList.add('hidden');
        
    } catch (error) {
        console.error('Error al cargar la experiencia:', error);
        // Mostrar mensaje de error
        alert('Ha ocurrido un error al cargar tu experiencia. Por favor, inténtalo de nuevo.');
        logout();
    }
}

// Mostrar los artistas favoritos
function displayTopArtists(artists) {
    // Limpiar la lista
    topArtistsList.innerHTML = '';
    
    // Añadir cada artista a la lista
    artists.forEach(artist => {
        const li = document.createElement('li');
        li.textContent = artist.name;
        topArtistsList.appendChild(li);
    });
}

// Descargar la obra de arte
function downloadArtwork() {
    if (!museumScene) return;
    
    const imgData = museumScene.captureImage();
    
    // Crear un enlace para descargar la imagen
    const downloadLink = document.createElement('a');
    downloadLink.href = imgData;
    downloadLink.download = 'mi-museo-musical.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);