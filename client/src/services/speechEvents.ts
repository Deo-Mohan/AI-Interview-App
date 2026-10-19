/**
 * Centralized Speech Event Bus
 * Synchronizes speech synthesis playback events with avatar animation engines.
 */
type SpeechEventListener = () => void;
type SpeechWordBoundaryListener = (word: string, approximateDurationMs: number) => void;

class SpeechEventBus {
  private startListeners: Set<SpeechEventListener> = new Set();
  private endListeners: Set<SpeechEventListener> = new Set();
  private wordBoundaryListeners: Set<SpeechWordBoundaryListener> = new Set();

  public onStart(listener: SpeechEventListener) {
    this.startListeners.add(listener);
    return () => this.startListeners.delete(listener);
  }

  public onEnd(listener: SpeechEventListener) {
    this.endListeners.add(listener);
    return () => this.endListeners.delete(listener);
  }

  public onWordBoundary(listener: SpeechWordBoundaryListener) {
    this.wordBoundaryListeners.add(listener);
    return () => this.wordBoundaryListeners.delete(listener);
  }

  public emitStart() {
    this.startListeners.forEach(l => {
      try { l(); } catch (e) { console.error('[SpeechBus] start error:', e); }
    });
  }

  public emitEnd() {
    this.endListeners.forEach(l => {
      try { l(); } catch (e) { console.error('[SpeechBus] end error:', e); }
    });
  }

  public emitWordBoundary(word: string, approximateDurationMs: number = 280) {
    this.wordBoundaryListeners.forEach(l => {
      try { l(word, approximateDurationMs); } catch (e) { console.error('[SpeechBus] boundary error:', e); }
    });
  }
}

export const speechEventBus = new SpeechEventBus();
