// Elements
const canvas = document.getElementById('flow-canvas');
const trackInfoPanel = document.getElementById('track-info');
const closeBtn = document.querySelector('.close-btn');
const detailCover = document.getElementById('detail-cover');
const detailTitle = document.getElementById('detail-title');
const detailArtist = document.getElementById('detail-artist');
const detailAlbum = document.getElementById('detail-album');
const audioPreview = document.getElementById('audio-preview');
const previewButton = document.getElementById('preview-button');
const openSpotifyLink = document.getElementById('open-spotify');

// Global variables
let ctx;
let particles = [];
let trackData = [];
let animationId;
let hoveredParticle = null;
let frameImage = new Image(); // Frame image
frameImage.src = '/api/placeholder/200/200'; // Placeholder for frame (would be an actual frame image in production)

// Event listeners
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('click', handleCanvasClick);
closeBtn.addEventListener('click', hideTrackInfo);
previewButton.addEventListener('click', toggleAudioPreview);

// Initialize canvas
function initCanvas() {
    ctx = canvas.getContext('2d');
    resizeCanvas();
}

// Resize canvas to fill container
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    if (trackData.length > 0) {
        // Reposition particles when canvas is resized
        createParticles(); // Recreate particles to ensure proper positioning
    }
}

// Main function to generate artwork from track data
function generateArtwork(tracks) {
    // Solo tomar los primeros 50 tracks en lugar de todos
    trackData = tracks.slice(0, 80);
    initCanvas();
    
    // Create particles from tracks
    createParticles();
    
    // Draw static layout (no animation)
    drawStaticLayout();
    
    // Preload images for better performance
    preloadImages(trackData);
    
    // Set background for the canvas to look like museum wall
    canvas.parentElement.style.backgroundColor = '#F5F5F0';
    canvas.parentElement.style.backgroundImage = 'linear-gradient(rgba(240, 240, 235, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(240, 240, 235, 0.8) 1px, transparent 1px)';
    canvas.parentElement.style.backgroundSize = '20px 20px';
}

// Preload album cover images
function preloadImages(tracks) {
    tracks.forEach(track => {
        const img = new Image();
        img.src = track.album.images[0].url;
        img.onload = () => {
            // Redraw once images are loaded
            drawStaticLayout();
        };
    });
}

// Create particles from track data - usando un layout optimizado para 50 elementos
function createParticles() {
    particles = [];
    
    // Calculate grid dimensions based on number of tracks (ahora 50 máximo)
    const itemCount = trackData.length;
    const aspectRatio = canvas.width / canvas.height;
    
    // Calcular filas y columnas para una distribución óptima
    // Para 50 elementos, una buena distribución podría ser 7x7 o 8x6 dependiendo del aspect ratio
    let cols = Math.round(Math.sqrt(itemCount * aspectRatio));
    let rows = Math.ceil(itemCount / cols);
    
    // Asegurarnos de tener suficientes celdas
    while (rows * cols < itemCount) {
        cols++;
    }
    
    // Calcular tamaño de celda sin espacio extra
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    
    // Tamaño de marco usando 100% del tamaño de la celda
    const frameSize = Math.min(cellWidth, cellHeight) * 1.0;
    
    // Crear partículas en patrón de rejilla - eliminando offsets
    let index = 0;
    for (let r = 0; r < rows && index < trackData.length; r++) {
        for (let c = 0; c < cols && index < trackData.length; c++) {
            // Crear imagen de la portada del álbum
            const img = new Image();
            img.src = trackData[index].album.images[0].url;
            
            // Posicionamiento exacto sin margen extra
            // Usar posicionamiento absoluto desde el borde izquierdo
            const x = c * cellWidth + (cellWidth / 2);
            const y = r * cellHeight + (cellHeight / 2);
            
            // Crear partícula con datos de la pista y propiedades del marco
            particles.push({
                x: x,
                y: y,
                size: frameSize, // Tamaño de la portada
                frameSize: frameSize * 0.08, // Reducir el padding del marco
                img: img,
                track: trackData[index],
                opacity: 1, // Opacidad completa
                rotation: 0, // Sin inclinación
                frameColor: getRandomFrameColor(), // Color aleatorio de marco clásico
                frameStyle: Math.floor(Math.random() * 4), // Diferentes estilos de marco
                shadow: 5 + Math.random() * 10 // Profundidad de la sombra
            });
            
            index++;
        }
    }
    
    // Eliminamos completamente el offset para centrado, para asegurar que
    // no haya margen extra a la izquierda
}

// Get random classic frame colors
function getRandomFrameColor() {
    const frameColors = [
        '#8B4513', // Saddle Brown
        '#A0522D', // Sienna
        '#CD853F', // Peru
        '#D2B48C', // Tan
        '#5C4033', // Dark Brown
        '#DEB887', // Burlywood
        '#DAA520', // Goldenrod
        '#B8860B', // Dark Goldenrod
        '#000000', // Black
        '#696969'  // Dim Gray
    ];
    return frameColors[Math.floor(Math.random() * frameColors.length)];
}

// Draw static layout (no animation)
function drawStaticLayout() {
    // Clear canvas
    ctx.fillStyle = 'rgba(245, 245, 240, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Sort particles by y position to create proper depth
    particles.sort((a, b) => a.y - b.y);
    
    // Draw particles
    particles.forEach(particle => {
        drawFramedParticle(particle);
    });
}

// Draw a particle with a painting frame
function drawFramedParticle(particle) {
    ctx.save();
    
    // Set coordinate system to the particle center
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    
    // Check if this is the hovered particle
    const isHovered = particle === hoveredParticle;
    const size = isHovered ? particle.size * 1.1 : particle.size;
    
    // Calculate frame dimensions - reducimos el tamaño del marco
    const frameWidth = particle.frameSize; // Frame thickness
    
    // Draw shadow for the frame
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = particle.shadow;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // Draw the complete frame as a solid rectangle
    const outerX = -size/2 - frameWidth;
    const outerY = -size/2 - frameWidth;
    const outerWidth = size + frameWidth * 2;
    const outerHeight = size + frameWidth * 2;
    
    ctx.fillStyle = particle.frameColor;
    ctx.fillRect(outerX, outerY, outerWidth, outerHeight);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw album cover directly on the frame with no gap
    // Slightly larger than the inner frame area to completely eliminate gaps
    const coverSize = size + 1; // Aumentamos para asegurar que no haya espacios
    
    if (particle.img.complete) {
        // Draw the image just slightly larger than the inner frame area
        ctx.drawImage(particle.img, -coverSize/2, -coverSize/2, coverSize, coverSize);
    }
    
    // Add frame details without disturbing the cover
    drawFrameDetails(size, frameWidth, particle.frameColor, particle.frameStyle);
    
    // Add a gold plate under the frame if hovered
    if (isHovered) {
        const plateHeight = frameWidth * 1.5;
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.roundRect(-size/3, size/2 + frameWidth, size*2/3, plateHeight, 3);
        ctx.fill();
        
        // Add artist name on the plate
        ctx.fillStyle = '#000';
        ctx.font = `${plateHeight * 0.6}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Get just the first artist for the plate
        const artistName = particle.track.artists[0].name;
        ctx.fillText(artistName, 0, size/2 + frameWidth + plateHeight/2);
    }
    
    ctx.restore();
}

// New function to draw frame details without affecting the cover
function drawFrameDetails(size, frameWidth, frameColor, frameStyle) {
    const outerX = -size/2 - frameWidth;
    const outerY = -size/2 - frameWidth;
    const outerWidth = size + frameWidth * 2;
    const outerHeight = size + frameWidth * 2;
    
    // Inner frame border (directly against the album cover)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(-size/2, -size/2, size, size);
    
    switch(frameStyle) {
        case 0: // Classic wooden frame
            // Frame detail
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(outerX + frameWidth * 0.25, outerY + frameWidth * 0.25, 
                          outerWidth - frameWidth * 0.5, outerHeight - frameWidth * 0.5);
            break;
            
        case 1: // Ornate gold frame
            // Gold details
            ctx.fillStyle = '#D4AF37';
            
            // Corner ornaments
            const ornamentSize = frameWidth * 0.7;
            // Top left
            ctx.beginPath();
            ctx.arc(outerX + frameWidth, outerY + frameWidth, ornamentSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Top right
            ctx.beginPath();
            ctx.arc(outerX + outerWidth - frameWidth, outerY + frameWidth, ornamentSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Bottom left
            ctx.beginPath();
            ctx.arc(outerX + frameWidth, outerY + outerHeight - frameWidth, ornamentSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Bottom right
            ctx.beginPath();
            ctx.arc(outerX + outerWidth - frameWidth, outerY + outerHeight - frameWidth, ornamentSize, 0, Math.PI * 2);
            ctx.fill();
            break;
            
        case 2: // Modern minimalist frame
            // No inner border for minimalist frame
            break;
            
        case 3: // Distressed vintage frame
            // Add distressed texture
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 20; i++) {
                const x = outerX + Math.random() * outerWidth;
                const y = outerY + Math.random() * outerHeight;
                const s = Math.random() * 5 + 2;
                
                // Only draw on the frame area - ensure no overlap with album cover
                if (x > -size/2 && x < size/2 && y > -size/2 && y < size/2) continue;
                
                ctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
                ctx.beginPath();
                ctx.rect(x, y, s, s);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            break;
    }
}

// Handle mouse movement for hover effects
function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Find particle under cursor
    const previousHoveredParticle = hoveredParticle;
    hoveredParticle = null;
    canvas.style.cursor = 'default';
    
    for (const particle of particles) {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Use larger detection area to include frame
        if (distance < particle.size * 0.75) {
            hoveredParticle = particle;
            canvas.style.cursor = 'pointer';
            break;
        }
    }
    
    // Only redraw if hover state changed
    if (previousHoveredParticle !== hoveredParticle) {
        drawStaticLayout();
    }
}

// Handle canvas clicks to show track info
function handleCanvasClick(e) {
    if (hoveredParticle) {
        showTrackInfo(hoveredParticle.track);
    }
}

// Show track information panel
function showTrackInfo(track) {
    // Set track details
    detailCover.src = track.album.images[0].url;
    detailTitle.textContent = track.name;
    detailArtist.textContent = track.artists.map(artist => artist.name).join(', ');
    detailAlbum.textContent = track.album.name;
    
    // Set preview URL if available
    if (track.preview_url) {
        audioPreview.src = track.preview_url;
        previewButton.disabled = false;
    } else {
        audioPreview.src = '';
        previewButton.disabled = true;
    }
    
    // Set Spotify link
    openSpotifyLink.href = track.external_urls.spotify;
    
    // Show panel
    trackInfoPanel.classList.remove('hidden');
    
    // Reset audio state
    audioPreview.pause();
    audioPreview.currentTime = 0;
    audioPreview.classList.add('hidden');
}

// Hide track information panel
function hideTrackInfo() {
    trackInfoPanel.classList.add('hidden');
    audioPreview.pause();
}

// Toggle audio preview playback
function toggleAudioPreview() {
    if (audioPreview.classList.contains('hidden')) {
        audioPreview.classList.remove('hidden');
        audioPreview.play();
        previewButton.textContent = 'Pause';
    } else if (audioPreview.paused) {
        audioPreview.play();
        previewButton.textContent = 'Pause';
    } else {
        audioPreview.pause();
        previewButton.textContent = 'Preview';
    }
}

// Reset canvas when logging out
function resetCanvas() {
    // Clear animation frame if it exists
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // Clear particles array
    particles = [];
    
    // Reset track data
    trackData = [];
    
    // Clear canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Reset hover state
    hoveredParticle = null;
}

// Función mejorada para capturar y compartir el canvas
function captureAndShare() {
    // Mostrar una animación de carga mientras se captura
    const loadingAnimation = document.querySelector('.loading-animation');
    if (loadingAnimation) {
        loadingAnimation.classList.remove('hidden');
        const loadingText = loadingAnimation.querySelector('p');
        if (loadingText) loadingText.textContent = 'Preparando imagen para compartir...';
    }
    
    setTimeout(() => {
        try {
            // Referencia al canvas
            const canvas = document.getElementById('flow-canvas');
            
            if (!canvas) {
                throw new Error('No se pudo encontrar el canvas');
            }
            
            // Verificar que el canvas tenga contenido
            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error('El canvas está vacío');
            }
            
            // Asegurarse de que el canvas esté limpio y renderizado
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('No se pudo obtener el contexto del canvas');
            }
            
            // Intentar capturar la imagen del canvas
            let dataUrl;
            try {
                dataUrl = canvas.toDataURL('image/png');
                
                // Verificar que el dataUrl sea válido (no sea el dataUrl de un canvas vacío)
                if (dataUrl === 'data:,' || dataUrl === 'data:image/png;base64,') {
                    throw new Error('El canvas generó una imagen vacía');
                }
            } catch (e) {
                console.error('Error al obtener dataURL del canvas:', e);
                
                // Alternativa: usar html2canvas para capturar el contenedor completo
                const canvasContainer = document.getElementById('canvas-container');
                if (!canvasContainer) {
                    throw new Error('No se pudo encontrar el contenedor del canvas');
                }
                
                // Si tenemos html2canvas disponible, lo usamos
                if (typeof html2canvas === 'function') {
                    html2canvas(canvasContainer).then(capturedCanvas => {
                        const capturedDataUrl = capturedCanvas.toDataURL('image/png');
                        processDataUrlAndShare(capturedDataUrl);
                    }).catch(err => {
                        console.error('Error con html2canvas:', err);
                        showError('No se pudo capturar la imagen');
                    });
                    return;
                } else {
                    throw new Error('No hay método disponible para capturar la imagen');
                }
            }
            
            // Si llegamos aquí, tenemos un dataUrl válido
            processDataUrlAndShare(dataUrl);
            
        } catch (error) {
            console.error('Error al capturar el canvas:', error);
            showError('No se pudo compartir la imagen: ' + error.message);
        }
    }, 300);
}

// Función para procesar el dataUrl y compartirlo
function processDataUrlAndShare(dataUrl) {
    // Convertir el dataURL a Blob para compartir
    fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
            // Crear un objeto de archivo
            const file = new File([blob], 'mi-musica-flow.png', { type: 'image/png' });
            
            // Verificar si el navegador soporta la API de compartir con archivos
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    title: 'Mi Música Flow',
                    text: 'Mira mi colección de música visualizada como una galería de arte',
                    files: [file]
                }).catch(error => {
                    console.error('Error al compartir:', error);
                    fallbackShare(dataUrl);
                }).finally(() => {
                    hideLoading();
                });
            } else {
                // Verificar si soporta compartir sin archivos
                if (navigator.share) {
                    navigator.share({
                        title: 'Mi Música Flow',
                        text: 'Mira mi colección de música visualizada como una galería de arte',
                        url: document.location.href
                    }).catch(() => {
                        fallbackShare(dataUrl);
                    }).finally(() => {
                        hideLoading();
                    });
                } else {
                    fallbackShare(dataUrl);
                    hideLoading();
                }
            }
        })
        .catch(error => {
            console.error('Error al procesar la imagen:', error);
            showError('No se pudo procesar la imagen para compartir');
        });
}

// Función mejorada de respaldo para navegadores que no soportan la API de compartir
function fallbackShare(dataUrl) {
    try {
        // Crear un elemento ancla
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'mi-musica-flow.png';
        
        // Simular click para descargar
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Notificar al usuario
        showMessage('La imagen se ha descargado. Puedes compartirla manualmente.');
    } catch (error) {
        console.error('Error en fallback:', error);
        showError('No se pudo descargar la imagen');
    }
}

// Funciones auxiliares para UI
function hideLoading() {
    const loadingAnimation = document.querySelector('.loading-animation');
    if (loadingAnimation) loadingAnimation.classList.add('hidden');
}

function showError(message) {
    hideLoading();
    alert(message || 'Ocurrió un error al compartir. Inténtalo de nuevo.');
}

function showMessage(message) {
    hideLoading();
    alert(message);
}

// Agregar event listener al botón de compartir
document.addEventListener('DOMContentLoaded', () => {
    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.addEventListener('click', captureAndShare);
    }
});

// Añadir script para html2canvas (alternativa de captura)
function loadHtml2Canvas() {
    if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        document.head.appendChild(script);
    }
}

// Cargar html2canvas al iniciar
document.addEventListener('DOMContentLoaded', loadHtml2Canvas);