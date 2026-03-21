import { GameState } from './types';
import { audioManager } from './AudioManager';
import { inputManager } from './InputManager';
import { CombatSystem } from './CombatSystem';
import { ParticleSystem } from './ParticleSystem';
import { 
  CANVAS_WIDTH, 
  ENEMY_ATTACK_RANGE, 
  ENEMY_SPEED, 
  GRAVITY, 
  PLAYER_ATTACK_COOLDOWN, 
  PLAYER_JUMP_FORCE, 
  PLAYER_SPEED,
  ENEMY_SPAWN_INTERVAL,
  STREET_TOP,
  STREET_BOTTOM,
  COMBO_TIMEOUT
} from './constants';

export class GameEngine {
  state: GameState;
  public inputManager = inputManager;
  private lastEnemySpawn: number = 0;

  constructor() {
    this.state = this.resetState();
  }

  resetState(): GameState {
    return {
      player: {
        id: 'player',
        position: { x: 100, y: 0, z: (STREET_TOP + STREET_BOTTOM) / 2 },
        velocity: { x: 0, y: 0, z: 0 },
        width: 40,
        height: 60,
        health: 100,
        maxHealth: 100,
        stamina: 100,
        maxStamina: 100,
        isExhausted: false,
        state: 'idle',
        direction: 'right',
        lastAttackTime: 0,
        comboCount: 0,
        hitTimer: 0,
        invulnerableTimer: 0,
        inventory: {
          rocks: 0,
          ironBarHits: 0,
        },
        visuals: {
          skinColor: '#d2b48c',
          clothingColor: '#d2b48c', // Bare chest look
          sleeveColor: '#d2b48c', // Bare arms
          pantsColor: '#1e293b',
          hairColor: '#451a03',
          hatType: 'none',
          hatColor: '#000',
          vestColor: '#7c2d12', // Warriors reddish-brown vest
        },
      },
      enemies: [],
      taxis: [],
      items: [],
      projectiles: [],
      dogs: [],
      particles: [],
      floatingTexts: [],
      score: 0,
      combo: 0,
      comboTimer: 0,
      isGameOver: false,
      isPaused: false,
      level: 1,
      levelUpTimer: 0,
      flashTimer: 0,
      bloodSplatter: [],
      kills: 0,
      maxCombo: 0,
      cameraX: 0,
      screenShake: 0,
      frameFreeze: 0,
      animationTime: 0,
    };
  }

  update(deltaTime: number) {
    // Screen shake decay should happen even when paused/gameOver to settle the view
    if (this.state.screenShake > 0) {
      this.state.screenShake *= 0.9;
      if (this.state.screenShake < 0.1) this.state.screenShake = 0;
    }

    if (this.state.isGameOver || this.state.isPaused) {
      audioManager.stopMusic();
      return;
    }
    audioManager.startMusic();

    // Hit-stop effect
    if (this.state.frameFreeze > 0) {
      this.state.frameFreeze--;
      return;
    }

    // Update animation time only when not paused/over
    this.state.animationTime += deltaTime;

    // Combo timer
    if (this.state.comboTimer > 0) {
      this.state.comboTimer -= deltaTime;
      if (this.state.comboTimer <= 0) {
        this.state.combo = 0;
      }
    }

    const dtFactor = deltaTime / 16.67; // Normalize to 60fps

    this.updatePlayer(dtFactor);
    this.updateEnemies(dtFactor);
    this.updateTaxis(dtFactor);
    this.updateItems(dtFactor);
    this.updateProjectiles(dtFactor);
    this.updateDogs(dtFactor);
    ParticleSystem.updateParticles(this.state, dtFactor);
    this.updateFloatingTexts(dtFactor);
    
    this.updateTimers(deltaTime);
    this.spawnEnemies();
    this.spawnTaxis();
    this.updateCamera();
  }

  private updateTaxis(dt: number) {
    const { player, enemies, taxis } = this.state;
    for (let i = taxis.length - 1; i >= 0; i--) {
      const taxi = taxis[i];
      taxi.position.x += taxi.velocity.x * dt;

      // Honk when entering screen
      if (!taxi.honked && taxi.position.x > this.state.cameraX && taxi.position.x < this.state.cameraX + CANVAS_WIDTH) {
        audioManager.playSFX('honk', 0.6);
        taxi.honked = true;
      }

      // Collision Detection
      const entities = [player, ...enemies];
      entities.forEach(entity => {
        if (entity.state === 'dead' || entity.invulnerableTimer > 0) return;
        
        const dx = Math.abs(entity.position.x - taxi.position.x);
        const dz = Math.abs(entity.position.z - taxi.position.z);

        // Taxi is large, so we check a range
        if (dx < taxi.width / 2 && dz < 35) {
          entity.health -= 40;
          entity.state = 'hit';
          entity.hitTimer = 500;
          entity.invulnerableTimer = 1000;
          entity.velocity.x = taxi.velocity.x * 0.5;
          
          this.createFloatingText(entity.position.x, entity.position.z - 40, 'VROOOOM!', '#facc15');
          ParticleSystem.createParticles(this.state, entity.position.x, entity.position.z, '#ef4444', 'blood');
          
          if (entity.health <= 0) {
            entity.state = 'dead';
            entity.velocity.y = -8;
            if (entity !== player) {
              this.state.score += 100;
              this.state.kills++;
            } else {
              this.state.isGameOver = true;
              this.state.screenShake = 20; // Strong shake for taxi crash
            }
          }
        }
      });

      // Cleanup
      if (taxi.position.x < this.state.cameraX - 1000 || taxi.position.x > this.state.cameraX + CANVAS_WIDTH + 1000) {
        taxis.splice(i, 1);
      }
    }
  }

  private spawnTaxis() {
    if (Math.random() < 0.002 && this.state.taxis.length < 1) {
      const direction = Math.random() > 0.5 ? 'right' : 'left';
      const x = direction === 'right' ? this.state.cameraX - 500 : this.state.cameraX + CANVAS_WIDTH + 500;
      // Sidewalk is first 30px of the street area, so we spawn below that
      const streetStart = STREET_TOP + 60; 
      const z = streetStart + Math.random() * (STREET_BOTTOM - streetStart - 20);
      const speed = PLAYER_SPEED * 2.5;

      this.state.taxis.push({
        id: `taxi-${Date.now()}`,
        position: { x, y: 0, z },
        velocity: { x: direction === 'right' ? speed : -speed, y: 0, z: 0 },
        width: 320, // Much larger taxi
        height: 120,
        active: true,
        honked: false
      });
    }
  }

  private updateDogs(dt: number) {
    const { player, enemies, dogs } = this.state;
    const wakeDistance = 120;

    // Spawn dogs occasionally
    if (Math.random() < 0.005 && dogs.length < 3) {
      const x = this.state.cameraX + CANVAS_WIDTH + 100;
      const z = STREET_TOP + 10; // On the sidewalk
      const dogColors = ['#7c2d12', '#ffffff', '#171717', '#78350f', '#f97316'];
      const variants: ('pitbull' | 'shepherd' | 'mutt')[] = ['pitbull', 'shepherd', 'mutt'];
      const collarColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

      dogs.push({
        id: `dog-${Date.now()}`,
        position: { x, y: 0, z },
        velocity: { x: 0, y: 0, z: 0 },
        state: 'sleeping',
        color: dogColors[Math.floor(Math.random() * dogColors.length)],
        direction: Math.random() > 0.5 ? 'right' : 'left',
        wakeTimer: 0,
        width: 40,
        height: 25,
        variant: variants[Math.floor(Math.random() * variants.length)],
        collarColor: collarColors[Math.floor(Math.random() * collarColors.length)]
      });
    }

    for (let i = dogs.length - 1; i >= 0; i--) {
      const dog = dogs[i];

      if (dog.state === 'sleeping') {
        const entities = [player, ...enemies];
        const nearEntity = entities.find(e => {
          const dx = Math.abs(e.position.x - dog.position.x);
          const dz = Math.abs(e.position.z - dog.position.z);
          return dx < wakeDistance && dz < 40;
        });

        if (nearEntity) {
          dog.state = 'waking';
          dog.wakeTimer = 600;
          audioManager.playSFX('bark', 0.4);
          dog.direction = nearEntity.position.x > dog.position.x ? 'left' : 'right';
        }
      } else if (dog.state === 'waking') {
        dog.wakeTimer -= dt * 16.67;
        if (dog.wakeTimer <= 0) {
          if (enemies.length === 0) {
            dog.state = 'running';
            dog.velocity.x = dog.direction === 'right' ? 6 : -6;
          } else {
            // Find nearest enemy to attack
            const nearestEnemy = enemies.reduce((prev, curr) => {
              const distPrev = Math.abs(prev.position.x - dog.position.x);
              const distCurr = Math.abs(curr.position.x - dog.position.x);
              return distPrev < distCurr ? prev : curr;
            }, enemies[0]);

            if (nearestEnemy && nearestEnemy.health > 0) {
              dog.state = 'chasing';
              dog.targetId = nearestEnemy.id;
            } else {
              dog.state = 'running';
              dog.velocity.x = dog.direction === 'right' ? 6 : -6;
            }
          }
        }
      } else if (dog.state === 'chasing') {
        const target = enemies.find(e => e.id === dog.targetId);
        if (!target || target.health <= 0) {
          dog.state = 'running';
          dog.velocity.x = dog.direction === 'right' ? 6 : -6;
          continue;
        }

        const dx = target.position.x - dog.position.x;
        const dz = target.position.z - dog.position.z;
        const dist = Math.abs(dx);
        const zDist = Math.abs(dz);

        dog.direction = dx > 0 ? 'right' : 'left';
        
        const chaseSpeed = 7;
        dog.velocity.x = dx > 0 ? chaseSpeed : -chaseSpeed;
        dog.velocity.z = dz > 0 ? 2 : -2;

        if (dist < 30 && zDist < 20) {
          // BITE!
          target.health -= 25;
          target.state = 'hit';
          target.hitTimer = 300;
          target.velocity.x = dog.direction === 'right' ? 2 : -2;
          
          this.createFloatingText(target.position.x, target.position.z - 40, 'MORDIDA!', '#ef4444');
          ParticleSystem.createParticles(this.state, target.position.x, target.position.z, '#ef4444', 'blood');
          audioManager.playSFX('bite', 0.6);
          
          if (target.health <= 0) {
            target.state = 'dead';
            target.velocity.y = -5;
            this.state.score += 50;
            this.state.kills++;
          }

          dog.state = 'running';
          dog.direction = dog.direction === 'right' ? 'left' : 'right';
          dog.velocity.x = dog.direction === 'right' ? 8 : -8;
          dog.velocity.z = 0;
        } else {
          dog.position.x += dog.velocity.x * dt;
          dog.position.z += dog.velocity.z * dt;
        }
      } else if (dog.state === 'running') {
        dog.position.x += dog.velocity.x * dt;
        if (dog.position.x < this.state.cameraX - 200 || dog.position.x > this.state.cameraX + CANVAS_WIDTH + 200) {
          dogs.splice(i, 1);
        }
      }
    }
  }

  private updateTimers(deltaTime: number) {
    if (this.state.levelUpTimer > 0) {
      this.state.levelUpTimer -= deltaTime;
    }

    if (this.state.flashTimer > 0) {
      this.state.flashTimer -= deltaTime;
    }

    for (let i = this.state.bloodSplatter.length - 1; i >= 0; i--) {
      this.state.bloodSplatter[i].life -= 0.001 * deltaTime;
      if (this.state.bloodSplatter[i].life <= 0) this.state.bloodSplatter.splice(i, 1);
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.state.floatingTexts[i];
      ft.y -= 1 * dt;
      ft.life -= 0.02 * dt;
      if (ft.life <= 0) this.state.floatingTexts.splice(i, 1);
    }
  }

  private createFloatingText(x: number, y: number, text: string, color: string) {
    this.state.floatingTexts.push({
      id: `ft-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      life: 1.0,
      color
    });
  }

  private updatePlayer(dt: number) {
    const { player } = this.state;

    // Timers
    if (player.hitTimer > 0) {
      player.hitTimer -= dt * 16.67;
      if (player.hitTimer <= 0) player.state = 'idle';
    }
    if (player.invulnerableTimer > 0) {
      player.invulnerableTimer -= dt * 16.67;
    }

    if (player.health <= 0 && player.state !== 'dead') {
      player.state = 'dead';
      this.state.isGameOver = true;
    }

    // Movement & Stamina Logic
    if (player.state !== 'hit' && player.state !== 'dead') {
      const isMoving = inputManager.isPressed('ArrowLeft') || inputManager.isPressed('ArrowRight') || 
                       inputManager.isPressed('ArrowUp') || inputManager.isPressed('ArrowDown');
                       
      // Run Logic
      const wantsToRun = (inputManager.isPressed('ShiftLeft') || inputManager.isPressed('ShiftRight')) && isMoving;
      const canRun = !player.isExhausted;
      const isRunning = wantsToRun && canRun;
      
      const speed = isRunning ? PLAYER_SPEED * 1.8 : PLAYER_SPEED;

      if (isRunning) {
        player.stamina = Math.max(0, player.stamina - dt * 0.15); // Very fast depletion
        if (player.stamina <= 0) {
          player.isExhausted = true;
          audioManager.playSFX('bark'); // Out of breath
        }
        // Run particles
        if (Math.random() > 0.7) ParticleSystem.createParticles(this.state, player.position.x + player.width/2, player.position.z, '#fff', 'smoke');
      } else {
        // Regen stamina (Slowly)
        const regenRate = isMoving ? 0.01 : 0.03; // Much slower regen, especially while walking
        player.stamina = Math.min(player.maxStamina, player.stamina + dt * regenRate);
        
        // Recover from exhaustion at 10%
        if (player.isExhausted && player.stamina >= player.maxStamina * 0.1) {
          player.isExhausted = false;
        }
      }

      // Horizontal Movement
      if (inputManager.isPressed('ArrowLeft')) {
        player.velocity.x = -speed;
        player.direction = 'left';
      } else if (inputManager.isPressed('ArrowRight')) {
        player.velocity.x = speed;
        player.direction = 'right';
      } else {
        player.velocity.x = 0;
      }

      // Depth Movement (Isometric)
      if (inputManager.isPressed('ArrowUp')) {
        player.velocity.z = -speed * 0.7;
      } else if (inputManager.isPressed('ArrowDown')) {
        player.velocity.z = speed * 0.7;
      } else {
        player.velocity.z = 0;
      }

      // Jump
      if (inputManager.isPressed('Space') && player.position.y >= 0) {
        player.velocity.y = PLAYER_JUMP_FORCE;
        player.state = 'jumping';
        audioManager.playSFX('jump');
      }

      // Attack
      if (inputManager.isPressed('KeyF') || inputManager.isPressed('KeyJ')) {
        const now = Date.now();
        const cooldown = Math.max(150, PLAYER_ATTACK_COOLDOWN - (this.state.level - 1) * 20);
        if (now - player.lastAttackTime > cooldown) {
          player.state = 'attacking';
          player.lastAttackTime = now;
          CombatSystem.performPlayerAttack(
            this.state, 
            (x, z, c, t) => ParticleSystem.createParticles(this.state, x, z, c, t), 
            (x, y, t, c) => this.createFloatingText(x, y, t, c)
          );
          audioManager.playSFX('punch');
          setTimeout(() => {
            if (player.state === 'attacking') player.state = 'idle';
          }, 200);
        }
      }

      // Throw Rock
      if (inputManager.isPressed('KeyG') && player.inventory && player.inventory.rocks > 0) {
        const now = Date.now();
        if (now - player.lastAttackTime > 300) {
          player.lastAttackTime = now;
          player.inventory.rocks--;
          player.state = 'throwing';
          this.state.projectiles.push({
            id: `rock-${now}`,
            position: { ...player.position, y: -40 },
            velocity: { x: player.direction === 'right' ? 10 : -10, y: -2, z: 0 },
            damage: 15,
            owner: 'player',
            life: 1.0
          });
          audioManager.playSFX('dash');
          inputManager.setKey('KeyG', false);
          setTimeout(() => {
            if (player.state === 'throwing') player.state = 'idle';
          }, 300);
        }
      }
    }

    // State update based on movement
    if (player.state !== 'jumping' && player.state !== 'attacking' && player.state !== 'throwing' && player.state !== 'hit') {
      if (player.velocity.x !== 0 || player.velocity.z !== 0) {
        player.state = 'walking';
      } else {
        player.state = 'idle';
      }
    }

    // Physics
    player.position.x += player.velocity.x * dt;
    player.position.z += player.velocity.z * dt;
    
    // Gravity for jumping
    player.velocity.y += GRAVITY * dt;
    player.position.y += player.velocity.y * dt;

    // Ground collision (y=0 is ground)
    if (player.position.y > 0) {
      if (player.velocity.y > 5) {
        ParticleSystem.createParticles(this.state, player.position.x + player.width/2, player.position.z, '#fff', 'smoke');
      }
      player.position.y = 0;
      player.velocity.y = 0;
      if (player.state === 'jumping') player.state = 'idle';
    }

    // Boundaries
    if (player.position.x < this.state.cameraX) player.position.x = this.state.cameraX;
    if (player.position.z < STREET_TOP) player.position.z = STREET_TOP;
    if (player.position.z > STREET_BOTTOM) player.position.z = STREET_BOTTOM;
  }

  private updateCamera() {
    const { player } = this.state;
    const scrollThreshold = CANVAS_WIDTH * 0.75;
    const screenX = player.position.x - this.state.cameraX;

    if (screenX > scrollThreshold) {
      this.state.cameraX += screenX - scrollThreshold;
    }
  }

  private updateEnemies(dt: number) {
    const { player, enemies } = this.state;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      
      // Timers
      if (enemy.hitTimer > 0) {
        enemy.hitTimer -= dt * 16.67;
        if (enemy.hitTimer <= 0 && enemy.state !== 'dead') enemy.state = 'idle';
      }

      if (enemy.state === 'dead') {
        enemy.position.y += 5 * dt; // Sink into ground
        if (enemy.position.y > 100) enemies.splice(i, 1);
        continue;
      }

      // Isometric AI
      const dx = player.position.x - enemy.position.x;
      const dz = player.position.z - enemy.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const hasIronBar = enemy.inventory && enemy.inventory.ironBarHits > 0;
      const attackRange = hasIronBar ? ENEMY_ATTACK_RANGE * 1.5 : ENEMY_ATTACK_RANGE;

      if (enemy.state !== 'hit' && enemy.state !== 'attacking' && enemy.state !== 'throwing') {
        // Throwing logic
        if (enemy.inventory && enemy.inventory.rocks > 0 && dist > 150 && dist < 300 && Math.random() < 0.02) {
          const now = Date.now();
          if (now - enemy.lastAttackTime > 2000) {
            enemy.state = 'throwing';
            enemy.lastAttackTime = now;
            enemy.inventory.rocks--;
            this.state.projectiles.push({
              id: `rock-enemy-${now}`,
              position: { ...enemy.position, y: -40 },
              velocity: { x: enemy.direction === 'right' ? 8 : -8, y: -2, z: 0 },
              damage: 10 + (this.state.level * 2),
              owner: 'enemy',
              life: 1.0
            });
            setTimeout(() => {
              if (enemy.state === 'throwing') enemy.state = 'idle';
            }, 400);
            continue;
          }
        }

        if (dist > attackRange) {
          const angle = Math.atan2(dz, dx);
          const speed = ENEMY_SPEED + (this.state.level * 0.2);
          enemy.velocity.x = Math.cos(angle) * speed;
          enemy.velocity.z = Math.sin(angle) * speed;
          enemy.direction = dx > 0 ? 'right' : 'left';
          enemy.state = 'walking';
        } else {
          enemy.velocity.x = 0;
          enemy.velocity.z = 0;
          const now = Date.now();
          if (now - enemy.lastAttackTime > 1500) {
            enemy.state = 'attacking';
            enemy.lastAttackTime = now;
            CombatSystem.performEnemyAttack(this.state, enemy, (x, z, c, t) => ParticleSystem.createParticles(this.state, x, z, c, t));
            setTimeout(() => {
              if (enemy.state === 'attacking') enemy.state = 'idle';
            }, 400);
          } else {
            enemy.state = 'idle';
          }
        }
      }

      enemy.position.x += enemy.velocity.x * dt;
      enemy.position.z += enemy.velocity.z * dt;
      
      enemy.velocity.y += GRAVITY * dt;
      enemy.position.y += enemy.velocity.y * dt;
      if (enemy.position.y > 0) {
        enemy.position.y = 0;
        enemy.velocity.y = 0;
      }

      if (enemy.position.x < this.state.cameraX - 200) {
        enemies.splice(i, 1);
      }
    }
  }

  private updateItems(dt: number) {
    const { player, items } = this.state;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const dx = Math.abs(player.position.x - item.position.x);
      const dz = Math.abs(player.position.z - item.position.z);
      
      if (dx < 30 && dz < 20) {
        // Collect!
        if (item.type === 'iron_bar') {
          if (player.inventory) player.inventory.ironBarHits = 10;
          this.createFloatingText(player.position.x, player.position.z - 60, 'BARRA DE FERRO!', '#94a3b8');
        } else if (item.type === 'rock') {
          if (player.inventory) player.inventory.rocks += 5;
          this.createFloatingText(player.position.x, player.position.z - 60, '+5 PEDRAS', '#64748b');
        } else if (item.type === 'beer') {
          player.health = Math.min(player.maxHealth, player.health + 30);
          this.createFloatingText(player.position.x, player.position.z - 60, '+30 HP', '#22c55e');
        }
        audioManager.playSFX('levelUp');
        items.splice(i, 1);
      }
      
      // Cleanup offscreen items
      if (item.position.x < this.state.cameraX - 200) {
        items.splice(i, 1);
      }
    }
  }

  private updateProjectiles(dt: number) {
    const { player, projectiles, enemies } = this.state;
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.velocity.y += 0.1 * dt; // Slight gravity for projectiles
      
      if (p.position.y > 0) p.position.y = 0;

      // Collision with enemies
      if (p.owner === 'player') {
        for (const enemy of enemies) {
          if (enemy.state === 'dead') continue;
          const dx = Math.abs(p.position.x - enemy.position.x);
          const dz = Math.abs(p.position.z - enemy.position.z);
          if (dx < 30 && dz < 30) {
            enemy.health -= p.damage;
            enemy.state = 'hit';
            enemy.hitTimer = 200;
            enemy.velocity.x = p.velocity.x > 0 ? 3 : -3;
            this.createFloatingText(enemy.position.x, enemy.position.z - 40, `-${p.damage}`, '#fff');
            ParticleSystem.createParticles(this.state, enemy.position.x, enemy.position.z, '#fff', 'spark');
            projectiles.splice(i, 1);
            
            if (enemy.health <= 0) {
              enemy.state = 'dead';
              enemy.velocity.y = -5;
              this.state.score += 50;
              this.state.kills++;
            }
            break;
          }
        }
      }

      // Cleanup
      if (p.position.x < this.state.cameraX - 100 || p.position.x > this.state.cameraX + CANVAS_WIDTH + 100 || p.position.y > 10) {
        if (projectiles[i] === p) projectiles.splice(i, 1);
      }

      // Collision with player
      if (p.owner === 'enemy' && player.invulnerableTimer <= 0) {
        const dx = Math.abs(p.position.x - player.position.x);
        const dz = Math.abs(p.position.z - player.position.z);
        if (dx < 25 && dz < 25) {
          player.health -= p.damage;
          player.state = 'hit';
          player.hitTimer = 400;
          player.invulnerableTimer = 1000;
          player.velocity.x = p.velocity.x > 0 ? 4 : -4;
          this.createFloatingText(player.position.x, player.position.z - 40, `-${p.damage}`, '#ef4444');
          ParticleSystem.createParticles(this.state, player.position.x, player.position.z, '#fff', 'spark');
          projectiles.splice(i, 1);
          
          if (player.health <= 0) {
            this.state.isGameOver = true;
            audioManager.playSFX('death');
            audioManager.stopMusic();
          }
        }
      }
    }
  }

  private getRandomVisuals(): any {
    const skinColors = ['#8d5524', '#c68642', '#e0ac69', '#f1c27d', '#ffdbac'];
    const clothingColors = ['#1e293b', '#450a0a', '#064e3b', '#4c1d95', '#78350f', '#111827', '#3f3f46', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
    const hairColors = ['#000000', '#451a03', '#78350f', '#a16207', '#d97706'];
    const hatTypes: ('none' | 'beanie' | 'cap' | 'bandana' | 'hoodie' | 'beret' | 'headphones' | 'mohawk')[] = ['none', 'beanie', 'cap', 'bandana', 'hoodie', 'beret', 'headphones', 'mohawk'];
    
    const clothingColor = clothingColors[Math.floor(Math.random() * clothingColors.length)];
    // 50% chance for sleeves to be different color (multi-toned)
    const sleeveColor = Math.random() > 0.5 ? clothingColors[Math.floor(Math.random() * clothingColors.length)] : clothingColor;
    
    return {
      skinColor: skinColors[Math.floor(Math.random() * skinColors.length)],
      clothingColor: clothingColor,
      sleeveColor: sleeveColor,
      pantsColor: clothingColors[Math.floor(Math.random() * clothingColors.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      hatType: hatTypes[Math.floor(Math.random() * hatTypes.length)],
      hatColor: clothingColors[Math.floor(Math.random() * clothingColors.length)],
      // 50% chance for enemies to have a vest
      vestColor: Math.random() > 0.5 ? clothingColors[Math.floor(Math.random() * clothingColors.length)] : undefined,
    };
  }

  private spawnEnemies() {
    const now = Date.now();
    const maxEnemies = 2 + Math.floor(this.state.level / 2);
    const spawnInterval = Math.max(1000, ENEMY_SPAWN_INTERVAL - (this.state.level * 200));

    if (now - this.lastEnemySpawn > spawnInterval && this.state.enemies.length < maxEnemies) {
      const x = this.state.cameraX + CANVAS_WIDTH + 40;
      const z = STREET_TOP + Math.random() * (STREET_BOTTOM - STREET_TOP);
      
      // Spawn item occasionally when spawning enemy
      if (Math.random() > 0.7) {
        const types: ('iron_bar' | 'rock' | 'beer')[] = ['iron_bar', 'rock', 'beer'];
        this.state.items.push({
          id: `item-${now}`,
          type: types[Math.floor(Math.random() * types.length)],
          position: { x: x - 100, y: 0, z: STREET_TOP + Math.random() * (STREET_BOTTOM - STREET_TOP) },
          collected: false
        });
      }

      const isBossLevel = this.state.level % 5 === 0;
      const hasBoss = this.state.enemies.some(e => e.isBoss);
      const shouldSpawnBoss = isBossLevel && !hasBoss;
      
      const health = shouldSpawnBoss 
        ? 200 + (this.state.level * 50) 
        : 50 + (this.state.level - 1) * 20;
      
      const inventory = {
        rocks: Math.random() < 0.1 ? 3 : 0,
        ironBarHits: Math.random() < 0.1 ? 10 : 0
      };

      const visuals = this.getRandomVisuals();

      this.state.enemies.push({
        id: `enemy-${now}`,
        position: { x, y: 0, z },
        velocity: { x: 0, y: 0, z: 0 },
        width: shouldSpawnBoss ? 60 : 40,
        height: shouldSpawnBoss ? 90 : 60,
        health: health,
        maxHealth: health,
        state: 'idle',
        direction: 'left',
        lastAttackTime: 0,
        comboCount: 0,
        hitTimer: 0,
        invulnerableTimer: 0,
        stamina: 100,
        maxStamina: 100,
        isExhausted: false,
        isBoss: shouldSpawnBoss,
        inventory: inventory,
        visuals: visuals
      });
      this.lastEnemySpawn = now;
    }
  }
}
