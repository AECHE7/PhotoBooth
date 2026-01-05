
// Simple Web Audio API wrapper for UI sounds without external assets

class SoundManager {
    private context: AudioContext | null = null;

    private getContext() {
        if (!this.context) {
            // @ts-ignore
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
        }
        return this.context;
    }

    playBeep(frequency: number = 440, duration: number = 0.1) {
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    }

    playCountdown() {
        this.playBeep(880, 0.1); // High beep
    }

    playShutter() {
        try {
            const ctx = this.getContext();
            const bufferSize = ctx.sampleRate * 0.1; // 100ms
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            // White noise
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            noise.connect(gain);
            gain.connect(ctx.destination);
            noise.start();
        } catch (e) {
            console.error("Shutter sound failed", e);
        }
    }
}

export const sounds = new SoundManager();
