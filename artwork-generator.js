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
        
        // Position calculation
        const radius = Math.min(canvas.width, canvas.height) * 0.35;
        const angle = (index / trackData.length) * Math.PI * 2;
        
        // Create particle with track data
        particles.push({
            x: canvas.width / 2 + Math.cos(angle) * radius * Math.random(),
            y: canvas.height / 2 + Math.sin(angle) * radius * Math.random(),
            size: 40 + Math.random() * 30,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            img: img,
            track: track,
            opacity: 0.7 + Math.random() * 0.3,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.01
        });
    });
}

// Reposition particles when canvas is resized
function repositionParticles() {
    particles.forEach((particle, index) => {
        const radius = Math.min(canvas.width, canvas.height) * 0.35;
        const angle = (index / particles.length) * Math.PI * 2;
        
        particle.x = canvas.width / 2 + Math.cos(angle) * radius * Math.random();
        particle.y = canvas.height / 2 + Math.sin(angle) * radius * Math.random();
    });
}

// Animation loop
function animate() {
    // Clear canvas
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    updateParticles();
    
    // Continue animation
    animationId = requestAnimationFrame(animate);
}

// Update particle positions and draw them
function updateParticles() {
    // Draw connections between nearby particles
    drawConnections();
    
    // Update and draw each particle
    particles.forEach(particle => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.rotation += particle.rotationSpeed;
        
        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.speedX *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.speedY *= -1;
        
        // Draw particle with watercolor effect
        drawParticle(particle);
    });
}

// Draw connections between nearby particles
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Draw line if particles are close enough
            if (distance < 150) {
                const opacity = 1 - (distance / 150);
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(29, 185, 84, ${opacity * 0.15})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }
}

// Draw a single particle with artistic effects
function drawParticle(particle) {
    ctx.save();
    
    // Set coordinate system to the particle center
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    
    // Check if this is the hovered particle
    const isHovered = particle === hoveredParticle;
    const size = isHovered ? particle.size * 1.2 : particle.size;
    
    // Draw blurred shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw semi-transparent background for the album cover
    ctx.globalAlpha = particle.opacity;
    
    // Draw album cover with rounded corners and watercolor effect
    ctx.beginPath();
    ctx.roundRect(-size/2, -size/2, size, size, 10);
    ctx.clip();
    
    // Watercolor effect as background
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(29, 185, 84, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(-size/2, -size/2, size, size);
    
    // Draw the actual album cover
    if (particle.img.complete) {
        ctx.drawImage(particle.img, -size/2, -size/2, size, size);
    }
    
    // Add a subtle border if hovered
    if (isHovered) {
        ctx.strokeStyle = '#1DB954';
        ctx.lineWidth = 3;
        ctx.roundRect(-size/2, -size/2, size, size, 10);
        ctx.stroke();
    }
    
    ctx.restore();
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
        
        if (distance < particle.size / 2) {
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