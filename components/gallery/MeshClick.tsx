import { THREE } from 'expo-three';
import { cameraRef, targetPosition } from '@/components/gallery/SceneManager';
import { gsap } from 'gsap-rn';

class MeshClick {
    planeClicked: THREE.Mesh | null = null;
    storedPositionPlanes: { [key: string]: { x: number, y: number, z: number } } = {};
    planes: THREE.Mesh[];
    camera: THREE.PerspectiveCamera | null;
    isActive: boolean = false;
    isMeshActive: boolean;
    setIsMeshActive: (value: boolean) => void;

    constructor({ planes, camera, isMeshActive, setIsMeshActive }: {
        planes: THREE.Mesh[];
        camera: THREE.PerspectiveCamera | null;
        isMeshActive: boolean;
        setIsMeshActive: (value: boolean) => void;
    }) {
        this.planes = planes;
        this.camera = camera;
        this.isMeshActive = isMeshActive;
        this.setIsMeshActive = setIsMeshActive;
    }

    setPlaneClicked(plane: THREE.Mesh | null) {
        if (plane) {
            this.planeClicked = plane;
            this.enter();
        }
    }

    enter() {
        this.isActive = true;
        this.setIsMeshActive(true);

        if (this.planeClicked === null) return;

        this.planes.forEach((plane) => {
            this.storedPositionPlanes[plane.uuid] = {
                x: plane.position.x,
                y: plane.position.y,
                z: plane.position.z,
            };

            if (plane !== this.planeClicked) {
                gsap.to(plane.position, {
                    z: -1,
                    duration: 2,
                    ease: "expo.inOut",
                });

                gsap.to(plane.material, {
                    opacity: 0.0,
                    duration: 2,
                    ease: "expo.inOut",
                });
            } else {
                gsap.to(plane.position, {
                    z: 0,
                    duration: 2,
                    ease: "expo.inOut",
                });
            }
        });

        gsap.to(targetPosition.current, {
            x: this.planeClicked.position.x,
            y: this.planeClicked.position.y,
            duration: 2,
            ease: "expo.inOut",
        });

        if (cameraRef.current) {
            gsap.to(cameraRef.current.position, {
                z: 5,
                duration: 2,
                ease: "expo.inOut",
            });
        }

        gsap.to(this.planeClicked.rotation, {
            y: Math.PI * 2,
            duration: 2,
            ease: "expo.inOut",
        });
    }

    leave() {
        this.isActive = false;
        this.setIsMeshActive(false);

        this.planes.forEach((plane) => {
            gsap.to(plane.material, {
                opacity: 1.0,
                duration: 1,
                ease: "expo.inOut",
            });

            gsap.to(plane.position, {
                z: Math.random() * 4 - 2,
                duration: 1,
                ease: "expo.inOut",
            });
        });

        if (cameraRef.current) {
            gsap.to(cameraRef.current.position, {
                z: 15,
                duration: 1,
                ease: "expo.inOut",
            });
        }

        gsap.to(this.planeClicked?.rotation, {
            y: 0,
            x: 0,
            z: 0,
            duration: 2,
            ease: "expo.inOut",
        });

        this.planeClicked = null;
    }
}

export default MeshClick;
