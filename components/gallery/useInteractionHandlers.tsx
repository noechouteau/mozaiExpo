import { Dimensions, PanResponder } from 'react-native';
import {useRef, useState} from 'react';
import { cameraRef, planes, raycaster, targetPosition } from './SceneManager';
import { THREE } from 'expo-three';
import MeshClick from '@/components/gallery/MeshClick';

const { width, height } = Dimensions.get('window');

const useInteractionHandlers = () => {
    const isTouching = useRef<boolean>(false);
    const initialTouchDistance = useRef<number>(0);
    const initialCameraZ = useRef<number>(0);

    const mouse = useRef(new THREE.Vector2(-10, -10)).current;

    const [isMeshActive, setIsMeshActive] = useState<boolean>(false);

    const startPosition = useRef({ x: 0, y: 0 });
    const clickThreshold = 5;
    const isMoving = useRef<boolean>(false);

    const sizesPan = {
        minZoom: 5,
        maxZoom: 30,
        minX: -10,
        maxX: 10,
        minY: -10,
        maxY: 10,
    };

    const meshClick = new MeshClick({
        planes: planes,
        camera: cameraRef.current,
        isMeshActive: isMeshActive,
        setIsMeshActive,
    });

    const updateMouse = (x: number, y: number) => {
        mouse.x = (x / width) * 2 - 1;
        mouse.y = -(y / height) * 2 + 1;
    };

    const checkClick = () => {
        if (cameraRef.current) {
            raycaster.setFromCamera(mouse, cameraRef.current);
            const intersects = raycaster.intersectObjects(planes, true);
            if (intersects.length > 0 && !meshClick.isActive) {
                const intersectedObject = intersects[0].object;
                meshClick.setPlaneClicked(intersectedObject as THREE.Mesh);
            }
        }
    };

    const panHandlers = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt, gestureState) => {
            if (isMeshActive) return;
            startPosition.current = {
                x: gestureState.x0,
                y: gestureState.y0,
            };
            updateMouse(gestureState.x0, gestureState.y0);
        },
        onPanResponderMove: (evt, gestureState) => {
            if (isMeshActive) return;

            const { vx, vy, dx, dy, x0, y0 } = gestureState;

            if (Math.abs(dx) > clickThreshold || Math.abs(dy) > clickThreshold) {
                isMoving.current = true;
            }

            if (isMoving.current) {
                targetPosition.current.x -= vx * 0.5;
                targetPosition.current.y += vy * 0.5;
            }

            updateMouse(x0, y0);
        },
        onPanResponderRelease: () => {
            if (isMeshActive) return;

            if (!isMoving.current) {
                checkClick();
            } else {
                // Glissement détecté
            }

            isMoving.current = false;
        },
    }).panHandlers;

    const onPinchGestureEvent = (event) => {
        if (isMeshActive) return;

        const { scale } = event.nativeEvent;
        if (cameraRef.current) {
            const newZ = initialCameraZ.current / scale;
            cameraRef.current.position.z = Math.max(sizesPan.minZoom, Math.min(sizesPan.maxZoom, newZ));
        }
    };

    const onPinchHandlerStateChange = (event) => {
        if (isMeshActive) return;

        const { state, scale } = event.nativeEvent;
        if (state === 2) {
            initialCameraZ.current = cameraRef.current.position.z;
        }
    };

    const backTouch = () => {
        if (meshClick.isActive) {
            meshClick.leave();
        }
        const backTouchAction = () => {
            meshClick.leave();
        };
        return {
            active: isMeshActive,
            action: backTouchAction,
        };
    };

    return { panHandlers, isMeshActive, onPinchGestureEvent, onPinchHandlerStateChange };
};

export default useInteractionHandlers;
