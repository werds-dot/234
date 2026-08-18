import * as THREE from 'three'
import { simplexNoiseGLSL } from './simplex-noise-glsl'

export type LiquidMetalUniforms = {
  uTime: { value: number }
  uBass: { value: number }
  uMid: { value: number }
  uTreble: { value: number }
  uNoiseScale: { value: number }
  uSpikeScale: { value: number }
  uNoiseStrength: { value: number }
  uSpikeStrength: { value: number }
  uPulseStrength: { value: number }
  uDragDir: { value: THREE.Vector3 }
  uDragStrength: { value: number }
}

/**
 * Creates a MeshPhysicalMaterial whose surface is displaced in the vertex
 * shader to look like a ferrofluid / liquid metal blob reacting to audio.
 * Displacement uniforms are shared by reference, so updating `uniforms.uX.value`
 * after creation is reflected on the GPU without triggering a recompile.
 */
export function createLiquidMetalMaterial() {
  const uniforms: LiquidMetalUniforms = {
    uTime: { value: 0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uTreble: { value: 0 },
    uNoiseScale: { value: 1.6 },
    uSpikeScale: { value: 3.2 },
    uNoiseStrength: { value: 0.045 },
    uSpikeStrength: { value: 0.55 },
    uPulseStrength: { value: 0.22 },
    uDragDir: { value: new THREE.Vector3(0, 1, 0) },
    uDragStrength: { value: 0 },
  }

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#0a0a0c'),
    emissive: new THREE.Color('#c9ccd4'),
    emissiveIntensity: 0.04,
    metalness: 1,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 2.4,
    iridescence: 0.18,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 400],
  })

  material.customProgramCacheKey = () => 'liquid-metal-orb'

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime;
        uniform float uBass;
        uniform float uMid;
        uniform float uTreble;
        uniform float uNoiseScale;
        uniform float uSpikeScale;
        uniform float uNoiseStrength;
        uniform float uSpikeStrength;
        uniform float uPulseStrength;
        uniform vec3 uDragDir;
        uniform float uDragStrength;
        ${simplexNoiseGLSL}

        float lmDisplace(vec3 p) {
          float base = snoise(p * uNoiseScale + uTime * 0.15);
          float spike = max(snoise(p * uSpikeScale + uTime * 0.35), 0.0);
          float pull = pow(max(dot(normalize(p), uDragDir), 0.0), 3.0) * uDragStrength;
          float pinch = pow(max(dot(normalize(p), -uDragDir), 0.0), 5.0) * uDragStrength * -0.35;
          return base * uNoiseStrength + spike * uTreble * uSpikeStrength + uBass * uPulseStrength + pull + pinch;
        }`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        `#include <beginnormal_vertex>
        float eps_lm = 0.02;
        vec3 tangent_lm = normalize(cross(normal, abs(normal.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
        vec3 bitangent_lm = normalize(cross(normal, tangent_lm));

        vec3 basePos_lm = position + normal * lmDisplace(position);
        vec3 tangentPos_lm = position + tangent_lm * eps_lm;
        vec3 dispTangent_lm = tangentPos_lm + normal * lmDisplace(tangentPos_lm);
        vec3 bitangentPos_lm = position + bitangent_lm * eps_lm;
        vec3 dispBitangent_lm = bitangentPos_lm + normal * lmDisplace(bitangentPos_lm);

        objectNormal = normalize(cross(dispTangent_lm - basePos_lm, dispBitangent_lm - basePos_lm));`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        transformed = basePos_lm;`,
      )
  }

  return { material, uniforms }
}
