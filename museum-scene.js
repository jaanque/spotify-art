class MuseumScene {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.frame = null;
        this.albums = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clock = new THREE.Clock();
        this.albumsGroup = null;
        this.frameTexture = null;
        
        this.init();
    }
    
    init() {
        // Crear la escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x121212);
        
        // Crear la cámara
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        
        // Crear el renderizador
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
        
        // Añadir luces
        this.addLights();
        
        // Crear la sala del museo
        this.createMuseumRoom();
        
        // Crear el marco para las portadas
        this.createFrame();
        
        // Crear el grupo para las portadas de álbumes
        this.albumsGroup = new THREE.Group();
        this.albumsGroup.position.set(0, 0, 0.1);
        this.scene.add(this.albumsGroup);
        
        // Añadir eventos de interacción
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Iniciar la animación
        this.animate();
    }
    
    addLights() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Luz direccional principal (simula luz de techo)
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(0, 10, 10);
        mainLight.castShadow = true;
        this.scene.add(mainLight);
        
        // Luz de acento para el cuadro
        const spotLight = new THREE.SpotLight(0xffffff, 1.5);
        spotLight.position.set(0, 0, 10);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.1;
        spotLight.decay = 2;
        spotLight.distance = 50;
        spotLight.castShadow = true;
        this.scene.add(spotLight);
        
        // Luces de relleno
        const fillLight1 = new THREE.PointLight(0xffffee, 0.5);
        fillLight1.position.set(-10, 0, 10);
        this.scene.add(fillLight1);
        
        const fillLight2 = new THREE.PointLight(0xeeffff, 0.5);
        fillLight2.position.set(10, 0, 10);
        this.scene.add(fillLight2);
    }
    
    createMuseumRoom() {
        // Crear las paredes
        const wallGeometry = new THREE.BoxGeometry(20, 10, 0.1);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.8
        });
        
        // Pared trasera
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.z = -5;
        this.scene.add(backWall);
        
        // Paredes laterales
        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.x = -10;
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.rotation.y = Math.PI / 2;
        rightWall.position.x = 10;
        this.scene.add(rightWall);
        
        // Suelo
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -5;
        this.scene.add(floor);
        
        // Techo
        const ceiling = new THREE.Mesh(floorGeometry, floorMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 5;
        this.scene.add(ceiling);
    }
    
    createFrame() {
        // Crear la geometría del marco estilo Rococó
        const frameWidth = 4;
        const frameHeight = 3;
        const frameDepth = 0.2;
        const frameBorderWidth = 0.3;
        
        // Crear la textura del marco dorado estilo Rococó
        const frameGeometry = new THREE.BoxGeometry(
            frameWidth + frameBorderWidth * 2,
            frameHeight + frameBorderWidth * 2,
            frameDepth
        );
        
        // Crear material con textura de marco dorado
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.8,
            roughness: 0.2
        });
        
        // Crear el marco
        this.frame = new THREE.Mesh(frameGeometry, frameMaterial);
        this.scene.add(this.frame);
        
        // Crear la "pintura" dentro del marco (un plano negro donde irán las portadas)
        const paintingGeometry = new THREE.PlaneGeometry(frameWidth, frameHeight);
        const paintingMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000
        });
        const painting = new THREE.Mesh(paintingGeometry, paintingMaterial);
        painting.position.z = frameDepth / 2 + 0.01;
        this.frame.add(painting);
        
        // Añadir detalles ornamentales al marco (estilo Rococó)
        this.addRococoDetails();
    }
    
    addRococoDetails() {
        // Añadir detalles ornamentales al marco
        // Implementación simplificada de detalles Rococó
        const ornamentGeometry = new THREE.TorusKnotGeometry(0.1, 0.03, 64, 8);
        const ornamentMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.9,
            roughness: 0.1
        });
        
        // Crear ornamentos en las esquinas
        const positions = [
            {x: 2, y: 1.5, z: 0.2}, // Esquina superior derecha
            {x: -2, y: 1.5, z: 0.2}, // Esquina superior izquierda
            {x: 2, y: -1.5, z: 0.2}, // Esquina inferior derecha
            {x: -2, y: -1.5, z: 0.2} // Esquina inferior izquierda
        ];
        
        positions.forEach(pos => {
            const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
            ornament.position.set(pos.x, pos.y, pos.z);
            ornament.scale.set(0.5, 0.5, 0.5);
            this.frame.add(ornament);
        });
        
        // Añadir detalles en el centro de cada lado
        const sidePositions = [
            {x: 0, y: 1.5, z: 0.2, rx: 0, ry: 0, rz: 0}, // Centro superior
            {x: 0, y: -1.5, z: 0.2, rx: 0, ry: 0, rz: Math.PI}, // Centro inferior
            {x: 2, y: 0, z: 0.2, rx: 0, ry: 0, rz: Math.PI / 2}, // Centro derecho
            {x: -2, y: 0, z: 0.2, rx: 0, ry: 0, rz: -Math.PI / 2} // Centro izquierdo
        ];
        
        sidePositions.forEach(pos => {
            const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
            ornament.position.set(pos.x, pos.y, pos.z);
            ornament.rotation.set(pos.rx, pos.ry, pos.rz);
            ornament.scale.set(0.5, 0.5, 0.5);
            this.frame.add(ornament);
        });
    }
    
    loadAlbumCovers(albumsData) {
        // Limpiar los álbumes existentes
        while (this.albumsGroup.children.length > 0) {
            const child = this.albumsGroup.children[0];
            this.albumsGroup.remove(child);
        }
        
        // Crear un plano para cada portada de álbum
        const textureLoader = new THREE.TextureLoader();
        
        // Creamos varias instancias de cada álbum para llenar el marco
        // pero asegurándonos de mostrar primero los diferentes
        const uniqueAlbumIds = new Set();
        const uniqueAlbums = [];
        
        // Primero filtrar para tener álbumes únicos
        albumsData.forEach(album => {
            const albumId = album.album.id;
            if (!uniqueAlbumIds.has(albumId)) {
                uniqueAlbumIds.add(albumId);
                uniqueAlbums.push(album);
            }
        });
        
        // Determinar cuántas portadas necesitamos para llenar el marco
        // Queremos al menos 30 portadas
        const targetAlbumCount = 30;
        let albumsToCreate = [];
        
        // Si tenemos menos de 30 álbumes únicos, repetiremos algunos
        if (uniqueAlbums.length < targetAlbumCount) {
            let currentCount = 0;
            while (currentCount < targetAlbumCount) {
                // Añadir todos los álbumes únicos
                uniqueAlbums.forEach(album => {
                    if (currentCount < targetAlbumCount) {
                        albumsToCreate.push(album);
                        currentCount++;
                    }
                });
            }
        } else {
            // Si tenemos suficientes álbumes únicos, usamos los primeros targetAlbumCount
            albumsToCreate = uniqueAlbums.slice(0, targetAlbumCount);
        }
        
        // Ahora creamos las portadas con una distribución más densa
        const frameWidth = 3.6; // Un poco menos que el ancho del marco
        const frameHeight = 2.6; // Un poco menos que el alto del marco
        
        albumsToCreate.forEach((album, index) => {
            const albumUrl = album.album.images[0].url;
            
            // Cargar la textura de la portada
            textureLoader.load(albumUrl, (texture) => {
                const aspectRatio = texture.image.width / texture.image.height;
                
                // Tamaño más pequeño para las portadas para que quepan más
                const width = 0.6 + Math.random() * 0.4; // Entre 0.6 y 1.0
                const height = width / aspectRatio;
                
                const geometry = new THREE.PlaneGeometry(width, height);
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true
                });
                
                const albumCover = new THREE.Mesh(geometry, material);
                
                // Distribución más densa dentro del marco
                // Usamos una distribución más uniforme para asegurar que todo el marco se llene
                
                // Método 1: Grid con offset aleatorio
                const gridCols = Math.ceil(Math.sqrt(targetAlbumCount));
                const gridRows = Math.ceil(targetAlbumCount / gridCols);
                
                const col = index % gridCols;
                const row = Math.floor(index / gridCols);
                
                // Calcular posición base en la cuadrícula
                const cellWidth = frameWidth / gridCols;
                const cellHeight = frameHeight / gridRows;
                
                const baseX = (col * cellWidth) - (frameWidth / 2) + (cellWidth / 2);
                const baseY = (row * cellHeight) - (frameHeight / 2) + (cellHeight / 2);
                
                // Añadir un offset aleatorio dentro de la celda
                const offsetX = (Math.random() - 0.5) * cellWidth * 0.8;
                const offsetY = (Math.random() - 0.5) * cellHeight * 0.8;
                
                const x = baseX + offsetX;
                const y = baseY + offsetY;
                
                // Profundidad aleatoria para crear un efecto de capas
                const z = Math.random() * 0.2 + 0.1;
                
                albumCover.position.set(x, y, z);
                
                // Rotación aleatoria más pronunciada
                albumCover.rotation.z = (Math.random() - 0.5) * 0.7;
                
                // Guardar la posición y rotación original para las animaciones
                albumCover.userData = {
                    originalPosition: {x, y, z},
                    originalRotation: albumCover.rotation.z,
                    album: album
                };
                
                this.albumsGroup.add(albumCover);
                this.albums.push(albumCover);
            });
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseMove(event) {
        // Actualizar posición del ratón para el raycaster
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Actualizar el raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Comprobar intersecciones con los álbumes
        const intersects = this.raycaster.intersectObjects(this.albums);
        
        // Resetear todos los álbumes a su posición original
        this.albums.forEach(album => {
            if (!album.userData.isAnimating) {
                gsap.to(album.position, {
                    x: album.userData.originalPosition.x,
                    y: album.userData.originalPosition.y,
                    z: album.userData.originalPosition.z,
                    duration: 0.5
                });
                
                gsap.to(album.rotation, {
                    z: album.userData.originalRotation,
                    duration: 0.5
                });
            }
        });
        
        // Animar el álbum seleccionado
        if (intersects.length > 0) {
            const selectedAlbum = intersects[0].object;
            selectedAlbum.userData.isAnimating = true;
            
            // Mover ligeramente hacia adelante y rotar
            gsap.to(selectedAlbum.position, {
                z: selectedAlbum.userData.originalPosition.z + 0.5, // Mayor desplazamiento para destacar
                duration: 0.3,
                onComplete: () => {
                    selectedAlbum.userData.isAnimating = false;
                }
            });
            
            gsap.to(selectedAlbum.rotation, {
                z: selectedAlbum.userData.originalRotation + Math.PI / 8, // Mayor rotación para efecto visual
                duration: 0.3
            });
            
            // Mostrar información del álbum al pasar el cursor
            this.showAlbumInfo(selectedAlbum.userData.album);
        } else {
            // Ocultar información del álbum si no hay ninguno seleccionado
            this.hideAlbumInfo();
        }
    }
    
    // Mostrar información del álbum seleccionado
    showAlbumInfo(album) {
        // Implementar más adelante si se desea mostrar información adicional
        // Por ahora solo para referencia
        console.log(`Álbum: ${album.name} - Artista: ${album.artists[0].name}`);
    }
    
    // Ocultar información del álbum
    hideAlbumInfo() {
        // Implementar más adelante si se añade un panel de información
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Animación suave del marco
        const time = this.clock.getElapsedTime();
        if (this.frame) {
            this.frame.rotation.y = Math.sin(time * 0.2) * 0.05;
        }
        
        // Animación suave de las portadas
        this.albums.forEach(album => {
            if (!album.userData.isAnimating) {
                // Movimiento más suave y natural
                album.position.y += Math.sin(time * 0.5 + album.position.x * 2) * 0.0003;
                album.rotation.z += Math.sin(time * 0.3 + album.position.y * 3) * 0.0001;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Capturar la imagen del cuadro para descargar
    captureImage() {
        const originalPosition = this.camera.position.clone();
        const originalRotation = this.camera.rotation.clone();
        
        // Mover la cámara para enfocar directamente al cuadro
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);
        
        // Renderizar la escena
        this.renderer.render(this.scene, this.camera);
        
        // Obtener la imagen del canvas
        const imgData = this.renderer.domElement.toDataURL('image/png');
        
        // Restaurar la posición y rotación original de la cámara
        this.camera.position.copy(originalPosition);
        this.camera.rotation.copy(originalRotation);
        
        return imgData;
    }
}