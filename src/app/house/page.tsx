'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeHouse = () => {
  const mountRef: any = useRef(null);

  // State for colors
  const [wallColor, setWallColor] = useState('#8b4513');
  const [roofColor, setRoofColor] = useState('#ffffff');
  const [floorColor, setFloorColor] = useState('#228b22');

  useEffect(() => {
    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Background color
    scene.background = new THREE.Color(0x87ceeb);

    // Lighting
    const light = new THREE.PointLight(0x000fff, 1, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xfff000);
    scene.add(ambientLight);

    // Helpers
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // House components
    const wallsMaterial = new THREE.MeshStandardMaterial({ color: wallColor });
    const frontWallsMaterial = new THREE.MeshStandardMaterial({ color: '000fff' });
    const backWallsMaterial = new THREE.MeshStandardMaterial({ color: wallColor });
    const leftWallsMaterial = new THREE.MeshStandardMaterial({ color: wallColor });
    const rightWallsMaterial = new THREE.MeshStandardMaterial({ color: wallColor });
    const wallsGeometry = new THREE.BoxGeometry(.1, 4, 6);
    const leftWall = new THREE.Mesh(wallsGeometry, leftWallsMaterial);
    leftWall.position.y = 2;
    leftWall.position.x = -3;
    scene.add(leftWall);
    const rightWall = new THREE.Mesh(wallsGeometry, rightWallsMaterial);
    rightWall.position.y = 2;
    rightWall.position.x = 3
    scene.add(rightWall);
    const frontWall = new THREE.Mesh(wallsGeometry, frontWallsMaterial);
    frontWall.position.y = 2;
    frontWall.position.x = 0;
    frontWall.position.z = 3;
    frontWall.rotation.y = Math.PI / 2;
    scene.add(frontWall);
    const backWall = new THREE.Mesh(wallsGeometry, backWallsMaterial);
    backWall.position.y = 2;
    backWall.position.x = 0;
    backWall.position.z = -3;
    backWall.rotation.y = Math.PI / 2;
    scene.add(backWall);

    const roofMaterial = new THREE.MeshStandardMaterial({ color: roofColor });
    const roofGeometry = new THREE.ConeGeometry(5, 3, 4);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 5.5;
    roof.rotation.y = Math.PI / 4;
    scene.add(roof);

    const floorMaterial = new THREE.MeshStandardMaterial({ color: floorColor });
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const ground = new THREE.Mesh(groundGeometry, floorMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    const doorMaterial = new THREE.MeshStandardMaterial({ color: '#654321' });
    const doorGeometry = new THREE.BoxGeometry(1, 2, 0.1);
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1, 3.05);
    scene.add(door);

    // Camera setup
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 2, 0);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Update materials when colors change
    // const updateColors = () => {
    //   walls.material.color.set(wallColor);
    //   roof.material.color.set(roofColor);
    //   ground.material.color.set(floorColor);
    // };

    // updateColors();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      controls.dispose();
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [wallColor, roofColor, floorColor]); // Re-run effect on color changes

  return (
    <>
      <div ref={mountRef} style={{ width: '100vw', height: '90vh' }}></div>
      {/* <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <label>
          Wall Color:
          <input
            type="color"
            value={wallColor}
            onChange={(e) => setWallColor(e.target.value)}
          />
        </label>
        <label>
          Roof Color:
          <input
            type="color"
            value={roofColor}
            onChange={(e) => setRoofColor(e.target.value)}
          />
        </label>
        <label>
          Floor Color:
          <input
            type="color"
            value={floorColor}
            onChange={(e) => setFloorColor(e.target.value)}
          />
        </label>
      </div> */}
    </>
  );
};

export default ThreeHouse;

