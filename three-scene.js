const initScene = () => {
    if (typeof THREE === 'undefined') return setTimeout(initScene, 100);
    const container = document.getElementById('three-container');
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 380;
    const aspect = width / height;
    const d = 9;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();

    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x8b3dff, 0.7);
    backLight.position.set(-10, -10, -10);
    scene.add(backLight);

    // Materials
    const planetMat = new THREE.MeshStandardMaterial({ color: 0x862deb, roughness: 0.3, metalness: 0.1 });
    const craterMat = new THREE.MeshStandardMaterial({ color: 0x5613a3, roughness: 0.4 });
    const moonMat = new THREE.MeshStandardMaterial({ color: 0x93919c, roughness: 0.5 });
    const crystalMat = new THREE.MeshStandardMaterial({ color: 0xe55cff, emissive: 0x9e13d9, emissiveIntensity: 0.6, roughness: 0.1, metalness: 0.6 });
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x59c922, roughness: 0.3 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a5532, roughness: 0.7 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, opacity: 1, transparent: true, roughness: 0.05, clearcoat: 1 });
    const hologramMat = new THREE.MeshBasicMaterial({ color: 0x4ddbff, transparent: true, opacity: 0.3, wireframe: true });

    // Main Planet
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const planetGeo = new THREE.BoxGeometry(7, 7, 7);
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.castShadow = true;
    planet.receiveShadow = true;
    planetGroup.add(planet);

    // Craters
    const craterGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
    const addCrater = (x, y, z, rotX, rotZ) => {
        const c = new THREE.Mesh(craterGeo, craterMat);
        c.position.set(x, y, z);
        c.rotation.x = rotX;
        c.rotation.z = rotZ;
        planetGroup.add(c);
    };
    addCrater(3.5, 1.5, 1.5, 0, Math.PI/2);
    addCrater(-3.5, -1.5, 0, 0, Math.PI/2);
    addCrater(1.5, 3.5, -1.5, Math.PI/2, 0);
    addCrater(-1.5, -3.5, 1.5, Math.PI/2, 0);
    addCrater(1.5, 0, 3.5, Math.PI/2, Math.PI/2); 

    // Robot on top
    const robotGroup = new THREE.Group();
    robotGroup.position.set(-1.2, 3.6, 0.5);
    planetGroup.add(robotGroup);
    const robotBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), greenMat);
    robotBody.castShadow = true;
    robotBody.position.y = 0.7;
    robotGroup.add(robotBody);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.2), new THREE.MeshStandardMaterial({color: 0x111111}));
    visor.position.set(0.3, 0.9, 0.6);
    robotGroup.add(visor);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.3, 8), new THREE.MeshStandardMaterial({color: 0xffcc00, metalness: 0.8}));
    crown.position.set(0, 1.5, 0);
    robotGroup.add(crown);

    // Tree on top
    const treeGroup = new THREE.Group();
    treeGroup.position.set(1.5, 3.5, -1);
    planetGroup.add(treeGroup);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.5), woodMat);
    trunk.position.y = 0.75;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    const leavesGeo = new THREE.DodecahedronGeometry(1.2);
    const leaves1 = new THREE.Mesh(leavesGeo, greenMat);
    leaves1.position.y = 1.8;
    leaves1.castShadow = true;
    const leaves2 = new THREE.Mesh(leavesGeo, greenMat);
    leaves2.position.set(0.7, 1.4, 0);
    leaves2.scale.set(0.7, 0.7, 0.7);
    leaves2.castShadow = true;
    const leaves3 = new THREE.Mesh(leavesGeo, greenMat);
    leaves3.position.set(-0.6, 1.5, 0.4);
    leaves3.scale.set(0.8, 0.8, 0.8);
    leaves3.castShadow = true;
    treeGroup.add(leaves1, leaves2, leaves3);

    // Moons
    const moons = {};
    const moonData = [
        { id: 'Элори', angle: 0.2, radius: 9 },
        { id: 'Теллу', angle: Math.PI / 2 + 0.2, radius: 7.5 },
        { id: 'Фонея', angle: Math.PI + 0.3, radius: 9.5 },
        { id: 'slot-1', angle: Math.PI * 1.4, radius: 7.5, locked: true },
        { id: 'slot-2', angle: Math.PI * 1.8, radius: 8.5, locked: true }
    ];

    const moonGeo = new THREE.BoxGeometry(2.8, 2.8, 2.8);
    const miniTreeGeo = new THREE.DodecahedronGeometry(0.4);
    const miniTrunkGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.5);

    moonData.forEach(data => {
        const group = new THREE.Group();
        group.position.x = Math.cos(data.angle) * data.radius;
        group.position.z = Math.sin(data.angle) * data.radius;
        group.userData.bobOffset = Math.random() * Math.PI * 2;
        group.userData.id = data.id;
        scene.add(group);

        const mesh = new THREE.Mesh(moonGeo, data.locked ? hologramMat : moonMat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);

        // Crystals group
        const crystals = new THREE.Group();
        crystals.position.y = 1.4;
        
        const createCrystal = (scale, x, y, z, rotX, rotZ) => {
            const geom = new THREE.OctahedronGeometry(1, 0);
            const c = new THREE.Mesh(geom, crystalMat);
            c.scale.set(0.4 * scale, 1.3 * scale, 0.4 * scale);
            c.position.set(x, y, z);
            c.rotation.set(rotX, 0, rotZ);
            c.castShadow = true;
            return c;
        };
        crystals.add(createCrystal(1.3, 0, 0.5, 0, 0, 0));
        crystals.add(createCrystal(0.9, 0.7, 0.3, 0.3, 0.2, -0.3));
        crystals.add(createCrystal(1, -0.6, 0.4, -0.4, -0.2, 0.3));
        crystals.add(createCrystal(0.8, 0, 0.2, -0.7, -0.4, 0));
        group.add(crystals);
        
        // Dome Group
        const domeGroup = new THREE.Group();
        domeGroup.position.y = 1.4;
        const dome = new THREE.Mesh(new THREE.SphereGeometry(1.3, 24, 24, 0, Math.PI * 2, 0, Math.PI/2), glassMat);
        domeGroup.add(dome);
        
        const mTrunk = new THREE.Mesh(miniTrunkGeo, woodMat);
        mTrunk.position.y = 0.25;
        domeGroup.add(mTrunk);
        const mLeaves = new THREE.Mesh(miniTreeGeo, greenMat);
        mLeaves.position.y = 0.6;
        domeGroup.add(mLeaves);
        
        group.add(domeGroup);

        if (!data.locked) {
            crystals.visible = true; 
            domeGroup.visible = false;
        } else {
            crystals.visible = false;
            domeGroup.visible = false;
            
            const lockMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.3), new THREE.MeshStandardMaterial({color: 0xffaa00}));
            lockMesh.position.y = 2.2;
            group.add(lockMesh);
        }

        moons[data.id] = { group, crystals, domeGroup };
    });

    window.addEventListener('resize', () => {
        let width = container.clientWidth || window.innerWidth;
        let height = container.clientHeight || 380;
        const aspect = width / height;
        camera.left = -d * aspect;
        camera.right = d * aspect;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    const syncLabels = () => {
        moonData.forEach(data => {
            const moonObj = moons[data.id].group;
            const vector = new THREE.Vector3();
            moonObj.getWorldPosition(vector);
            vector.y += 0; 
            vector.project(camera);
            
            const x = (vector.x * 0.5 + 0.5) * container.clientWidth;
            const y = (vector.y * -0.5 + 0.5) * container.clientHeight;
            
            let selector = data.locked ? `.moon.slot[data-id="${data.id}"]` : `.moon[data-moon="${data.id}"]`;
            let el = document.querySelector(selector);
            if (el) {
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
            }
        });
    };

    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        planetGroup.position.y = Math.sin(time) * 0.4;
        planetGroup.rotation.y = time * 0.1;

        moonData.forEach(data => {
            const moonObj = moons[data.id].group;
            moonObj.position.y = Math.sin(time * 2 + moonObj.userData.bobOffset) * 0.6;
            moonObj.position.x = Math.cos(data.angle + time * 0.1) * data.radius;
            moonObj.position.z = Math.sin(data.angle + time * 0.1) * data.radius;
        });

        renderer.render(scene, camera);
        syncLabels();
    };
    animate();

    window.update3DScene = (state) => {
        moonData.forEach(data => {
            if (data.locked) return;
            const isReady = state.ready && state.ready[data.id] > 0;
            moons[data.id].crystals.visible = isReady;
            moons[data.id].domeGroup.visible = !isReady; 
        });
    };
    
    // Initial sync
    if (window.state) {
        window.update3DScene(window.state);
    }
};

initScene();
