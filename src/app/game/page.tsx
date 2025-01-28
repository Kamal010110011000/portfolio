'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { cameraPosition } from 'three/tsl';

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

    let userHealth = 5;
    let enemyHealth = 3;
    // Camera initial position
    camera.position.set(0, 2, 5); // Eye level

    // PointerLockControls for mouse-based navigation
    const controls = new PointerLockControls(camera, document.body);

    document.addEventListener('click', () => {
      controls.lock(); // Lock pointer on click
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
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
    // Enemies
    const enemies: any = [];
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

    const spawnEnemy = () => {
      const enemyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);

      // Random spawn position
      const x = (Math.random() - 0.5) * hallwayWidth;
      const y = 1; // Ground level
      const z = -Math.random() * 40 - 20;

      enemy.position.set(x, y, z);
      scene.add(enemy);

      enemies.push({ enemy, health: enemyHealth });
    };

    // Spawn 5 enemies initially
    for (let i = 0; i < 5; i++) {
      spawnEnemy();
    }

    // Game Logic: Check Collisions and Update
    const checkCollisions = () => {
      enemies.forEach((data: any, index: any) => {
        const { enemy, health } = data;

        // Enemy moving toward the camera
        enemy.position.z += 0.1;

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
          if (laser.laser.position.distanceTo(enemy.position) < 1) {
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

      checkCollisions();

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
