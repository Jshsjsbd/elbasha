import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParticleBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let material: THREE.PointsMaterial;

    let backgroundRef: THREE.Color;
    let fogRef: THREE.FogExp2;

    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    let lastBgColor = "";
    let lastParticleColor = "";

    init();
    animate();

    function getThemeColors() {
      const styles = getComputedStyle(document.documentElement);
      return {
        bgColor: styles.getPropertyValue("--bg-primary").trim(),
        particleColor: styles.getPropertyValue("--shadow-color").trim(),
      };
    }

    function init() {
      camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 5, 2000);
      camera.position.z = 500;

      scene = new THREE.Scene();

      const { bgColor, particleColor } = getThemeColors();

      backgroundRef = new THREE.Color(bgColor);
      scene.background = backgroundRef;

      fogRef = new THREE.FogExp2(bgColor, 0.001);
      scene.fog = fogRef;

      const geometry = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const size = 2000;

      for (let i = 0; i < 20000; i++) {
        const x = (Math.random() * size + Math.random() * size) / 2 - size / 2;
        const y = (Math.random() * size + Math.random() * size) / 2 - size / 2;
        const z = (Math.random() * size + Math.random() * size) / 2 - size / 2;
        vertices.push(x, y, z);
      }

      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

      material = new THREE.PointsMaterial({
        size: 2,
        color: new THREE.Color(particleColor),
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      lastBgColor = bgColor;
      lastParticleColor = particleColor;

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("resize", onWindowResize);
    }

    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onPointerMove(event: PointerEvent) {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    }

    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    function render() {
      const { bgColor, particleColor } = getThemeColors();

      if (bgColor && bgColor !== lastBgColor) {
        backgroundRef.set(bgColor);
        fogRef.color.set(bgColor);
        lastBgColor = bgColor;
      }

      if (particleColor && particleColor !== lastParticleColor) {
        material.color.set(particleColor);
        lastParticleColor = particleColor;
      }

      camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      scene.rotation.x += 0.001;
      scene.rotation.y += 0.002;

      renderer.render(scene, camera);
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onWindowResize);
      if (mountRef.current && renderer) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        filter: "blur(2.5px)",
        pointerEvents: "none",
      }}
    />
  );
}
