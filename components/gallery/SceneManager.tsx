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

const SceneManager = async (gl: ExpoWebGLRenderingContext) => {
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

    createRandomGrid({rows: 10, cols: 10, spacing: 1.5, scene: scene});

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

const createRandomGrid = ({rows, cols, spacing, scene}: {
    rows: number;
    cols: number;
    spacing: number;
    scene: THREE.Scene;
}) => {

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const link = "https://placehold.jp/150x150.png"
            const texture = new ExpoTHREE.TextureLoader().load(link);

            const imageWidth = 150; // Todo bdd
            const imageHeight = 150; // Todo bdd

            const aspectRatio = imageWidth / imageHeight;
            const planeWidth = 1.5;
            const planeHeight = planeWidth / aspectRatio;

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
            });

            const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight), material);

            const x = j * spacing * 1.5 - (cols * spacing) / 2 + Math.random() * (spacing * 0.5);
            const y = i * spacing * 1.5 - (rows * spacing) / 2 + Math.random() * (spacing * 0.5);
            const z = Math.random() * 4 - 2;

            plane.position.set(x, y, z);
            planes.push(plane);
            scene.add(plane);
        }
    }

};

export default SceneManager;
export {planes, cameraRef, raycaster, targetPosition};
