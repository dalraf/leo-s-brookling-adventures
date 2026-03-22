import { BaseRenderer } from './BaseRenderer';
import { Entity, Particle, Dog, Taxi } from '../types';

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
    
    // Head Accessories (Profile View)
    const headX = (entity.width - headWidth) / 2;
    const headY = -entity.height - 15;

    if (visuals.hatType !== 'none') {
      this.ctx.fillStyle = hatColor;
      
      if (visuals.hatType === 'beanie') {
        // Main part
        this.ctx.fillRect(headX - 2, headY - 5, headWidth + 4, 12);
        // Fold/Bottom part
        this.ctx.fillStyle = this.darkenColor(hatColor);
        this.ctx.fillRect(headX - 3, headY + 5, headWidth + 6, 5);
        // Pom-pom or top curve
        this.ctx.fillStyle = hatColor;
        this.ctx.beginPath();
        this.ctx.arc(headX + headWidth / 2, headY - 5, 8, 0, Math.PI, true);
        this.ctx.fill();
      } else if (visuals.hatType === 'cap') {
        // Dome
        this.ctx.fillRect(headX - 1, headY - 5, headWidth + 2, 12);
        // Brim (Sticks out to the front/right)
        this.ctx.fillStyle = this.darkenColor(hatColor);
        this.ctx.fillRect(headX + headWidth - 5, headY + 3, 14, 4);
        // Top button
        this.ctx.fillRect(headX + headWidth / 2 - 2, headY - 7, 4, 2);
      } else if (visuals.hatType === 'bandana') {
        this.ctx.fillStyle = '#ef4444'; // Red bandana
        // Band around head
        this.ctx.fillRect(headX - 1, headY + 2, headWidth + 2, 6);
        // Knot at the back (left)
        this.ctx.fillRect(headX - 6, headY + 4, 6, 4);
        this.ctx.beginPath();
        this.ctx.moveTo(headX - 4, headY + 8);
        this.ctx.lineTo(headX - 10, headY + 14);
        this.ctx.lineTo(headX - 6, headY + 14);
        this.ctx.fill();
      } else if (visuals.hatType === 'hoodie') {
        this.ctx.fillStyle = hatColor;
        // Outer hood
        this.ctx.fillRect(headX - 4, headY - 7, headWidth + 8, 25);
        // Shadowed interior
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillRect(headX + 2, headY, headWidth - 4, 15);
        // Draw face again inside (simple skin rect)
        this.ctx.fillStyle = skinColor;
        this.ctx.fillRect(headX + 4, headY + 2, headWidth - 8, 12);
      } else if (visuals.hatType === 'beret') {
        this.ctx.save();
        this.ctx.translate(headX + headWidth / 2, headY);
        this.ctx.rotate(-Math.PI / 12); // Slanted
        this.ctx.fillStyle = hatColor;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      } else if (visuals.hatType === 'headphones') {
        // Headband
        this.ctx.strokeStyle = '#171717';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(headX + headWidth / 2, headY + 5, 14, Math.PI, 0);
        this.ctx.stroke();
        // Earcup (Center of head in profile)
        this.ctx.fillStyle = hatColor;
        this.ctx.beginPath();
        this.ctx.ellipse(headX + headWidth / 2, headY + 10, 8, 11, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
      } else if (visuals.hatType === 'mohawk') {
        this.ctx.fillStyle = hatColor; // Mohawk color
        // Spiky ridge along the top
        for (let i = 0; i < 5; i++) {
          this.ctx.beginPath();
          this.ctx.moveTo(headX + i * 6 - 2, headY-2);
          this.ctx.lineTo(headX + i * 6 + 1, headY - 12);
          this.ctx.lineTo(headX + i * 6 + 4, headY-2);
          this.ctx.fill();
        }
      }
    } else {
      // Hair
      this.ctx.fillStyle = hairColor;
      this.ctx.fillRect(headX, headY - 5, headWidth, 10);
      // Back of hair
      this.ctx.fillRect(headX - 2, headY - 2, 6, 15);
    }

    // Face details (Eyes and Mouth) - Profile View
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
    const isRunning = dog.state === 'running' || dog.state === 'chasing';
    const variant = dog.variant || 'mutt';

    this.ctx.fillStyle = dog.color;

    if (isSleeping) {
      // Sleeping position
      this.ctx.save();
      const breathing = Math.sin(time * 0.5) * 2;
      this.ctx.translate(dog.width / 2, 0);
      
      this.ctx.fillStyle = dog.color;
      
      // Body (pulsing slightly with breathing)
      this.ctx.beginPath();
      this.ctx.ellipse(0, -8, 20 + breathing * 0.5, 12, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      this.ctx.stroke();
      
      // Head
      this.ctx.beginPath();
      this.ctx.arc(12, -10, 9, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Ears tucked
      this.ctx.fillStyle = this.darkenColor(dog.color);
      this.ctx.fillRect(10, -18, 5, 4);
      
      // Zzz floating
      if (Math.floor(time * 0.4) % 3 === 0) {
        this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText('z', 20, -25 - (time % 5) * 2);
      }
      
      this.ctx.restore();
    } else {
      const runBounce = isRunning ? Math.abs(Math.sin(time * 2)) * -5 : 0;
      this.ctx.translate(0, runBounce);

      // Legs
      const legSwing = isRunning ? Math.sin(time * 2) * 0.6 : (isWaking ? Math.sin(time * 5) * 0.1 : 0);
      
      // Far Legs
      this.ctx.fillStyle = this.darkenColor(dog.color);
      this.ctx.save();
      this.ctx.translate(12, -10);
      this.ctx.rotate(-legSwing);
      this.ctx.fillRect(-3, 0, 6, 12);
      this.ctx.restore();

      this.ctx.save();
      this.ctx.translate(dog.width - 12, -10);
      this.ctx.rotate(legSwing);
      this.ctx.fillRect(-3, 0, 6, 12);
      this.ctx.restore();

      // Body
      this.ctx.fillStyle = dog.color;
      let bodyH = 18;
      if (variant === 'pitbull') bodyH = 22;
      if (variant === 'shepherd') bodyH = 15;
      
      this.ctx.fillRect(0, -bodyH - 8, dog.width, bodyH);
      this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      this.ctx.strokeRect(0, -bodyH - 8, dog.width, bodyH);

      // Collar
      if (dog.collarColor) {
        this.ctx.fillStyle = dog.collarColor;
        this.ctx.fillRect(dog.width - 8, -bodyH - 8, 5, bodyH);
      }

      // Near Legs
      this.ctx.fillStyle = dog.color;
      this.ctx.save();
      this.ctx.translate(8, -10);
      this.ctx.rotate(legSwing);
      this.ctx.fillRect(-3, 0, 6, 12);
      this.ctx.strokeRect(-3, 0, 6, 12);
      this.ctx.restore();

      this.ctx.save();
      this.ctx.translate(dog.width - 8, -10);
      this.ctx.rotate(-legSwing);
      this.ctx.fillRect(-3, 0, 6, 12);
      this.ctx.strokeRect(-3, 0, 6, 12);
      this.ctx.restore();
      
      // Head
      this.ctx.save();
      this.ctx.translate(dog.width - 2, -bodyH - 10);
      if (isWaking) this.ctx.rotate(Math.sin(time * 10) * 0.15);
      if (isRunning) this.ctx.rotate(Math.sin(time * 2) * 0.1);

      this.ctx.fillStyle = dog.color;
      this.ctx.fillRect(0, -12, 18, 18);
      this.ctx.strokeRect(0, -12, 18, 18);

      // Muzzle
      this.ctx.fillStyle = this.darkenColor(dog.color);
      this.ctx.fillRect(10, -4, 12, 10);
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(18, -4, 5, 4); // Nose

      // Eyes
      const eyeBlink = Math.sin(time * 0.1) > 0.95 ? 0 : 4;
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(8, -8, 4, eyeBlink);
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(10, -7, 2, eyeBlink * 0.6);

      // Ears
      this.ctx.fillStyle = this.darkenColor(dog.color);
      if (variant === 'pitbull') {
        this.ctx.fillRect(2, -16, 6, 6);
      } else if (variant === 'shepherd') {
        this.ctx.save();
        this.ctx.translate(5, -12);
        this.ctx.rotate(-Math.PI / 6);
        this.ctx.fillRect(-4, -12, 8, 15);
        this.ctx.restore();
      } else {
        this.ctx.fillRect(0, -14, 10, 8);
      }
      this.ctx.restore();
      
      // Tail
      this.ctx.save();
      this.ctx.translate(2, -bodyH - 2);
      const wagSpeed = isRunning ? 15 : (isWaking ? 8 : 2);
      const wagRange = isRunning ? 40 : 20;
      const tailWag = Math.sin(time * wagSpeed) * wagRange;
      this.ctx.rotate(((-150 + tailWag) * Math.PI) / 180);
      
      this.ctx.fillStyle = dog.color;
      let tailL = 15;
      if (variant === 'shepherd') tailL = 22;
      this.ctx.fillRect(0, -3, tailL, 6);
      this.ctx.strokeRect(0, -3, tailL, 6);
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  drawTaxi(taxi: Taxi) {
    this.ctx.save();
    this.ctx.translate(taxi.position.x - taxi.width / 2, taxi.position.z);

    const isMovingLeft = taxi.velocity.x < 0;
    if (isMovingLeft) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-taxi.width, 0);
    }

    const w = taxi.width;
    const h = taxi.height;

    // Wheels
    const drawWheel = (wx: number) => {
      this.ctx.fillStyle = '#171717';
      this.ctx.beginPath();
      this.ctx.arc(wx, -25, 25, 0, Math.PI * 2);
      this.ctx.fill();
      // Rim
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.beginPath();
      this.ctx.arc(wx, -25, 12, 0, Math.PI * 2);
      this.ctx.fill();
      // Bolts
      this.ctx.fillStyle = '#475569';
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        this.ctx.fillRect(wx + Math.cos(ang) * 7 - 2, -25 + Math.sin(ang) * 7 - 2, 4, 4);
      }
    };
    drawWheel(70);
    drawWheel(w - 70);

    // Body Lower Part
    this.ctx.fillStyle = '#facc15';
    this.ctx.strokeStyle = '#854d0e';
    this.ctx.lineWidth = 3;
    
    // Front hood, main body, trunk
    this.ctx.beginPath();
    this.ctx.roundRect(0, -90, w, 70, 8);
    this.ctx.fill();
    this.ctx.stroke();

    // Cabin Part
    this.ctx.beginPath();
    this.ctx.moveTo(60, -90);
    this.ctx.lineTo(100, -h - 10);
    this.ctx.lineTo(w - 110, -h - 10);
    this.ctx.lineTo(w - 50, -90);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Large Windows (Profile)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.save();
    // Front window
    this.ctx.beginPath();
    this.ctx.moveTo(105, -h);
    this.ctx.lineTo(w / 2 - 10, -h);
    this.ctx.lineTo(w / 2 - 10, -90);
    this.ctx.lineTo(80, -90);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Back window
    this.ctx.beginPath();
    this.ctx.moveTo(w / 2 + 10, -h);
    this.ctx.lineTo(w - 120, -h);
    this.ctx.lineTo(w - 65, -90);
    this.ctx.lineTo(w / 2 + 10, -90);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    // Checker Line
    this.ctx.fillStyle = '#000';
    const checkerSize = 12;
    for (let x = 10; x < w - 10; x += checkerSize * 2) {
      this.ctx.fillRect(x, -65, checkerSize, checkerSize);
      this.ctx.fillRect(x + checkerSize, -53, checkerSize, checkerSize);
    }

    // Door handles
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(w / 2 - 40, -50, 20, 5);
    this.ctx.fillRect(w / 2 + 60, -50, 20, 5);

    // Taxi Sign
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(w / 2 - 40, -h - 25, 80, 25);
    this.ctx.strokeRect(w / 2 - 40, -h - 25, 80, 25);
    this.ctx.fillStyle = '#000';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('TAXI', w / 2, -h - 5);

    // Chrome Details
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillRect(-15, -45, 30, 12); // Back bumper
    this.ctx.fillRect(w - 15, -45, 30, 12); // Front bumper

    // Grill
    this.ctx.fillRect(w - 3, -80, 5, 25);

    // Headlight (Brighter)
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#fef08a';
    this.ctx.fillStyle = '#fffabc';
    this.ctx.beginPath();
    this.ctx.arc(w - 5, -65, 12, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

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
