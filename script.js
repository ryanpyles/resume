document.addEventListener('DOMContentLoaded', () => {
    // Navigation Functionality
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            const section = document.getElementById(sectionId);

            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            item.classList.add('active');
            section.classList.add('active');

            section.scrollIntoView({ behavior: 'smooth' });

            if (sectionId === 'experience') {
                setTimeout(animateTimeline, 500);
            }
        });
    });

    document.querySelector('.nav-item[data-section="home"]').classList.add('active');
    document.getElementById('home').classList.add('active');

    // Three.js Morphing Polygons
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    const container = document.getElementById('threeCanvas');
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    // Background
    scene.background = new THREE.Color(0xffecd2);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 5, 10);
    scene.add(pointLight);

    // Polygon definitions
    const polygons = [
        { name: 'About', color: 0xffeb3b, position: [-6, 2, 0], section: '#about', targetShape: 'cube' },
        { name: 'Skills', color: 0x4ecdc4, position: [-2, 2, 0], section: '#skills', targetShape: 'gear' },
        { name: 'Experience', color: 0xff7043, position: [2, 2, 0], section: '#experience', targetShape: 'pyramid' },
        { name: 'Projects', color: 0xf7b733, position: [6, 2, 0], section: '#projects', targetShape: 'star' },
        { name: 'Languages', color: 0x96c93d, position: [-6, -2, 0], section: '#languages', targetShape: 'globe' },
        { name: 'Soft Skills', color: 0x45b7d1, position: [-2, -2, 0], section: '#soft-skills', targetShape: 'heart' },
        { name: 'Market Reach', color: 0xff6b6b, position: [2, -2, 0], section: '#market-reach', targetShape: 'ring' }
    ];

    const polygonMeshes = [];
    polygons.forEach(poly => {
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: poly.color, 
            emissive: poly.color, 
            emissiveIntensity: 0.3 
        });
        const mesh = new THREE.Mesh(sphereGeometry, material);
        mesh.position.set(...poly.position);
        mesh.userData = { 
            baseGeometry: sphereGeometry, 
            targetShape: poly.targetShape, 
            morphProgress: 0, 
            isMorphing: false 
        };
        scene.add(mesh);

        // Add text label with improved readability
        const spriteMaterial = new THREE.SpriteMaterial({
            map: createTextTexture(poly.name),
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2.5, 1.25, 1); // Larger size for better visibility
        sprite.position.y = 1; // Slightly higher to avoid overlap
        mesh.add(sprite);

        polygonMeshes.push({ mesh, name: poly.name, section: poly.section });
    });

    // Helper function for text labels with improved readability
    function createTextTexture(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 512; // Larger canvas for sharper text
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Background for contrast
        context.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Text
        context.fillStyle = '#ffffff'; // White text
        context.font = 'bold 60px Montserrat Alternates'; // Larger font
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Optional: Add a subtle outline
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeText(text, canvas.width / 2, canvas.height / 2);

        return new THREE.CanvasTexture(canvas);
    }

    // Morphing function
    function morphToShape(mesh) {
        const targetShape = mesh.userData.targetShape;
        let targetGeometry;

        switch (targetShape) {
            case 'cube':
                targetGeometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case 'gear':
                targetGeometry = createGearGeometry(0.7, 8);
                break;
            case 'pyramid':
                targetGeometry = new THREE.TetrahedronGeometry(0.8);
                break;
            case 'star':
                targetGeometry = createStarGeometry(0.7, 5);
                break;
            case 'globe':
                targetGeometry = new THREE.SphereGeometry(0.6, 32, 32);
                break;
            case 'heart':
                targetGeometry = createHeartGeometry(0.7);
                break;
            case 'ring':
                targetGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
                break;
            default:
                targetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        }

        const basePositions = mesh.userData.baseGeometry.attributes.position.array;
        const targetPositions = targetGeometry.attributes.position.array;
        const morphPositions = new Float32Array(basePositions.length);

        for (let i = 0; i < basePositions.length; i++) {
            const base = basePositions[i];
            const target = targetPositions[i % targetPositions.length];
            morphPositions[i] = base + (target - base) * mesh.userData.morphProgress;
        }

        mesh.geometry.attributes.position.array = morphPositions;
        mesh.geometry.attributes.position.needsUpdate = true;
    }

    // Custom geometry functions
    function createGearGeometry(radius, teeth) {
        const shape = new THREE.Shape();
        const outerRadius = radius;
        const innerRadius = radius * 0.6;
        const angleStep = Math.PI * 2 / (teeth * 2);

        shape.moveTo(outerRadius, 0);
        for (let i = 0; i < teeth * 2; i++) {
            const angle = i * angleStep;
            const r = (i % 2 === 0) ? outerRadius : innerRadius;
            shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        shape.lineTo(outerRadius, 0);

        return new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
    }

    function createStarGeometry(radius, points) {
        const shape = new THREE.Shape();
        const outerRadius = radius;
        const innerRadius = radius * 0.5;
        const angleStep = Math.PI / points;

        shape.moveTo(outerRadius, 0);
        for (let i = 0; i < points * 2; i++) {
            const angle = i * angleStep;
            const r = (i % 2 === 0) ? outerRadius : innerRadius;
            shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        shape.lineTo(outerRadius, 0);

        return new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
    }

    function createHeartGeometry(radius) {
        const shape = new THREE.Shape();
        const x = 0, y = 0;

        shape.moveTo(x + radius * 0.25, y + radius * 0.25);
        shape.bezierCurveTo(x + radius * 0.25, y + radius * 0.25, x, y, x - radius * 0.25, y + radius * 0.25);
        shape.bezierCurveTo(x - radius * 0.5, y + radius * 0.25, x - radius * 0.5, y + radius * 0.75, x, y + radius);
        shape.bezierCurveTo(x + radius * 0.5, y + radius * 0.75, x + radius * 0.5, y + radius * 0.25, x + radius * 0.25, y + radius * 0.25);

        return new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
    }

    // Camera position
    camera.position.z = 10;

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ 
        color: 0xfcb69f, 
        size: 0.02, 
        transparent: true, 
        opacity: 0.03 
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Dynamic Camera Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    document.getElementById('threeCanvas').addEventListener('mousedown', (event) => {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    document.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const deltaX = event.clientX - previousMousePosition.x;
            const deltaY = event.clientY - previousMousePosition.y;
            camera.rotation.y += deltaX * 0.002;
            camera.rotation.x += deltaY * 0.002;
            previousMousePosition = { x: event.clientX, y: event.clientY };
        }
    });

    document.addEventListener('mouseup', () => isDragging = false);

    // Animation
    function animate() {
        requestAnimationFrame(animate);

        polygonMeshes.forEach((poly, index) => {
            poly.mesh.rotation.y += 0.01;
            if (poly.mesh.userData.isMorphing) {
                poly.mesh.userData.morphProgress += 0.05;
                if (poly.mesh.userData.morphProgress > 1) poly.mesh.userData.morphProgress = 1;
            } else {
                poly.mesh.userData.morphProgress -= 0.05;
                if (poly.mesh.userData.morphProgress < 0) poly.mesh.userData.morphProgress = 0;
            }
            morphToShape(poly.mesh);
        });

        particles.rotation.y += 0.0002;

        renderer.render(scene, camera);
    }
    animate();

    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    document.getElementById('threeCanvas').addEventListener('mousemove', (event) => {
        event.preventDefault();
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(polygonMeshes.map(p => p.mesh));

        if (intersects.length > 0) {
            const poly = polygonMeshes.find(p => p.mesh === intersects[0].object);
            tooltip.textContent = poly.name;
            tooltip.style.display = 'block';
            tooltip.style.left = event.clientX + 10 + 'px';
            tooltip.style.top = event.clientY + 10 + 'px';
            renderer.domElement.style.cursor = 'pointer';
            intersects[0].object.userData.isMorphing = true;
            intersects[0].object.material.emissiveIntensity = 1;
        } else {
            tooltip.style.display = 'none';
            renderer.domElement.style.cursor = 'default';
            polygonMeshes.forEach(p => {
                p.mesh.userData.isMorphing = false;
                p.mesh.material.emissiveIntensity = 0.3;
            });
        }
    });

    document.getElementById('threeCanvas').addEventListener('click', (event) => {
        event.preventDefault();
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(polygonMeshes.map(p => p.mesh));

        if (intersects.length > 0) {
            const poly = polygonMeshes.find(p => p.mesh === intersects[0].object);
            tooltip.textContent = poly.name;
            tooltip.style.display = 'block';
            tooltip.style.left = event.clientX + 10 + 'px';
            tooltip.style.top = event.clientY + 10 + 'px';
            setTimeout(() => { tooltip.style.display = 'none'; }, 1000);
            navigateToSection(poly.name);
        }
    });

    // Navigate to section
    function navigateToSection(sectionName) {
        const sectionMap = {
            'About': '#about',
            'Skills': '#skills',
            'Experience': '#experience',
            'Projects': '#projects',
            'Languages': '#languages',
            'Soft Skills': '#soft-skills',
            'Market Reach': '#market-reach'
        };
        const target = sectionMap[sectionName];
        if (target) {
            window.location.hash = target;
            const element = document.querySelector(target);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    // Skill Card Flip
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'rotateY(180deg)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateY(0deg)';
        });
    });

    // Project Image Uniformity
    const projectImages = document.querySelectorAll('.projects-grid img');
    projectImages.forEach(img => {
        img.style.maxWidth = '300px';
        img.style.height = 'auto';
        img.style.borderRadius = '10px';
        img.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    });

    // Project Image Slider
    const projectContainers = document.querySelectorAll('.projects-grid');
    projectContainers.forEach(container => {
        let scrollAmount = 0;
        const scrollStep = 300;
        const scrollMax = container.scrollWidth - container.clientWidth;

        container.addEventListener('wheel', (event) => {
            event.preventDefault();
            scrollAmount += event.deltaY > 0 ? scrollStep : -scrollStep;
            scrollAmount = Math.max(0, Math.min(scrollAmount, scrollMax));
            container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        });
    });

    // Timeline Animation on Scroll
    function animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
                item.classList.add('show');
            } else {
                item.classList.remove('show');
            }
        });
    }

    window.addEventListener('scroll', animateTimeline);

    // Interactive Language Map
   // Interactive Language Map
const mapContainer = document.getElementById('languageMap');
if (mapContainer) {
    // Load Leaflet CSS
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    leafletCSS.crossOrigin = '';
    document.head.appendChild(leafletCSS);

    // Load Leaflet JS
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    leafletScript.crossOrigin = '';
    document.head.appendChild(leafletScript);

    leafletScript.onload = () => {
        // Initialize map
        const map = L.map('languageMap', {
            center: [20, 0], // Center globally
            zoom: 2,
            scrollWheelZoom: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Expanded country data
        const countryData = {
            "type": "FeatureCollection",
            "features": [
                // Spanish-speaking countries
                { "properties": { "name": "Argentina", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-58.3816, -34.6037] } },
                { "properties": { "name": "Bolivia", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-68.1193, -16.4897] } },
                { "properties": { "name": "Chile", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-70.6693, -33.4489] } },
                { "properties": { "name": "Colombia", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-74.0721, 4.7110] } },
                { "properties": { "name": "Costa Rica", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-84.0907, 9.9281] } },
                { "properties": { "name": "Cuba", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-82.3666, 23.1136] } },
                { "properties": { "name": "Dominican Republic", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-69.9312, 18.4861] } },
                { "properties": { "name": "Ecuador", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-78.4678, -0.1807] } },
                { "properties": { "name": "El Salvador", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-89.1872, 13.6929] } },
                { "properties": { "name": "Equatorial Guinea", "languages": ["Spanish", "French", "Portuguese"] }, "geometry": { "type": "Point", "coordinates": [8.7832, 3.7504] } },
                { "properties": { "name": "Guatemala", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-90.5133, 14.6349] } },
                { "properties": { "name": "Honduras", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-87.2032, 14.0723] } },
                { "properties": { "name": "Mexico", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-99.1332, 19.4326] } },
                { "properties": { "name": "Nicaragua", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-86.2419, 12.1140] } },
                { "properties": { "name": "Panama", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-79.5199, 8.9824] } },
                { "properties": { "name": "Paraguay", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-57.5759, -25.2637] } },
                { "properties": { "name": "Peru", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-77.0428, -12.0464] } },
                { "properties": { "name": "Spain", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-3.7038, 40.4168] } },
                { "properties": { "name": "Uruguay", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-56.1645, -34.9011] } },
                { "properties": { "name": "Venezuela", "languages": ["Spanish"] }, "geometry": { "type": "Point", "coordinates": [-66.9036, 10.4806] } },

                // French-speaking countries (excluding overlaps like Equatorial Guinea)
                { "properties": { "name": "Belgium", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [4.3517, 50.8503] } },
                { "properties": { "name": "Benin", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [2.3158, 6.4969] } },
                { "properties": { "name": "Burkina Faso", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [-1.5616, 12.2383] } },
                { "properties": { "name": "Burundi", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [29.9189, -3.3731] } },
                { "properties": { "name": "Cameroon", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [11.5021, 3.8480] } },
                { "properties": { "name": "Canada", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [-71.2079, 46.8139] } }, // Quebec City
                { "properties": { "name": "Central African Republic", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [20.9394, 6.6111] } },
                { "properties": { "name": "Chad", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [15.0444, 12.1348] } },
                { "properties": { "name": "Comoros", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [43.3333, -11.6455] } },
                { "properties": { "name": "Congo (Brazzaville)", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [15.2832, -4.2661] } },
                { "properties": { "name": "DR Congo", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [15.3070, -4.3224] } },
                { "properties": { "name": "Djibouti", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [43.1450, 11.8251] } },
                { "properties": { "name": "France", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [2.3522, 48.8566] } },
                { "properties": { "name": "Gabon", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [9.4673, 0.4162] } },
                { "properties": { "name": "Guinea", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [-13.6773, 9.6412] } },
                { "properties": { "name": "Haiti", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [-72.3350, 18.5333] } },
                { "properties": { "name": "Ivory Coast", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [-5.5471, 7.5400] } },
                { "properties": { "name": "Luxembourg", "languages": ["French", "German"] }, "geometry": { "type": "Point", "coordinates": [6.1296, 49.8153] } },
                { "properties": { "name": "Madagascar", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [47.5361, -18.8792] } },
                { "properties": { "name": "Mali", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [-8.0000, 12.6392] } },
                { "properties": { "name": "Monaco", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [7.4246, 43.7384] } },
                { "properties": { "name": "Niger", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [2.1167, 13.5116] } },
                { "properties": { "name": "Rwanda", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [30.0586, -1.9403] } },
                { "properties": { "name": "Senegal", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [-17.4439, 14.6928] } },
                { "properties": { "name": "Seychelles", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [55.4915, -4.6796] } },
                { "properties": { "name": "Switzerland", "languages": ["French", "German", "Italian"] }, "geometry": { "type": "Point", "coordinates": [6.1432, 46.2044] } }, // Geneva for French
                { "properties": { "name": "Togo", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [1.2228, 6.1256] } },
                { "properties": { "name": "Vanuatu", "languages": ["French"] }, "geometry": { "type": "Point", "coordinates": [168.3219, -17.7348] } },

                // Italian-speaking countries (excluding overlaps like Switzerland)
                { "properties": { "name": "Italy", "languages": ["Italian"] }, "geometry": { "type": "Point", "coordinates": [12.4964, 41.9028] } },
                { "properties": { "name": "San Marino", "languages": ["Italian"] }, "geometry": { "type": "Point", "coordinates": [12.4578, 43.9424] } },
                { "properties": { "name": "Vatican City", "languages": ["Italian"] }, "geometry": { "type": "Point", "coordinates": [12.4534, 41.9029] } },

                // Portuguese-speaking countries (excluding Equatorial Guinea)
                { "properties": { "name": "Angola", "languages": ["Portuguese"] }, "geometry": { "type": "Point", "coordinates": [13.2340, -8.8147] } },
                { "properties": { "name": "Brazil", "languages": ["Portuguese"] }, "geometry": { "type": "Point", "coordinates": [-47.9292, -15.7801] } },
                { "properties": { "name": "Cape Verde", "languages": ["Portuguese"] }, "geometry": { "type": "Point", "coordinates": [-23.5133, 14.9330] } },
                { "properties": { "name": "East Timor", "languages": ["Portuguese"] }, "geometry": { "type": "Point", "coordinates": [125.7275, -8.5569] } },
                { "properties": { "name": "Guinea-Bissau", "languages": ["Portuguese"] }, "geometry": { "type": "Point", "coordinates": [-15.5984, 11.8037] } },
                { "properties": { "name": "Mozambique", "languages": ["Portuguese"] }, "geometry": { "type": "Point", "coordinates": [32.5892, -25.9537] } },
                { "properties": { "name": "Portugal", "languages": ["Portuguese"] }, "geometry": { "type": "Point", "coordinates": [-9.1393, 38.7223] } },
                { "properties": { "name": "São Tomé and Príncipe", "languages": ["Portuguese"] }, "geometry": { "type": "Point", "coordinates": [6.6131, 0.1864] } },

                // German-speaking countries (excluding overlaps like Switzerland, Luxembourg)
                { "properties": { "name": "Austria", "languages": ["German"] }, "geometry": { "type": "Point", "coordinates": [16.3738, 48.2082] } },
                { "properties": { "name": "Germany", "languages": ["German"] }, "geometry": { "type": "Point", "coordinates": [13.4050, 52.5200] } },
                { "properties": { "name": "Liechtenstein", "languages": ["German"] }, "geometry": { "type": "Point", "coordinates": [9.5209, 47.1410] } },

                // Mandarin-speaking countries
                { "properties": { "name": "China", "languages": ["Mandarin"] }, "geometry": { "type": "Point", "coordinates": [116.4074, 39.9042] } },
                { "properties": { "name": "Singapore", "languages": ["Mandarin"] }, "geometry": { "type": "Point", "coordinates": [103.8198, 1.3521] } },
                { "properties": { "name": "Taiwan", "languages": ["Mandarin"] }, "geometry": { "type": "Point", "coordinates": [121.5654, 25.0330] } }
            ]
        };

        const languages = ['Spanish', 'French', 'Italian', 'Portuguese', 'German', 'Mandarin'];
        const colorMap = {
            'Spanish': '#FFEB3B', // Yellow
            'French': '#4ECDC4',  // Turquoise
            'Italian': '#FF7043',  // Orange
            'Portuguese': '#F7B733', // Gold
            'German': '#96C93D',   // Green
            'Mandarin': '#45B7D1'  // Blue
        };

        countryData.features.forEach(feature => {
            const langs = feature.properties.languages;
            langs.forEach(lang => {
                if (languages.includes(lang)) {
                    L.marker(feature.geometry.coordinates.reverse(), {
                        icon: L.divIcon({
                            className: 'language-marker',
                            html: `<div style="background-color: ${colorMap[lang]}; width: 10px; height: 10px; border-radius: 50%;"></div>`,
                            iconSize: [10, 10]
                        })
                    }).addTo(map).bindPopup(`${feature.properties.name} - ${langs.join(', ')}`);
                }
            });
        });

        map.on('mouseover', (e) => {
            if (e.layer instanceof L.Marker) {
                e.layer.openPopup();
            }
        });

        map.on('mouseout', (e) => {
            if (e.layer instanceof L.Marker) {
                e.layer.closePopup();
            }
        });

        console.log('Language Map Initialized');
    };

    leafletScript.onerror = () => {
        console.error('Failed to load Leaflet script');
    };
}
    

    // Dark Mode Toggle
    const darkModeToggle = document.createElement('button');
    darkModeToggle.innerText = 'Toggle Dark Mode';
    darkModeToggle.classList.add('dark-mode-toggle');
    document.body.appendChild(darkModeToggle);

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });

    if (localStorage.getItem('dark-mode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    console.log('Interactive Portfolio Initialized');
});