// ─── Configuração ─────────────────────────────────────────────────────────────
// Obtém a tua API key gratuita em: https://www.themoviedb.org/settings/api
const CONFIG = {
  TMDB_API_KEY: '7deb374bd296e916ea2c85e46f47293e',
  TMDB_BEARER: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZGViMzc0YmQyOTZlOTE2ZWEyYzg1ZTQ2ZjQ3MjkzZSIsIm5iZiI6MTc3NDc5NzM4MS40MTIsInN1YiI6IjY5Yzk0MjQ1ZGZlNmRhZmVlMjE0Yzg3NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.MT2k-F45SQimFZug4daNmrUOwrswBL0keesQPCI94zg',
  TMDB_BASE: 'https://api.themoviedb.org/3',
  IMG_BASE: 'https://image.tmdb.org/t/p',
  LANG: 'pt-PT',
  REGION: 'PT',

  // Embeds para ver filmes/séries (fontes públicas)
  EMBED_MOVIE: (id) => `https://vidsrc.to/embed/movie/${id}`,
  EMBED_TV: (id, s = 1, e = 1) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
};
