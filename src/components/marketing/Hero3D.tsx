'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const support = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      if (!support) {
        setWebGLSupported(false);
        return;
      }
    } catch (e) {
      setWebGLSupported(false);
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Top right main white light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Green glow point light inside/near the object
    const greenGlow = new THREE.PointLight(0xB7C48E, 3.5, 12);
    greenGlow.position.set(-2, 1, 2);
    scene.add(greenGlow);

    // Contrast warm light
    const pinkGlow = new THREE.PointLight(0xEAECE5, 2.5, 10);
    pinkGlow.position.set(2, -3, 1);
    scene.add(pinkGlow);

    // Animation and GLB Loading setup
    let animationFrameId: number;
    let modelPivot: THREE.Group | null = null;
    
    // Load custom GLB model
    const loader = new GLTFLoader();
    loader.load(
      '/images/Vitalis%20Logo%203d.glb',
      (gltf) => {
        const loadedModel = gltf.scene;

        // Keep the original loaded materials/textures, only set shadow support
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Compute bounding box to auto-scale the model to fit container
        const box = new THREE.Box3().setFromObject(loadedModel);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 2.6; // target size in scene units
        const scale = targetSize / maxDim;
        loadedModel.scale.set(scale, scale, scale);

        // Center the model geometry inside its pivot group
        const center = box.getCenter(new THREE.Vector3());
        loadedModel.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        // Create pivot group
        const pivot = new THREE.Group();
        pivot.add(loadedModel);
        scene.add(pivot);

        modelPivot = pivot;
      },
      undefined,
      (error) => {
        console.error('Error loading custom GLB logo model:', error);
      }
    );

    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    // Interactive mouse movement (horizontal and slight vertical tilt)
    const handleMouseMove = (event: MouseEvent) => {
      if (prefersReducedMotion) return;
      const mouseX = (event.clientX / window.innerWidth) - 0.5;
      const mouseY = (event.clientY / window.innerHeight) - 0.5;
      targetRotationY = mouseX * 1.2;
      targetRotationX = mouseY * 0.3; // Limit vertical tilt to max ~17 degrees
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (modelPivot) {
        // Auto-rotation (slow and continuous - Y-axis only)
        if (prefersReducedMotion) {
          modelPivot.rotation.y += 0.002;
          modelPivot.rotation.x = 0; // Reset X rotation
        } else {
          modelPivot.rotation.y += 0.003;

          // Smooth interpolation (easing) for mouse interactive inertia
          currentRotationX += (targetRotationX - currentRotationX) * 0.05;
          currentRotationY += (targetRotationY - currentRotationY) * 0.05;

          // Influence Y rotation velocity with mouse horizontal position
          modelPivot.rotation.y += currentRotationY * 0.1;
          
          // Directly set X rotation (vertical tilt) to prevent accumulation and inversion!
          modelPivot.rotation.x = currentRotationX;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!webGLSupported) {
    return <StaticFallback />;
  }

  return (
    <div ref={containerRef} className="w-full h-full min-h-[350px] relative flex items-center justify-center">
      {/* Background radial soft green gradient decoration */}
      <div className="absolute w-72 h-72 bg-[#8A9A5B]/20 rounded-full blur-3xl opacity-60 animate-pulse pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full max-w-full block relative z-10 cursor-grab active:cursor-grabbing" />
    </div>
  );
}

function StaticFallback() {
  return (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center relative">
      {/* 2D elegant vector/CSS rotating glass-like ring representation */}
      <div className="absolute w-72 h-72 bg-[#8A9A5B]/10 rounded-full blur-3xl opacity-80" />
      <div className="relative w-64 h-64 rounded-full border border-white/40 bg-gradient-to-tr from-[#8A9A5B]/20 via-[#B7C48E]/40 to-[#EAECE5]/30 backdrop-blur-2xl shadow-xl flex items-center justify-center animate-[spin_20s_linear_infinite]">
        <div className="w-40 h-40 rounded-full bg-[#F4F5F1] shadow-inner border border-white/50" />
        <div className="absolute w-12 h-12 rounded-full bg-[#8A9A5B] opacity-60 blur-md top-4 left-10" />
        <div className="absolute w-16 h-16 rounded-full bg-[#B7C48E] opacity-50 blur-lg bottom-6 right-8" />
      </div>
    </div>
  );
}
