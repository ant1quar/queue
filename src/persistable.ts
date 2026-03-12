export abstract class Persistable {
    private static instances = new Set<Persistable>();
    private static shutdownRegistered = false;

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
        process.exit(0);
      };
      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);
    }

    protected abstract persist(): Promise<void>;
  }