/**
 * Media sources.
 *
 * The hero tries, in order: a local frame sequence (when
 * HERO_SEQUENCE_MANIFEST is set), the remote Seedance clip scrubbed with
 * scroll (HERO_ORBIT_URL) — with the WebGL particle portrait rendering until
 * it is buffered — then the particle portrait alone.
 *
 * BUILDER_URL / CLOSER_URL are the Pillars and Finale clips. While they are
 * empty those sections show the real photograph instead; paste a clip URL in
 * to play it in the same frame (the photo becomes its poster).
 */
export const MEDIA = {
  HERO_ORBIT_URL:
    "https://d8j0ntlcm91z4.cloudfront.net/user_3G2CGCIgACIHPlqTOlAXOfInWfj/hf_20260718_215318_358869d5-5de1-4a9b-bb38-2fc43e2c7239.mp4",
  HERO_SEQUENCE_MANIFEST: null as string | null,
  BUILDER_URL: "",
  CLOSER_URL: "",
  PORTRAIT: "/media/shohruh-portrait.jpg",
  PORTRAIT_SQUARE: "/media/portrait-square.jpg",
};
