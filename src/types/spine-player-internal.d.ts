import type { SpinePlayer, SpinePlayerConfig, Color } from '@esotericsoftware/spine-player';

interface SpinePlayerInternal extends SpinePlayer {
  config: SpinePlayerConfig & { backgroundColor?: string; alpha?: boolean };
  bg: Color & { setFromString(hex: string): void };
  context: { gl: WebGLRenderingContext | WebGL2RenderingContext };
  drawFrame(requestNextFrame?: boolean): void;
}
export type { SpinePlayerInternal };
