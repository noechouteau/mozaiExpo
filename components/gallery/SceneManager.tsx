import * as ExpoTHREE from 'expo-three';
import * as THREE from 'three';
import { ExpoWebGLRenderingContext } from 'expo-gl';

export function lerp(v0: number, v1: number, t: number): number {
    return v0 + (v1 - v0) * t;
}

const localImage = require('../../assets/images/cardTest.png');


const planes: THREE.Mesh[] = [];
const cameraRef = { current: null } as { current: THREE.PerspectiveCamera | null };
const raycaster = new THREE.Raycaster();
const targetPosition = { current: { x: 0, y: 0, z: 0 } };

const sizesPan = {
    minX: -10,
    maxX: 10,
    minY: -10,
    maxY: 10,
};

const textureCache = new Map<string, THREE.Texture>();

let frameCount = 0;
let processedPlanesIndex = 0;

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

const SceneManager = async (gl: ExpoWebGLRenderingContext, images: string[]) => {
    const renderer = new ExpoTHREE.Renderer({
        gl,
        antialias: false,
        powerPreference: 'low-power',
    });

    const updateRendererSize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setClearColor(0x000000);
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio || 1);

        if (cameraRef.current) {
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
        }
    };

    updateRendererSize();

    window.addEventListener('resize', updateRendererSize);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.z = 8;
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const scene = new THREE.Scene();

    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(0, 0, 10);
    scene.add(light);

    createRandomGrid({ spacing: 2.5, scene, images });

    const animate = () => {
        frameCount++;

        if (cameraRef.current) {
            targetPosition.current.x = Math.max(
                Math.min(targetPosition.current.x, sizesPan.maxX),
                sizesPan.minX
            );
            targetPosition.current.y = Math.max(
                Math.min(targetPosition.current.y, sizesPan.maxY),
                sizesPan.minY
            );

            const newX = lerp(cameraRef.current.position.x, targetPosition.current.x, 0.1);
            const newY = lerp(cameraRef.current.position.y, targetPosition.current.y, 0.1);

            if (Math.abs(cameraRef.current.position.x - newX) > 0.01 ||
                Math.abs(cameraRef.current.position.y - newY) > 0.01) {
                cameraRef.current.position.x = newX;
                cameraRef.current.position.y = newY;
            }

            renderer.render(scene, camera);
        }

        gl.endFrameEXP();
        requestAnimationFrame(animate);
    };

    animate();
};

const loadTexture = (url: string, callback: (texture: THREE.Texture) => void) => {
    if (textureCache.has(url)) {
        callback(textureCache.get(url)!);
    } else {
        new ExpoTHREE.TextureLoader().load(url, (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            textureCache.set(url, texture);
            callback(texture);
        });
    }
};

const createRandomGrid = ({
                              spacing,
                              scene,
                              images,
                          }: {
    spacing: number;
    scene: THREE.Scene;
    images: { url: string; width?: number; height?: number }[];
}) => {
    const totalImages = images.length;
    const maxRows = Math.ceil(Math.sqrt(totalImages));
    const maxCols = Math.ceil(totalImages / maxRows);

    let index = 0;

    const backTexture = new ExpoTHREE.TextureLoader().load(localImage);

    for (let i = 0; i < maxRows; i++) {
        for (let j = 0; j < maxCols; j++) {
            if (index >= totalImages) break;

            const dataImage = images[index];
            index++;

            const width = dataImage?.width || 150;
            const height = dataImage?.height || 150;
            const aspectRatio = width / height;
            const maxDimension = 2.5;

            let planeWidth: number;
            let planeHeight: number;

            if (aspectRatio >= 1) {
                planeWidth = maxDimension;
                planeHeight = maxDimension / aspectRatio;
            } else {
                planeHeight = maxDimension;
                planeWidth = maxDimension * aspectRatio;
            }

            const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

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
                blending: THREE.NormalBlending,
            });


            const mesh = new THREE.Mesh(geometry, material);

            loadTexture(dataImage.url, (texture) => {
                material.uniforms.frontTexture.value = texture;
                material.needsUpdate = true;
            });

            const x = j * spacing * 1.5 - (maxCols * spacing) / 2 + Math.random() * (spacing * 0.5);
            const y = i * spacing * 1.5 - (maxRows * spacing) / 2 + Math.random() * (spacing * 0.5);
            const z = Math.random() * 3 - 1.5;

            mesh.position.set(x, y, z);
            planes.push(mesh);
            scene.add(mesh);
        }
    }
};

export default SceneManager;
export { planes, cameraRef, raycaster, targetPosition };
