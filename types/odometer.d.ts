declare module "odometer" {
  export interface OdometerOptions {
    el: HTMLElement;
    value?: number;
    format?: string;
    theme?: string;
    duration?: number;
  }

  export default class Odometer {
    constructor(options: OdometerOptions);
    update(value: number): void;
  }
}
