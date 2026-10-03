/* Background music: a YouTube link (hidden player) or a direct mp3/m4a/ogg/wav link.
   The YouTube player is created early (preload) so that play() can run right inside
   the visitor's tap — phones block audio that starts later than the tap. */
import { isAudioFile, ytId } from './utils';

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(id: string): void;
  setVolume(v: number): void;
}
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: object) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private audioUrl = '';
  private player: YTPlayer | null = null;
  private playerId: string | null = null;
  private ready = false;
  private wantPlay = false;
  private hintTimer = 0;
  playing = false;

  constructor(
    private onChange: (playing: boolean) => void,
    private hint: (msg: string) => void,
  ) {}

  /** True when the link is something we can play. */
  static canPlay(url: string): boolean {
    return !!ytId(url) || isAudioFile(url);
  }

  private set(on: boolean) {
    this.playing = on;
    this.onChange(on);
  }

  /** Load the YouTube API + a paused player in the background. */
  preload(url: string): void {
    const id = ytId(url);
    if (id && !this.player) this.withApi(() => this.create(id));
    else if (isAudioFile(url)) this.makeAudio(url.trim()).preload = 'auto';
  }

  start(url: string): void {
    url = (url || '').trim();
    this.wantPlay = true;

    if (isAudioFile(url)) {
      this.makeAudio(url).play().catch(() => this.hint('উপরের ♪ button চেপে music চালু করো'));
      return;
    }

    const id = ytId(url);
    if (!id) return;
    if (this.player && this.ready) {
      // Called inside the tap -> allowed to start sound
      if (this.playerId !== id) { this.playerId = id; this.player.loadVideoById(id); }
      else this.player.playVideo();
    } else if (!this.player) {
      this.withApi(() => this.create(id));
    }
    clearTimeout(this.hintTimer);
    this.hintTimer = window.setTimeout(() => {
      if (!this.playing) this.hint('Music শুরু না হলে উপরের ♪ button চাপো');
    }, 4500);
  }

  pause(): void {
    this.wantPlay = false;
    clearTimeout(this.hintTimer); // she stopped it on purpose — no "music didn't start" hint
    this.audio?.pause();
    try { this.player?.pauseVideo(); } catch { /* not ready */ }
    this.set(false);
  }

  private makeAudio(url: string): HTMLAudioElement {
    if (!this.audio || this.audioUrl !== url) {
      this.audio?.pause();
      this.audio = new Audio(url);
      this.audio.loop = true;
      this.audioUrl = url;
      this.audio.onplay = () => this.set(true);
      this.audio.onpause = () => this.set(false);
    }
    return this.audio;
  }

  private withApi(cb: () => void): void {
    if (window.YT?.Player) { cb(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); cb(); };
    if (!document.getElementById('yt-api')) {
      const s = document.createElement('script');
      s.id = 'yt-api';
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  }

  private create(id: string): void {
    if (this.player) return;
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:-9999px;top:0;width:200px;height:200px;pointer-events:none';
    box.appendChild(document.createElement('div'));
    document.body.appendChild(box);
    this.playerId = id;
    this.player = new window.YT!.Player(box.firstChild as HTMLElement, {
      width: 200, height: 200, videoId: id,
      playerVars: { autoplay: 0, loop: 1, playlist: id, controls: 0, playsinline: 1 },
      events: {
        onReady: (e: { target: YTPlayer }) => {
          this.ready = true;
          e.target.setVolume(75);
          if (this.wantPlay) e.target.playVideo();
        },
        onStateChange: (e: { data: number }) => this.set(e.data === 1),
      },
    });
  }
}
