export class InputManager {
  private keys: { [key: string]: boolean } = {};

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  isPressed(code: string): boolean {
    return !!this.keys[code];
  }

  handleJoystickMove(dir: { x: number, y: number }) {
    const threshold = 0.3;
    this.keys['ArrowUp'] = dir.y < -threshold;
    this.keys['ArrowDown'] = dir.y > threshold;
    this.keys['ArrowLeft'] = dir.x < -threshold;
    this.keys['ArrowRight'] = dir.x > threshold;
  }

  handleJoystickEnd() {
    this.keys['ArrowUp'] = false;
    this.keys['ArrowDown'] = false;
    this.keys['ArrowLeft'] = false;
    this.keys['ArrowRight'] = false;
  }

  setKey(code: string, value: boolean) {
    this.keys[code] = value;
  }

  dispose() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
  }
}

export const inputManager = new InputManager();
