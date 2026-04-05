// ─── Configuração ─────────────────────────────────────────────────────────────
const LANGS = [
  { code: 'pt-PT', region: 'PT', label: 'Português',    flag: '🇵🇹', sub: 'pt' },
  { code: 'pt-BR', region: 'BR', label: 'Português BR', flag: '🇧🇷', sub: 'pt-BR' },
  { code: 'en-US', region: 'US', label: 'English',      flag: '🇬🇧', sub: 'en' },
  { code: 'es-ES', region: 'ES', label: 'Español',      flag: '🇪🇸', sub: 'es' },
  { code: 'fr-FR', region: 'FR', label: 'Français',     flag: '🇫🇷', sub: 'fr' },
  { code: 'de-DE', region: 'DE', label: 'Deutsch',      flag: '🇩🇪', sub: 'de' },
  { code: 'it-IT', region: 'IT', label: 'Italiano',     flag: '🇮🇹', sub: 'it' },
  { code: 'ja-JP', region: 'JP', label: '日本語',        flag: '🇯🇵', sub: 'ja' },
];

const CONFIG = {
  TMDB_API_KEY: '7deb374bd296e916ea2c85e46f47293e',
  TMDB_BEARER: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZGViMzc0YmQyOTZlOTE2ZWEyYzg1ZTQ2ZjQ3MjkzZSIsIm5iZiI6MTc3NDc5NzM4MS40MTIsInN1YiI6IjY5Yzk0MjQ1ZGZlNmRhZmVlMjE0Yzg3NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MT2k-F45SQimFZug4daNmrUOwrswBL0keesQPCI94zg',
  TMDB_BASE: 'https://api.themoviedb.org/3',
  IMG_BASE: 'https://image.tmdb.org/t/p',
  get LANG() { return localStorage.getItem('emergent_lang') || 'pt-PT'; },
  get REGION() { return localStorage.getItem('emergent_region') || 'PT'; },
  get SUBLANG() {
    const l = LANGS.find(x => x.code === this.LANG);
    return l ? l.sub : 'pt';
  },

  SERVERS_MOVIE: [
    { name: 'Servidor 1', url: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}` },
    { name: 'Servidor 2', url: (id) => `https://embed.su/embed/movie/${id}` },
    { name: 'Servidor 3', url: (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` },
    { name: 'Servidor 4', url: (id) => `https://vidsrc.to/embed/movie/${id}` },
    { name: 'Servidor 5', url: (id) => `https://autoembed.co/movie/tmdb/${id}` },
    { name: 'Servidor 6', url: (id) => `https://player.videasy.net/movie/${id}` },
    { name: 'Servidor 7', url: (id) => `https://vidbinge.dev/embed/movie/${id}` },
  ],
  SERVERS_TV: [
    { name: 'Servidor 1', url: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
    { name: 'Servidor 2', url: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
    { name: 'Servidor 3', url: (id, s, e) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
    { name: 'Servidor 4', url: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { name: 'Servidor 5', url: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
    { name: 'Servidor 6', url: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}` },
    { name: 'Servidor 7', url: (id, s, e) => `https://vidbinge.dev/embed/tv/${id}/${s}/${e}` },
  ],
  EMBED_MOVIE: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
  EMBED_TV: (id, s = 1, e = 1) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
};
