// ─────────────────────────────────────────────────────────────────────────────
// DETECTION FUNCTION
// Async — injected into the active tab. Must be fully self-contained.
// ─────────────────────────────────────────────────────────────────────────────
async function detectDocsPlatform() {
  const hostname = window.location.hostname.toLowerCase();
  const origin   = window.location.origin;

  const metaGenerator = document.querySelector('meta[name="generator"]');
  const generator = (metaGenerator ? metaGenerator.getAttribute('content') : '').toLowerCase();

  const scriptSrcs = Array.from(document.querySelectorAll('script[src]'))
    .map(s => (s.getAttribute('src') || '').toLowerCase());
  const scriptTexts = Array.from(document.querySelectorAll('script:not([src])'))
    .map(s => s.textContent.slice(0, 8000).toLowerCase());
  const linkHrefs = Array.from(document.querySelectorAll('link[href]'))
    .map(l => (l.getAttribute('href') || '').toLowerCase());
  const metaContents = Array.from(document.querySelectorAll('meta'))
    .map(m => [m.getAttribute('name')||'', m.getAttribute('property')||'', m.getAttribute('content')||''].join('|').toLowerCase());
  const headHTML = document.head.innerHTML.toLowerCase().slice(0, 30000);

  const hasScript = (re) => scriptSrcs.some(s => re.test(s)) || scriptTexts.some(t => re.test(t));
  const hasLink   = (re) => linkHrefs.some(l => re.test(l));
  const hasMeta   = (re) => metaContents.some(m => re.test(m));
  const hasEl     = (sel) => { try { return !!document.querySelector(sel); } catch { return false; } };
  const inHead    = (re) => re.test(headHTML);
  const htmlAttr  = (attr) => (document.documentElement.getAttribute(attr) || '').toLowerCase();

  // ── Platform definitions ───────────────────────────────────────────────

  const platforms = [

    // ── Dedicated Dev-Docs Platforms ──────────────────────────────────────
    {
      name: 'Mintlify', color: '#16a34a', category: 'Developer Docs Platform',
      signals: [
        { label: 'mintlify.app / .dev domain',    detected: /mintlify\.(app|dev)/.test(hostname) },
        { label: 'mintlify.com domain',           detected: hostname.includes('mintlify.com') },
        { label: 'Meta generator',                detected: generator.includes('mintlify') },
        { label: 'Mintlify CDN (b-cdn.net)',       detected: hasScript(/mintlify\.b-cdn\.net/) },
        { label: 'Mintlify script / stylesheet',   detected: hasScript(/mintlify/) || hasLink(/mintlify/) },
        { label: 'Mintlify DOM markers',           detected: hasEl('[class*="mint-"],[id*="mintlify"],[data-mintlify]') || inHead(/mintlify/) },
        { label: 'Next.js + Mintlify refs',        detected: hasScript(/__next\/static/) && inHead(/mintlify/) },
      ],
    },
    {
      name: 'Fern', color: '#7c3aed', category: 'Developer Docs Platform',
      signals: [
        { label: 'buildwithfern.com domain',  detected: hostname.includes('buildwithfern.com') },
        { label: 'fern.dev domain',           detected: hostname.includes('fern.dev') },
        { label: 'Meta generator',            detected: generator.includes('fern') },
        { label: 'Fern CDN script',           detected: hasScript(/cdn\.buildwithfern\.com|fern-docs/) },
        { label: 'Fern script reference',     detected: hasScript(/buildwithfern/) },
        { label: 'Fern DOM markers',          detected: hasEl('[class*="fern-"],[data-fern]') || inHead(/buildwithfern|fern-docs/) },
        { label: 'Fern Ask AI button',        detected: !!document.querySelector('fern-ask-ai-button') },
      ],
    },
    {
      name: 'Speakeasy', color: '#e879f9', category: 'Developer Docs Platform',
      signals: [
        { label: 'speakeasyapi.dev domain',  detected: hostname.includes('speakeasyapi.dev') || hostname.includes('speakeasy.com') },
        { label: 'Speakeasy script',         detected: hasScript(/speakeasy/) },
        { label: 'Speakeasy in head',        detected: inHead(/speakeasy/) },
        { label: 'Speakeasy DOM markers',    detected: hasEl('[class*="speakeasy"]') },
      ],
    },
    {
      name: 'GitBook', color: '#3b82f6', category: 'Documentation Platform',
      signals: [
        { label: 'gitbook.io domain',       detected: hostname.includes('gitbook.io') },
        { label: 'gitbook.com domain',      detected: hostname.includes('gitbook.com') },
        { label: 'Meta generator',          detected: generator.includes('gitbook') },
        // v2/X: unique data-dpl-id attribute on <html>
        { label: 'GitBook data-dpl-id (v2)', detected: /^p-/.test(htmlAttr('data-dpl-id')) },
        { label: 'GitBook script',          detected: hasScript(/gitbook/) },
        { label: 'GitBook stylesheet',      detected: hasLink(/gitbook/) },
        { label: 'GitBook DOM (v1)',        detected: hasEl('.gitbook-root,.page-inner,.book-summary') },
        { label: 'GitBook DOM (v2)',        detected: hasEl('[class*="gitbook"]') && inHead(/gitbook/) },
      ],
    },
    {
      name: 'ReadMe', color: '#f59e0b', category: 'Developer Docs Platform',
      signals: [
        { label: 'readme.io / .com domain',  detected: /readme\.(io|com)/.test(hostname) },
        { label: 'Meta generator',           detected: generator.includes('readme') },
        { label: 'ReadMe script',            detected: hasScript(/readme\.io|readmeio|readme\.com/) },
        { label: 'ReadMe stylesheet',        detected: hasLink(/readme\.io|readme\.com/) },
        // New rm-* classes (current ReadMe)
        { label: 'ReadMe DOM (current)',     detected: hasEl('.rm-Guides,.rm-APISidebar,.rm-Header,.rm-Sidebar,.rm-ReferenceMain') },
        // Legacy hub-* classes (older ReadMe)
        { label: 'ReadMe DOM (legacy)',      detected: hasEl('.hub-sidebar,.hub-reference-section,#hub-content') },
      ],
    },
    {
      name: 'Archbee', color: '#5b21b6', category: 'Documentation Platform',
      signals: [
        { label: 'archbee.com / .io domain',  detected: /archbee\.(com|io)/.test(hostname) },
        { label: 'Archbee script',            detected: hasScript(/archbee/) },
        { label: 'Archbee in head',           detected: inHead(/archbee/) },
        { label: 'Archbee DOM markers',       detected: hasEl('[class*="archbee"]') },
      ],
    },
    {
      name: 'Document360', color: '#0284c7', category: 'Documentation Platform',
      signals: [
        { label: 'document360.com domain',   detected: /document360\.(com|io)/.test(hostname) },
        { label: 'Document360 script',       detected: hasScript(/document360/) },
        { label: 'Document360 in head',      detected: inHead(/document360/) },
        { label: 'Document360 DOM markers',  detected: hasEl('[class*="d360-"],[data-document360]') },
      ],
    },
    {
      name: 'Helpjuice', color: '#0891b2', category: 'Knowledge Base Platform',
      signals: [
        { label: 'helpjuice.com domain',  detected: hostname.includes('helpjuice.com') },
        { label: 'Helpjuice script',      detected: hasScript(/helpjuice/) },
        { label: 'Helpjuice in head',     detected: inHead(/helpjuice/) },
      ],
    },

    {
      name: 'MadCap Flare', color: '#d97706', category: 'Technical Documentation Tool',
      signals: [
        { label: 'Meta generator',        detected: /madcap flare/i.test(generator) },
        { label: 'MadCap JS files',       detected: hasScript(/MadCapBody|MadCapUtilities|MadCapAll|MCBody|MadCap\.js/i) },
        { label: 'MadCap CSS / assets',   detected: hasLink(/madcap/i) || inHead(/madcap\.flare|madcapflare/) },
        { label: 'MadCap DOM markers',    detected: hasEl('.MCBody,.MCBreadcrumbsBox,.MCTOCBody,.MCDropDown,.MCMainBody,.MCExpandingBody,.MCDropDownBody') },
        { label: 'data-mc-* attributes',  detected: !!document.querySelector('[data-mc-target-name],[data-mc-id],[data-mc-conditions],[data-mc-help-system-file-name]') },
      ],
    },

    // ── API Docs Platforms ─────────────────────────────────────────────────
    {
      name: 'Slate', color: '#2a4e7c', category: 'API Docs Framework',
      signals: [
        { label: 'Meta generator',             detected: /^slate/i.test(generator) },
        // Three-column layout: the defining Slate structure
        { label: 'Slate 3-column layout',      detected: hasEl('.toc-wrapper') && hasEl('.dark-box') },
        { label: 'Language selector',          detected: hasEl('.lang-selector,[data-language-name]') },
        { label: 'TOC + content structure',    detected: hasEl('.toc-wrapper') && hasEl('.content') },
        { label: 'Slate in head',              detected: inHead(/slate/) },
      ],
    },
    {
      name: 'Stoplight', color: '#6366f1', category: 'API Docs Platform',
      signals: [
        { label: 'stoplight.io domain',   detected: hostname.includes('stoplight.io') },
        { label: 'Stoplight Elements',    detected: hasEl('elements-api,[class*="sl-"]') || hasScript(/elements.*stoplight|stoplight.*elements/) },
        { label: 'Stoplight script',      detected: hasScript(/stoplight/) },
        { label: 'Stoplight in head',     detected: inHead(/stoplight/) },
      ],
    },
    {
      name: 'Scalar', color: '#6b7280', category: 'API Docs Platform',
      signals: [
        { label: 'scalar.com domain',      detected: hostname.includes('scalar.com') },
        // Scalar web component (most reliable)
        { label: 'Scalar web component',   detected: hasEl('scalar-api-reference,.scalar-app') },
        { label: 'Scalar script',          detected: hasScript(/scalar/) },
        { label: 'Scalar in head',         detected: inHead(/scalar\.com|@scalar\/api/) },
      ],
    },
    {
      name: 'Redocly', color: '#dc2626', category: 'API Docs Platform',
      signals: [
        { label: 'redocly.com / redoc.ly domain',  detected: /redocly\.com|redoc\.ly/.test(hostname) },
        { label: 'Redoc DOM structure',            detected: hasEl('.redoc-wrap,[data-role="redoc"],redoc') },
        { label: 'Redocly script',                 detected: hasScript(/redocly|redoc\.(min|standalone|esm)/) },
      ],
    },
    {
      name: 'Bump.sh', color: '#2563eb', category: 'API Docs Platform',
      signals: [
        { label: 'bump.sh domain',   detected: hostname.includes('bump.sh') },
        { label: 'Bump.sh script',   detected: hasScript(/bump\.sh/) },
        { label: 'Bump.sh in head',  detected: inHead(/bump\.sh/) },
        { label: 'Bump DOM markers', detected: hasEl('[class*="bump-"]') },
      ],
    },

    // ── Open-Source Frameworks ─────────────────────────────────────────────
    {
      name: 'Fumadocs', color: '#f97316', category: 'Open Source Docs Framework',
      signals: [
        { label: 'Meta generator',          detected: /fumadocs/i.test(generator) },
        // fd-* utility classes are unique to Fumadocs' Tailwind preset
        { label: 'Fumadocs fd-* classes',   detected: inHead(/\bfd-foreground\b|\bfd-background\b|\bfd-muted\b|\bfd-sidebar\b/) || !!document.querySelector('[class*="fd-"]') },
        // CSS custom properties injected by the Fumadocs layout
        { label: 'Fumadocs CSS vars',       detected: getComputedStyle(document.documentElement).getPropertyValue('--fd-sidebar-width') !== '' || /--fd-sidebar|--fd-toc/.test(headHTML) },
        { label: 'Fumadocs script',         detected: hasScript(/fumadocs/) },
        { label: 'Fumadocs in head',        detected: inHead(/fumadocs/) },
      ],
    },
    {
      name: 'Docusaurus', color: '#0ea5e9', category: 'Open Source Docs Framework',
      signals: [
        { label: 'Meta generator',           detected: /^docusaurus/i.test(generator) },
        { label: 'Docusaurus script',        detected: hasScript(/docusaurus/) },
        { label: 'Infima CSS (Docusaurus)',  detected: hasLink(/infima/) || inHead(/infima/) },
        { label: 'Docusaurus DOM',           detected: hasEl('.navbar--fixed-top,.theme-doc-markdown,.docSidebarContainer,.docMainContainer') },
        { label: 'Theme data attribute',     detected: hasEl('[data-theme]') && hasScript(/docusaurus/) },
      ],
    },
    {
      name: 'MkDocs', color: '#10b981', category: 'Open Source Docs Framework',
      signals: [
        { label: 'Meta generator',       detected: /mkdocs/i.test(generator) },
        { label: 'Material theme DOM',   detected: hasEl('[data-md-component],.md-sidebar,.md-content,.md-header') },
        { label: 'MkDocs script / link', detected: hasScript(/mkdocs/) || hasLink(/mkdocs/) },
      ],
    },
    {
      name: 'Sphinx', color: '#0d9488', category: 'Open Source Docs Framework',
      signals: [
        { label: 'Meta generator',          detected: /^sphinx/i.test(generator) },
        { label: 'Sphinx HTML comment',     detected: /generated by sphinx|sphinx [0-9]/i.test(document.documentElement.innerHTML.slice(0, 3000)) },
        // Furo theme (modern, popular)
        { label: 'Furo theme',             detected: hasEl('.sidebar-sticky,.toc-drawer,body[data-theme]') && inHead(/furo/) },
        // PyData Sphinx Theme (used by NumPy, pandas, etc.)
        { label: 'PyData theme',           detected: hasEl('[class*="pst-"],[class*="pydata-sphinx"]') || inHead(/pydata-sphinx/) },
        // Classic RTD theme
        { label: 'RTD / Classic theme',   detected: hasEl('.wy-nav-content,.rst-content,.sphinxsidebarwrapper') },
        { label: 'Sphinx assets',          detected: hasScript(/sphinx/) || hasLink(/pygments|furo\/|pydata_sphinx/) },
      ],
    },
    {
      // VitePress: Vue team's next-gen docs framework
      name: 'VitePress', color: '#646cff', category: 'Open Source Docs Framework',
      signals: [
        // Meta generator is the most reliable signal
        { label: 'Meta generator',            detected: /vitepress/i.test(generator) },
        { label: 'VitePress DOM (.VPNav)',     detected: hasEl('.VPNav,.VPSidebar,.VPContent,.VPLocalNav,.VPDoc') },
        { label: 'VitePress CSS vars',        detected: inHead(/--vp-c-brand|vitepress/) },
        { label: 'VitePress script',          detected: hasScript(/vitepress/) },
        { label: 'VitePress data attr',       detected: hasEl('[class*="vp-doc"],[data-vp-theme]') },
      ],
    },
    {
      // Starlight: Astro's official docs framework
      name: 'Starlight', color: '#ff5d01', category: 'Open Source Docs Framework',
      signals: [
        { label: 'Meta generator (Astro)',    detected: /astro/i.test(generator) },
        { label: 'Starlight in head',         detected: inHead(/starlight/) },
        // Astro Island web component — unique to Astro
        { label: 'Astro Island component',   detected: hasEl('astro-island') },
        { label: 'Starlight DOM (.sl-*)',     detected: hasEl('.sl-sidebar,.sl-content-panel,.sl-markdown-content,.sl-flex') },
        { label: 'Starlight script',         detected: hasScript(/starlight/) },
      ],
    },
    {
      // Docsify: lightweight docs from markdown, no static build step
      name: 'Docsify', color: '#42b983', category: 'Open Source Docs Framework',
      signals: [
        { label: 'Docsify script',            detected: hasScript(/docsify/) },
        // window.$docsify is set by the library on load
        { label: 'window.$docsify global',   detected: typeof window.$docsify !== 'undefined' },
        { label: 'Docsify DOM (#app)',        detected: (hasEl('#app') || hasEl('.app-nav')) && hasScript(/docsify/) },
        { label: 'Docsify in head',          detected: inHead(/docsify/) },
      ],
    },
    {
      name: 'VuePress', color: '#42b883', category: 'Open Source Docs Framework',
      signals: [
        { label: 'Meta generator',   detected: /vuepress/i.test(generator) },
        { label: 'VuePress DOM',     detected: hasEl('.theme-container,.theme-default-content,.vuepress-content') },
        { label: 'VuePress script',  detected: hasScript(/vuepress/) },
      ],
    },
    {
      name: 'Nextra', color: '#e2e8f0', category: 'Open Source Docs Framework',
      signals: [
        { label: 'Meta generator',   detected: /nextra/i.test(generator) },
        { label: 'Nextra DOM',       detected: hasEl('.nextra-sidebar-container,[class*="nextra-"]') },
        { label: 'Nextra in head',   detected: inHead(/nextra/) },
      ],
    },
    {
      name: 'Hugo', color: '#ef4444', category: 'Static Site Generator',
      signals: [
        { label: 'Meta generator', detected: /^hugo/i.test(generator) },
      ],
    },
    {
      name: 'Jekyll', color: '#f97316', category: 'Static Site Generator',
      signals: [
        { label: 'Meta generator', detected: /^jekyll/i.test(generator) },
      ],
    },

    // ── Enterprise / Wiki ──────────────────────────────────────────────────
    {
      name: 'Confluence', color: '#0052cc', category: 'Enterprise Wiki',
      signals: [
        { label: 'Confluence meta',   detected: !!document.querySelector('meta[name="confluence-request-time"]') || hasMeta(/confluence/) },
        { label: 'Atlassian domain',  detected: /atlassian\.(net|com)/.test(hostname) },
        { label: 'Confluence DOM',    detected: hasEl('#main-content .wiki-content,.confluence-content-image,#breadcrumbs') },
      ],
    },
    {
      name: 'Notion', color: '#f1f5f9', category: 'Productivity / Docs',
      signals: [
        { label: 'notion.so domain',    detected: hostname.includes('notion.so') },
        { label: 'notion.site domain',  detected: hostname.includes('notion.site') },
        { label: 'Notion DOM',          detected: hasEl('.notion-app-inner,.notion-page-content,.notion-frame') },
        { label: 'Notion script',       detected: hasScript(/notion\.so/) },
      ],
    },
    {
      name: 'Intercom Articles', color: '#6366f1', category: 'Help Center Platform',
      signals: [
        { label: 'intercom.com / intercom.help domain', detected: /intercom\.(com|help|io)/.test(hostname) },
        { label: 'Intercom messenger script',           detected: hasScript(/widget\.intercom\.io|js\.intercomcdn\.com/) },
        { label: 'Intercom DOM markers',                detected: hasEl('.intercom-app,.intercom-namespace,[class*="intercom-"]') || !!document.querySelector('#intercom-container,#intercom-frame') },
        { label: 'Intercom in head',                    detected: inHead(/intercom/) },
      ],
    },
    {
      name: 'Freshdesk', color: '#25c16f', category: 'Help Center Platform',
      signals: [
        { label: 'freshdesk.com / myfreshworks domain', detected: /freshdesk\.com|myfreshworks\.com/.test(hostname) },
        { label: 'Freshdesk DOM markers',               detected: hasEl('.fw-search,.fw-autocomplete-wrapper,.portal--light,.portal--dark') },
        { label: 'Freshworks script',                   detected: hasScript(/freshdesk\.com|freshworks\.com|freshchat\.com/) },
        { label: 'Freshdesk search form',               detected: hasEl('#fw-search-form,#searchInput[name="term"]') },
        { label: 'Freshdesk in head',                   detected: inHead(/freshdesk|freshworks/) },
      ],
    },
    {
      name: 'HubSpot Knowledge Base', color: '#ff7a59', category: 'Help Center Platform',
      signals: [
        { label: 'HubSpot domain',          detected: /hubspot\.com/.test(hostname) },
        { label: 'HubSpot data attributes', detected: !!document.querySelector('[data-cl-brand*="hubspot"]') },
        { label: 'HubSpot DOM markers',     detected: hasEl('.hs-breadcrumb-menu,.hs-search-field,.hs-kb-article') },
        { label: 'HubSpot script',          detected: hasScript(/hubspot\.com|hs-scripts\.com/) },
        { label: 'HubSpot in head',         detected: inHead(/hubspot/) },
      ],
    },
    {
      name: 'Guru', color: '#dc2626', category: 'Knowledge Base Platform',
      signals: [
        { label: 'getguru.com domain',   detected: hostname.includes('getguru.com') },
        { label: 'Guru script',          detected: hasScript(/getguru\.com/) },
        { label: 'Guru global',          detected: typeof (window as any).__GURU_CONFIG__ !== 'undefined' },
        { label: 'Guru in head',         detected: inHead(/getguru\.com/) },
      ],
    },
    {
      name: 'Outline', color: '#000000', category: 'Knowledge Base Platform',
      signals: [
        { label: 'getoutline.com domain', detected: hostname.includes('getoutline.com') },
        { label: 'Outline DOM markers',   detected: hasEl('[data-sharing-url],[class*="outline-"]') || (hasEl('#__NEXT_DATA__') && inHead(/outline/)) },
        { label: 'Outline script',        detected: hasScript(/getoutline\.com/) },
        { label: 'Outline in head',       detected: inHead(/getoutline/) },
      ],
    },
    {
      name: 'Front Knowledge Base', color: '#f04e23', category: 'Help Center Platform',
      signals: [
        { label: 'front.com / frontapp.com domain',   detected: /front\.com|frontapp\.com/.test(hostname) },
        // Most reliable: JS globals injected by the Front KB runtime
        { label: 'window.kbid global',                detected: typeof window.kbid !== 'undefined' },
        { label: 'window.aHost (frontapp.com)',        detected: typeof window.aHost === 'string' && window.aHost.includes('frontapp.com') },
        { label: 'Front KB server script',            detected: hasScript(/frontapp\.com/) || inHead(/knowledge-base-server\.frontapp\.com|companion\.frontapp\.com/) },
        { label: 'Front in head',                     detected: inHead(/frontapp\.com/) },
      ],
    },
    {
      name: 'Zendesk', color: '#03363d', category: 'Help Center Platform',
      signals: [
        { label: 'zendesk.com domain',  detected: /zendesk\.com|zendeskguide\.com/.test(hostname) },
        { label: 'Zendesk DOM',         detected: hasEl('#hc-wrapper,.hc-header,.article-body') && inHead(/zendesk/) },
        { label: 'Zendesk script',      detected: hasScript(/zendesk/) },
      ],
    },
  ];

  const detected = platforms
    .map(p => ({
      name: p.name, color: p.color, category: p.category,
      score: p.signals.filter(s => s.detected).length,
      total: p.signals.length,
      signals: p.signals.filter(s => s.detected).map(s => s.label),
    }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);

  const isMintlify = detected.length > 0 && detected[0].name === 'Mintlify' && detected[0].score >= 2;
  if (isMintlify) {
    return { hostname, detected, isMintlify: true, opportunity: null };
  }

  // ── Opportunity analysis ─────────────────────────────────────────────────

  // tryHead: attempts HEAD, falls back to GET on 405 (some servers reject HEAD)
  async function tryHead(url, timeoutMs = 5000) {
    async function attempt(method) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const r = await fetch(url, { signal: ctrl.signal, method });
        clearTimeout(t);
        return r;
      } catch { clearTimeout(t); return null; }
    }
    const r = await attempt('HEAD');
    if (!r) return false;
    if (r.status === 405) { const r2 = await attempt('GET'); return r2 ? r2.ok : false; }
    return r.ok;
  }

  // tryGet: fetches content, returns string or null on failure/timeout
  async function tryGet(url, maxBytes = 50000, timeoutMs = 6000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) return null;
      const text = await r.text();
      return text.slice(0, maxBytes);
    } catch { clearTimeout(t); return null; }
  }

  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/index';
  const [llmsTxtContent, sitemapXml, mdPathOk] = await Promise.all([
    tryGet(origin + '/llms.txt'),
    tryHead(origin + '/sitemap.xml'),
    tryHead(origin + currentPath + '.md'),
  ]);
  const llmsTxt = llmsTxtContent !== null;

  // AI discoverability
  const sitemapLink    = !!document.querySelector('link[rel="sitemap"]');
  const structuredData = document.querySelectorAll('script[type="application/ld+json"]').length > 0;
  const ogTags         = !!document.querySelector('meta[property^="og:"]');
  const canonical      = !!document.querySelector('link[rel="canonical"]');
  const robotsMeta     = document.querySelector('meta[name="robots"]');
  const indexable      = !robotsMeta || !/noindex/i.test(robotsMeta.getAttribute('content') || '');

  // AI assistant
  const allSrcText = [...scriptSrcs, ...linkHrefs, ...scriptTexts.map(t => t.slice(0, 2000))].join(' ');
  const AI_ASSISTANTS = [
    { name: 'Kapa.ai',    found: !!document.querySelector('kapa-widget') || /kapa\.ai/.test(allSrcText) },
    { name: 'Inkeep',     found: /inkeep\.(com|ai)/.test(allSrcText) || !!document.querySelector('inkeep-chat,inkeep-floating-button,[class*="inkeep"]') },
    { name: 'Mendable',   found: /mendable\.ai/.test(allSrcText) },
    { name: 'Chatbase',   found: /chatbase\.co/.test(allSrcText) },
    { name: 'Cohere',     found: /cohere\.ai/.test(allSrcText) },
    { name: 'Algolia AI', found: hasEl('#docsearch,.DocSearch') && /instantsearch|docsearch/.test(allSrcText) },
    // Platform-native AI assistants
    { name: 'Fern Ask AI',     found: !!document.querySelector('fern-ask-ai-button,[class*="fern-ask-ai"],[id*="fern-ask-ai"]') },
    { name: 'Mintlify Ask AI', found: !!document.querySelector('[class*="ask-ai"],[id*="ask-ai"]') && inHead(/mintlify/) },
  ];
  const aiMatch = AI_ASSISTANTS.find(a => a.found);

  // External search tool detection
  const SEARCH_TOOLS = [
    { name: 'Algolia DocSearch',     found: hasEl('#docsearch,.DocSearch,.DocSearch-Button') || hasScript(/docsearch/) },
    { name: 'Algolia InstantSearch', found: (hasEl('.ais-SearchBox,.ais-Hits') || hasScript(/instantsearch/)) && hasScript(/algolia/) },
    { name: 'Typesense',             found: hasScript(/typesense/) || hasEl('[class*="typesense"]') },
    { name: 'Pagefind',              found: hasScript(/pagefind/) || hasEl('.pagefind-ui,.pagefind-ui__search-input') },
    { name: 'Lunr.js',               found: hasScript(/\blunr\./) && !hasEl('#docsearch,.DocSearch') },
    { name: 'Meilisearch',           found: hasScript(/meilisearch/) || hasEl('[class*="meilisearch"]') },
    { name: 'Fuse.js',               found: hasScript(/\bfuse\.min\b|\bfuse\.js\b/) && hasEl('[class*="search"]') },
    { name: 'Swiftype',              found: hasScript(/swiftype\.com/) },
  ];
  const searchTool = SEARCH_TOOLS.find(s => s.found) || null;

  // Feature gaps
  // hasSearch: standard inputs + platform-native search components (Fern, GitBook, ReadMe, MkDocs, etc.)
  const hasSearch = hasEl([
    'input[type="search"]',
    'input[placeholder*="search" i]',
    '[role="search"]',
    '.DocSearch', '#docsearch',
    '[class*="search-input"]',
    // Fern native search
    '[class*="fern-search"],[id*="fern-search"]',
    'fern-search-button',
    // GitBook native search
    '[data-testid="search-ask-button"],[class*="search-ask"]',
    // ReadMe native search
    '.rm-SearchBox',
    // MkDocs Material
    '.md-search',
    // Generic platform search buttons with keyboard shortcut hints (e.g. "/ " or "⌘K")
    'button[aria-label*="search" i]',
    'button[class*="search"]',
    '[data-search]',
  ].join(','));
  const hasAiSearch      = /ai.{0,15}search|search.{0,15}ai|semantic.{0,15}search|ask.{0,15}ai/i.test(document.body?.innerHTML.slice(0, 40000) || '');
  const hasFeedback      = hasEl('[class*="feedback"],[id*="feedback"],button[aria-label*="helpful" i],[class*="thumbs"],[class*="was-this"],[class*="helpful"]');
  const hasApiPlayground = hasEl('.swagger-ui,redoc,[class*="playground"],[class*="try-it"],[class*="api-explorer"],[id*="swagger"],[class*="tryit"]');
  const hasVersioning    = hasEl('[class*="version-picker"],[class*="version-select"],select[name*="version" i],[aria-label*="version" i],[class*="versioning"]');

  // Tech stack fingerprinting (most useful for homegrown sites)
  const TECH_STACKS = [
    { name: 'Next.js',    found: !!document.querySelector('#__NEXT_DATA__') },
    { name: 'Gatsby',     found: !!document.querySelector('#___gatsby,#gatsby-focus-wrapper') },
    { name: 'Nuxt',       found: !!document.querySelector('#__nuxt,#__layout') },
    { name: 'Astro',      found: hasEl('astro-island') },
    { name: 'SvelteKit',  found: !!document.querySelector('#svelte') || (hasScript(/\/_app\/immutable\//) && inHead(/sveltekit/)) },
    { name: 'Angular',    found: !!document.querySelector('[ng-version]') },
    { name: 'WordPress',  found: inHead(/wp-content|wp-includes/) },
    { name: 'Vue',        found: hasEl('[data-v-app]') && !hasScript(/vitepress|vuepress/) },
    { name: 'React',      found: !!document.querySelector('[data-reactroot]') || (hasScript(/react\.production/) && !document.querySelector('#__NEXT_DATA__,#___gatsby')) },
  ];
  const techStack = TECH_STACKS.find(t => t.found) || null;

  // Shared body snippet for text-based analysis
  const bodySnippet = document.body?.innerHTML.slice(0, 60000) || '';

  // Analytics stack detection
  const ANALYTICS = [
    { name: 'GA4',       found: hasScript(/googletagmanager\.com\/gtag|gtag\/js\?id=G-/) || scriptTexts.some(t => /gtag\('config',\s*'g-/i.test(t)) },
    { name: 'GTM',       found: hasScript(/googletagmanager\.com\/gtm\.js/) },
    { name: 'Segment',   found: hasScript(/cdn\.segment\.com|segment\.io\/analytics/) },
    { name: 'Amplitude', found: hasScript(/cdn\.amplitude\.com|amplitude\.com\/libs/) },
    { name: 'Mixpanel',  found: hasScript(/cdn\.mxpnl\.com|mixpanel\.com/) },
    { name: 'PostHog',   found: hasScript(/posthog\.com|posthog-js/) },
    { name: 'Heap',      found: hasScript(/heapanalytics\.com/) },
    { name: 'Plausible', found: hasScript(/plausible\.io/) },
    { name: 'Hotjar',    found: hasScript(/hotjar\.com/) },
    { name: 'Pendo',     found: hasScript(/cdn\.pendo\.io/) },
    { name: 'HubSpot',   found: hasScript(/js\.hs-scripts\.com/) },
  ];
  const detectedAnalytics = ANALYTICS.filter(a => a.found).map(a => a.name);

  // OpenAPI spec detection
  const openApiSpecLinks = Array.from(document.querySelectorAll('a[href]'))
    .map(el => el.getAttribute('href') || '')
    .filter(href => /openapi|swagger|(api|spec)\.(ya?ml|json)/i.test(href));
  const hasOpenApiSpec = openApiSpecLinks.length > 0
    || hasScript(/swagger-ui-bundle|SwaggerUIBundle|redoc\.standalone/)
    || /openapi\.ya?ml|swagger\.json|openapi\.json/i.test(bodySnippet);

  // Git-based edit link (shows docs-as-code workflow)
  const hasGitEditLink = !!document.querySelector(
    'a[href*="github.com"][href*="/edit/"],a[href*="github.com"][href*="/blob/"],a[href*="gitlab.com"][href*="/edit/"]'
  ) || /edit (this page|on github|on gitlab)/i.test(bodySnippet);

  // ── Agentic score (AFDocs spec — afdocs.dev) ────────────────────────────────

  // Rendering strategy: require specific known SSR/static signals — not just any generator tag
  const STATIC_GENERATORS = /^(docusaurus|mkdocs|sphinx|vitepress|jekyll|hugo|gatsby|eleventy|hexo|astro|nuxt|next\.js|gitbook|starlight|nextra|vuepress|docsify)/i;
  const isStaticOrSSR = STATIC_GENERATORS.test(generator)
    || detected.some(p => ['Docusaurus', 'MkDocs', 'Sphinx', 'VitePress', 'Starlight',
        'Jekyll', 'Hugo', 'Nextra', 'VuePress', 'Docsify', 'Fern'].includes(p.name))
    || ['Next.js', 'Nuxt', 'Astro', 'Gatsby'].includes(techStack?.name);

  // content-start: use document-absolute Y position (scroll-independent)
  const contentEl = document.querySelector('main, article, [role="main"]');
  const contentDocTop = contentEl
    ? contentEl.getBoundingClientRect().top + window.scrollY
    : Infinity;

  const agenticChecks = [
    // LLMs.txt (33 pts)
    { id: 'llms-txt-exists',    label: 'llms.txt present',                        pts: 10, cat: 'llms',    pass: llmsTxt },
    { id: 'llms-txt-size',      label: 'llms.txt is concise (< 100 KB)',          pts: 7,  cat: 'llms',    pass: llmsTxt && llmsTxtContent.length < 100000 },
    { id: 'llms-txt-md-links',  label: 'llms.txt links to .md files',             pts: 7,  cat: 'llms',    pass: llmsTxt && /\.md\b/.test(llmsTxtContent) },
    { id: 'llms-txt-directive', label: 'llms.txt has H1 title',                   pts: 7,  cat: 'llms',    pass: llmsTxt && /^#\s+\S/.test(llmsTxtContent.trim()) },
    { id: 'llms-txt-valid',     label: 'llms.txt has spec-valid structure',       pts: 2,  cat: 'llms',    pass: llmsTxt && /^#\s+\S/.test(llmsTxtContent.trim()) && /^>\s+\S/m.test(llmsTxtContent) },
    // AI Accessibility (27 pts)
    { id: 'rendering-strategy', label: 'Server-rendered or statically generated', pts: 10, cat: 'access',  pass: isStaticOrSSR },
    { id: 'auth-gate',          label: 'Content accessible without login wall',   pts: 10, cat: 'access',  pass: indexable && (document.body?.innerText.trim().length || 0) > 300 },
    { id: 'markdown-url',       label: 'Pages accessible as .md URLs',            pts: 7,  cat: 'access',  pass: mdPathOk },
    // Page Quality (12 pts)
    { id: 'content-start',      label: 'Main content starts within first 500px',  pts: 4,  cat: 'quality', pass: contentDocTop < 500 },
    { id: 'page-size',          label: 'Page HTML is lightweight (< 500 KB)',     pts: 4,  cat: 'quality', pass: document.documentElement.outerHTML.length < 500000 },
    { id: 'redirect-behavior',  label: 'Clean permalink (no legacy extensions)',  pts: 4,  cat: 'quality', pass: !/\.(php|asp|aspx|cfm|cgi)$/.test(window.location.pathname) },
  ];

  const agenticRaw = agenticChecks.reduce((s, c) => s + (c.pass ? c.pts : 0), 0);
  // AFDocs spec hard cap: no llms.txt → score cannot exceed 59 (D), regardless of other checks
  const agenticScoreRaw  = Math.round((agenticRaw / 72) * 100);
  const agenticScore     = !llmsTxt ? Math.min(agenticScoreRaw, 59) : agenticScoreRaw;
  const agenticGrade     = agenticScore >= 95 ? 'A+' : agenticScore >= 85 ? 'A'
    : agenticScore >= 70 ? 'B' : agenticScore >= 50 ? 'C' : agenticScore >= 30 ? 'D' : 'F';

  return {
    hostname,
    detected,
    isMintlify: false,
    opportunity: {
      discoverability: { llmsTxt, sitemap: sitemapLink || sitemapXml, structuredData, ogTags, canonical, indexable },
      aiAssistant: { detected: !!aiMatch, name: aiMatch?.name || null },
      features: { hasSearch, hasAiSearch, hasFeedback, hasApiPlayground, hasVersioning },
      search: { tool: searchTool?.name || null, hasAny: hasSearch || !!searchTool },
      techStack: techStack?.name || null,
      hasGitEditLink,
      analytics: detectedAnalytics,
      openApi: hasOpenApiSpec,
    },
    agentic: { score: agenticScore, grade: agenticGrade, checks: agenticChecks, url: origin },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UI RENDERING
// ─────────────────────────────────────────────────────────────────────────────

// Binary check row
function chk(ok, gapText, okText) {
  return `<div class="check-item ${ok ? 'ok' : 'gap'}">
    <div class="check-icon">${ok ? '✓' : '✗'}</div>
    <span>${ok ? okText : gapText}</span>
  </div>`;
}

// Informational row (neutral — neither gap nor confirmed ✓)
function info(text) {
  return `<div class="check-item info">
    <div class="check-icon">i</div>
    <span>${text}</span>
  </div>`;
}

function renderResults(data) {
  const el = document.getElementById('results');

  // ── Mintlify customer ────────────────────────────────────────────────────
  if (data.isMintlify) {
    const p = data.detected[0];
    el.innerHTML = `
      <div class="mintlify-success">
        <div class="mintlify-success-icon">🌿</div>
        <div class="mintlify-success-title">Powered by Mintlify</div>
        <div class="mintlify-success-sub">This documentation site is already a Mintlify customer.</div>
        <div class="mintlify-signals">
          ${p.signals.map(s => `<span class="signal-chip" style="--color: #16a34a">${s}</span>`).join('')}
        </div>
      </div>`;
    return;
  }

  // ── Homegrown / unknown ──────────────────────────────────────────────────
  if (!data.detected.length) {
    const stackBadge = data.opportunity?.techStack
      ? `<span class="tech-badge">Built with ${data.opportunity.techStack}</span>`
      : '';
    el.innerHTML = `
      <div class="no-result">
        <div class="no-result-icon">🏠</div>
        <div class="no-result-title">Homegrown or Unknown Platform</div>
        <div class="no-result-sub">No known documentation platform detected. Likely a custom-built solution.</div>
        <span class="homegrown-badge">Homegrown / Unknown</span>
        ${stackBadge}
      </div>
      ${data.opportunity ? renderAnalysis(data.opportunity) : ''}
      ${data.agentic ? renderAgenticScore(data.agentic) : ''}
      ${renderSummary(data)}`;
    return;
  }

  // ── Platform detected ────────────────────────────────────────────────────
  const [primary, ...others] = data.detected;
  const pct = Math.round((primary.score / primary.total) * 100);

  let html = `
    <div class="platform-card" style="--color: ${primary.color}">
      <div class="platform-category">${primary.category}</div>
      <div class="platform-name">${primary.name}</div>
      <div class="confidence">
        <div class="confidence-label">${primary.score} of ${primary.total} signals matched (${pct}% confidence)</div>
        <div class="confidence-bar"><div class="confidence-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="signals-list">
        ${primary.signals.map(s => `<span class="signal-chip">${s}</span>`).join('')}
      </div>
    </div>`;

  if (others.length) {
    html += `<div class="section-label">Also detected</div>`;
    others.forEach(p => {
      html += `
        <div class="other-card" style="--color: ${p.color}">
          <span class="other-name">${p.name}</span>
          <span class="other-signals">${p.score} signal${p.score !== 1 ? 's' : ''}</span>
        </div>`;
    });
  }

  if (data.opportunity) html += renderAnalysis(data.opportunity);
  if (data.agentic) html += renderAgenticScore(data.agentic);
  html += renderSummary(data);

  el.innerHTML = html;
}

function renderAnalysis(opp) {
  const { aiAssistant: ai, features: f, search, techStack, hasGitEditLink, analytics, openApi } = opp;

  const gaps = [
    !ai.detected, !f.hasFeedback, !f.hasApiPlayground, analytics.length === 0,
  ].filter(Boolean).length;

  // Search row: 3-state
  let searchRow;
  if (search.tool) {
    const isAiTool = /algolia ai/i.test(search.tool);
    searchRow = isAiTool
      ? chk(true, '', `${search.tool} detected`)
      : info(`${search.tool} detected (3rd-party) — Mintlify includes AI search natively`);
  } else if (f.hasAiSearch) {
    searchRow = chk(true, '', 'AI-powered search present');
  } else if (f.hasSearch) {
    searchRow = info('Basic search present (not AI-powered) — Mintlify includes semantic AI search');
  } else {
    searchRow = chk(false, 'No search detected — Mintlify includes AI search built-in.', '');
  }

  return `
    <div class="analysis-card">
      <div class="analysis-header">
        <span class="analysis-title">Mintlify Opportunity</span>
        ${gaps > 0 ? `<span class="analysis-score">${gaps} gap${gaps !== 1 ? 's' : ''}</span>` : ''}
      </div>

      <div class="analysis-group">
        <div class="analysis-group-title">AI Features</div>
        ${ai.detected
          ? chk(true, '', `${ai.name} AI assistant detected`)
          : chk(false, '<strong>No AI assistant</strong> — Mintlify includes Ask AI built-in.', '')}
        ${searchRow}
      </div>

      <div class="analysis-group">
        <div class="analysis-group-title">Key Features</div>
        ${chk(f.hasFeedback,
          '<strong>No page feedback</strong> — Mintlify includes 👍👎 on every page.',
          'Page feedback detected')}
        ${chk(f.hasApiPlayground,
          '<strong>No API playground</strong> — Mintlify includes an interactive API reference.',
          'API playground detected')}
        ${chk(f.hasVersioning,
          'No version selector — Mintlify supports multi-version docs natively.',
          'Versioning present')}
        ${hasGitEditLink ? info('Git-based workflow detected — natural Mintlify fit') : ''}
        ${openApi ? info('OpenAPI spec detected — Mintlify renders this as an interactive API playground') : ''}
        ${analytics.length > 0
          ? info(`Analytics: ${analytics.join(', ')} (3rd-party) — Mintlify includes native analytics`)
          : chk(false, '<strong>No analytics detected</strong> — Mintlify includes built-in doc analytics.', '')}
        ${techStack ? info(`Tech stack: ${techStack}`) : ''}
      </div>
    </div>`;
}

const PLATFORM_CONTEXT = {
  'GitBook': {
    pain: 'GitBook is facing pricing pressure and has shifted focus away from developer docs toward internal wikis.',
    pitch: 'Mintlify is purpose-built for developer docs with AI search, Ask AI, and API playgrounds out of the box.',
  },
  'ReadMe': {
    pain: 'ReadMe is strong on API references but lacks a full docs experience — no native AI assistant or feedback.',
    pitch: 'Mintlify combines API references, guides, and AI features in one platform without stitching tools together.',
  },
  'Confluence': {
    pain: 'Confluence is built for internal wikis, not external developer docs — slow, hard to customize, no AI.',
    pitch: 'Mintlify is built from the ground up for public-facing developer documentation with modern AI tooling.',
  },
  'Notion': {
    pain: 'Notion lacks structured navigation, versioning, API playground, and AI discoverability for developer docs.',
    pitch: 'Mintlify is purpose-built for developer docs — not repurposed from a note-taking tool.',
  },
  'MadCap Flare': {
    pain: 'MadCap Flare is a legacy desktop tool with a steep learning curve and no native AI or developer integrations.',
    pitch: 'Mintlify modernizes the docs workflow with Git-based authoring, AI search, and zero infrastructure overhead.',
  },
  'Docusaurus': {
    pain: 'Docusaurus requires significant engineering time to maintain, customize, and add features like AI search.',
    pitch: 'Mintlify handles the infrastructure so the team can focus on content, not maintaining a docs framework.',
  },
  'Zendesk': {
    pain: 'Zendesk Help Center is built for support tickets — it lacks developer-focused features like API playgrounds and code blocks.',
    pitch: 'Mintlify is designed for developer docs with interactive API references and AI-powered search built in.',
  },
  'Freshdesk': {
    pain: 'Freshdesk is a support platform, not a developer docs tool — limited customization and no AI assistant.',
    pitch: 'Mintlify is purpose-built for developer documentation with AI search, feedback, and analytics.',
  },
  'Intercom Articles': {
    pain: 'Intercom Articles is a lightweight help center, not built for technical documentation or API references.',
    pitch: 'Mintlify handles complex developer docs with versioning, code playgrounds, and AI search natively.',
  },
  'HubSpot Knowledge Base': {
    pain: 'HubSpot KB is built for marketing teams, not developer docs — no code support, versioning, or AI features.',
    pitch: 'Mintlify is purpose-built for developer documentation with a full AI and analytics suite.',
  },
  'Slate': {
    pain: 'Slate is an unmaintained static generator — no search, no AI, no analytics, and requires manual HTML editing.',
    pitch: 'Mintlify modernizes API docs with interactive playgrounds, AI search, and Git-based workflows.',
  },
};

function renderSummary(data) {
  const { detected, hostname, opportunity: opp, agentic } = data;

  const primaryPlatform = detected.length > 0 ? detected[0].name : null;
  const platformLabel = primaryPlatform
    ?? (opp?.techStack ? `Homegrown (${opp.techStack})` : 'Homegrown / Unknown');

  const agenticLine = agentic
    ? `Agentic Score: ${agentic.grade} (${agentic.score}/100)`
    : '';

  const gaps = [];
  if (agentic && !agentic.checks.find(c => c.id === 'llms-txt-exists')?.pass) {
    gaps.push('No llms.txt — content invisible to AI agents');
  }
  if (opp) {
    if (!opp.aiAssistant.detected)      gaps.push('No AI assistant');
    if (!opp.features.hasSearch)        gaps.push('No search');
    if (!opp.features.hasFeedback)      gaps.push('No page feedback');
    if (!opp.features.hasApiPlayground) gaps.push('No interactive API playground');
    if (opp.analytics.length === 0)     gaps.push('No documentation analytics');
  }

  const gapsText = gaps.length > 0
    ? gaps.slice(0, 5).map(g => `• ${g}`).join('\n')
    : '• No major gaps detected';

  const ctx = PLATFORM_CONTEXT[primaryPlatform] || null;
  const contextLine = ctx ? `\n${ctx.pain}\n${ctx.pitch}` : '';

  const text = [
    `${hostname} uses ${platformLabel}.`,
    agenticLine,
    contextLine,
    `\nGaps vs. Mintlify:\n${gapsText}`,
    '\nMintlify delivers AI search, Ask AI, page feedback, and analytics out of the box.',
  ].filter(Boolean).join('\n');

  return `
    <div class="summary-card">
      <div class="summary-title">Summary</div>
      <button class="copy-btn" id="copy-summary-btn">Copy</button>
      <div class="summary-text" id="summary-text">${text}</div>
    </div>`;
}

function renderAgenticScore(agentic) {
  const { score, grade, checks, categories, cap, fromApi, url } = agentic;
  const gradeColors = { 'A+': '#22c55e', 'A': '#4ade80', 'B': '#a3e635', 'C': '#fbbf24', 'D': '#f97316', 'F': '#ef4444' };
  const color = gradeColors[grade] || '#22d3ee';

  // Build groups: use API categories if available, else fall back to client-side cats
  let groupsHtml;
  if (fromApi && categories?.length) {
    groupsHtml = categories.map(({ id, label }) => {
      const catChecks = checks.filter(c => (c.category ?? c.cat) === id);
      if (!catChecks.length) return '';
      const rows = catChecks.map(c => {
        if (c.warn) return info(c.label);
        return chk(c.pass, `<strong>${c.label}</strong>`, c.label);
      }).join('');
      return `
        <div class="agentic-group">
          <div class="agentic-group-title">${label}</div>
          ${rows}
        </div>`;
    }).join('');
  } else {
    const cats = [
      { key: 'llms',    label: 'LLMs.txt' },
      { key: 'access',  label: 'AI Accessibility' },
      { key: 'quality', label: 'Page Quality' },
    ];
    groupsHtml = cats.map(({ key, label }) => {
      const catChecks = checks.filter(c => (c.cat ?? c.category) === key);
      const rows = catChecks.map(c =>
        chk(c.pass, `<strong>${c.label}</strong>`, c.label)
      ).join('');
      return `
        <div class="agentic-group">
          <div class="agentic-group-title">${label}</div>
          ${rows}
        </div>`;
    }).join('');
  }

  const source = fromApi ? 'afdocs.dev' : 'client-side est. · afdocs.dev';
  const capNote = cap ? ` · ${cap.reason ?? 'score capped'}` : '';
  const hostname = agentic.url ? new URL(agentic.url).hostname.replace(/^www\./, '') : '';
  const mintlifyScoreUrl = hostname ? `https://www.mintlify.com/score/${hostname.replace(/\./g, '-')}` : 'https://www.mintlify.com/score';

  return `
    <div class="agentic-card" id="agentic-score-card" style="--grade-color: ${color}">
      <div class="agentic-header">
        <span class="agentic-title">Agentic Score <span style="font-size:9px;opacity:0.6;text-transform:none;letter-spacing:0;font-weight:500">${source}</span></span>
        <div style="display:flex;align-items:center;gap:8px">
          <a href="${mintlifyScoreUrl}" target="_blank" style="font-size:9px;color:var(--accent);text-decoration:none;border:1px solid var(--accent-dim);border-radius:4px;padding:2px 7px;font-weight:600;" title="View on Mintlify Score">Full Report ↗</a>
          <span class="agentic-grade">${grade}</span>
        </div>
      </div>
      <div class="agentic-score-row">
        <span class="agentic-score-num">${score}</span>
        <div style="flex:1">
          <div class="agentic-bar"><div class="agentic-bar-fill" style="width:${score}%"></div></div>
          <div class="agentic-score-sub">out of 100${capNote}</div>
        </div>
      </div>
      ${groupsHtml}
    </div>`;
}

async function fetchAndRenderAgenticScore(url) {
  // Show loading state in the agentic card immediately
  const placeholder = document.getElementById('agentic-score-card');
  if (placeholder) {
    placeholder.innerHTML = `
      <div class="agentic-header">
        <span class="agentic-title">Agentic Score <span style="font-size:9px;opacity:0.6;text-transform:none;letter-spacing:0;font-weight:500">afdocs.dev</span></span>
        <span style="font-size:10px;color:var(--text-3)">Scanning…</span>
      </div>
      <div style="padding:12px 14px;display:flex;align-items:center;gap:8px">
        <div class="spinner" style="width:14px;height:14px;border-width:2px;flex-shrink:0"></div>
        <span style="font-size:11px;color:var(--text-3)">Running full AI-readiness check…</span>
      </div>`;
  }

  try {
    const res = await fetch(`${AGENTIC_API}?url=${encodeURIComponent(url)}`);
    if (!res.ok) return;
    const agentic = await res.json();
    const card = document.getElementById('agentic-score-card');
    if (card) card.outerHTML = renderAgenticScore({ ...agentic, fromApi: true });
  } catch { /* silently fall back to client-side score already shown */ }
}

function renderError(msg) {
  document.getElementById('results').innerHTML = `
    <div class="error">
      <strong>Cannot scan this page</strong>
      <span>${msg}</span>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
const AGENTIC_API = 'https://docsfinder-api-vercel.vercel.app/api/score';

async function runScan() {
  const resultsEl  = document.getElementById('results');
  const hostnameEl = document.getElementById('current-hostname');

  resultsEl.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <div class="loading-text">Scanning page…</div>
    </div>`;

  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    hostnameEl.textContent = tab.url ? new URL(tab.url).hostname : 'Unknown';
  } catch {
    hostnameEl.textContent = 'Unknown';
  }

  if (!tab) { renderError('Could not access the current tab.'); return; }

  try {
    // Step 1: Run DOM detection immediately and render results
    const [scriptResult] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: detectDocsPlatform,
    });

    const data = scriptResult.result;
    renderResults(data);

    // Step 2: If not Mintlify, fetch the accurate API score in the background
    // and update just the agentic card when it arrives
    if (!data.isMintlify) {
      fetchAndRenderAgenticScore(tab.url);
    }
  } catch (err) {
    renderError(err.message || 'This page type cannot be analyzed (e.g. chrome:// pages).');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ── Dark mode toggle ───────────────────────────────────────────────────────
  const themeBtn = document.getElementById('theme-btn');
  if (localStorage.getItem('docfinder-theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.textContent = '☀️';
  }
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      themeBtn.textContent = '🌙';
      localStorage.setItem('docfinder-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeBtn.textContent = '☀️';
      localStorage.setItem('docfinder-theme', 'dark');
    }
  });

  // ── Copy summary button (delegated) ───────────────────────────────────────
  document.getElementById('results').addEventListener('click', (e) => {
    if (e.target.id === 'copy-summary-btn') {
      const text = document.getElementById('summary-text')?.textContent || '';
      navigator.clipboard.writeText(text).catch(() => {});
      e.target.textContent = 'Copied!';
      setTimeout(() => { e.target.textContent = 'Copy'; }, 1800);
    }
  });

  runScan();
  document.getElementById('rescan-btn').addEventListener('click', runScan);
});
