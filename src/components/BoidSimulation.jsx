import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

class Boid {
  constructor(p, x, y, groupId, totalGroups) {
    this.p = p;
    // Initialize position near group center
    this.position = p.createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(p.random(2, 4));
    this.acceleration = p.createVector();
    this.groupId = groupId;

    // Get a nice color for the group using HSL
    const hue = (groupId * (360 / totalGroups)) % 360;
    this.color = p.color(`hsl(${hue}, 100%, 50%)`);
  }

  // ... (keep all the previous Boid methods the same) ...

  show(params) {
    const angle = this.velocity.heading() + this.p.PI / 2;
    const size = params.boidSize;

    this.p.push();
    this.p.translate(this.position.x, this.position.y);
    this.p.rotate(angle);
    this.p.fill(this.color);
    this.p.noStroke();
    this.p.beginShape();
    this.p.vertex(0, -size);
    this.p.vertex(-size/2, size);
    this.p.vertex(size/2, size);
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }
}

const EnhancedBoids = () => {
  const canvasRef = useRef(null);
  const p5Instance = useRef(null);
  const flock = useRef([]);
  const [params, setParams] = useState({
    numFlocks: 3,
    nodesPerFlock: 50,
    separation: 2,
    cohesion: 1,
    alignment: 0.6,
    maxForce: 0.2,
    maxSpeed: 4,
    perceptionRadius: 50,
    separationRadius: 30,
    boidSize: 8,
    mouseRadius: 100,
    mouseRepel: true,
    spaceAwareMult: 5,
    laziness: 0,
    speedLimit: 10
  });

  const resetFlock = (p) => {
    flock.current = [];
    // Calculate positions for each group
    for (let g = 0; g < params.numFlocks; g++) {
      // Create starting points in different areas
      const centerX = p.width * (0.3 + (g * 0.2));
      const centerY = p.height * 0.5;

      for (let i = 0; i < params.nodesPerFlock; i++) {
        // Add some random offset from center
        const offsetX = p.random(-50, 50);
        const offsetY = p.random(-50, 50);
        flock.current.push(
          new Boid(p, centerX + offsetX, centerY + offsetY, g, params.numFlocks)
        );
      }
    }
  };

  useEffect(() => {
    const sketch = (p) => {
      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(canvasRef.current);
        resetFlock(p);
      };

      p.draw = () => {
        p.background(0);

        for (let boid of flock.current) {
          boid.edges();
          boid.flock(flock.current, params);
          boid.update(params);
          boid.show(params);
        }

        // Show framerate
        p.fill(255);
        p.noStroke();
        p.text(`framerate ${p.frameRate().toFixed(1)}`, 10, 20);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      p.mousePressed = () => {
        if (params.mouseRepel) {
          const mouse = p.createVector(p.mouseX, p.mouseY);
          for (let boid of flock.current) {
            const d = boid.position.dist(mouse);
            if (d < params.mouseRadius * 2) {
              const force = p5.Vector.sub(boid.position, mouse);
              force.setMag(5);
              boid.applyForce(force);
            }
          }
        }
      };
    };

    p5Instance.current = new p5(sketch);

    return () => {
      p5Instance.current.remove();
    };
  }, []);

  const Controls = () => (
    <div className="fixed right-4 top-4 bg-black/80 p-4 rounded-lg text-white space-y-4" style={{ minWidth: '250px' }}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg">Controls</h3>
        <button
          onClick={() => resetFlock(p5Instance.current)}
          className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex justify-between">
            Flocks: {params.numFlocks}
            <div className="flex gap-1">
              <button
                onClick={() => setParams(p => ({ ...p, numFlocks: Math.max(1, p.numFlocks - 1) }))}
                className="px-2 bg-gray-700 rounded"
              >-</button>
              <button
                onClick={() => setParams(p => ({ ...p, numFlocks: p.numFlocks + 1 }))}
                className="px-2 bg-gray-700 rounded"
              >+</button>
            </div>
          </label>
        </div>

        <div>
          <label className="flex justify-between">
            Nodes per flock: {params.nodesPerFlock}
            <div className="flex gap-1">
              <button
                onClick={() => setParams(p => ({ ...p, nodesPerFlock: Math.max(1, p.nodesPerFlock - 5) }))}
                className="px-2 bg-gray-700 rounded"
              >-</button>
              <button
                onClick={() => setParams(p => ({ ...p, nodesPerFlock: p.nodesPerFlock + 5 }))}
                className="px-2 bg-gray-700 rounded"
              >+</button>
            </div>
          </label>
        </div>

        <div className="space-y-2">
          <label>
            Separation ({params.separation.toFixed(1)})
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={params.separation}
              onChange={e => setParams(p => ({ ...p, separation: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </label>

          <label>
            Cohesion ({params.cohesion.toFixed(1)})
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={params.cohesion}
              onChange={e => setParams(p => ({ ...p, cohesion: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </label>

          <label>
            Alignment ({params.alignment.toFixed(1)})
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={params.alignment}
              onChange={e => setParams(p => ({ ...p, alignment: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </label>

          <label>
            Speed Limit ({params.speedLimit.toFixed(1)})
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={params.speedLimit}
              onChange={e => setParams(p => ({ ...p, speedLimit: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </label>

          <label>
            Space Aware Mult ({params.spaceAwareMult.toFixed(1)})
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={params.spaceAwareMult}
              onChange={e => setParams(p => ({ ...p, spaceAwareMult: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </label>

          <label>
            Laziness ({params.laziness.toFixed(1)})
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={params.laziness}
              onChange={e => setParams(p => ({ ...p, laziness: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={params.mouseRepel}
              onChange={e => setParams(p => ({ ...p, mouseRepel: e.target.checked }))}
            />
            Mouse Repel
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      <div ref={canvasRef} className="absolute inset-0" />
      <Controls />
    </div>
  );
};

export default EnhancedBoids;