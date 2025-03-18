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
        repositionParticles();
    }
}

// Main function to generate artwork from track data
function generateArtwork(tracks) {
    trackData = tracks;
    initCanvas();
    
    // Create particles from tracks
    createParticles();
    
    // Start animation loop
    animate();
    
    // Preload images for better performance
    preloadImages(tracks);
    
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
    });
}

// Create particles from track data
function createParticles() {
    particles = [];
    
    trackData.forEach((track, index) => {
        // Create image from album cover
        const img = new Image();
        img.src = track.album.images[0].url;
        
        // Position calculation - distribute across museum wall
        // Use golden ratio layout to avoid perfect grid and look more like art gallery
        const phi = 1.618033988749895;
        const angle = index * phi * Math.PI * 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.4 * Math.sqrt(index / trackData.length);
        
        // Randomize positions a bit for organic layout
        const randomX = (Math.random() - 0.5) * 100;
        const randomY = (Math.random() - 0.5) * 100;
        
        // Create particle with track data and frame properties
        particles.push({
            x: canvas.width / 2 + Math.cos(angle) * radius + randomX,
            y: canvas.height / 2 + Math.sin(angle) * radius + randomY,
            size: 40 + Math.random() * 30, // Size of the cover
            frameSize: 0, // Frame size padding, will be calculated during drawing
            speedX: (Math.random() - 0.5) * 0.2, // Slower movement for museum feel
            speedY: (Math.random() - 0.5) * 0.2,
            img: img,
            track: track,
            opacity: 0.9 + Math.random() * 0.1, // More solid for framed artwork
            rotation: (Math.random() - 0.5) * 0.2, // Slight tilt for artistic arrangement
            rotationSpeed: (Math.random() - 0.5) * 0.002, // Very slow rotation
            frameColor: getRandomFrameColor(), // Random classic frame color
            frameStyle: Math.floor(Math.random() * 4), // Different frame styles
            shadow: 5 + Math.random() * 15 // Shadow depth
        });
    });
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

// Reposition particles when canvas is resized
function repositionParticles() {
    particles.forEach((particle, index) => {
        const phi = 1.618033988749895;
        const angle = index * phi * Math.PI * 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.4 * Math.sqrt(index / particles.length);
        
        const randomX = (Math.random() - 0.5) * 100;
        const randomY = (Math.random() - 0.5) * 100;
        
        particle.x = canvas.width / 2 + Math.cos(angle) * radius + randomX;
        particle.y = canvas.height / 2 + Math.sin(angle) * radius + randomY;
    });
}

// Animation loop
function animate() {
    // Semi-transparent clearing for motion trails
    ctx.fillStyle = 'rgba(245, 245, 240, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    updateParticles();
    
    // Continue animation
    animationId = requestAnimationFrame(animate);
}

// Update particle positions and draw them
function updateParticles() {
    // Sort particles by y position to create proper depth
    particles.sort((a, b) => a.y - b.y);
    
    // Draw particles
    particles.forEach(particle => {
        // Move particle very gently, like floating paintings
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.rotation += particle.rotationSpeed;
        
        // Bounce off edges with damping
        if (particle.x <= particle.size || particle.x >= canvas.width - particle.size) {
            particle.speedX *= -0.9;
        }
        if (particle.y <= particle.size || particle.y >= canvas.height - particle.size) {
            particle.speedY *= -0.9;
        }
        
        // Draw particle with frame
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
    const frameWidth = size * 0.15; // Frame thickness
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