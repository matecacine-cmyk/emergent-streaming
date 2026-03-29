// ─── TMDB API Wrapper ─────────────────────────────────────────────────────────
const TMDB = {
  async fetch(endpoint, params = {}) {
    const url = new URL(CONFIG.TMDB_BASE + endpoint);
    url.searchParams.set('language', CONFIG.LANG);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await window.fetch(url, {
      headers: { Authorization: `Bearer ${CONFIG.TMDB_BEARER}` }
    });
    if (res.status === 404) return { results: [], status_code: 404 };
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
  },

  img(path, size = 'w500') {
    if (!path) return 'https://via.placeholder.com/500x750/111/444?text=Sem+Imagem';
    return `${CONFIG.IMG_BASE}/${size}${path}`;
  },

  backdrop(path, size = 'w1280') {
    if (!path) return '';
    return `${CONFIG.IMG_BASE}/${size}${path}`;
  },

  // ── Movies ──
  trending: (media = 'all', window = 'week') =>
    TMDB.fetch(`/trending/${media}/${window}`),

  popular: (type = 'movie', page = 1) =>
    TMDB.fetch(`/${type}/popular`, { page }),

  topRated: (type = 'movie', page = 1) =>
    TMDB.fetch(`/${type}/top_rated`, { page }),

  nowPlaying: (page = 1) =>
    TMDB.fetch('/movie/now_playing', { page }),

  upcoming: (page = 1) =>
    TMDB.fetch('/movie/upcoming', { page }),

  airingToday: (page = 1) =>
    TMDB.fetch('/tv/airing_today', { page }),

  onAir: (page = 1) =>
    TMDB.fetch('/tv/on_the_air', { page }),

  async details(type, id) {
    // Tenta com append_to_response, em caso de erro tenta sem
    try {
      const data = await TMDB.fetch(`/${type}/${id}`, { append_to_response: 'videos,credits,similar,recommendations' });
      if (data.status_code === 404 || !data.id) throw new Error('not found');
      return data;
    } catch(e) {
      return TMDB.fetch(`/${type}/${id}`);
    }
  },

  genres: (type = 'movie') =>
    TMDB.fetch(`/genre/${type}/list`),

  byGenre: (type = 'movie', genreId, page = 1) =>
    TMDB.fetch(`/discover/${type}`, { with_genres: genreId, page, sort_by: 'popularity.desc' }),

  search: (query, page = 1) =>
    TMDB.fetch('/search/multi', { query, page }),

  anime: (page = 1) =>
    TMDB.fetch('/discover/tv', {
      with_genres: 16,
      with_keywords: '210024',
      sort_by: 'popularity.desc',
      page,
    }),

  animeAlt: (page = 1) =>
    TMDB.fetch('/discover/tv', {
      with_genres: 16,
      sort_by: 'popularity.desc',
      page,
    }),

  watchProviders: (type, id) =>
    TMDB.fetch(`/${type}/${id}/watch/providers`),
};
