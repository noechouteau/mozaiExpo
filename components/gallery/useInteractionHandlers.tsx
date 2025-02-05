import {Dimensions, PanResponder} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import {cameraRef, planes, raycaster, targetPosition} from './SceneManager';
import {THREE} from 'expo-three';
import MeshClick from '@/components/gallery/MeshClick';
import {Gyroscope} from "expo-sensors";

const {width, height} = Dimensions.get('window');

const sizesPan = {
    minZoom: 5,
    maxZoom: 30,
    minX: -10,
    maxX: 10,
    minY: -10,
    maxY: 10,
};

const useInteractionHandlers = () => {
    const initialCameraZ = useRef<number>(0);

    const mouse = useRef(new THREE.Vector2(-10, -10)).current;

    const [isMeshActive, setIsMeshActive] = useState<boolean>(false);
    const [isTurned, setIsTurned] = useState<boolean>(false);

    const startPosition = useRef({x: 0, y: 0});
    const clickThreshold = 5;
    const isMoving = useRef<boolean>(false);


    useEffect(() => {
        const gyroSensitivity = 0.02;
        let gyroSubscription: any;
        const updateGyroscope = ({ x, y }: { x: number; y: number }) => {
            if (cameraRef.current && !isMoving.current && !isMeshActive) {
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

    const meshClickRef = useRef<MeshClick | null>(null);

    if (!meshClickRef.current) {
        meshClickRef.current = new MeshClick({
            planes,
            camera: cameraRef.current,
            isMeshActive,
            setIsMeshActive,
            setIsTurned,
        });
    } else {
        meshClickRef.current.isMeshActive = isMeshActive;
        meshClickRef.current.isTurned = isTurned;
    }

    const meshClick = meshClickRef.current;

    const updateMouse = (x: number, y: number) => {
        const rendererSize = {width: cameraRef.current?.aspect * height || width, height};
        mouse.x = (x / rendererSize.width) * 2 - 1;
        mouse.y = -(y / rendererSize.height) * 2 + 1;
    };

    const checkClick = () => {
        if (!cameraRef.current) return;

        raycaster.setFromCamera(mouse, cameraRef.current);
        const [intersection] = raycaster.intersectObjects(planes, true);

        if (intersection) {
            const clickedObject = intersection.object as THREE.Mesh;

            if (!meshClick.isActive || meshClick.planeClicked === null) {
                meshClick.setPlaneClicked(clickedObject);
            } else if (meshClick.planeClicked === clickedObject) {
                meshClick.turn(clickedObject);
            }

        }
    };



    const panHandlers = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt, gestureState) => {
            startPosition.current = {
                x: gestureState.x0,
                y: gestureState.y0,
            };

            if (isMeshActive) return;
            updateMouse(gestureState.x0, gestureState.y0);
        },
        onPanResponderMove: (evt, gestureState) => {

            const {vx, vy, dx, dy, x0, y0} = gestureState;

            if (Math.abs(dx) > clickThreshold || Math.abs(dy) > clickThreshold) {
                isMoving.current = true;
            }

            if (isMeshActive) return;

            if (isMoving.current) {
                targetPosition.current.x -= vx * 0.5;
                targetPosition.current.y += vy * 0.5;
            }

            updateMouse(x0, y0);
        },
        onPanResponderRelease: () => {

            if (!isMoving.current) {
                checkClick();
            } else {
                // Glissement détecté
            }

            isMoving.current = false;
        },
    }).panHandlers;

    const onPinchGestureEvent = (event) => {
        const {scale} = event.nativeEvent;
        if (cameraRef.current) {
            const newZ = initialCameraZ.current / scale;
            cameraRef.current.position.z = Math.max(sizesPan.minZoom, Math.min(sizesPan.maxZoom, newZ));
        }
    };

    const onPinchHandlerStateChange = (event) => {
        const {state} = event.nativeEvent;
        if (state === 2) {
            initialCameraZ.current = cameraRef.current.position.z;
        }
    };

    return {panHandlers, meshClick, isMeshActive, onPinchGestureEvent, onPinchHandlerStateChange, isTurned};
};

export default useInteractionHandlers;
