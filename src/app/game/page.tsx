'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Audio, AudioListener, AudioLoader } from 'three';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const InteractiveHallway = () => {
  const mountRef: any = useRef(null);
  const [gameOver, setGameOver] = useState(false); 
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if(mountRef.current != undefined){
      mountRef.current.appendChild(renderer.domElement);
    }

    let userHealth = 100;
    const enemyHealth = 3;
    // Camera initial position
    camera.position.set(0, 2, 5); // Eye level

    // PointerLockControls for mouse-based navigation
    const controls = new PointerLockControls(camera, document.body);

    document.addEventListener('click', () => {
      controls.lock(); // Lock pointer on click
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const spotlight = new THREE.SpotLight(0xffaa00, 1, 100, Math.PI / 4, 0.5);
    spotlight.position.set(0, 5, 0);
    spotlight.target.position.set(0, 0, -10);
    scene.add(spotlight);
    scene.add(spotlight.target);

    // Flickering effect for the spotlight
    const flickerLight = () => {
      spotlight.intensity = 0.5 + Math.random() * 0.5; // Random intensity between 0.5 and 1
    };

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 5, 0);
    scene.add(directionalLight);

    // Textures
    const textureLoader = new THREE.TextureLoader();
    const wallTexture = textureLoader.load('/texture/wall.jpg');
    const floorTexture = textureLoader.load('/texture/floor.jpg');
    const ceilingTexture = textureLoader.load('/texture/ceiling.jpg');

    // Hallway Geometry
    const hallwayWidth = 4;
    const hallwayHeight = 10;
    const hallwayDepth = 20;

    const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture });
    const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
    const ceilingMaterial = new THREE.MeshStandardMaterial({ map: ceilingTexture });

    const hallwayGroup = new THREE.Group();

    const createHallwaySegment = (zOffset: any) => {
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(hallwayWidth, hallwayDepth),
        floorMaterial
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.z = zOffset;

      const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(hallwayWidth, hallwayDepth),
        ceilingMaterial
      );
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.z = zOffset;
      ceiling.position.y = hallwayHeight - 5;

      const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(hallwayDepth, hallwayHeight),
        wallMaterial
      );
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.z = zOffset;
      leftWall.position.x = -hallwayWidth / 2;

      const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(hallwayDepth, hallwayHeight),
        wallMaterial
      );
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.position.z = zOffset;
      rightWall.position.x = hallwayWidth / 2;

      return [floor, ceiling, leftWall, rightWall];
    };

    const numSegments = 5;
    for (let i = 0; i < numSegments; i++) {
      const zOffset = -i * hallwayDepth;
      const segment = createHallwaySegment(zOffset);
      segment.forEach((mesh) => hallwayGroup.add(mesh));
    }
    scene.add(hallwayGroup);

        // Add Gun (Placeholder Box for Gun)
    const gunGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.4);
    const gunMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const gun = new THREE.Mesh(gunGeometry, gunMaterial);
    gun.position.set(0.3, -0.3, -0.6); // Position relative to the camera
    camera.add(gun);
    scene.add(camera);

    // Laser Shooting
    const lasers: any = [];
    const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

     const shootLaser = () => {
      const laserGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 32);
      // const laserGeometry = new THREE.SphereGeometry(0.02, 32, 32);
      const laser = new THREE.Mesh(laserGeometry, laserMaterial);

      // Position the laser at the gun's tip
      console.log(camera.position, 'cameraPosition');
      laser.position.copy(camera.position);
      laser.rotation.x = Math.PI / 2;

      // Get the camera's forward direction
      const laserDirection = new THREE.Vector3();
      camera.getWorldDirection(laserDirection);

      // Attach direction to the laser for movement
      lasers.push({ laser, direction: laserDirection.clone() });
      scene.add(laser);
    };

    document.addEventListener('click', shootLaser);


    // Animate Lasers
    const animateLasers = () => {
      lasers.forEach(({ laser, direction }: any, index: any) => {
        // Move laser in its direction
        laser.position.addScaledVector(direction, 0.4);

        // Remove laser if it moves too far
        if (laser.position.z < -50 || laser.position.z > 50 || Math.abs(laser.position.x) > 50) {
          scene.remove(laser);
          lasers.splice(index, 1);
        }
      });
    };

    // Add Random Objects
    const addRandomObjects = (z: number) => {
      const objects = [];
      const objectMaterial = new THREE.MeshStandardMaterial({ color: 0x44aa88 });

      for (let i = 0; i < 1; i++) {
        const size = Math.random() * 0.5 + 0.5; // Random size
        const geometry = Math.random() > 0.5
          ? new THREE.BoxGeometry(size, size, size)
          : new THREE.SphereGeometry(size / 2, 32, 32);

        const object = new THREE.Mesh(geometry, objectMaterial);
        object.position.set(
          Math.random() * hallwayWidth - hallwayWidth / 2, // Random x within hallway
          size / 2, // Place on the floor
          z // Random z within the hallway length
        );

        objects.push(object);
        scene.add(object);
      }

      return objects;
    };


    // Movement and Physics
    const speed = 0.1;
    const jumpSpeed = 0.2;
    const gravity = 0.01;
    let isJumping = false;
    let verticalVelocity = 0;

    const boundaries = {
      left: -hallwayWidth / 2 + 0.5,
      right: hallwayWidth / 2 - 0.5,
      forward: Infinity,
      backward: -hallwayDepth,
    };
    // FBX Loader
    const loader = new FBXLoader();
    const gltfLoader = new GLTFLoader();
    // Load the Texture
    const diffuseTexture = textureLoader.load('/texture/kenney_animated-characters-3/Skins/zombieMaleA.png'); // Diffuse (color) texture
    const normalTexture = textureLoader.load('/texture/kenney_animated-characters-3/Skins/humanMaleA.png');  // Optional normal map

    // Audio
    const listener = new AudioListener();
    camera.add(listener);

    const audioLoader = new AudioLoader();
    const mixers: any = []; // Array to hold AnimationMixers
    // Load Enemy Model
    // let enemyModel: any = null;
    // gltfLoader.load('/texture/Rampaging-T-Rex.glb', (fbx: any) => {
    //   // console.log('Model Loaded:', fbx);
    //   enemyModel = fbx;
    //   // console.log(enemyModel, 'enemyModel');
    //   // enemyModel.scale.set(0.002, 0.002, 0.002); // Scale down the model (adjust as needed)
    //   enemyModel.scale.set(0.005, 0.005, 0.005); // Try different scale values
    //   const mixer = new THREE.AnimationMixer(enemyModel);
  
    //   if(enemyModel.animations.length > 0){
    //     const action = mixer.clipAction(enemyModel.animations[0]);
    //     action.play();
    //   }
    //   mixers.push(mixer);

    //   // Optional: Check the bounding box to ensure proper scaling
    //   // const box = new THREE.Box3().setFromObject(enemyModel);
    //   // console.log('Model Bounding Box:', box.getSize(new THREE.Vector3())); // Log the size
    //   enemyModel.traverse((child: any) => {
    //     // console.log(child, 'test')
    //     if (child.isMesh) {
    //       // console.log('child', child);
    //       child.castShadow = true;
    //       child.receiveShadow = true;
    //       // child.material = new THREE.MeshStandardMaterial({ color: 0xfffff }); // Use a basic material for testing

    //       // Apply textures to the material
    //       // child.material.map = diffuseTexture; // Apply the diffuse texture
    //       // child.material.normalMap = normalTexture; // Optional: Apply a normal map
    //       child.material.needsUpdate = true;
    //     }
    //   });
    // });
    // Enemies
    const enemies: any = [];
    //  const spawnEnemy = () => {
    //   console.log('spawnEnemy', enemyModel);
    //   if (!enemyModel) return; // Ensure the model is loaded

    //   const enemy = enemyModel.scenes?.[0]?.clone();
    //   // enemy.position.set(0, 1, -10); // Place the enemy in front of the camera

    //   enemy.position.set(
    //     (Math.random() - 0.5) * hallwayWidth, // Random x position
    //     1, // Ground level
    //     -Math.random() * 40 - 20 // Random z position
    //   );
    //   scene.add(enemy);
    //   enemies.push({ enemy, health: enemyHealth });
    // };

    // Game Logic: Check Collisions and Update

     // Function to spawn an enemy
    const spawnEnemy = () => {
      gltfLoader.load('/texture/Rampaging-T-Rex.glb', (gltf) => {
        const enemyModel = gltf.scene;

        // Scale and randomize position
        enemyModel.scale.set(0.5, 0.5, 0.5);
        enemyModel.position.set(
        (Math.random() - 0.5) * hallwayWidth -1, // Random x position
        1, // Ground level
        -Math.random() * 40 - 20 // Random z position
        ); // Random x-position, far back z-position

      enemyModel.traverse((child: any) => {
        if (child.isMesh) {
          // console.log('child', child);
          child.castShadow = true;
          child.receiveShadow = true;
          // child.material = new THREE.MeshStandardMaterial({ color: 0xfffff }); // Use a basic material for testing

          // Apply textures to the material
          // child.material.map = diffuseTexture; // Apply the diffuse texture
          // child.material.normalMap = normalTexture; // Optional: Apply a normal map
          child.material.needsUpdate = true;
        }
      });
        // Animation mixer for this enemy
        const mixer = new THREE.AnimationMixer(enemyModel);

        if (gltf.animations.length > 0) {
          const action = mixer.clipAction(gltf.animations[0]); // Assume first animation is the running animation
          action.play();
        }
         // Load and attach footstep sound
        const footstepSound = new Audio(listener);
        audioLoader.load('/public/texture/515783_6142149-lq.mp3', (buffer) => {
          footstepSound.setBuffer(buffer);
          footstepSound.setLoop(false); // Play sound only once per footstep
          footstepSound.setVolume(0.5);
        });

        // Play footsteps at intervals based on animation speed
        const footstepInterval = 0.5; // Adjust interval to sync with animation (in seconds)
        let timeSinceLastStep = 0;

        enemies.push({ 
          enemy: enemyModel, 
          mixer, 
          health: enemyHealth,
          footstepSound,
          playFootsteps: (delta: any) => {
            timeSinceLastStep += delta;
            console.log(footstepInterval, timeSinceLastStep, 'footstepInterval, timeSinceLastStep');
            // if (timeSinceLastStep >= footstepInterval) {
              if (footstepSound.isPlaying) footstepSound.stop();
              footstepSound.play();
              timeSinceLastStep = 0;
            }
          // },
         });
        scene.add(enemyModel);
        mixers.push(mixer);
      });
    };
    // Spawn 5 enemies initially
    const interval = setInterval(() => {
      if (enemies.length < 1) spawnEnemy();
    }, 3000);


    const checkCollisions = (dalta: any) => {
      enemies.forEach((data: any, index: any) => {
        const { enemy, health, playFootsteps } = data;

        // Enemy moving toward the camera
        enemy.position.z += 0.1;
        playFootsteps(dalta); // Play footstep sound at intervals
        // Check if the enemy touches the user
        if (enemy.position.z > camera.position.z - 1) {
          userHealth--;
          console.log(`User hit! Health: ${userHealth}`);
          scene.remove(enemy);
          enemies.splice(index, 1);
          spawnEnemy();

          if (userHealth <= 0) {
            setGameOver(true);
            return;
          }
        }

        // Check if laser hits the enemy
        lasers.forEach((laser: any, laserIndex: any) => {
          // console.log(laser.laser.position, enemy.position, 'laserPosition, enemyPosition', laser.laser.position.distanceTo(enemy.position));
          if (laser.laser.position.distanceTo(enemy.position) < 5) {
            data.health--;
            console.log(`Enemy hit! Health: ${data.health}`);
            scene.remove(laser.laser);
            lasers.splice(laserIndex, 1);

            // Remove enemy if health is 0
            if (data.health <= 0) {
              scene.remove(enemy);
              if(!gameOver){
                setScore((prev) => prev + 1);
              }
              enemies.splice(index, 1);
              spawnEnemy();
            }
          }
        });
      });
    };

    const keys: any = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false, Control: false };
    document.addEventListener('keydown', (e) => {
      if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
    });
    document.addEventListener('keyup', (e) => {
      if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
    });

    // Animate Function
    const clock = new THREE.Clock();

    const animate = () => {
      if(gameOver) return;
      requestAnimationFrame(animate);

      if(keys.Control){
        shootLaser();
      }
      // Handle horizontal movement
      if (keys.ArrowUp) {
        const nextZ = camera.position.z - speed;
        console.log('nextZ', nextZ, hallwayGroup.position.z, hallwayDepth, boundaries.backward);
        // if(Math.abs(Math.floor(nextZ * 1000000)) % 3000000 == 0){
        //   const objects = addRandomObjects(nextZ - 5);
        // }
        if (hallwayGroup.position.z >= hallwayDepth) {
          hallwayGroup.position.z = 0;
        }
        if (nextZ > boundaries.backward) 
          camera.position.z = nextZ;
        else camera.position.z = 0;
        
      }
      if (keys.ArrowDown) {
        const nextZ = camera.position.z + speed;
        if (nextZ < boundaries.forward) camera.position.z = nextZ;
      }
      if (keys.ArrowLeft) {
        const nextX = camera.position.x - speed;
        if (nextX > boundaries.left) camera.position.x = nextX;
      }
      if (keys.ArrowRight) {
        const nextX = camera.position.x + speed;
        if (nextX < boundaries.right) camera.position.x = nextX;
      }

      // Handle jumping
      if (keys.Space && !isJumping) {
        isJumping = true;
        verticalVelocity = jumpSpeed;
      }

      if (isJumping) {
        camera.position.y += verticalVelocity;
        verticalVelocity -= gravity;

        if (camera.position.y <= 2) {
          camera.position.y = 2; // Reset to floor level
          isJumping = false;
        }
      }

      // Move hallway backward
      // hallwayGroup.position.z += speed;
      // if (hallwayGroup.position.z >= hallwayDepth) {
      //   hallwayGroup.position.z = 0;
      // }
 
     // Update lasers
      // animateLasers();
      // Animate lasers and enemies
      lasers.forEach((laser: any) => {
        laser.laser.position.addScaledVector(laser.direction, 0.5);
      });

      // Flickering light
      flickerLight();


      // Update mixers
      const delta = clock.getDelta();
      mixers.forEach((mixer: any) => mixer.update(delta));
      checkCollisions(delta);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      if(mountRef.current != undefined){
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      {gameOver ? (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'red',
            fontSize: '32px',
          }}
        >
          <p>Game Over</p>
          <br/>
          <button onClick={() => {setGameOver(false); setScore(0)}}>Restart</button>
        </div>
      ) : (
        <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />
      )}

      {/* Crosshair (Gun Pointer) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '10px',
          height: '10px',
          backgroundColor: 'white',
          borderRadius: '50%',
          zIndex: 10,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          zIndex: 10,
        }}
      ><h5>SCORE: {score}</h5></div>
    </>
  );
};

export default InteractiveHallway;
