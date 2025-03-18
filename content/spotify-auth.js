// Configuration for Spotify OAuth
const clientId = 'ba0e68fafbf441958bac79bb94d5412d'; // Replace with your Spotify Client ID
const redirectUri = window.location.origin + window.location.pathname;
const scopes = 'user-top-read';

// Elements
const loginButton = document.getElementById('login-button');
const loginContainer = document.getElementById('login-container');
const artworkContainer = document.getElementById('artwork-container');
const logoutButton = document.getElementById('logout-button');

// Event listeners
loginButton.addEventListener('click', initiateLogin);
logoutButton.addEventListener('click', logout);

// Check if we're coming back from Spotify auth
window.onload = function() {
    const hash = window.location.hash;
    if (hash) {
        const accessToken = extractAccessToken(hash);
        if (accessToken) {
            // Save token and hide login screen
            sessionStorage.setItem('spotify_access_token', accessToken);
            showArtworkInterface();
            
            // Fetch user's top tracks
            fetchTopTracks(accessToken)
                .then(tracks => {
                    // Hide loading animation
                    document.querySelector('.loading-animation').style.opacity = '0';
                    setTimeout(() => {
                        document.querySelector('.loading-animation').classList.add('hidden');
                    }, 500);
                    
                    // Generate artwork
                    generateArtwork(tracks);
                })
                .catch(error => {
                    console.error('Error fetching tracks:', error);
                    alert('Failed to fetch your top tracks. Please try again.');
                    showLoginInterface();
                });
        }
    }
};

// Function to initiate Spotify login
function initiateLogin() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
}

// Extract access token from URL hash
function extractAccessToken(hash) {
    const params = new URLSearchParams(hash.substring(1));
    return params.get('access_token');
}

// Fetch user's top 100 tracks from Spotify API
async function fetchTopTracks(accessToken) {
    // Spotify limits to 50 per request, so we need to make multiple requests
    const allTracks = [];
    
    // First 50 tracks
    const response1 = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    
    const data1 = await response1.json();
    allTracks.push(...data1.items);
    
    // Next 50 tracks
    const response2 = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term&offset=50', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    
    const data2 = await response2.json();
    allTracks.push(...data2.items);
    
    return allTracks.slice(0, 100); // Ensure we only have 100 tracks
}

// UI state functions
function showArtworkInterface() {
    loginContainer.classList.add('hidden');
    artworkContainer.classList.remove('hidden');
}

function showLoginInterface() {
    artworkContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    
    // Clear any previous token
    sessionStorage.removeItem('spotify_access_token');
    
    // Clear URL hash to prevent token leakage
    history.replaceState(null, null, ' ');
}

// Logout function
function logout() {
    // Clear session storage
    sessionStorage.removeItem('spotify_access_token');
    
    // Show login interface
    showLoginInterface();
    
    // Clear URL hash
    history.replaceState(null, null, ' ');
    
    // Reset canvas if needed
    if (typeof resetCanvas === 'function') {
        resetCanvas();
    }
}