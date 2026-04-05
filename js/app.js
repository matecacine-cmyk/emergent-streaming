// ─── Emergent App ──────────────────────────────────────────────────────────────
const App = {
  wishlist: JSON.parse(localStorage.getItem('emergent_wishlist') || '[]'),
  searchTimeout: null,

  init() {
    this.checkApiKey();
    this.bindNav();
    this.bindSearch();
    this.bindChat();
    document.getElementById('year').textContent = new Date().getFullYear();
  },

  checkApiKey() {
    if (CONFIG.TMDB_API_KEY === 'COLOCA_AQUI_A_TUA_API_KEY') {
      this.showApiWarning();
    }
  },

  showApiWarning() {
    const w = document.createElement('div');
    w.className = 'api-warning';
    w.innerHTML = `
      <strong>API Key em falta!</strong>
      Obtém uma key gratuita em <a href="https://www.themoviedb.org/settings/api" target="_blank">themoviedb.org</a>
      e coloca em <code>js/config.js</code>
      <button onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.prepend(w);
  },

  bindNav() {
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        Router.go(el.dataset.page, el.dataset.params ? JSON.parse(el.dataset.params) : {});
      });
    });
  },

  bindSearch() {
    const input = document.getElementById('search-input');
    const suggestions = document.getElementById('search-suggestions');
    const btn = document.getElementById('search-btn');
    if (!input) return;

    input.addEventListener('input', () => {
      clearTimeout(this.searchTimeout);
      const q = input.value.trim();
      if (q.length < 2) { suggestions.innerHTML = ''; suggestions.classList.remove('active'); return; }
      this.searchTimeout = setTimeout(() => this.fetchSuggestions(q, suggestions), 350);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        suggestions.classList.remove('active');
        Router.go('search', { q: input.value.trim() });
      }
    });

    btn?.addEventListener('click', () => {
      suggestions.classList.remove('active');
      Router.go('search', { q: input.value.trim() });
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.search-wrap')) {
        suggestions.classList.remove('active');
      }
    });
  },

  async fetchSuggestions(q, container) {
    try {
      const data = await TMDB.search(q);
      const items = data.results.filter(r => r.media_type !== 'person').slice(0, 6);
      container.innerHTML = items.map(r => `
        <div class="suggestion-item" onclick="Router.go('watch',{type:'${r.media_type}',id:${r.id}})">
          <img src="${TMDB.img(r.poster_path, 'w92')}" onerror="this.src='https://via.placeholder.com/40x60/222/444?text=?'">
          <div>
            <span>${r.title || r.name}</span>
            <small>${r.media_type === 'movie' ? 'Filme' : 'Série'} · ${(r.release_date || r.first_air_date || '').substring(0,4)}</small>
          </div>
        </div>
      `).join('');
      container.classList.toggle('active', items.length > 0);
    } catch(e) {}
  },

  bindChat() {
    const btn = document.getElementById('chat-btn');
    const win = document.getElementById('chat-window');
    const close = document.getElementById('chat-close');
    const send = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    const msgs = document.getElementById('chat-messages');
    if (!btn) return;

    const responses = [
      'Olá! Como posso ajudar?',
      'Para problemas de reprodução, tenta outro servidor.',
      'Podes usar a Minha Lista para guardar favoritos.',
      'Recomendo ativar as legendas nas definições do player.',
      'Novos conteúdos são adicionados diariamente!',
    ];

    btn.addEventListener('click', () => win.classList.toggle('open'));
    close?.addEventListener('click', () => win.classList.remove('open'));
    send?.addEventListener('click', sendMsg);
    input?.addEventListener('keydown', e => e.key === 'Enter' && sendMsg());

    function sendMsg() {
      const text = input.value.trim();
      if (!text) return;
      msgs.innerHTML += `<div class="chat-msg user">${text}</div>`;
      input.value = '';
      setTimeout(() => {
        const r = responses[Math.floor(Math.random() * responses.length)];
        msgs.innerHTML += `<div class="chat-msg bot">${r}</div>`;
        msgs.scrollTop = msgs.scrollHeight;
      }, 600);
      msgs.scrollTop = msgs.scrollHeight;
    }
  },

  // Wishlist
  toggleWishlist(id, type, title, poster) {
    const idx = this.wishlist.findIndex(w => w.id === id);
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
      this.showToast(`Removido da lista: ${title}`);
    } else {
      this.wishlist.push({ id, type, title, poster });
      this.showToast(`Adicionado à lista: ${title}`);
    }
    localStorage.setItem('emergent_wishlist', JSON.stringify(this.wishlist));
    document.querySelectorAll(`[data-wishlist="${id}"]`).forEach(el => {
      el.classList.toggle('active', this.wishlist.some(w => w.id === id));
    });
  },

  inWishlist(id) {
    return this.wishlist.some(w => w.id === id);
  },

  showToast(msg, type = '') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3500);
  },

  renderStars(rating) {
    const r = Math.round(rating / 2);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  },

  renderCard(item, type) {
    if (!item.poster_path || item.media_type === 'person') return '';
    const id = item.id;
    const actualType = (item.media_type === 'movie' || item.media_type === 'tv') ? item.media_type : type;
    const title = item.title || item.name;
    const poster = TMDB.img(item.poster_path);
    const year = (item.release_date || item.first_air_date || '').substring(0, 4);
    const rating = item.vote_average?.toFixed(1) || '?';
    const inList = this.inWishlist(id);

    return `
      <div class="card" onclick="Router.go('watch',{type:'${actualType}',id:${id}})">
        <div class="card-img-wrap">
          <img src="${poster}" alt="${title}" loading="lazy"
               onerror="this.src='https://via.placeholder.com/300x450/111/333?text=Sem+Imagem'">
          <div class="card-overlay">
            <button class="play-btn">▶</button>
          </div>
          <button class="wishlist-btn ${inList ? 'active' : ''}" data-wishlist="${id}"
            onclick="event.stopPropagation(); App.toggleWishlist(${id},'${actualType}','${title.replace(/'/g,"\\'")}','${item.poster_path || ''}')">
            ${inList ? '♥' : '♡'}
          </button>
          ${item.vote_average ? `<div class="card-rating">⭐ ${rating}</div>` : ''}
        </div>
        <div class="card-info">
          <p class="card-title">${title}</p>
          <p class="card-meta">${year}${type === 'tv' ? ' · Série' : ''}</p>
        </div>
      </div>
    `;
  },

  renderRow(title, items, type) {
    if (!items?.length) return '';
    return `
      <section class="row-section">
        <h2 class="row-title">${title}</h2>
        <div class="cards-row">
          ${items.map(i => this.renderCard(i, type)).join('')}
        </div>
      </section>
    `;
  },

  skeleton(count = 6) {
    return `<div class="cards-row">${Array(count).fill(`
      <div class="card skeleton">
        <div class="skeleton-img"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    `).join('')}</div>`;
  },

  renderPagination(page, totalPages, callbackTpl) {
    if (totalPages <= 1) return '';
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    if (start > 1) pages.push(1, '...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push('...', totalPages);
    const btn = (p) => callbackTpl.replace('__PAGE__', p);
    return `
      <div class="pagination">
        <button ${page <= 1 ? 'disabled' : ''} onclick="${btn(page - 1)}">‹</button>
        ${pages.map(p => p === '...'
          ? '<span>...</span>'
          : `<button class="${p === page ? 'active' : ''}" onclick="${btn(p)}">${p}</button>`
        ).join('')}
        <button ${page >= totalPages ? 'disabled' : ''} onclick="${btn(page + 1)}">›</button>
      </div>
    `;
  },
};

// ─── Router ───────────────────────────────────────────────────────────────────
const Router = {
  routes: {},
  current: null,

  register(name, handler) { this.routes[name] = handler; },

  go(page, params = {}) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const handler = this.routes[page];
    if (!handler) return;
    this.current = page;
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    handler(params);
    history.pushState({ page, params }, '', `#${page}`);
  },

  init() {
    window.addEventListener('popstate', e => {
      if (e.state) this.go(e.state.page, e.state.params);
    });
    const hash = location.hash.replace('#', '');
    // Páginas que precisam de params não são restauráveis ao refrescar
    const noRestore = ['watch', 'search'];
    if (hash && this.routes[hash] && !noRestore.includes(hash)) {
      this.go(hash, {});
    } else {
      this.go('home', {});
    }
  },
};

// ─── Pages ────────────────────────────────────────────────────────────────────
const Pages = {
  main: document.getElementById('main-content'),

  set(html) { this.main.innerHTML = html; },

  // HOME
  async home() {
    Pages.set(`<div class="hero-skeleton"></div>${App.skeleton(8)}`);
    try {
      const [trending, popular, topMovies, topTV, anime] = await Promise.all([
        TMDB.trending('all', 'week'),
        TMDB.popular('movie'),
        TMDB.topRated('movie'),
        TMDB.topRated('tv'),
        TMDB.animeAlt(),
      ]);

      const featured = trending.results[0];
      Pages.set(`
        ${Pages.hero(featured)}
        <div class="rows-container">
          ${App.renderRow('Em Tendência', trending.results.slice(1, 13), 'movie')}
          ${App.renderRow('Filmes Populares', popular.results.slice(0, 12), 'movie')}
          ${App.renderRow('Séries Mais Vistas', topTV.results.slice(0, 12), 'tv')}
          ${App.renderRow('Anime', anime.results.slice(0, 12), 'tv')}
          ${App.renderRow('Top Filmes', topMovies.results.slice(0, 12), 'movie')}
        </div>
      `);
    } catch(e) {
      Pages.set(`<div class="error-msg"><h2>Erro ao carregar</h2><p>${e.message}</p></div>`);
    }
  },

  hero(item) {
    if (!item) return '';
    const title = item.title || item.name;
    const type = item.media_type || 'movie';
    const bg = TMDB.backdrop(item.backdrop_path);
    return `
      <div class="hero" style="background-image: linear-gradient(to right, #0a0a0a 30%, transparent 70%), url('${bg}')">
        <div class="hero-content">
          <div class="hero-badge">${type === 'movie' ? 'FILME' : 'SÉRIE'}</div>
          <h1>${title}</h1>
          <p>${item.overview?.substring(0, 180) || ''}...</p>
          <div class="hero-meta">
            <span class="hero-rating">⭐ ${item.vote_average?.toFixed(1)}</span>
            <span>${(item.release_date || item.first_air_date || '').substring(0, 4)}</span>
          </div>
          <div class="hero-btns">
            <button class="btn-play" onclick="Router.go('watch',{type:'${type}',id:${item.id}})">▶ Assistir</button>
            <button class="btn-info" onclick="Router.go('watch',{type:'${type}',id:${item.id}})">ⓘ Mais Info</button>
          </div>
        </div>
      </div>
    `;
  },

  // FILMES
  async movies(params = {}) {
    const page = params.page || 1;
    const genre = params.genre || '';
    Pages.set(`<div class="page-header"><h1>Filmes</h1></div>${App.skeleton(20)}`);
    try {
      const genres = await TMDB.genres('movie');
      const data = genre
        ? await TMDB.byGenre('movie', genre, page)
        : await TMDB.popular('movie', page);
      Pages.set(`
        <div class="catalog-page">
          <div class="catalog-header">
            <h1>Filmes</h1>
            <div class="genre-pills">
              <button class="pill ${!genre ? 'active' : ''}" onclick="Pages.movies({page:1})">Todos</button>
              ${genres.genres.map(g => `
                <button class="pill ${genre == g.id ? 'active' : ''}"
                  onclick="Pages.movies({genre:${g.id},page:1})">${g.name}</button>
              `).join('')}
            </div>
          </div>
          <div class="cards-grid">
            ${data.results.map(i => App.renderCard(i, 'movie')).join('')}
          </div>
          ${App.renderPagination(page, Math.min(data.total_pages, 100), `Pages.movies({page:__PAGE__${genre ? ',genre:' + genre : ''}})`)}
        </div>
      `);
    } catch(e) {
      Pages.set(`<div class="error-msg"><p>${e.message}</p></div>`);
    }
  },

  // SÉRIES
  async series(params = {}) {
    const page = params.page || 1;
    const genre = params.genre || '';
    Pages.set(`<div class="page-header"><h1>Séries</h1></div>${App.skeleton(20)}`);
    try {
      const genres = await TMDB.genres('tv');
      const data = genre
        ? await TMDB.byGenre('tv', genre, page)
        : await TMDB.popular('tv', page);
      Pages.set(`
        <div class="catalog-page">
          <div class="catalog-header">
            <h1>Séries</h1>
            <div class="genre-pills">
              <button class="pill ${!genre ? 'active' : ''}" onclick="Pages.series({page:1})">Todas</button>
              ${genres.genres.map(g => `
                <button class="pill ${genre == g.id ? 'active' : ''}"
                  onclick="Pages.series({genre:${g.id},page:1})">${g.name}</button>
              `).join('')}
            </div>
          </div>
          <div class="cards-grid">
            ${data.results.map(i => App.renderCard(i, 'tv')).join('')}
          </div>
          ${App.renderPagination(page, Math.min(data.total_pages, 100), `Pages.series({page:__PAGE__${genre ? ',genre:' + genre : ''}})`)}
        </div>
      `);
    } catch(e) {
      Pages.set(`<div class="error-msg"><p>${e.message}</p></div>`);
    }
  },

  // ANIME
  async anime(params = {}) {
    const page = params.page || 1;
    Pages.set(`<div class="page-header"><h1>Anime</h1></div>${App.skeleton(20)}`);
    try {
      const data = await TMDB.animeAlt(page);
      Pages.set(`
        <div class="catalog-page">
          <div class="catalog-header"><h1>Anime</h1></div>
          <div class="cards-grid">
            ${data.results.map(i => App.renderCard(i, 'tv')).join('')}
          </div>
          ${App.renderPagination(page, Math.min(data.total_pages, 50), `Pages.anime({page:__PAGE__})`)}
        </div>
      `);
    } catch(e) {
      Pages.set(`<div class="error-msg"><p>${e.message}</p></div>`);
    }
  },

  // MINHA LISTA
  myList() {
    const list = App.wishlist;
    Pages.set(`
      <div class="catalog-page">
        <div class="catalog-header"><h1>Minha Lista</h1></div>
        ${list.length === 0
          ? `<div class="empty-list"><p>A tua lista está vazia.</p><button class="btn-play" onclick="Router.go('home')">Explorar</button></div>`
          : `<div class="cards-grid">${list.map(i => App.renderCard(i, i.type)).join('')}</div>`
        }
      </div>
    `);
  },

  // WATCH / DETALHES
  async watch(params) {
    let { type, id } = params;
    if (!type || !id || type === 'person') { Router.go('home'); return; }
    if (type !== 'movie' && type !== 'tv') type = 'movie';
    Pages.set(`<div class="loading-detail"></div>`);
    try {
      const data = await TMDB.details(type, id);
      const title = data.title || data.name;
      const year = (data.release_date || data.first_air_date || '').substring(0, 4);
      const trailer = data.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      const cast = data.credits?.cast?.slice(0, 8) || [];
      const similar = data.similar?.results?.slice(0, 8) || [];
      const seasons = data.seasons?.filter(s => s.season_number > 0) || [];

      const s = params.season || 1;
      const e = params.episode || 1;
      const servers = type === 'movie' ? CONFIG.SERVERS_MOVIE : CONFIG.SERVERS_TV;
      const serverBtns = servers.map((srv, i) => `
        <button class="server-btn ${i === 0 ? 'active' : ''}"
          onclick="Pages.changeServer(${id},'${type}',${s},${e},${i})">
          ${srv.name}
        </button>
      `).join('');

      let playerHtml = '';
      if (type === 'movie') {
        playerHtml = `
          <div class="server-bar"><span>Servidor:</span>${serverBtns}</div>
          <iframe id="player-frame" src="${servers[0].url(id)}" allow="autoplay; fullscreen" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox"></iframe>
        `;
      } else if (seasons.length > 0) {
        playerHtml = `
          <div class="server-bar"><span>Servidor:</span>${serverBtns}</div>
          <iframe id="player-frame" src="${servers[0].url(id, s, e)}" allow="autoplay; fullscreen" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox"></iframe>
          <div class="episode-selector">
            <select id="season-sel" onchange="Pages.changeSeason(${id}, this.value)">
              ${seasons.map(se => `<option value="${se.season_number}" ${se.season_number == s ? 'selected' : ''}>Temporada ${se.season_number}</option>`).join('')}
            </select>
            <div id="episode-list" class="episode-list">
              ${Array.from({length: seasons.find(se => se.season_number == s)?.episode_count || 1}, (_, i) => `
                <button class="ep-btn ${i+1 == e ? 'active' : ''}"
                  onclick="Pages.changeEpisode(${id}, ${s}, ${i+1})">Ep ${i+1}</button>
              `).join('')}
            </div>
          </div>
        `;
      }

      Pages.set(`
        <div class="watch-page">
          <div class="player-wrap">${playerHtml}</div>
          <div class="watch-info">
            <div class="watch-main">
              <span class="watch-type">${type === 'movie' ? 'FILME' : 'SÉRIE'}</span>
              <h1>${title}</h1>
              <div class="watch-meta">
                <span class="rating">⭐ ${data.vote_average?.toFixed(1)}</span>
                <span>${year}</span>
                ${data.runtime ? `<span>${Math.floor(data.runtime/60)}h ${data.runtime%60}m</span>` : ''}
                ${data.number_of_seasons ? `<span>${data.number_of_seasons} temporada${data.number_of_seasons > 1 ? 's' : ''}</span>` : ''}
                ${data.genres?.map(g => `<span class="genre-tag">${g.name}</span>`).join('') || ''}
              </div>
              <p class="watch-overview">${data.overview || ''}</p>
              <div class="watch-actions">
                <button class="btn-wishlist ${App.inWishlist(id) ? 'active' : ''}" data-wishlist="${id}"
                  onclick="App.toggleWishlist(${id},'${type}','${title.replace(/'/g,"\\'")}','${data.poster_path || ''}')">
                  ${App.inWishlist(id) ? '♥ Na Lista' : '♡ Adicionar à Lista'}
                </button>
                ${trailer ? `<a class="btn-trailer" href="https://youtube.com/watch?v=${trailer.key}" target="_blank">🎬 Trailer</a>` : ''}
              </div>
            </div>
            ${cast.length ? `
              <div class="cast-section">
                <h3>Elenco</h3>
                <div class="cast-list">
                  ${cast.map(c => `
                    <div class="cast-item">
                      <img src="${TMDB.img(c.profile_path, 'w92')}" alt="${c.name}"
                           onerror="this.src='https://via.placeholder.com/60x60/222/444?text=?'">
                      <span>${c.name}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          ${similar.length ? `
            <div class="similar-section">
              <h2>Conteúdo Semelhante</h2>
              <div class="cards-row">${similar.map(i => App.renderCard(i, type)).join('')}</div>
            </div>
          ` : ''}
        </div>
      `);
      // Auto-fallback de servidor
      setTimeout(() => Pages.initAutoFallback(id, type, s, e), 200);


    } catch(e) {
      Pages.set(`<div class="error-msg"><h2>Erro</h2><p>${e.message}</p></div>`);
    }
  },

  initAutoFallback(id, type, season, episode) {
    const frame = document.getElementById('player-frame');
    if (!frame) return;
    const servers = type === 'movie' ? CONFIG.SERVERS_MOVIE : CONFIG.SERVERS_TV;
    let current = 0;
    let timer = null;
    let stopped = false;

    // Expõe função para parar o fallback quando o utilizador troca manualmente
    frame._stopFallback = () => { stopped = true; clearTimeout(timer); };

    const tryNext = () => {
      if (stopped) return;
      current++;
      if (current >= servers.length) {
        App.showToast('Nenhum servidor disponível de momento.', 'error');
        return;
      }
      App.showToast(`Servidor indisponível — a tentar ${servers[current].name}...`);
      Pages.changeServer(id, type, season, episode, current);
      // Aguarda mais 10s antes de tentar o seguinte
      timer = setTimeout(tryNext, 10000);
    };

    // Espera 8s pelo primeiro servidor; se carregar erro (ex: "media unavailable"),
    // passa ao seguinte sem depender do evento load (que dispara mesmo em páginas de erro)
    timer = setTimeout(tryNext, 8000);
  },

  changeServer(id, type, season, episode, serverIdx) {
    const frame = document.getElementById('player-frame');
    if (!frame) return;
    // Se o utilizador clicou manualmente, para o fallback automático
    if (frame._stopFallback) { frame._stopFallback(); frame._stopFallback = null; }
    const servers = type === 'movie' ? CONFIG.SERVERS_MOVIE : CONFIG.SERVERS_TV;
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation allow-popups-to-escape-sandbox');
    frame.src = type === 'movie'
      ? servers[serverIdx].url(id)
      : servers[serverIdx].url(id, season, episode);
    document.querySelectorAll('.server-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === serverIdx);
    });
  },

  async changeSeason(id, season) {
    const frame = document.getElementById('player-frame');
    const episodeList = document.getElementById('episode-list');
    if (!frame) return;
    const serverIdx = [...document.querySelectorAll('.server-btn')].findIndex(b => b.classList.contains('active'));
    const idx = serverIdx >= 0 ? serverIdx : 0;
    frame.src = CONFIG.SERVERS_TV[idx].url(id, season, 1);
    try {
      const data = await TMDB.details('tv', id);
      const s = data.seasons?.find(se => se.season_number == season);
      const count = s?.episode_count || 1;
      episodeList.innerHTML = Array.from({length: count}, (_, i) => `
        <button class="ep-btn ${i === 0 ? 'active' : ''}"
          onclick="Pages.changeEpisode(${id}, ${season}, ${i+1})">Ep ${i+1}</button>
      `).join('');
    } catch(e) {}
  },

  changeEpisode(id, season, episode) {
    const frame = document.getElementById('player-frame');
    if (frame) {
      const serverIdx = [...document.querySelectorAll('.server-btn')].findIndex(b => b.classList.contains('active'));
      const idx = serverIdx >= 0 ? serverIdx : 0;
      frame.src = CONFIG.SERVERS_TV[idx].url(id, season, episode);
    }
    document.querySelectorAll('.ep-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i + 1 === episode);
    });
  },

  // PESQUISA
  async search(params) {
    const q = params.q || '';
    if (!q) return Router.go('home');
    Pages.set(`<div class="page-header"><h1>A pesquisar "${q}"...</h1></div>${App.skeleton(10)}`);
    try {
      const data = await TMDB.search(q);
      const results = data.results.filter(r => r.media_type !== 'person');
      Pages.set(`
        <div class="catalog-page">
          <div class="catalog-header">
            <h1>Resultados para "${q}" (${data.total_results})</h1>
          </div>
          ${results.length === 0
            ? '<div class="empty-list"><p>Sem resultados.</p></div>'
            : `<div class="cards-grid">${results.map(i => App.renderCard(i, i.media_type || 'movie')).join('')}</div>`
          }
        </div>
      `);
    } catch(e) {
      Pages.set(`<div class="error-msg"><p>${e.message}</p></div>`);
    }
  },
};

// ─── Register Routes ──────────────────────────────────────────────────────────
Router.register('home', () => Pages.home());
Router.register('movies', params => Pages.movies(params));
Router.register('series', params => Pages.series(params));
Router.register('anime', params => Pages.anime(params));
Router.register('mylist', () => Pages.myList());
Router.register('watch', params => Pages.watch(params));
Router.register('search', params => Pages.search(params));

// ─── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
  setTimeout(() => {
    document.getElementById('page-loader')?.classList.add('hidden');
    Router.init();
  }, 600);
});
