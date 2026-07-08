import type gsap from "gsap";
import type {
  SceneDefinition,
  SceneHandle,
  SceneRegistration,
  Timeline,
} from "./types";

export type CanvasTier = "desktop" | "mobile" | "weak";

export interface RegistryFlags {
  reducedMotion: boolean;
  canvasTier: CanvasTier;
  paused: boolean;
}

/**
 * Singleton scene registry. Scenes register their build() on mount; the
 * ScrollProvider rebuilds them once the document is ready and tears them down
 * on route change. The registry is intentionally framework-agnostic — React
 * hooks in `src/hooks` are the public surface for components.
 */
class SceneRegistry {
  private pending = new Map<string, SceneDefinition>();
  private mounted = new Map<string, SceneRegistration>();
  private version = 0;

  getVersion() {
    return this.version;
  }

  /** Queue a scene to be built when the engine commits. */
  register(def: SceneDefinition) {
    this.pending.set(def.id, def);
  }

  unregister(id: string) {
    this.pending.delete(id);
    this.teardown(id);
  }

  listPending(): SceneDefinition[] {
    return [...this.pending.values()].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
    );
  }

  hasPending(id: string) {
    return this.pending.has(id);
  }

  /** Build all queued scenes against the given gsap instance and root scope. */
  commit(gsapInstance: typeof gsap, root: HTMLElement) {
    const next: SceneDefinition[] = [];
    for (const def of this.listPending()) {
      if (this.mounted.has(def.id)) continue;
      next.push(def);
    }
    if (!next.length) return;

    // Single shared context for the commit batch — one revert per commit.
    const ctx = gsapInstance.context(() => {
      for (const def of next) {
        const handle: SceneHandle = {
          id: def.id,
          el: root.querySelector<HTMLElement>(`#${def.id}`),
          reducedMotion: this.flags.reducedMotion,
          canvasTier: this.flags.canvasTier,
          paused: this.flags.paused,
        };
        const timeline = def.build(ctx, handle) ?? undefined;
        this.mounted.set(def.id, { id: def.id, context: ctx, timeline });
        this.pending.delete(def.id);
      }
    }, root);

    this.version++;
  }

  teardown(id: string) {
    const reg = this.mounted.get(id);
    if (!reg) return;
    reg.context.revert();
    reg.timeline?.kill();
    this.mounted.delete(id);
    this.version++;
  }

  teardownAll() {
    for (const id of [...this.mounted.keys()]) this.teardown(id);
    this.pending.clear();
    this.version++;
  }

  getTimeline(id: string): Timeline | undefined {
    return this.mounted.get(id)?.timeline;
  }

  isMounted(id: string) {
    return this.mounted.has(id);
  }

  /** Engine-level flags mirrored into every scene handle. */
  flags: RegistryFlags = {
    reducedMotion: false,
    canvasTier: "desktop",
    paused: false,
  };

  setFlags(next: Partial<RegistryFlags>) {
    Object.assign(this.flags, next);
  }
}

let registry: SceneRegistry | null = null;

export function getRegistry(): SceneRegistry {
  if (!registry) registry = new SceneRegistry();
  return registry;
}