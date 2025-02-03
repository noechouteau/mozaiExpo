import * as ExpoTHREE from 'expo-three';
import * as THREE from 'three';

import {ExpoWebGLRenderingContext} from "expo-gl";

export function lerp(v0: number, v1: number, t: number): number {
    return v0 + (v1 - v0) * t;
}
const planes = [] as THREE.Mesh[];
const cameraRef = {
    current: null
} as { current: THREE.PerspectiveCamera | null };

const raycaster = new THREE.Raycaster();
const targetPosition = {current: {x: 0, y: 0, z: 0}};

function loadImage(gl: WebGLRenderingContext) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000)
    });
}

async function loadImagesInScene(gl: WebGLRenderingContext, images: string[]) {
    await Promise.all(images.map((image) => loadImage(gl, image)));
}

const SceneManager = async (gl: ExpoWebGLRenderingContext, images: string[]) => {
    await loadImagesInScene(gl, images);

    const {drawingBufferWidth: bufferWidth, drawingBufferHeight: bufferHeight} = gl;

    const renderer = new ExpoTHREE.Renderer({
        gl,
        antialias: true,
        powerPreference: 'high-performance',
    });

    renderer.setSize(bufferWidth, bufferHeight);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000);

    const camera = new THREE.PerspectiveCamera(
        70,
        bufferWidth / bufferHeight,
        0.01,
        1000);


    camera.position.z = 10;
    cameraRef.current = camera;

    const scene = new THREE.Scene();

    createRandomGrid({
        spacing: 2.5,
        scene: scene,
        images: images
    });

    const animate = () => {
        if (cameraRef.current) {
            camera.position.x = lerp(camera.position.x, targetPosition.current.x, 0.1);
            camera.position.y = lerp(camera.position.y, targetPosition.current.y, 0.1);
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
        requestAnimationFrame(animate);
    };

    animate();
};

const createRandomGrid = ({spacing, scene, images}: {
    rows: number;
    cols: number;
    spacing: number;
    scene: THREE.Scene;
    images: { url: string, width?: number, height?: number }[];
}) => {

    const totalImages = images.length;
    const maxRows = Math.ceil(Math.sqrt(totalImages));
    const maxCols = Math.ceil(totalImages / maxRows);

    let index = 0;

    for (let i = 0; i < maxRows; i++) {
        for (let j = 0; j < maxCols; j++) {
            if (index >= totalImages) break;

            const dataImage = images[index];
            index++;

            const url = dataImage?.url || "https://placehold.jp/150x150.png";

            const texture = new ExpoTHREE.TextureLoader().load(url);

            const width = dataImage?.width || 150;
            const height = dataImage?.height || 150;
            const aspectRatio = width / height;
            const maxDimension = 3;

            let planeWidth: number;
            let planeHeight: number;

            if (aspectRatio >= 1) {
                planeWidth = maxDimension;
                planeHeight = maxDimension / aspectRatio;
            } else {
                planeHeight = maxDimension;
                planeWidth = maxDimension * aspectRatio;
            }

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
            });

            const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight), material);

            const x = j * spacing * 1.5 - (maxCols * spacing) / 2 + Math.random() * (spacing * 0.5);
            const y = i * spacing * 1.5 - (maxRows * spacing) / 2 + Math.random() * (spacing * 0.5);
            const z = Math.random() * 4 - 2;

            plane.position.set(x, y, z);
            planes.push(plane);
            scene.add(plane);
        }
    }
};


export default SceneManager;
export {planes, cameraRef, raycaster, targetPosition};
