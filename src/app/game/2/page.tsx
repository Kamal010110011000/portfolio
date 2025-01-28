"use client";

import { useEffect, useRef } from 'react';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';

const InteractiveHallway = () => {
  const mountRef: any = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Game State
    let userHealth = 5;
    const enemyHealth = 3;

    camera.position.set(0, 2, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 5, 0);
    scene.add(directionalLight);

    // // Lighting
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // scene.add(ambientLight);

    // const spotlight = new THREE.SpotLight(0xffaa00, 1, 100, Math.PI / 4, 0.5);
    // spotlight.position.set(0, 5, 0);
    // scene.add(spotlight);

    // Hallway and Gun setup here...

    // FBX Loader
    const loader = new FBXLoader();
    const textureLoader = new THREE.TextureLoader();

    // Load the Texture
    const diffuseTexture = textureLoader.load('/texture/kenney_animated-characters-3/Skins/zombieMaleA.png'); // Diffuse (color) texture
    const normalTexture = textureLoader.load('/texture/kenney_animated-characters-3/Skins/humanMaleA.png');  // Optional normal map

    // Load Enemy Model
    let enemyModel: any = null;
    loader.load('/texture/kenney_animated-characters-3/Model/characterMedium.fbx', (fbx) => {
      enemyModel = fbx;
      enemyModel.scale.set(1, 1, 1); // Scale down the model (adjust as needed)
      enemyModel.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Use a basic material for testing
          child.castShadow = true;
          child.receiveShadow = true;

          // Apply textures to the material
          child.material.map = diffuseTexture; // Apply the diffuse texture
          child.material.normalMap = normalTexture; // Optional: Apply a normal map
          child.material.needsUpdate = true; // Ensure the material updates
        }
      });
    });

    // Enemies
    const enemies: any = [];
    const spawnEnemy = () => {
      if (!enemyModel) return; // Ensure the model is loaded

      const enemy = enemyModel.clone();
      enemy.position.set(
        (Math.random() - 0.5) * 8, // Random x position
        0, // Ground level
        -Math.random() * 40 - 20 // Random z position
      );
      scene.add(enemy);
      enemies.push({ enemy, health: enemyHealth });
    };

    // Spawn 5 enemies initially
    const interval = setInterval(() => {
      if (enemies.length < 5) spawnEnemy();
    }, 3000);

    const helper = new THREE.BoxHelper(enemyModel, 0xff0000);
    scene.add(helper);
    // Game Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Move enemies toward the player
      enemies.forEach(({ enemy }: any, index: number) => {
        camera.lookAt(enemy.position);
        // enemy.position.set(0, 1, -10);
        // enemy.position.z += 0.1;

        if (enemy.position.z > camera.position.z - 1) {
          userHealth--;
          scene.remove(enemy);
          enemies.splice(index, 1);

          if (userHealth <= 0) {
            console.log("Game Over");
            clearInterval(interval);
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default InteractiveHallway;
