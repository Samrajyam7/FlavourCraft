import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCookingScene({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer, scene, camera, animationFrameId;
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 400;

    try {
      // Scene & Camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 2.5, 6.5);
      camera.lookAt(0, 0, 0);

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.8);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffedd5, 1.8);
      mainLight.position.set(4, 8, 5);
      mainLight.castShadow = true;
      scene.add(mainLight);

      const rimLight = new THREE.PointLight(0x52b788, 1.5, 10);
      rimLight.position.set(-4, -2, -3);
      scene.add(rimLight);

      const warmUnderLight = new THREE.PointLight(0xe9c46a, 2.0, 8);
      warmUnderLight.position.set(0, -1.8, 0);
      scene.add(warmUnderLight);

      // --- Group containing the 3D Cooking Pot & Food ---
      const potGroup = new THREE.Group();
      scene.add(potGroup);

      // 1. Cooking Pot Body (Deep Forest / Cast Iron metallic)
      const potMat = new THREE.MeshStandardMaterial({
        color: 0x1b4332,
        roughness: 0.35,
        metalness: 0.6,
      });

      const potBaseGeo = new THREE.CylinderGeometry(1.6, 1.3, 1.2, 36, 1, false);
      const potBase = new THREE.Mesh(potBaseGeo, potMat);
      potBase.position.y = -0.4;
      potBase.castShadow = true;
      potBase.receiveShadow = true;
      potGroup.add(potBase);

      // Pot Rim
      const rimGeo = new THREE.TorusGeometry(1.6, 0.1, 16, 40);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x52b788, metalness: 0.8, roughness: 0.2 });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.2;
      potGroup.add(rim);

      // Handles
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, metalness: 0.7, roughness: 0.3 });
      const handleGeo = new THREE.TorusGeometry(0.35, 0.08, 12, 24, Math.PI);

      const handleLeft = new THREE.Mesh(handleGeo, handleMat);
      handleLeft.position.set(-1.75, 0.05, 0);
      handleLeft.rotation.z = Math.PI / 2;
      potGroup.add(handleLeft);

      const handleRight = new THREE.Mesh(handleGeo, handleMat);
      handleRight.position.set(1.75, 0.05, 0);
      handleRight.rotation.z = -Math.PI / 2;
      potGroup.add(handleRight);

      // Golden Simmer Liquid Surface
      const soupGeo = new THREE.CircleGeometry(1.5, 32);
      const soupMat = new THREE.MeshStandardMaterial({
        color: 0xe9c46a,
        roughness: 0.15,
        metalness: 0.2,
        transparent: true,
        opacity: 0.9,
      });
      const soup = new THREE.Mesh(soupGeo, soupMat);
      soup.rotation.x = -Math.PI / 2;
      soup.position.y = 0.15;
      potGroup.add(soup);

      // --- Floating 3D Produce & Ingredients ---
      const floatingItems = [];

      // 1. Tomato (Vibrant red sphere with green calyx)
      const tomatoGroup = new THREE.Group();
      const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.2, metalness: 0.1 });
      const tomatoMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 24), tomatoMat);
      tomatoGroup.add(tomatoMesh);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.6 });
      const stemMesh = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.2, 5), stemMat);
      stemMesh.position.y = 0.42;
      stemMesh.rotation.x = Math.PI;
      tomatoGroup.add(stemMesh);
      tomatoGroup.position.set(-1.8, 1.4, 0.8);
      scene.add(tomatoGroup);
      floatingItems.push({ mesh: tomatoGroup, speedY: 1.2, speedRot: 0.015, baseY: 1.4, phase: 0 });

      // 2. Egg (Smooth golden cream ellipsoid)
      const eggMat = new THREE.MeshStandardMaterial({ color: 0xfdf6e2, roughness: 0.25, metalness: 0.05 });
      const eggGeo = new THREE.SphereGeometry(0.32, 24, 24);
      eggGeo.scale(1, 1.35, 1);
      const eggMesh = new THREE.Mesh(eggGeo, eggMat);
      eggMesh.position.set(1.9, 1.6, 0.6);
      eggMesh.rotation.z = 0.4;
      scene.add(eggMesh);
      floatingItems.push({ mesh: eggMesh, speedY: 1.0, speedRot: -0.012, baseY: 1.6, phase: 1.8 });

      // 3. Fresh Herb Leaf (Sage green petal)
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.4, side: THREE.DoubleSide });
      const leafGeo = new THREE.CylinderGeometry(0.25, 0.05, 0.6, 12);
      leafGeo.scale(1, 0.1, 1);
      const leafMesh = new THREE.Mesh(leafGeo, leafMat);
      leafMesh.position.set(-1.2, 2.2, -0.6);
      leafMesh.rotation.set(0.6, 0.4, 0.8);
      scene.add(leafMesh);
      floatingItems.push({ mesh: leafMesh, speedY: 1.5, speedRot: 0.02, baseY: 2.2, phase: 3.2 });

      // 4. Carrot slice / Coin
      const carrotMat = new THREE.MeshStandardMaterial({ color: 0xf77f00, roughness: 0.3, metalness: 0.1 });
      const carrotGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 20);
      const carrotMesh = new THREE.Mesh(carrotGeo, carrotMat);
      carrotMesh.position.set(1.4, 2.3, -0.4);
      carrotMesh.rotation.set(1.2, 0.3, 0.5);
      scene.add(carrotMesh);
      floatingItems.push({ mesh: carrotMesh, speedY: 1.3, speedRot: -0.018, baseY: 2.3, phase: 4.5 });

      // 5. Garlic Clove
      const garlicMat = new THREE.MeshStandardMaterial({ color: 0xfefae0, roughness: 0.3 });
      const garlicGeo = new THREE.ConeGeometry(0.25, 0.45, 8);
      const garlicMesh = new THREE.Mesh(garlicGeo, garlicMat);
      garlicMesh.position.set(0.2, 2.4, 1.2);
      garlicMesh.rotation.set(-0.5, 0.8, -0.3);
      scene.add(garlicMesh);
      floatingItems.push({ mesh: garlicMesh, speedY: 1.1, speedRot: 0.016, baseY: 2.4, phase: 5.7 });

      // --- Steam Particles ---
      const steamCount = 30;
      const steamGeo = new THREE.BufferGeometry();
      const steamPos = new Float32Array(steamCount * 3);
      const steamSpeed = new Float32Array(steamCount);

      for (let i = 0; i < steamCount; i++) {
        steamPos[i * 3] = (Math.random() - 0.5) * 1.8;
        steamPos[i * 3 + 1] = 0.2 + Math.random() * 2.5;
        steamPos[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
        steamSpeed[i] = 0.015 + Math.random() * 0.02;
      }

      steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));

      const steamMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.12,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });

      const steamParticles = new THREE.Points(steamGeo, steamMat);
      scene.add(steamParticles);

      // --- Mouse Parallax ---
      let mouseX = 0;
      let mouseY = 0;
      let targetRotX = 0;
      let targetRotY = 0;

      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        mouseX = normX * 0.4;
        mouseY = normY * 0.2;
      };

      window.addEventListener('mousemove', handleMouseMove);

      // --- Resize Handler ---
      const handleResize = () => {
        if (!container) return;
        width = container.clientWidth;
        height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      // --- Animation Loop ---
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Smooth pot tilt & gentle rotation
        targetRotY += (mouseX - targetRotY) * 0.05;
        targetRotX += (mouseY - targetRotX) * 0.05;

        potGroup.rotation.y = targetRotY * 0.8 + Math.sin(elapsedTime * 0.6) * 0.08;
        potGroup.rotation.x = 0.15 + targetRotX * 0.4;

        // Floating Ingredients
        floatingItems.forEach((item) => {
          item.mesh.position.y = item.baseY + Math.sin(elapsedTime * item.speedY + item.phase) * 0.2;
          item.mesh.rotation.x += item.speedRot;
          item.mesh.rotation.y += item.speedRot * 1.2;
        });

        // Steam Rising Loop
        const positions = steamParticles.geometry.attributes.position.array;
        for (let i = 0; i < steamCount; i++) {
          positions[i * 3 + 1] += steamSpeed[i];
          positions[i * 3] += Math.sin(elapsedTime + i) * 0.003;
          if (positions[i * 3 + 1] > 2.8) {
            positions[i * 3 + 1] = 0.2;
            positions[i * 3] = (Math.random() - 0.5) * 1.6;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
          }
        }
        steamParticles.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('Three.js initialization skipped or WebGL not available:', err);
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[360px] flex items-center justify-center overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
