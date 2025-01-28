'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeInterior = () => {
  const mountRef: any = useRef(null);

  useEffect(() => {
    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Background color
    scene.background = new THREE.Color(0xcccccc);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 10, 5);
    scene.add(pointLight);

    // Room dimensions
    const roomWidth = 10;
    const roomHeight = 5;
    const roomDepth = 10;

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const wallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);

    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.z = -roomDepth / 2;
    backWall.position.y = roomHeight / 2;
    scene.add(backWall);

    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    frontWall.position.z = roomDepth / 2;
    frontWall.position.y = roomHeight / 2;
    frontWall.rotation.y = Math.PI;
    scene.add(frontWall);

    const sideWall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    sideWall1.rotation.y = Math.PI / 2;
    sideWall1.position.x = -roomWidth / 2;
    sideWall1.position.y = roomHeight / 2;
    scene.add(sideWall1);

    const sideWall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    sideWall2.rotation.y = -Math.PI / 2;
    sideWall2.position.x = roomWidth / 2;
    sideWall2.position.y = roomHeight / 2;
    scene.add(sideWall2);

    // Ceiling
    const ceiling = new THREE.Mesh(floorGeometry, wallMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    scene.add(ceiling);

    // Camera setup
    camera.position.set(0, 1.6, 2); // Initial position inside the room
    camera.lookAt(0, 1.6, 0);

    // Movement logic
    const speed = 0.1; // Movement speed
    const keys: any = {};

    const handleKeyDown = (event: any) => {
      keys[event.key] = true;
    };

    const handleKeyUp = (event: any) => {
      keys[event.key] = false;
    };

    const moveCamera = () => {
      if (keys['w'] || keys['ArrowUp']) {
        camera.position.z -= speed * Math.cos(camera.rotation.y);
        camera.position.x -= speed * Math.sin(camera.rotation.y);
      }
      if (keys['s'] || keys['ArrowDown']) {
        camera.position.z += speed * Math.cos(camera.rotation.y);
        camera.position.x += speed * Math.sin(camera.rotation.y);
      }
      if (keys['a'] || keys['ArrowLeft']) {
        camera.position.x -= speed * Math.cos(camera.rotation.y);
        camera.position.z += speed * Math.sin(camera.rotation.y);
      }
      if (keys['d'] || keys['ArrowRight']) {
        camera.position.x += speed * Math.cos(camera.rotation.y);
        camera.position.z -= speed * Math.sin(camera.rotation.y);
      }
    };

    // Mouse movement for looking around
    const handleMouseMove = (event: any) => {
      const { movementX, movementY } = event;
      camera.rotation.y -= movementX * 0.002;
      camera.rotation.x -= movementY * 0.002;
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x)); // Limit pitch
    };

    // Event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      moveCamera();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}></div>;
};

export default ThreeInterior;
