# Deploy na Cloudflare Pages com emergent.fit

## Passo 1 — API Key TMDB (gratuita)
1. Vai a https://www.themoviedb.org/signup e cria conta
2. Vá a https://www.themoviedb.org/settings/api
3. Clica "Create" → "Developer"
4. Copia a API Key (v3 auth)
5. Abre `js/config.js` e substitui `COLOCA_AQUI_A_TUA_API_KEY` pela key

## Passo 2 — Criar repositório GitHub
```bash
cd C:\Users\Pedro\donflix-clone
git init
git add .
git commit -m "DonFlix clone inicial"
git remote add origin https://github.com/SEU-USERNAME/donflix-clone.git
git push -u origin main
```

## Passo 3 — Deploy nas Cloudflare Pages
1. Vai a https://dash.cloudflare.com → Pages → Create a project
2. Conecta ao GitHub → seleciona o repositório `donflix-clone`
3. Build settings:
   - Framework: None
   - Build command: (vazio)
   - Output directory: `/` (root)
4. Clica "Save and Deploy"

## Passo 4 — Associar o domínio emergent.fit
1. Em Cloudflare Pages → Settings → Custom Domains
2. Clica "Set up a custom domain"
3. Escreve `emergent.fit` (ou `www.emergent.fit`)
4. Como o domínio já está no Cloudflare, o CNAME é criado automaticamente

## Resultado
O site fica em https://emergent.fit com:
- HTTPS automático
- CDN global
- Deploy automático a cada push no GitHub
