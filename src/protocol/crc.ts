export class CRC16 {
  // We use a Uint16Array to get free overflow functionality
  state = Uint16Array.from([0xffff]);
  buffer: DataView = new DataView(this.state.buffer);

  constructor() {
    this.reset = this.reset.bind(this);
    this.step = this.step.bind(this);
    this.read = this.read.bind(this);
    this.finish = this.finish.bind(this);
  }

  reset(): void {
    this.state[0] = 0xffff;
  }

  step(byte: number): void {
    this.state[0] = (this.state[0] >> 8) | (this.state[0] << 8);
    this.state[0] ^= byte;
    this.state[0] ^= (this.state[0] & 0xff) >> 4;
    this.state[0] ^= (this.state[0] << 8) << 4;
    this.state[0] ^= ((this.state[0] & 0xff) << 4) << 1;
  }

  read(): number {
    return this.state[0];
  }

  finish(): number {
    const res = this.read();
    this.reset();
    return res;
  }
}
