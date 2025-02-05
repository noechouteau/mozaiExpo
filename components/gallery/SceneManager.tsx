import * as ExpoTHREE from 'expo-three';
import * as THREE from 'three';

const localImage = require('../../assets/images/cardTest.png');

const planes = [];
const cameraRef = { current: null };
const raycaster = new THREE.Raycaster();
const targetPosition = { current: { x: 0, y: 0, z: 0 } };
const sizesPan = { minX: -10, maxX: 10, minY: -10, maxY: 10 };
const textureCache = new Map();
let sceneRef = null;
let frameCount = 0;

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D frontTexture;
    uniform sampler2D backTexture;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
        vec4 frontColor = texture2D(frontTexture, vUv);
        vec4 backColor = texture2D(backTexture, vUv);
        frontColor = vec4(frontColor.rgb, frontColor.a * uOpacity);
        backColor = vec4(backColor.rgb, backColor.a * uOpacity);
        if (gl_FrontFacing) {
            gl_FragColor = frontColor;
        } else {
            gl_FragColor = backColor;
        }
    }
`;

function lerp(v0, v1, t) {
    return v0 + (v1 - v0) * t;
}

function loadTexture(url, callback) {
    if (textureCache.has(url)) {
        callback(textureCache.get(url));
    } else {
        new ExpoTHREE.TextureLoader().load(url, (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            textureCache.set(url, texture);
            callback(texture);
        });
    }
}

function createPlane({ scene, image, position }) {
    const w = image.width || 150;
    const h = image.height || 150;
    const a = w / h;
    const m = 2.5;
    let pw, ph;
    if (a >= 1) {
        pw = m;
        ph = m / a;
    } else {
        ph = m;
        pw = m * a;
    }
    const geometry = new THREE.PlaneGeometry(pw, ph);
    const backTexture = new ExpoTHREE.TextureLoader().load(localImage);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            frontTexture: { value: null },
            backTexture: { value: backTexture },
            uOpacity: { value: 1.0 },
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        depthTest: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.urlImage = image.url;
    mesh.userData = { url: image.url };

    loadTexture(image.url, (tex) => {
        material.uniforms.frontTexture.value = tex;
        material.needsUpdate = true;
    });
    mesh.position.copy(position);
    planes.push(mesh);
    scene.add(mesh);
}

function createRandomGrid({ spacing, scene, images }) {
    const total = images.length;
    const maxRows = Math.ceil(Math.sqrt(total));
    const maxCols = Math.ceil(total / maxRows);
    let idx = 0;
    for (let i = 0; i < maxRows; i++) {
        for (let j = 0; j < maxCols; j++) {
            if (idx >= total) break;
            const dataImage = images[idx];
            idx++;
            const x = j * spacing * 1.5 - (maxCols * spacing) / 2 + Math.random() * (spacing * 0.5);
            const y = i * spacing * 1.5 - (maxRows * spacing) / 2 + Math.random() * (spacing * 0.5);
            const z = Math.random() * 3 - 1.5;
            createPlane({
                scene,
                image: dataImage,
                position: new THREE.Vector3(x, y, z),
            });
        }
    }
}

export function removeImage(url: string) {
    const index = planes.findIndex((mesh) => (mesh?.urlImage === url));
    if (index !== -1 && sceneRef) {
        sceneRef.remove(planes[index]);
        planes.splice(index, 1);
    }
}

async function SceneManager(gl, images) {
    const renderer = new ExpoTHREE.Renderer({ gl, antialias: false, powerPreference: 'low-power' });
    const updateRendererSize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setClearColor(0x000000);
        renderer.setSize(w, h);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        if (cameraRef.current) {
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
        }
    };
    updateRendererSize();
    window.addEventListener('resize', updateRendererSize);
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.z = 8;
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    sceneRef = new THREE.Scene();
    const scene = sceneRef;
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(0, 0, 10);
    scene.add(light);
    createRandomGrid({ spacing: 2.5, scene, images });
    const animate = () => {
        frameCount++;
        if (cameraRef.current) {
            targetPosition.current.x = Math.max(Math.min(targetPosition.current.x, sizesPan.maxX), sizesPan.minX);
            targetPosition.current.y = Math.max(Math.min(targetPosition.current.y, sizesPan.maxY), sizesPan.minY);
            const nx = lerp(cameraRef.current.position.x, targetPosition.current.x, 0.1);
            const ny = lerp(cameraRef.current.position.y, targetPosition.current.y, 0.1);
            if (Math.abs(cameraRef.current.position.x - nx) > 0.01 || Math.abs(cameraRef.current.position.y - ny) > 0.01) {
                cameraRef.current.position.x = nx;
                cameraRef.current.position.y = ny;
            }
            renderer.render(scene, camera);
        }
        gl.endFrameEXP();
        requestAnimationFrame(animate);
    };
    animate();
}

function addNewImage(url, w = 150, h = 150, lenght = 1) {
    if (!sceneRef) return;
    const x = (Math.random() - 0.5) * 10 * lenght;
    const y = (Math.random() - 0.5) * 10 * lenght;
    const z = (Math.random() - 0.5) * 5;

    createPlane({
        scene: sceneRef,
        image: { url, width: w, height: h },
        position: new THREE.Vector3(x, y, z),
    });
}

export default SceneManager;
export { planes, cameraRef, raycaster, targetPosition, addNewImage };
