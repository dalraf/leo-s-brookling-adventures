import { BaseRenderer } from './BaseRenderer';
import { Entity, Particle, Dog } from '../types';

export class EntityRenderer extends BaseRenderer {
  drawEntity(entity: Entity, color: string, animationTime: number) {
    this.ctx.save();
    this.ctx.translate(entity.position.x, entity.position.z + entity.position.y);

    const time = animationTime / 100;
    const isWalking = entity.state === 'walking';
    const isAttacking = entity.state === 'attacking';
    const isThrowing = entity.state === 'throwing';
    const isHit = entity.state === 'hit';
    const isDead = entity.state === 'dead';
    const { visuals } = entity;

    if (isHit && Math.floor(animationTime / 50) % 2 === 0) {
      this.ctx.globalCompositeOperation = 'lighter';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    }

    const skinColor = isHit ? 'white' : visuals.skinColor;
    const clothingColor = isHit ? 'white' : visuals.clothingColor;
    const sleeveColor = isHit ? 'white' : visuals.sleeveColor;
    const pantsColor = isHit ? 'white' : visuals.pantsColor;
    const hairColor = isHit ? 'white' : visuals.hairColor;
    const hatColor = isHit ? 'white' : (visuals.hatColor || visuals.clothingColor);

    const legSwing = isWalking ? Math.sin(time) * 25 : Math.sin(time * 0.5) * 2;
    const armSwing = isWalking ? Math.cos(time) * 25 : Math.cos(time * 0.5) * 2;

    if (entity.direction === 'left') {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-entity.width, 0);
    }

    const drawArm = (x: number, swing: number, attacking: boolean, throwing: boolean, isBack: boolean) => {
      this.ctx.save();
      this.ctx.translate(x, -entity.height + 18);
      
      // Sleeve
      this.ctx.fillStyle = isBack ? this.darkenColor(sleeveColor) : sleeveColor;
      this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      this.ctx.lineWidth = 2;
      
      if (attacking) {
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillRect(-6, 0, 12, 25); // Sleeve
        this.ctx.strokeRect(-6, 0, 12, 25);
        
        this.ctx.fillStyle = isBack ? this.darkenColor(skinColor) : skinColor;
        this.ctx.fillRect(-6, 25, 12, 15); // Forearm
        this.ctx.strokeRect(-6, 25, 12, 15);
        
        this.ctx.fillStyle = isBack ? this.darkenColor(skinColor) : skinColor;
        this.ctx.fillRect(-7, 35, 14, 12); // Hand

        // Draw Iron Bar
        if (!isBack && entity.inventory && entity.inventory.ironBarHits > 0) {
          this.ctx.fillStyle = '#94a3b8';
          this.ctx.strokeStyle = '#475569';
          this.ctx.lineWidth = 2;
          this.ctx.fillRect(-4, 40, 8, 45);
          this.ctx.strokeRect(-4, 40, 8, 45);
        }
      } else if (throwing) {
        // Throwing animation: arm goes back then forward
        const throwProgress = (Date.now() - entity.lastAttackTime) / 300;
        const angle = throwProgress < 0.3 
          ? (Math.PI / 4) * (throwProgress / 0.3) // Back
          : (Math.PI / 4) - (Math.PI * (throwProgress - 0.3) / 0.7); // Forward
        
        this.ctx.rotate(angle);
        this.ctx.fillRect(-6, 0, 12, 15); // Sleeve
        this.ctx.strokeRect(-6, 0, 12, 15);
        
        this.ctx.fillStyle = isBack ? this.darkenColor(skinColor) : skinColor;
        this.ctx.fillRect(-6, 15, 12, 15); // Forearm
        this.ctx.strokeRect(-6, 15, 12, 15);
        
        this.ctx.fillStyle = isBack ? this.darkenColor(skinColor) : skinColor;
        this.ctx.fillRect(-6, 20, 12, 10); // Hand
        
        // Draw rock in hand if just started throwing
        if (!isBack && throwProgress < 0.4) {
          this.ctx.fillStyle = '#64748b';
          this.ctx.beginPath();
          this.ctx.arc(0, 25, 5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else {
        this.ctx.rotate((swing * Math.PI) / 180);
        this.ctx.fillRect(-6, 0, 12, 15); // Sleeve
        this.ctx.strokeRect(-6, 0, 12, 15);
        
        this.ctx.fillStyle = isBack ? this.darkenColor(skinColor) : skinColor;
        this.ctx.fillRect(-6, 15, 12, 10); // Forearm
        this.ctx.strokeRect(-6, 15, 12, 10);
        
        this.ctx.fillStyle = isBack ? this.darkenColor(skinColor) : skinColor;
        this.ctx.fillRect(-6, 20, 12, 10); // Hand

        // Draw Iron Bar
        if (!isBack && entity.inventory && entity.inventory.ironBarHits > 0) {
          this.ctx.fillStyle = '#94a3b8';
          this.ctx.strokeStyle = '#475569';
          this.ctx.lineWidth = 2;
          this.ctx.save();
          this.ctx.translate(0, 25);
          this.ctx.rotate(Math.PI / 6);
          this.ctx.fillRect(-3, 0, 6, 35);
          this.ctx.strokeRect(-3, 0, 6, 35);
          this.ctx.restore();
        }
      }
      this.ctx.restore();
    };

    drawArm(entity.width / 2, -armSwing, false, false, true);
    
    // Legs
    this.ctx.fillStyle = pantsColor;
    this.ctx.save();
    this.ctx.translate(entity.width / 2 - 5, -15);
    this.ctx.rotate((legSwing * Math.PI) / 180);
    this.ctx.fillRect(-5, 0, 10, 15);
    this.ctx.restore();
    this.ctx.save();
    this.ctx.translate(entity.width / 2 + 5, -15);
    this.ctx.rotate((-legSwing * Math.PI) / 180);
    this.ctx.fillRect(-5, 0, 10, 15);
    this.ctx.restore();

    if (isDead) this.ctx.globalAlpha = 0.5;
    const bodyWidth = entity.width * 0.7;
    
    // Body (Shirt)
    this.ctx.fillStyle = clothingColor;
    this.ctx.fillRect((entity.width - bodyWidth) / 2, -entity.height, bodyWidth, entity.height - 15);
    
    // Vest (Warriors style)
    if (visuals.vestColor) {
      this.ctx.fillStyle = visuals.vestColor;
      // Left side of vest
      this.ctx.fillRect((entity.width - bodyWidth) / 2, -entity.height, bodyWidth * 0.35, entity.height - 15);
      // Right side of vest
      this.ctx.fillRect((entity.width - bodyWidth) / 2 + bodyWidth * 0.65, -entity.height, bodyWidth * 0.35, entity.height - 15);
      // Back of vest (top part)
      this.ctx.fillRect((entity.width - bodyWidth) / 2, -entity.height, bodyWidth, (entity.height - 15) * 0.25);
    }

    drawArm(entity.width / 2, armSwing, isAttacking, isThrowing, false);
    
    // Head
    this.ctx.fillStyle = skinColor;
    const headWidth = 25;
    this.ctx.fillRect((entity.width - headWidth) / 2, -entity.height - 15, headWidth, 20);
    
    // Hair or Hat
    if (visuals.hatType !== 'none') {
      this.ctx.fillStyle = hatColor;
      if (visuals.hatType === 'beanie') {
        this.ctx.fillRect((entity.width - headWidth) / 2 - 2, -entity.height - 20, headWidth + 4, 10);
      } else if (visuals.hatType === 'cap') {
        this.ctx.fillRect((entity.width - headWidth) / 2 - 2, -entity.height - 20, headWidth + 4, 8);
        this.ctx.fillRect((entity.width - headWidth) / 2 + 5, -entity.height - 15, 15, 4); // Brim
      } else if (visuals.hatType === 'bandana') {
        this.ctx.fillStyle = '#ef4444'; // Red bandana
        this.ctx.fillRect((entity.width - headWidth) / 2 - 1, -entity.height - 15, headWidth + 2, 6);
      } else if (visuals.hatType === 'hoodie') {
        this.ctx.fillRect((entity.width - headWidth) / 2 - 4, -entity.height - 22, headWidth + 8, 25);
        // Face cutout
        this.ctx.fillStyle = skinColor;
        this.ctx.fillRect((entity.width - headWidth) / 2 + 2, -entity.height - 15, headWidth - 4, 15);
      }
    } else {
      // Hair
      this.ctx.fillStyle = hairColor;
      this.ctx.fillRect((entity.width - headWidth) / 2, -entity.height - 20, headWidth, 8);
    }

    // Face details (Eyes and Mouth) - Profile View
    const headX = (entity.width - headWidth) / 2;
    const headY = -entity.height - 15;
    
    // Eye (Profile view - only one eye visible on the front side)
    const eyeY = headY + 6;
    const eyeW = 6;
    const eyeH = 5;
    const eyeX = headX + headWidth - 10; // Positioned towards the front

    // White of eye
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(eyeX, eyeY, eyeW, eyeH);

    // Pupil
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(eyeX + 3, eyeY + 1, 2, 3);

    // Eyelid (Angry slant)
    this.ctx.strokeStyle = this.darkenColor(skinColor);
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(eyeX - 1, eyeY - 1);
    this.ctx.lineTo(eyeX + eyeW + 1, eyeY + 1);
    this.ctx.stroke();

    // Angry Mouth (Profile view - on the front edge)
    this.ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    const mouthX = headX + headWidth - 8;
    const mouthY = headY + 15;
    this.ctx.moveTo(mouthX, mouthY);
    this.ctx.lineTo(mouthX + 6, mouthY + 2); // Slightly down-turned angry mouth
    this.ctx.stroke();

    if (!isDead) {
      const healthWidth = (entity.health / entity.maxHealth) * entity.width;
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0, -entity.height - 25, entity.width, 5);
      this.ctx.fillStyle = entity.health > 20 ? '#22c55e' : '#ef4444';
      this.ctx.fillRect(0, -entity.height - 25, healthWidth, 5);
    }
    this.ctx.restore();
  }

  drawDog(dog: Dog, animationTime: number) {
    this.ctx.save();
    this.ctx.translate(dog.position.x, dog.position.z + dog.position.y);

    if (dog.direction === 'left') {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-dog.width, 0);
    }

    const time = animationTime / 100;
    const isSleeping = dog.state === 'sleeping';
    const isWaking = dog.state === 'waking';
    const isRunning = dog.state === 'running';

    this.ctx.fillStyle = dog.color;

    if (isSleeping) {
      // Sleeping position: curled up
      this.ctx.save();
      this.ctx.translate(dog.width / 2, 0);
      
      // Body
      this.ctx.beginPath();
      this.ctx.ellipse(0, -8, 18, 10, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Head (tucked in)
      this.ctx.beginPath();
      this.ctx.arc(10, -12, 8, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Snoring effect (zZz)
      if (Math.floor(time * 0.5) % 2 === 0) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '10px monospace';
        this.ctx.fillText('z', 15, -25);
      }
      
      this.ctx.restore();
    } else {
      // Standing/Running
      
      // Shadow
      this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
      this.ctx.beginPath();
      this.ctx.ellipse(dog.width/2, 0, 20, 5, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = dog.color;

      // Legs (Front and Back)
      const legSwing = isRunning ? Math.sin(time * 1.5) * 0.5 : 0;
      
      // Back Leg
      this.ctx.save();
      this.ctx.translate(8, -12);
      if (isRunning) this.ctx.rotate(legSwing);
      this.ctx.fillRect(-3, 0, 6, 12);
      this.ctx.restore();

      // Front Leg
      this.ctx.save();
      this.ctx.translate(dog.width - 12, -12);
      if (isRunning) this.ctx.rotate(-legSwing);
      this.ctx.fillRect(-3, 0, 6, 12);
      this.ctx.restore();
      
      // Body
      this.ctx.fillRect(0, -22, dog.width, 15);
      
      // Head
      this.ctx.save();
      this.ctx.translate(dog.width - 5, -25);
      if (isWaking) {
         this.ctx.rotate(Math.sin(time * 5) * 0.1);
      }
      this.ctx.fillStyle = dog.color;
      this.ctx.fillRect(0, -10, 15, 15);
      // Ears
      this.ctx.fillStyle = this.darkenColor(dog.color);
      this.ctx.fillRect(2, -14, 6, 8);
      // Nose
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(12, -4, 4, 4);
      // Eye
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(8, -8, 3, 3);
      this.ctx.restore();
      
      // Tail
      this.ctx.save();
      this.ctx.translate(0, -18);
      const tailWag = isRunning ? Math.sin(time * 10) * 30 : Math.sin(time * 2) * 10;
      this.ctx.rotate((tailWag * Math.PI) / 180);
      this.ctx.fillStyle = dog.color;
      this.ctx.fillRect(-12, -3, 12, 6);
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  drawParticle(p: Particle) {
    this.ctx.save();
    this.ctx.globalAlpha = p.life;
    this.ctx.fillStyle = p.color;
    this.ctx.translate(p.position.x, p.position.z + p.position.y);
    if (p.type === 'blood') {
      this.ctx.beginPath();
      if (p.position.y >= 0) this.ctx.scale(1.5, 0.5);
      this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
    }
    this.ctx.restore();
  }

  drawItem(item: any) {
    this.ctx.save();
    this.ctx.translate(item.position.x, item.position.z);
    
    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
    this.ctx.beginPath();
    this.ctx.ellipse(15, 0, 15, 5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const bounce = Math.sin(Date.now() / 200) * 5;
    this.ctx.translate(0, -15 + bounce);

    if (item.type === 'iron_bar') {
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.strokeStyle = '#475569';
      this.ctx.lineWidth = 2;
      this.ctx.rotate(Math.PI / 4);
      this.ctx.fillRect(0, 0, 30, 6);
      this.ctx.strokeRect(0, 0, 30, 6);
    } else if (item.type === 'rock') {
      this.ctx.fillStyle = '#64748b';
      this.ctx.beginPath();
      this.ctx.moveTo(0, 10);
      this.ctx.lineTo(10, 0);
      this.ctx.lineTo(20, 5);
      this.ctx.lineTo(15, 15);
      this.ctx.closePath();
      this.ctx.fill();
    } else if (item.type === 'beer') {
      this.ctx.fillStyle = '#166534';
      this.ctx.fillRect(5, 0, 10, 20);
      this.ctx.fillStyle = '#fef08a';
      this.ctx.fillRect(5, 0, 10, 5);
      this.ctx.strokeStyle = '#064e3b';
      this.ctx.strokeRect(5, 0, 10, 20);
    }
    this.ctx.restore();
  }

  drawProjectile(p: any) {
    this.ctx.save();
    this.ctx.translate(p.position.x, p.position.z + p.position.y);
    this.ctx.fillStyle = '#64748b';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
}
