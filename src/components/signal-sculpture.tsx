import { useEffect, useRef, useState } from "react";
/** Lazy Three.js, bounded DPR and 30fps. Static CSS fallback for mobile/reduced motion. */
export function SignalSculpture() {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce), (max-width: 700px)").matches)
      return;
    let dispose = () => {};
    let cancelled = false;
    void import("three")
      .then((T) => {
        if (cancelled) return;
        let renderer: InstanceType<typeof T.WebGLRenderer>;
        try {
          renderer = new T.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
        camera.position.z = 7;
        const group = new T.Group();
        scene.add(group);
        const geometry = new T.TorusGeometry(1.35, 0.065, 12, 100);
        const materials = [0x4ee7bc, 0x83a7ff, 0xe1f7f1].map(
          (color) => new T.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.25 }),
        );
        for (let i = 0; i < 6; i++) {
          const mesh = new T.Mesh(geometry, materials[i % 3]);
          mesh.rotation.set(i * 0.5, i * 0.65, i * 0.4);
          group.add(mesh);
        }
        scene.add(new T.AmbientLight(0xffffff, 2));
        const light = new T.DirectionalLight(0xffffff, 4);
        light.position.set(3, 4, 5);
        scene.add(light);
        element.appendChild(renderer.domElement);
        setLive(true);
        const resize = () => {
          const w = element.clientWidth,
            h = element.clientHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(element);
        resize();
        let x = 0,
          y = 0,
          frame = 0,
          last = 0,
          visible = true;
        const move = (event: PointerEvent) => {
          const r = element.getBoundingClientRect();
          x = (event.clientX - r.left) / r.width - 0.5;
          y = (event.clientY - r.top) / r.height - 0.5;
        };
        element.addEventListener("pointermove", move);
        const intersection = new IntersectionObserver((entries) => {
          visible = entries[0]?.isIntersecting ?? false;
        });
        intersection.observe(element);
        const render = (time: number) => {
          frame = requestAnimationFrame(render);
          if (!visible || document.hidden || time - last < 32) return;
          last = time;
          group.rotation.y += 0.003;
          group.rotation.x += (y * 0.3 + scrollY * 0.0003 - group.rotation.x) * 0.035;
          group.rotation.z += (x * 0.3 - group.rotation.z) * 0.035;
          renderer.render(scene, camera);
        };
        frame = requestAnimationFrame(render);
        dispose = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          intersection.disconnect();
          element.removeEventListener("pointermove", move);
          geometry.dispose();
          materials.forEach((m) => m.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      dispose();
    };
  }, []);
  return (
    <div
      className="signal-sculpture"
      ref={host}
      role="img"
      aria-label="Interconnected signal rings representing customer evidence"
    >
      {!live && (
        <div className="sculpture-fallback" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <i key={i} style={{ transform: `rotate(${i * 38}deg) rotateY(45deg)` }} />
          ))}
        </div>
      )}
      <span className="sculpture-label">FROM SIGNAL TO DIRECTION</span>
    </div>
  );
}
