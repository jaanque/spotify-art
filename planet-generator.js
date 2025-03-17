// Clase generadora del planeta
class PlanetGenerator {
    constructor(container, userData) {
        this.container = container;
        this.userData = userData;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.planet = null;
        this.controls = null;
        
        // Colores basados en géneros musicales
        this.genreColors = {
            'pop': 0xFF69B4,       // Rosa
            'rock': 0xCD5C5C,      // Rojo
            'hip hop': 0xFFA500,   // Naranja
            'rap': 0xFFD700,       // Dorado
            'electronic': 0x00FFFF, // Cian
            'dance': 0x9370DB,     // Púrpura
            'r&b': 0x4682B4,       // Azul acero
            'indie': 0x32CD32,     // Verde lima
            'alternative': 0x5F9EA0, // Azul verdoso
            'jazz': 0x8B4513,      // Marrón
            'classical': 0xFFFFE0,  // Amarillo claro
            'metal': 0x696969,     // Gris oscuro
            'folk': 0xD2B48C,      // Tan
            'country': 0xF4A460,   // Marrón arena
            'latin': 0xFF6347      // Tomate
        };
        
        // Colores por defecto para otros géneros
        this.defaultColors = [
            0x3498db, 0x9b59b6, 0x2ecc71, 0xe74c3c, 0xf1c40f,
            0x1abc9c, 0xd35400, 0x34495e, 0x16a085, 0x2980b9
        ];
        
        this.init();
    }
    
    // Inicializar escena 3D
    init() {
        // Crear escena
        this.scene = new THREE.Scene();
        
        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 5;
        
        // Crear renderizador
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        // Añadir luces
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);
        
        // Iniciar animación
        this.animate();
        
        // Manejar redimensionamiento
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    // Generar planeta basado en datos de usuario
    generatePlanet() {
        // Eliminar planeta anterior si existe
        if (this.planet) {
            this.scene.remove(this.planet);
        }
        
        // Crear grupo contenedor para el planeta
        this.planet = new THREE.Group();
        
        // Crear esfera base del planeta
        const planetGeometry = new THREE.SphereGeometry(2, 64, 64);
        const planetMaterial = new THREE.MeshPhongMaterial({
            color: 0x1A1A2E,
            shininess: 10,
            flatShading: false
        });
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        this.planet.add(planetMesh);
        
        // Añadir continentes basados en géneros musicales
        this.addContinents();
        
        // Añadir montañas basadas en artistas principales
        this.addMountains();
        
        // Añadir océanos basados en playlists
        this.addOceans();
        
        // Añadir ciudades basadas en canciones favoritas
        this.addCities();
        
        // Añadir atmósfera
        this.addAtmosphere();
        
        // Añadir planeta a la escena
        this.scene.add(this.planet);
        
        // Añadir rotación inicial aleatoria
        this.planet.rotation.y = Math.random() * Math.PI * 2;
        
        return this;
    }
    
    // Añadir continentes basados en géneros musicales
    addContinents() {
        const { topGenres } = this.userData;
        if (!topGenres || topGenres.length === 0) return;
        
        // Calcular total para porcentajes
        const totalCount = topGenres.reduce((sum, genre) => sum + genre.count, 0);
        
        // Limitamos a los 6 principales géneros para continentes
        const mainGenres = topGenres.slice(0, 6);
        
        mainGenres.forEach((genre, index) => {
            // Calcular tamaño proporcional
            const size = 0.5 + (genre.count / totalCount) * 2;
            
            // Determinar color del continente
            let continentColor;
            
            // Buscar en mapa de colores o usar color por defecto
            for (const key in this.genreColors) {
                if (genre.name.includes(key)) {
                    continentColor = this.genreColors[key];
                    break;
                }
            }
            
            // Si no se encontró un color específico, usar uno del array predeterminado
            if (!continentColor) {
                continentColor = this.defaultColors[index % this.defaultColors.length];
            }
            
            // Crear geometría del continente
            const continentGeometry = new THREE.SphereGeometry(size, 32, 32);
            const continentMaterial = new THREE.MeshPhongMaterial({
                color: continentColor,
                shininess: 5,
                flatShading: true
            });
            
            // Crear y posicionar el continente
            const continent = new THREE.Mesh(continentGeometry, continentMaterial);
            
            // Posicionar el continente en diferentes áreas del planeta
            const phi = Math.acos(-1 + (2 * index) / mainGenres.length);
            const theta = Math.sqrt(mainGenres.length * Math.PI) * phi;
            
            // Ajustar la posición para que los continentes estén sobre la superficie
            continent.position.set(
                2.1 * Math.cos(theta) * Math.sin(phi),
                2.1 * Math.sin(theta) * Math.sin(phi),
                2.1 * Math.cos(phi)
            );
            
            // Escalar el continente para que parezca parte de la superficie
            continent.scale.set(0.5, 0.3, 0.5);
            
            // Añadir datos para interactividad
            continent.userData = {
                type: 'continent',
                name: genre.name,
                value: genre.count,
                percentage: ((genre.count / totalCount) * 100).toFixed(1) + '%'
            };
            
            this.planet.add(continent);
        });
    }
    
    // Añadir montañas basadas en artistas principales
    addMountains() {
        const { topArtists } = this.userData;
        if (!topArtists || topArtists.items.length === 0) return;
        
        // Limitamos a los 5 principales artistas para montañas
        const mainArtists = topArtists.items.slice(0, 5);
        
        mainArtists.forEach((artist, index) => {
            // Calcular altura proporcional (1 al 5 para el más popular)
            const heightFactor = 1 + ((5 - index) * 0.2);
            
            // Crear geometría de la montaña (cono)
            const mountainGeometry = new THREE.ConeGeometry(0.2, heightFactor, 5);
            const mountainMaterial = new THREE.MeshPhongMaterial({
                color: 0xC0C0C0,
                shininess: 30,
                flatShading: true
            });
            
            // Crear y posicionar la montaña
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            
            // Posicionar en diferentes áreas del planeta
            const phi = Math.acos(-1 + (2 * index) / mainArtists.length);
            const theta = Math.sqrt(mainArtists.length * Math.PI) * phi;
            
            // Ajustar la posición para que las montañas estén sobre la superficie
            mountain.position.set(
                2 * Math.cos(theta) * Math.sin(phi),
                2 * Math.sin(theta) * Math.sin(phi),
                2 * Math.cos(phi)
            );
            
            // Orientar la montaña hacia afuera del planeta
            mountain.lookAt(0, 0, 0);
            mountain.rotateX(Math.PI / 2);
            
            // Añadir datos para interactividad
            mountain.userData = {
                type: 'mountain',
                name: artist.name,
                popularity: artist.popularity,
                genres: artist.genres.join(', ')
            };
            
            this.planet.add(mountain);
        });
    }
    
    // Añadir océanos basados en playlists
    addOceans() {
        const { playlists } = this.userData;
        if (!playlists || playlists.items.length === 0) return;
        
        // Crear un material para los océanos
        const oceanMaterial = new THREE.MeshPhongMaterial({
            color: 0x1E90FF,
            transparent: true,
            opacity: 0.7,
            shininess: 90
        });
        
        // Limitamos a las 3 principales playlists para océanos
        const mainPlaylists = playlists.items.slice(0, 3);
        
        mainPlaylists.forEach((playlist, index) => {
            // Crear geometría del océano (anillo)
            const oceanGeometry = new THREE.TorusGeometry(2.05, 0.05, 16, 100);
            
            // Crear y posicionar el océano
            const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
            
            // Rotar el océano para que estén en diferentes orientaciones
            ocean.rotation.x = Math.PI / 2;
            ocean.rotation.y = (index * Math.PI) / mainPlaylists.length;
            
            // Añadir datos para interactividad
            ocean.userData = {
                type: 'ocean',
                name: playlist.name,
                tracks: playlist.tracks.total,
                owner: playlist.owner.display_name
            };
            
            this.planet.add(ocean);
        });
    }
    
    // Añadir ciudades basadas en canciones favoritas
    addCities() {
        const { topTracks } = this.userData;
        if (!topTracks || topTracks.items.length === 0) return;
        
        // Limitamos a las 10 principales canciones para ciudades
        const mainTracks = topTracks.items.slice(0, 10);
        
        mainTracks.forEach((track, index) => {
            // Crear geometría de la ciudad (pequeña esfera)
            const cityGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            
            // Crear material con brillo basado en popularidad
            const brightness = (track.popularity / 100) * 0.8 + 0.2;
            const cityMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                emissive: 0xFFFF00,
                emissiveIntensity: brightness,
                shininess: 100
            });
            
            // Crear y posicionar la ciudad
            const city = new THREE.Mesh(cityGeometry, cityMaterial);
            
            // Posicionar en diferentes áreas del planeta
            const phi = Math.acos(-1 + (2 * index) / mainTracks.length);
            const theta = Math.sqrt(mainTracks.length * Math.PI) * phi;
            
            // Ajustar la posición para que las ciudades estén sobre la superficie
            city.position.set(
                2.1 * Math.cos(theta) * Math.sin(phi),
                2.1 * Math.sin(theta) * Math.sin(phi),
                2.1 * Math.cos(phi)
            );
            
            // Añadir datos para interactividad
            city.userData = {
                type: 'city',
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                popularity: track.popularity
            };
            
            this.planet.add(city);
            
            // Añadir efecto de luz (punto de luz)
            const light = new THREE.PointLight(0xFFFF00, brightness * 2, 0.5);
            light.position.copy(city.position);
            this.planet.add(light);
        });
    }
    
    // Añadir atmósfera
    addAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(2.2, 32, 32);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.planet.add(atmosphere);
    }
    
    // Animar el planeta
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotar el planeta lentamente
        if (this.planet) {
            this.planet.rotation.y += 0.001;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Ajustar vista al redimensionar la ventana
    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    // Capturar imagen del planeta
    captureImage() {
        // Guardar estado actual
        const currentRotation = this.planet ? { ...this.planet.rotation } : null;
        
        // Ajustar planeta para captura
        if (this.planet) {
            // Posicionar el planeta para mejor vista
            this.planet.rotation.x = 0.3;
            this.planet.rotation.y = 0.5;
            this.planet.rotation.z = 0;
        }
        
        // Renderizar la escena
        this.renderer.render(this.scene, this.camera);
        
        // Obtener imagen
        const imageData = this.renderer.domElement.toDataURL('image/png');
        
        // Restaurar estado original
        if (this.planet && currentRotation) {
            this.planet.rotation.x = currentRotation.x;
            this.planet.rotation.y = currentRotation.y;
            this.planet.rotation.z = currentRotation.z;
        }
        
        return imageData;
    }
}

// Exportar clase
window.PlanetGenerator = PlanetGenerator;