import { isNil } from "./declarations/typeguards/isNil";

export abstract class Persistable {
    private static instances = new Set<Persistable>();
    private static shutdownRegistered = false;
    private static onComplete?: () => void;

    constructor() {
      Persistable.instances.add(this);
      Persistable.initialize();
    }

    private static initialize(): void {
      if (Persistable.shutdownRegistered) return;
      Persistable.shutdownRegistered = true;

      const shutdown = async () => {
        await Promise.all(
          [...Persistable.instances].map((p) => p.persist())
        );
        if(!isNil(Persistable.onComplete) || typeof Persistable.onComplete === 'function') {
            Persistable.onComplete();
        }
      };
      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);
    }

    static setShutdownComplete(cb: () => void): void {
        Persistable.onComplete = cb;
      }
    
    protected abstract persist(): Promise<void>;
  }