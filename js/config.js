// ─── Configuração ─────────────────────────────────────────────────────────────
// Obtém a tua API key gratuita em: https://www.themoviedb.org/settings/api
const CONFIG = {
  TMDB_API_KEY: 'COLOCA_AQUI_A_TUA_API_KEY',
  TMDB_BASE: 'https://api.themoviedb.org/3',
  IMG_BASE: 'https://image.tmdb.org/t/p',
  LANG: 'pt-PT',
  REGION: 'PT',

  // Embeds para ver filmes/séries (fontes públicas)
  EMBED_MOVIE: (id) => `https://vidsrc.to/embed/movie/${id}`,
  EMBED_TV: (id, s = 1, e = 1) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
};
