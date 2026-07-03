// TODO(colab-os): sound set is a reskin candidate (swap assets, keep API)
// Windows XP Sound Effects Utility

import startupUrl from "../assets/sounds/Windows XP Startup.mp3";
import logonUrl from "../assets/sounds/Windows XP Logon Sound.mp3";
import logoffUrl from "../assets/sounds/Windows XP Logoff Sound.mp3";
import shutdownUrl from "../assets/sounds/Windows XP Shutdown.mp3";
import startUrl from "../assets/sounds/Windows XP Start.mp3";
import balloonUrl from "../assets/sounds/Windows XP Balloon.mp3";
import criticalStopUrl from "../assets/sounds/Windows XP Critical Stop.mp3";
import minimizeUrl from "../assets/sounds/Windows XP Minimize.mp3";

export type SoundEffect =
  | "startup"
  | "logon"
  | "logoff"
  | "shutdown"
  | "start"
  | "balloon"
  | "criticalStop"
  | "minimize";

const soundPaths: Record<SoundEffect, string> = {
  startup: startupUrl,
  logon: logonUrl,
  logoff: logoffUrl,
  shutdown: shutdownUrl,
  start: startUrl,
  balloon: balloonUrl,
  criticalStop: criticalStopUrl,
  minimize: minimizeUrl,
};

let currentAudio: HTMLAudioElement | null = null;

export function playSound(sound: SoundEffect, volume: number = 0.5): void {
  try {
    // Stop any currently playing sound
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(soundPaths[sound]);
    audio.volume = Math.max(0, Math.min(1, volume));
    currentAudio = audio;

    audio.play().catch((error) => {
      console.warn(`Failed to play sound ${sound}:`, error);
    });

    // Clear reference when sound finishes
    audio.addEventListener("ended", () => {
      if (currentAudio === audio)
        currentAudio = null;

    });
  } catch (error) {
    console.warn(`Error playing sound ${sound}:`, error);
  }
}

export function stopSound(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}
