declare module 'bootstrap' {
  export class Modal {
    static getInstance(element: HTMLElement): Modal;
    hide(): void;
    show(): void;
    dispose(): void;
  }
} 