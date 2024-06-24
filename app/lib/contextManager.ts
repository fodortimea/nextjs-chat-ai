class ContextManager {
  private static instance: ContextManager;
  private context: number[];

  private constructor() {
    this.context = [];
  }

  static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  getContext(): number[] {
    return this.context;
  }

  setContext(value: number[]): void {
    this.context = value;
  }
}

const contextManager = ContextManager.getInstance();
export default contextManager;
