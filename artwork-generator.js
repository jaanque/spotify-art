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
    trackData = tracks.slice(0, 50);
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
    
    // Calcular tamaño de celda con menos espacio entre elementos
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    const padding = Math.min(cellWidth, cellHeight) * 0.1; // Reducir el padding al 10% para elementos más grandes
    
    // Tamaño de marco más grande (aumentado al 85% del tamaño de la celda)
    const frameSize = Math.min(cellWidth, cellHeight) * 0.85;
    
    // Crear partículas en patrón de rejilla
    let index = 0;
    for (let r = 0; r < rows && index < trackData.length; r++) {
        for (let c = 0; c < cols && index < trackData.length; c++) {
            // Crear imagen de la portada del álbum
            const img = new Image();
            img.src = trackData[index].album.images[0].url;
            
            // Cálculo de posición - pequeño offset aleatorio para interés visual
            // Reducir el offset para una distribución más uniforme
            const offsetX = (Math.random() - 0.5) * padding * 0.8;
            const offsetY = (Math.random() - 0.5) * padding * 0.8;
            
            // Calcular posición
            const x = c * cellWidth + cellWidth / 2 + offsetX;
            const y = r * cellHeight + cellHeight / 2 + offsetY;
            
            // Crear partícula con datos de la pista y propiedades del marco
            particles.push({
                x: x,
                y: y,
                size: frameSize, // Tamaño de la portada
                frameSize: frameSize * 0.15, // Tamaño del padding del marco
                img: img,
                track: trackData[index],
                opacity: 1, // Opacidad completa
                rotation: (Math.random() - 0.5) * 0.08, // Inclinación muy ligera para disposición artística
                frameColor: getRandomFrameColor(), // Color aleatorio de marco clásico
                frameStyle: Math.floor(Math.random() * 4), // Diferentes estilos de marco
                shadow: 5 + Math.random() * 10 // Profundidad de la sombra
            });
            
            index++;
        }
    }
    
    // Añadir un pequeño desplazamiento para centrar mejor si hay menos elementos que celdas
    if (trackData.length < rows * cols) {
        const emptyCells = rows * cols - trackData.length;
        const offsetForCentering = (emptyCells * cellWidth / 2) / cols;
        
        // Solo aplicar offset si hay suficientes celdas vacías
        if (emptyCells > cols / 2) {
            particles.forEach(p => {
                p.x += offsetForCentering;
            });
        }
    }
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
    
    // Calculate frame dimensions
    const frameWidth = particle.frameSize; // Frame thickness
    const frameOuterWidth = size + frameWidth * 2;
    const frameOuterHeight = frameOuterWidth;
    
    // Draw shadow for the frame
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = particle.shadow;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // Draw outer frame
    drawFrame(size, frameWidth, particle.frameColor, particle.frameStyle);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw album cover with slight inset
    ctx.save();
    ctx.beginPath();
    ctx.rect(-size/2, -size/2, size, size);
    ctx.clip();
    
    // Draw the album cover
    if (particle.img.complete) {
        ctx.drawImage(particle.img, -size/2, -size/2, size, size);
    }
    
    // Add a subtle texture/canvas effect over image
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillRect(-size/2 + i*size/5, -size/2 + j*size/5, size/5, size/5);
            }
        }
    }
    
    ctx.restore();
    
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

// Draw different frame styles
function drawFrame(size, frameWidth, frameColor, frameStyle) {
    // Common frame setup
    const outerX = -size/2 - frameWidth;
    const outerY = -size/2 - frameWidth;
    const outerWidth = size + frameWidth * 2;
    const outerHeight = size + frameWidth * 2;
    
    switch(frameStyle) {
        case 0: // Classic wooden frame
            // Outer frame
            ctx.fillStyle = frameColor;
            ctx.beginPath();
            ctx.rect(outerX, outerY, outerWidth, outerHeight);
            ctx.rect(-size/2, -size/2, size, size);
            ctx.fill('evenodd');
            
            // Frame detail
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(outerX + frameWidth * 0.25, outerY + frameWidth * 0.25, 
                          outerWidth - frameWidth * 0.5, outerHeight - frameWidth * 0.5);
            break;
            
        case 1: // Ornate gold frame
            // Base frame
            ctx.fillStyle = frameColor;
            ctx.beginPath();
            ctx.rect(outerX, outerY, outerWidth, outerHeight);
            ctx.rect(-size/2, -size/2, size, size);
            ctx.fill('evenodd');
            
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
            // Thin clean frame
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.rect(outerX, outerY, outerWidth, outerHeight);
            ctx.rect(-size/2, -size/2, size, size);
            ctx.fill('evenodd');
            
            // Light inner border
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.strokeRect(-size/2 - 2, -size/2 - 2, size + 4, size + 4);
            break;
            
        case 3: // Distressed vintage frame
            // Base frame
            ctx.fillStyle = frameColor;
            ctx.beginPath();
            ctx.rect(outerX, outerY, outerWidth, outerHeight);
            ctx.rect(-size/2, -size/2, size, size);
            ctx.fill('evenodd');
            
            // Add distressed texture
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 20; i++) {
                const x = outerX + Math.random() * outerWidth;
                const y = outerY + Math.random() * outerHeight;
                const s = Math.random() * 5 + 2;
                
                // Only draw on the frame area
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