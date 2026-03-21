import { GameState, Vector3D } from './types';
import { GRAVITY } from './constants';

export class ParticleSystem {
  static createParticles(state: GameState, x: number, z: number, color: string, type: 'blood' | 'spark' | 'smoke' = 'blood') {
    const count = type === 'blood' ? 12 : 6;
    // Cap particles for mobile performance
    if (state.particles.length > 150) {
      state.particles.splice(0, count);
    }
    for (let i = 0; i < count; i++) {
      state.particles.push({
        position: { x, y: -30, z },
        velocity: { 
          x: (Math.random() - 0.5) * 8, 
          y: (Math.random() - 0.7) * 10,
          z: (Math.random() - 0.5) * 4
        },
        life: 1.0,
        maxLife: 1.0,
        color,
        size: Math.random() * 4 + 2,
        type
      });
    }
  }

  static updateParticles(state: GameState, dt: number) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      
      if (p.position.y < 0 || p.type !== 'blood') {
        p.position.x += p.velocity.x * dt;
        p.position.y += p.velocity.y * dt;
        p.position.z += p.velocity.z * dt;
        
        if (p.type === 'blood') p.velocity.y += GRAVITY * 0.5 * dt;
      } else {
        // Stay on floor
        p.position.y = 0;
        p.velocity.x = 0;
        p.velocity.y = 0;
        p.velocity.z = 0;
      }
      
      p.life -= 0.02 * dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
  }
}
