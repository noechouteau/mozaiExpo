import {Dimensions, PanResponder} from 'react-native';
import {useRef, useEffect, useState} from 'react';
import {cameraRef, planes, raycaster, targetPosition} from './SceneManager';
import {THREE} from "expo-three";
import MeshClick from "@/components/gallery/MeshClick";
import { Gyroscope } from 'expo-sensors';
const {width, height} = Dimensions.get('window');
const useInteractionHandlers = () => {
    const isTouching = useRef<boolean>(false);
    const isMoving = useRef<boolean>(false);
    const initialTouchDistance = useRef<number>(0);
    const initialCameraZ = useRef<number>(0);
    const mouse = useRef(new THREE.Vector2(-10, -10)).current;
    const [isMeshActive, setIsMeshActive] = useState(false);

    const sizesPan = {
        minZoom: 5,
        maxZoom: 30,
        minX: -10,
        maxX: 10,
        minY: -10,
        maxY: 10,
    }
    const meshClick = new MeshClick({
        planes: planes,
        camera: cameraRef.current,
        onStateChange: setIsMeshActive,
    });
    useEffect(() => {
        const gyroSensitivity = 0.02;
        let gyroSubscription: any;
        const updateGyroscope = ({ x, y }: { x: number; y: number }) => {
            if (cameraRef.current && !isTouching.current && !isMeshActive) {
                targetPosition.current.x -= y * gyroSensitivity;
                targetPosition.current.y += x * gyroSensitivity;
                targetPosition.current.x = Math.max(
                    Math.min(targetPosition.current.x, sizesPan.maxX),
                    sizesPan.minX
                );
                targetPosition.current.y = Math.max(
                    Math.min(targetPosition.current.y, sizesPan.maxY),
                    sizesPan.minY
                );
            }
        };
        Gyroscope.setUpdateInterval(16);
        const subscribeGyroscope = () => {
            gyroSubscription = Gyroscope.addListener(updateGyroscope);
        };
        const unsubscribeGyroscope = () => {
            if (gyroSubscription) {
                gyroSubscription.remove();
            }
        };
        subscribeGyroscope();
        return () => {
            unsubscribeGyroscope();
        };
    }, [isMeshActive]);
    const handleTouchStart = ({nativeEvent}: {
        nativeEvent: { locationX: number, locationY: number, touches: { locationX: number, locationY: number }[] }
    }) => {
        if (meshClick.isActive) return;
        const {locationX, locationY, touches} = nativeEvent;
        if (touches.length === 1) {
            mouse.set(
                (locationX / width) * 2 - 1,
                -(locationY / height) * 2 + 1
            );
            isTouching.current = true;
            isMoving.current = false;
            checkClick();
        } else if (touches.length === 2) {
            initialTouchDistance.current = Math.hypot(
                touches[0].locationX - touches[1].locationX,
                touches[0].locationY - touches[1].locationY
            );
            initialCameraZ.current = cameraRef.current?.position.z || 10;
        }
    };
    const handleTouchEnd = () => {
        isTouching.current = false;
        isMoving.current = false;
        mouse.set(-10, -10);
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
        onPanResponderMove: (evt, gestureState) => {
            if (meshClick.isActive) return;
            const {vx, vy} = gestureState;
            isMoving.current = !(vx === 0 && vy === 0);
            targetPosition.current.x -= vx * 0.5;
            targetPosition.current.y += vy * 0.5;
        },
        onPanResponderRelease: () => {
            isMoving.current = false;
        },
    }).panHandlers;
    const handleTouchMove = ({ nativeEvent }: {
        nativeEvent: { touches: { locationX: number, locationY: number }[] }
    }) => {
        const { touches } = nativeEvent;
        if (isMeshActive && meshClick.planeClicked) {
            if (touches.length === 1) {
                const { locationX, locationY } = touches[0];
                const deltaX = locationX - width / 2;
                const deltaY = locationY - height / 2;
                const sensitivity = 0.0005;
                meshClick.planeClicked.rotation.y += deltaX * sensitivity;
                meshClick.planeClicked.rotation.x += deltaY * sensitivity;
            }
        } else {
            if (touches.length === 1) {
                const { locationX, locationY } = touches[0];
                const sensitivity = 0.001;
                targetPosition.current.x -= (locationX - width / 2) * sensitivity;
                targetPosition.current.y += (locationY - height / 2) * sensitivity;
                targetPosition.current.x = Math.max(Math.min(targetPosition.current.x, sizesPan.maxX), sizesPan.minX);
                targetPosition.current.y = Math.max(Math.min(targetPosition.current.y, sizesPan.maxY), sizesPan.minY);
            } else if (touches.length === 2) {
                const distance = Math.hypot(
                    touches[0].locationX - touches[1].locationX,
                    touches[0].locationY - touches[1].locationY
                );
                const zoomFactor = (initialTouchDistance.current - distance) * 0.05;
                if (cameraRef.current) {
                    let newCameraZ = initialCameraZ.current + zoomFactor;
                    newCameraZ = Math.min(Math.max(newCameraZ, sizesPan.minZoom), sizesPan.maxZoom);
                    cameraRef.current.position.z = newCameraZ;
                }
            }
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
    return { handleTouchStart, handleTouchEnd, panHandlers, handleTouchMove, backTouch };
};
export default useInteractionHandlers;
