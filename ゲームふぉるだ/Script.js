(function(){
  const appEl = document.getElementById('app');
  const visitorCountEl = document.getElementById('visitorCount');
  // busy: 行動処理中か／lastResult: 直近の行動結果（行動パネルの最上部に表示）／
  // pendingRetry: 保存に失敗したときの「もう一度保存する」で再開する処理
  let state = { village:null, allVillages:[], busy:false, lastResult:null, pendingRetry:null };
  let cooldownInterval = null;

  // パネル見出し（▼ ○○）をクリックすると、その下の中身を開閉できるようにする。
  // appEl の中身は再描画のたびに丸ごと差し替わるので、appEl 自体にイベント委譲しておけば個別のパネルを再生成するたびにリスナーを付け直す必要がない。
  // data-panel-id が付いているパネルは、開閉状態を次回訪問時・再描画後も同じ開閉状態を復元する。
  const PANEL_COLLAPSE_KEY = 'tokoku_panel_collapsed_v1';
  function getCollapsedPanelIds(){
    try{
      const raw = localStorage.getItem(PANEL_COLLAPSE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    }catch(e){ return []; }
  }
  function saveCollapsedPanelIds(ids){
    try{ localStorage.setItem(PANEL_COLLAPSE_KEY, JSON.stringify(ids)); }catch(e){}
  }
  function applyPanelCollapseState(root){
    const collapsed = new Set(getCollapsedPanelIds());
    root.querySelectorAll('.panel[data-panel-id]').forEach(panel=>{
      if(!collapsed.has(panel.dataset.panelId)) return;
      panel.classList.add('collapsed');
      const head = panel.querySelector('.panel-head');
      if(head) head.textContent = head.textContent.replace(/^[▼▶]/, '▶');
    });
  }
  appEl.addEventListener('click', (e)=>{
    const head = e.target.closest('.panel-head');
    if(!head || !appEl.contains(head)) return;
    const panel = head.closest('.panel');
    if(!panel) return;
    panel.classList.toggle('collapsed');
    const isCollapsed = panel.classList.contains('collapsed');
    head.textContent = head.textContent.replace(/^[▼▶]/, isCollapsed ? '▶' : '▼');
    const id = panel.dataset.panelId;
    if(id){
      const ids = new Set(getCollapsedPanelIds());
      if(isCollapsed){ ids.add(id); } else { ids.delete(id); }
      saveCollapsedPanelIds(Array.from(ids));
    }
  });
  // appEl.innerHTML が丸ごと差し替わるたびに、覚えている開閉状態を自動で復元する
  new MutationObserver(()=> applyPanelCollapseState(appEl)).observe(appEl, { childList:true });

  // クリックで滑らかに先頭へ戻るようにする
  const toTopLink = document.getElementById('toTopLink');
  if(toTopLink){
    toTopLink.addEventListener('click', (e)=>{
      e.preventDefault();
      window.scrollTo({ top:0, behavior:'smooth' });
    });
  }

  const COOLDOWN_MS = 20 * 1000; // 行動のクールダウン
  const MAP_SIZE = 41;   // マップは0~41の41×41マス
  const BUFFER_DIST = 5; // 建国時、他国の領土からこのマス以内には建国できない
  const ABANDON_MS = 14 * 24 * 60 * 60 * 1000; // 14日間行動が無いと「廃墟」となり、誰でも接収できる
  const LIST_CACHE_MS = 5 * 1000; // 国一覧（ランキング・地図用）を使い回す時間。自分の保存・削除時は即破棄
  // 領土を国力に加算し、開拓による領土拡大に逓増コストを付ける。
  //   開拓コスト = max(0, 領土数 - DEV_FREE_TILES) × DEV_COST_PER_TILE（資金）
  // TERRITORY_SCORE は Story.js の loadPlayerScore と同じ値にしておくこと（章の解放判定が食い違うため）。
  const TERRITORY_SCORE = 5;
  const DEV_FREE_TILES = 2;
  const DEV_COST_PER_TILE = 1;
  let selectedFoundTile = null; // 建国画面で選択中の座標
  let deviceKiribanHit = false; // この端末でキリ番の瞬間に立ち会ったことがあるか（実績表示用）

  // ---------- storage adapter ----------
  //htmlファイルとしてローカルに保存してブラウザで直接開いた場合はwindow.storageが存在しないため、その場合はlocalStorageで代用する。（ローカルモードではデータもこの端末のブラウザ内だけの保存になるため、他の人とは国データを共有できない点に注意）
  let isLocalMode = false;
  const storage = (function(){
    if(window.storage && typeof window.storage.get === 'function'){
      return window.storage;
    }
    isLocalMode = true;
    const NS = 'tokoku_local_v1:';
    function nsKey(key, shared){ return NS + (shared ? 'shared:' : 'priv:') + key; }
    return {
      async get(key, shared){
        try{
          const raw = localStorage.getItem(nsKey(key, shared));
          if(raw === null) return null;
          return { key, value: raw, shared: !!shared };
        }catch(e){ return null; }
      },
      async set(key, value, shared){
        try{
          localStorage.setItem(nsKey(key, shared), String(value));
          return { key, value: String(value), shared: !!shared };
        }catch(e){ return null; }
      },
      async delete(key, shared){
        try{
          const existed = localStorage.getItem(nsKey(key, shared)) !== null;
          localStorage.removeItem(nsKey(key, shared));
          return { key, deleted: existed, shared: !!shared };
        }catch(e){ return null; }
      },
      async list(prefix, shared){
        try{
          const base = NS + (shared ? 'shared:' : 'priv:');
          const full = base + (prefix || '');
          const keys = [];
          for(let i=0;i<localStorage.length;i++){
            const k = localStorage.key(i);
            if(k && k.indexOf(full) === 0){ keys.push(k.slice(base.length)); }
          }
          return { keys, prefix, shared: !!shared };
        }catch(e){ return null; }
      }
    };
  })();

  // 建国時の国名に使えないNGワード
  // ここに単語を追加すれば判定対象を増やせます。
  const NG_WORDS = [
    '死ね','しね','殺す','ころす','殺害','爆破','テロ','自殺',
    'セックス','レイプ','ちんこ','まんこ','おっぱい','porn','sex','rape',
    'カス','クズ',
    'fuck','shit','bitch','asshole','cunt','dick',
    '運営','管理人','スタッフ','admin','administrator','staff','公式','official'
  ];

  function pad(n){ return String(n).padStart(6,'0'); }
  function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  // 国力 = 人口 + 兵力×3 + 資金 + 領土×TERRITORY_SCORE（領土が無い古い記録は0マス扱い）
  function score(v){ return v.population + v.military*3 + v.gold + (v.territory ? v.territory.length : 0) * TERRITORY_SCORE; }
  // 次に領土を1マス広げるのに必要な資金
  function devCost(v){ return Math.max(0, (v.territory ? v.territory.length : 0) - DEV_FREE_TILES) * DEV_COST_PER_TILE; }
  // 侵攻で奪えるマス。首都マス以外からランダムに1つ（隣接は問わない）。奪えるマスが無ければ null。
  // 首都の判定は buildMapStatus と同じ（capital が無い古い記録は territory[0] を首都とみなす）。
  function pickCapturableTile(v){
    const terr = v.territory || [];
    const cap = v.capital || terr[0];
    const cands = terr.filter(t => !(cap && t.x === cap.x && t.y === cap.y));
    return cands.length ? cands[Math.floor(Math.random() * cands.length)] : null;
  }
  function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
  }

  // ---------- マップ ----------
  // 座標(x,y)同士の距離は「周囲Nマス」の感覚に合わせてチェビシェフ距離（将棋の王の動き）で扱う
  function chebyshev(x1,y1,x2,y2){ return Math.max(Math.abs(x1-x2), Math.abs(y1-y2)); }

  // 国名から見た目の色を一定にするための簡易ハッシュ
  function colorForVillage(id){
    let hash = 0;
    for(let i=0;i<id.length;i++){ hash = (hash*31 + id.charCodeAt(i)) | 0; }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue},60%,55%)`;
  }

  // (x,y)が、excludeId以外のどの国の領土からもBUFFER_DIST（周囲5マス）より遠いか
  function isTileFree(x, y, allVillages, excludeId){
    for(const o of allVillages){
      if(excludeId && o.id === excludeId) continue;
      for(const t of (o.territory||[])){
        if(chebyshev(x,y,t.x,t.y) <= BUFFER_DIST) return false;
      }
    }
    return true;
  }

  // 建国候補地をランダムに探す（見つからなければ全マス探索にフォールバック）
  function findRandomValidTile(allVillages, excludeId){
    for(let i=0;i<400;i++){
      const x = rand(0, MAP_SIZE-1), y = rand(0, MAP_SIZE-1);
      if(isTileFree(x,y,allVillages,excludeId)) return {x,y};
    }
    for(let x=0;x<MAP_SIZE;x++){
      for(let y=0;y<MAP_SIZE;y++){
        if(isTileFree(x,y,allVillages,excludeId)) return {x,y};
      }
    }
    return null; // 相当マスが埋まっている場合
  }

  // 自国の領土に隣接する（面している）未所有マスの一覧
  function getFrontierTiles(v){
    const owned = new Set((v.territory||[]).map(t=>t.x+','+t.y));
    const frontier = new Map();
    for(const t of (v.territory||[])){
      const cands = [[t.x+1,t.y],[t.x-1,t.y],[t.x,t.y+1],[t.x,t.y-1]];
      for(const [nx,ny] of cands){
        if(nx<0||ny<0||nx>=MAP_SIZE||ny>=MAP_SIZE) continue;
        const key = nx+','+ny;
        if(!owned.has(key) && !frontier.has(key)) frontier.set(key, {x:nx,y:ny});
      }
    }
    return Array.from(frontier.values());
  }

  function isOwnedByOther(x, y, allVillages, selfId){
    for(const o of allVillages){
      if(o.id === selfId) continue;
      if((o.territory||[]).some(t=>t.x===x && t.y===y)) return true;
    }
    return false;
  }

  // 地図の各マスの状態をまとめる。opts.markBuffer=trueのとき、建国不可エリア（他国領土＋周囲5マス）も算出する
  function buildMapStatus(allVillages, opts){
    opts = opts || {};
    const status = {};
    for(const o of allVillages){
      const color = colorForVillage(o.id);
      const terr = o.territory || [];
      const cap = o.capital || terr[0];
      const capKey = cap ? (cap.x+','+cap.y) : null;
      for(const t of terr){
        status[t.x+','+t.y] = {
          owned:true, id:o.id, name:o.name, score:score(o), color,
          isCapital: (t.x+','+t.y) === capKey,
          isSelf: !!(state.village && o.id === state.village.id)
        };
      }
    }
    if(opts.markBuffer){
      for(const o of allVillages){
        for(const t of (o.territory||[])){
          for(let dx=-BUFFER_DIST; dx<=BUFFER_DIST; dx++){
            for(let dy=-BUFFER_DIST; dy<=BUFFER_DIST; dy++){
              const x=t.x+dx, y=t.y+dy;
              if(x<0||y<0||x>=MAP_SIZE||y>=MAP_SIZE) continue;
              const key = x+','+y;
              if(status[key] && status[key].owned) continue;
              if(!status[key]) status[key] = { buffered:true };
            }
          }
        }
      }
    }
    return status;
  }

  // status(buildMapStatusの結果)から地図のマスのHTMLを組み立てる
  function renderMapGridHtml(status, opts){
    opts = opts || {};
    let html = '';
    for(let y=0;y<MAP_SIZE;y++){
      for(let x=0;x<MAP_SIZE;x++){
        const info = status[x+','+y];
        let cls = 'map-cell';
        let style = '';
        if(info && info.owned){
          cls += ' owned';
          style = `background:${info.color};`;
          if(info.isCapital) cls += ' capital';
          if(info.isSelf) cls += ' self';
        }else if(info && info.buffered){
          cls += ' buffer';
        }else if(opts.interactive){
          cls += ' free';
        }
        html += `<div class="${cls}" data-x="${x}" data-y="${y}"${style?` style="${style}"`:''}></div>`;
      }
    }
    return html;
  }

  // 世界地図モーダル内の全体俯瞰用ミニマップ（1マス=1セルの小さなグリッド）
  function renderMiniMapHtml(status){
    let html = '';
    for(let y=0;y<MAP_SIZE;y++){
      for(let x=0;x<MAP_SIZE;x++){
        const info = status[x+','+y];
        let cls = 'minimap-cell';
        let style = '';
        if(info && info.owned){
          cls += ' owned';
          style = ` style="background:${info.color};"`;
          if(info.isSelf) cls += ' self';
        }
        html += `<div class="${cls}"${style}></div>`;
      }
    }
    return html;
  }

  // ---------- 称号（国力に応じたランク表示） ----------
  const TITLES = [
    { min: 0,   label: '開拓村' },
    { min: 40,  label: '小国' },
    { min: 80,  label: '中堅国' },
    { min: 150, label: '大国' },
    { min: 300, label: '強国' },
    { min: 600, label: '覇者' }
  ];
  function getTitle(s){
    let label = TITLES[0].label;
    for(const t of TITLES){ if(s >= t.min) label = t.label; }
    return label;
  }

  // ---------- キリ番判定 ----------
  // ・通常キリ番：100の倍数（100,200,…）／2桁のゾロ目（11,22,…,99）
  // ・激レアキリ番：3桁以上のゾロ目（111,777,1111,…）／777・1000・7777・10000など特別な番号
  // 該当しなければ null、該当すれば 'normal' か 'special' を返す
  const SPECIAL_KIRIBAN_NUMBERS = [777, 1000, 7777, 10000];
  function isKiriban(n){
    if(!n || n < 10) return null;
    const s = String(n);
    const isRepdigit = s.length >= 2 && new Set(s.split('')).size === 1;
    if(SPECIAL_KIRIBAN_NUMBERS.includes(n)) return 'special';
    if(isRepdigit && s.length >= 3) return 'special';
    if(n % 100 === 0) return 'normal';
    if(isRepdigit) return 'normal';
    return null;
  }

  // ---------- 汎用モーダル ----------
  function openModal(bodyHtml, boxClass){
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="${boxClass}">${bodyHtml}</div>`;
    document.body.appendChild(overlay);
    function onKeydown(e){ if(e.key === 'Escape'){ close(); } }
    function close(){
      overlay.remove();
      document.removeEventListener('keydown', onKeydown);
    }
    overlay.addEventListener('click', (e)=>{ if(e.target === overlay) close(); });
    document.addEventListener('keydown', onKeydown);
    return { overlay, close };
  }

  function showKiribanDialog(count, tier){
    const isSpecial = tier === 'special';
    const modal = openModal(`
      <div class="kiriban-title">${isSpecial ? '🌟 激レアキリ番 GET！！ 🌟' : '🎉 キリ番 GET！ 🎉'}</div>
      <div class="kiriban-num">${pad(count)}</div>
      <div class="kiriban-sub">${isSpecial ? `なんと ${count} 人目！　滅多に出会えない激レアキリ番です。<br>これはおめでとうございます！！` : `記念すべき ${count} 人目の訪問者です。<br>おめでとうございます！`}</div>
      <button type="button" class="retro-btn btn-inline" id="kiribanCloseBtn">閉じる</button>
    `, isSpecial ? 'kiriban-box kiriban-special' : 'kiriban-box');
    document.getElementById('kiribanCloseBtn').addEventListener('click', modal.close);
  }

  // ---------- 世界地図（クールタイムなしでいつでも見られる） ----------
  // 指定した座標(x,y)が、スクロール領域のちょうど真ん中に来るようスクロールする
  function scrollMapToTile(scrollEl, x, y){
    const cellEl = scrollEl.querySelector('.map-cell');
    if(!cellEl) return;
    const cellSize = cellEl.getBoundingClientRect().width + 1; // gap 1px ぶんを含めた1マスの実寸
    const targetLeft = x*cellSize - scrollEl.clientWidth/2 + cellSize/2;
    const targetTop = y*cellSize - scrollEl.clientHeight/2 + cellSize/2;
    scrollEl.scrollTo({ left: Math.max(0,targetLeft), top: Math.max(0,targetTop), behavior:'smooth' });
  }

  async function showWorldMap(){
    const allVillages = await listAllVillages();
    const status = buildMapStatus(allVillages, {});
    const gridHtml = renderMapGridHtml(status, { interactive:true });
    const miniHtml = renderMiniMapHtml(status);
    const myCapital = state.village && state.village.capital ? state.village.capital : null;
    const modal = openModal(`
      <div class="kiriban-title" style="font-size:14px;">🗺️ 世界地図</div>
      <div class="msgbox" style="margin-bottom:6px; text-align:left;">
        地図は指でスワイプ（またはドラッグ）して見てください。
      </div>
      <div class="zoom-row">
        🔍拡大率：
        <button type="button" class="retro-btn btn-inline zoom-btn" data-zoom="10">小</button>
        <button type="button" class="retro-btn btn-inline zoom-btn" data-zoom="16">中</button>
        <button type="button" class="retro-btn btn-inline zoom-btn" data-zoom="24">大</button>
      </div>
      <div class="map-scroll" id="worldMapScroll">
        <div class="map-grid" id="worldMapGrid" style="grid-template-columns:repeat(${MAP_SIZE}, var(--map-cell));">${gridHtml}</div>
      </div>
      <div class="minimap-wrap" id="worldMiniMapWrap">
        <div class="minimap-grid" id="worldMiniMap" style="grid-template-columns:repeat(${MAP_SIZE}, 1fr);">${miniHtml}</div>
        <div class="minimap-viewport" id="minimapViewport"></div>
      </div>
      <div class="msgbox" id="mapTileInfo" style="margin-top:8px; text-align:left;">
        マスをタップすると、その場所の情報が見られます。<br>
        <span class="localnote">金色の枠＝あなたの国／白枠＝各国の拠点／下の小さな全体図はタップでジャンプできます</span>
      </div>
      <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
        ${myCapital ? `<button type="button" class="retro-btn btn-inline" id="mapRecenterBtn">📍 自分の場所へ</button>` : ''}
        <button type="button" class="retro-btn btn-inline" id="mapCloseBtn">閉じる</button>
      </div>
    `, 'map-box');
    document.getElementById('mapCloseBtn').addEventListener('click', modal.close);
    const gridEl = document.getElementById('worldMapGrid');
    const scrollEl = document.getElementById('worldMapScroll');
    const recenterBtn = document.getElementById('mapRecenterBtn');
    const miniMapEl = document.getElementById('worldMiniMap');
    const viewportEl = document.getElementById('minimapViewport');

    // ミニマップ上に、いま実際に見えている範囲を示す枠を描く
    function updateViewportIndicator(){
      if(!viewportEl || !miniMapEl) return;
      const cellEl = gridEl.querySelector('.map-cell');
      if(!cellEl) return;
      const mmRect = miniMapEl.getBoundingClientRect();
      const cellSize = cellEl.getBoundingClientRect().width + 1;
      const scaleX = mmRect.width / MAP_SIZE;
      const scaleY = mmRect.height / MAP_SIZE;
      viewportEl.style.left = ((scrollEl.scrollLeft/cellSize) * scaleX) + 'px';
      viewportEl.style.top = ((scrollEl.scrollTop/cellSize) * scaleY) + 'px';
      viewportEl.style.width = Math.max(4, (scrollEl.clientWidth/cellSize) * scaleX) + 'px';
      viewportEl.style.height = Math.max(4, (scrollEl.clientHeight/cellSize) * scaleY) + 'px';
    }
    scrollEl.addEventListener('scroll', updateViewportIndicator);

    if(recenterBtn){
      recenterBtn.addEventListener('click', ()=> scrollMapToTile(scrollEl, myCapital.x, myCapital.y));
    }
    // 開いた直後は、自分の国があればその場所を中心に、無ければ地図の中央を表示する
    const initialTarget = myCapital || { x:Math.floor(MAP_SIZE/2), y:Math.floor(MAP_SIZE/2) };
    scrollMapToTile(scrollEl, initialTarget.x, initialTarget.y);
    setTimeout(updateViewportIndicator, 60);

    modal.overlay.querySelectorAll('.zoom-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        gridEl.style.setProperty('--map-cell', btn.dataset.zoom + 'px');
        setTimeout(updateViewportIndicator, 60);
      });
    });

    gridEl.addEventListener('click', (e)=>{
      const cell = e.target.closest('.map-cell');
      if(!cell) return;
      const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
      const info = status[x+','+y];
      const infoEl = document.getElementById('mapTileInfo');
      if(info && info.owned){
        const nameHtml = state.village ? dispName(state.village, {id:info.id, name:info.name}) : esc(info.name);
        infoEl.innerHTML = `座標(${x},${y})：<b>${nameHtml}</b>（国力 ${info.score}）${info.isCapital ? '　🏯拠点' : ''}${info.isSelf ? '　⭐あなたの国' : ''}`;
      }else{
        infoEl.textContent = `座標(${x},${y})：空き地（まだ誰の領土でもありません）`;
      }
    });

    miniMapEl.addEventListener('click', (e)=>{
      const rect = miniMapEl.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      const tx = Math.min(MAP_SIZE-1, Math.max(0, Math.floor(relX*MAP_SIZE)));
      const ty = Math.min(MAP_SIZE-1, Math.max(0, Math.floor(relY*MAP_SIZE)));
      scrollMapToTile(scrollEl, tx, ty);
      setTimeout(updateViewportIndicator, 350);
    });
  }

  // 端末のローカル日付（UTCではなく実際の現地日付）を YYYY-MM-DD で返す
  function localDateStr(){
    const d = new Date();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  function normalizeForFilter(s){
    return String(s)
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[\s\u3000!-/:-@[-`{-~。、・ー－]/g, '');
  }
  const NG_WORDS_NORM = NG_WORDS.map(normalizeForFilter);
  function isInappropriateName(name){
    const norm = normalizeForFilter(name);
    if(!norm) return false;
    return NG_WORDS_NORM.some(w => w && norm.includes(w));
  }

  // 一時的な通信エラーに強くするための簡易リトライ
  async function withRetry(fn, retries=3, delayMs=300){
    let lastErr;
    for(let i=0;i<retries;i++){
      try{ return await fn(); }
      catch(e){
        lastErr = e;
        if(i < retries-1){ await new Promise(res=>setTimeout(res, delayMs)); }
      }
    }
    throw lastErr;
  }

  // ---------- visitor counter (flavor; best-effort) ----------
  // ★バグ修正：以前はページを開くたびに無条件でカウントを+1していたため、
  // 国王が自分の国に戻ってきただけでも「新規訪問者」として毎回カウントされてしまっていた。
  // この端末で一度カウント済みかどうかを個人用ストレージ（koku-visited-before）に記録し、
  // 2回目以降はカウントを増やさず、現在の値を表示するだけにする。
  async function bumpVisitorCounter(){
    try{
      const already = await storage.get('koku-visited-before', false);
      if(already && already.value){
        const res = await storage.get('koku-visitor-count', true);
        visitorCountEl.textContent = res && res.value ? pad(parseInt(res.value,10)||0) : '??????';
        return;
      }
      let count = 1;
      const res = await storage.get('koku-visitor-count', true);
      if(res && res.value){ count = (parseInt(res.value,10) || 0) + 1; }
      await storage.set('koku-visitor-count', String(count), true);
      await storage.set('koku-visited-before', '1', false);
      visitorCountEl.textContent = pad(count);
      const tier = isKiriban(count);
      if(tier){
        showKiribanDialog(count, tier);
        deviceKiribanHit = true;
        try{ await storage.set('koku-kiriban-hit', '1', false); }catch(e){}
      }
    }catch(e){
      try{
        const res2 = await storage.get('koku-visitor-count', true);
        visitorCountEl.textContent = res2 && res2.value ? pad(parseInt(res2.value,10)||0) : '??????';
      }catch(e2){ visitorCountEl.textContent = '??????'; }
    }
  }

  // サイトの本当の開設年（最初の訪問時に確定させ、以後はその実際の値を使う）
  async function loadSiteSince(){
    const el = document.getElementById('sinceYear');
    if(!el) return;
    try{
      let val = null;
      try{
        const r = await storage.get('koku-site-since', true);
        if(r && r.value) val = r.value;
      }catch(e){ /* まだ記録がない＝これが最初の訪問 */ }
      if(!val){
        val = String(new Date().getFullYear());
        try{ await storage.set('koku-site-since', val, true); }catch(e){}
      }
      el.textContent = val;
    }catch(e){
      el.textContent = String(new Date().getFullYear());
    }
  }

  // ---------- storage helpers ----------
  // 「現在選んでいる国」のID（1個だけ）
  async function getCurrentId(){
    try{
      return await withRetry(async ()=>{
        const r = await storage.get('koku-my-id', false);
        return r && r.value ? r.value : null;
      });
    }catch(e){
      return null;
    }
  }
  async function setCurrentId(id){
    try{
      await withRetry(async ()=>{
        const ok = await storage.set('koku-my-id', id, false);
        if(!ok) throw new Error('setCurrentId failed');
      });
      return true;
    }catch(e){
      return false;
    }
  }
  async function clearCurrentId(){
    try{ await storage.delete('koku-my-id', false); return true; }
    catch(e){ return false; }
  }

  // 「この端末で作った国（アカウント）の一覧」。ホーム画面の表示に使う。
  async function getMyIds(){
    try{
      return await withRetry(async ()=>{
        const r = await storage.get('koku-my-ids', false);
        if(!r || !r.value) return [];
        try{
          const arr = JSON.parse(r.value);
          return Array.isArray(arr) ? arr : [];
        }catch(e){ return []; }
      });
    }catch(e){
      return [];
    }
  }
  async function saveMyIds(ids){
    try{
      await withRetry(async ()=>{
        const ok = await storage.set('koku-my-ids', JSON.stringify(ids), false);
        if(!ok) throw new Error('saveMyIds failed');
      });
      return true;
    }catch(e){
      return false;
    }
  }
  async function addMyId(id){
    const ids = await getMyIds();
    if(ids.includes(id)) return true;
    ids.push(id);
    return await saveMyIds(ids);
  }
  async function removeMyId(id){
    const ids = await getMyIds();
    const next = ids.filter(x => x !== id);
    const ok = await saveMyIds(next);
    const cur = await getCurrentId();
    if(cur === id){ await clearCurrentId(); }
    return ok;
  }
  // 旧バージョン（単一アカウントのみ）からの移行：
  // 既にkoku-my-id（現在の国）はあるのに一覧が空なら、そのIDを一覧に登録する
  async function migrateOldSingleAccount(){
    try{
      const ids = await getMyIds();
      if(ids.length > 0) return;
      const oldId = await getCurrentId();
      if(oldId){ await saveMyIds([oldId]); }
    }catch(e){}
  }
  // ホーム画面へ戻る（現在選択中の国だけ解除。データは一切消さない）
  async function goHome(){
    await clearCurrentId();
    const ids = await getMyIds();
    if(ids.length > 0){ await renderHome(); }
    else{ await renderFoundingForm(); }
  }
  // 読み込み失敗時は例外を投げっぱなしにする（呼び出し元で
  // 「本当にデータが無い」のか「一時的な読み込み失敗」なのかを区別し、
  // 後者の場合に既存の国を誤って消してしまわないようにするため）
  async function fetchVillage(id){
    return await withRetry(async ()=>{
      const r = await storage.get('koku:'+id, true);
      return r && r.value ? JSON.parse(r.value) : null;
    });
  }
  async function saveVillage(v){
    try{
      await withRetry(async ()=>{
        const ok = await storage.set('koku:'+v.id, JSON.stringify(v), true);
        if(!ok) throw new Error('saveVillage failed');
      });
      return true;
    }catch(e){
      console.warn('saveVillage failed', v && v.id, e);
      return false;
    }finally{
      invalidateVillageCache(); // 成否にかかわらず、自分が書いた直後の一覧キャッシュは捨てる
    }
  }

  // 国のデータを丸ごと削除する（廃墟の接収で使う）。成功したかどうかを返す。
  async function deleteVillage(id){
    try{
      const r = await storage.delete('koku:'+id, true);
      return !!r;
    }catch(e){
      console.warn('deleteVillage failed', id, e);
      return false;
    }finally{
      invalidateVillageCache();
    }
  }

  // ---------- 読み取り→差分適用→保存（A1：ロストアップデート対策） ----------
  // 画面を開いている間に手元のstate.villageが古くなる（他プレイヤーの侵攻・偵察で
  // 資金や履歴が書き換わる）ので、手元のオブジェクトを丸ごとsaveVillageすると
  // その変更を巻き戻してしまう。そこで、保存の直前に最新の記録を読み直し、
  // mutate(最新の記録) の中で「増減（差分）」だけを加えてから保存する。
  // ・mutateが false を返したときは保存せず、最新の記録だけを返す。
  // ・storageには比較して書き込む（CAS）機能が無いため、「読み直し」と「書き込み」の
  //   間に他の人が書いた場合の取りこぼしは原理上ゼロにはできない。ただし窓は
  //   画面を開いていた時間（数分）から通信1往復分（数十ms）まで縮まる。この点は許容する。
  // 返り値：{ ok:true, village, skipped? } / { ok:false, reason:'missing'|'read'|'write' }
  async function updateVillage(id, mutate){
    let fresh;
    try{
      fresh = await fetchVillage(id);
    }catch(e){
      console.warn('updateVillage: read failed', id, e);
      return { ok:false, reason:'read' };
    }
    if(!fresh) return { ok:false, reason:'missing' };
    fresh.log = fresh.log || [];
    if(mutate(fresh) === false) return { ok:true, skipped:true, village:fresh };
    const saved = await saveVillage(fresh);
    return saved ? { ok:true, village:fresh } : { ok:false, reason:'write' };
  }

  // ---------- 国一覧の取得（A3） ----------
  // ・全件を並列(Promise.all)で読む（以前は1件ずつ直列で、国が増えるほど遅くなっていた）。
  // ・LIST_CACHE_MS の間は結果を使い回す。自分が保存・削除したときは捨てる。
  //   他のプレイヤーの変更は最大でこの時間だけ遅れて見える（ランキング・地図の表示用途なので許容）。
  // ・opts.force : キャッシュを使わず取り直す（建国直前の空き確認など、最新が要る場面）
  // ・opts.strict: 1件でも読めなければ例外を投げる（既定は読めた分だけ返す）。
  //   「他国の領土を確認できないまま開拓して他国の土地に重ねてしまう」のを防ぐために使う。
  const villageCache = { list:null, at:0, gen:0 };
  function invalidateVillageCache(){
    villageCache.list = null;
    villageCache.at = 0;
    villageCache.gen++; // 取得中だった古い結果がキャッシュに戻るのを防ぐ
  }
  async function loadVillageList(strict){
    const listRes = await storage.list('koku:', true);
    if(!listRes || !listRes.keys) throw new Error('storage.list failed');
    let failed = 0;
    const rows = await Promise.all(listRes.keys.map(async (k)=>{
      try{
        const r = await storage.get(k, true);
        return (r && r.value) ? JSON.parse(r.value) : null;
      }catch(e){
        failed++;
        console.warn('listAllVillages: could not read', k, e);
        return null;
      }
    }));
    if(failed > 0 && strict) throw new Error('could not read ' + failed + ' village(s)');
    return { list: rows.filter(Boolean), complete: failed === 0 };
  }
  async function listAllVillages(opts){
    opts = opts || {};
    if(!opts.force && villageCache.list && (Date.now() - villageCache.at) < LIST_CACHE_MS){
      return villageCache.list.slice();
    }
    const gen = villageCache.gen;
    try{
      const { list, complete } = await loadVillageList(!!opts.strict);
      if(complete && gen === villageCache.gen){ // 読み漏れのある結果はキャッシュしない
        villageCache.list = list;
        villageCache.at = Date.now();
      }
      return list.slice();
    }catch(e){
      console.warn('listAllVillages failed', e);
      if(opts.strict) throw e;
      return [];
    }
  }

  function addLog(v, text, cls){
    v.log = v.log || [];
    const d = new Date();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    v.log.unshift({ date: `${mm}-${dd}`, text, cls: cls||'' });
    v.log = v.log.slice(0,6);
  }

  // ---------- 二つ名（自分だけが見られる、相手への呼び名） ----------
  // v.nicknames は { 相手のid: 呼び名 } の形で各国主が自分のデータの中だけに持つ。
  // お互いが自分の画面で相手に呼び名をつけられるので、双方向に「二つ名を付け合える」形になる。
  function dispNameRaw(v, other){
    const nn = v && v.nicknames && other && other.id ? v.nicknames[other.id] : null;
    return nn ? `${other.name}（${nn}）` : (other ? other.name : '');
  }
  function dispName(v, other){ return esc(dispNameRaw(v, other)); }

  // ---------- 国力の推移記録（1日1件、直近30件まで保持） ----------
  function recordScoreHistory(v){
    v.scoreHistory = v.scoreHistory || [];
    const today = localDateStr();
    const s = score(v);
    const last = v.scoreHistory[v.scoreHistory.length-1];
    if(last && last.date === today){
      last.score = s;
    }else{
      v.scoreHistory.push({ date: today, score: s });
    }
    v.scoreHistory = v.scoreHistory.slice(-30);
    v.maxScore = Math.max(v.maxScore || 0, s);
  }

  function daysSinceFounded(v){
    if(!v.founded) return 0;
    try{
      const f = new Date(v.founded + 'T00:00:00');
      return Math.floor((Date.now() - f.getTime()) / (24*60*60*1000));
    }catch(e){ return 0; }
  }

  // ---------- 実績（トロフィー） ----------
  const ACHIEVEMENTS = [
    { id:'expand',     label:'開拓者',       desc:'領土を2マス以上にした',        check: v => (v.territory||[]).length >= 2 },
    { id:'invadeWin1', label:'初陣',         desc:'侵攻に初めて勝利した',          check: v => ((v.stats&&v.stats.invadeWins)||0) >= 1 },
    { id:'invadeWin10',label:'常勝将軍',     desc:'侵攻に10回勝利した',            check: v => ((v.stats&&v.stats.invadeWins)||0) >= 10 },
    { id:'scout10',    label:'密偵',         desc:'偵察を10回行った',              check: v => ((v.stats&&v.stats.scoutCount)||0) >= 10 },
    { id:'streak7',    label:'皆勤賞',       desc:'7日連続でログインした',          check: v => ((v.stats&&v.stats.loginStreakMax)||0) >= 7 },
    { id:'kiriban',    label:'キリ番の証人', desc:'この端末でキリ番の瞬間に立ち会った', check: () => deviceKiribanHit },
    { id:'score100',   label:'中堅国の証',   desc:'国力100を達成した',             check: v => score(v) >= 100 },
    { id:'score300',   label:'強国の証',     desc:'国力300を達成した',             check: v => score(v) >= 300 },
    { id:'veteran30',  label:'古参国',       desc:'建国から30日以上が経過した',     check: v => daysSinceFounded(v) >= 30 },
    { id:'reclaim1',   label:'廃墟の接収者', desc:'廃墟となった国を接収した',       check: v => ((v.stats&&v.stats.reclaimCount)||0) >= 1 }
  ];

  // ---------- 本日初回ログインボーナス（連続ログイン日数に応じて増える） ----------
  // その日はじめてこの国を開いたとき、行動回数を消費せずに少しだけ資源をもらえる、
  // 個人サイトCGIゲームの定番「ログインボーナス」演出。前回のボーナス日が「昨日」なら
  // 連続日数（streak）を伸ばし、間が空いていれば1日目にリセットする。
  // ★A2：以前はここで毎回saveVillageしていたが、領土の後付け割り当てと合わせて
  // 読み込み時に2回保存していた。今回は記録を書き換えるだけにして、保存は
  // prepareVillage() の1回にまとめている。
  // 返り値：ボーナスを付与したときはそのログ文、受け取り済みなら null
  function applyDailyBonus(v){
    const today = localDateStr();
    if(v.lastBonusDate === today) return null;
    let streak = 1;
    if(v.lastBonusDate){
      try{
        const prev = new Date(v.lastBonusDate + 'T00:00:00');
        const cur = new Date(today + 'T00:00:00');
        const diffDays = Math.round((cur - prev) / (24*60*60*1000));
        streak = (diffDays === 1) ? (v.loginStreak||0) + 1 : 1;
      }catch(e){ streak = 1; }
    }
    v.loginStreak = streak;
    v.stats = v.stats || {};
    v.stats.loginStreakMax = Math.max(v.stats.loginStreakMax||0, streak);
    v.lastBonusDate = today;
    const bonusMul = Math.min(streak, 7); // 7日目以降は頭打ち
    const popGain = 3 + bonusMul;
    const goldGain = 5 + bonusMul*2;
    v.population += popGain;
    v.gold += goldGain;
    const text = `本日はじめてのご来訪です（連続${streak}日目）。ログインボーナスとして人口+${popGain}・資金+${goldGain}を得た。`;
    addLog(v, text, 'g');
    recordScoreHistory(v);
    return text;
  }

  // ---------- 領土の後付け割り当て（マップ機能導入前に建国した国のための移行処理） ----------
  // 記録を書き換えるだけで保存はしない。すでに領土があれば何もせず false を返す。
  function applyTerritoryMigration(v, tile){
    if(v.territory && v.territory.length > 0) return false;
    v.territory = [tile];
    v.capital = tile;
    addLog(v, `国土の記録が整備され、座標(${tile.x},${tile.y})が正式な領土として登録された。`, 'g');
    return true;
  }

  // 国を開いたときの準備（領土の後付け＋ログインボーナス）を、読み直し→1回の保存で行う。
  // 最新の記録に対して適用するので、別タブで先に受け取り済みならボーナスは二重に付かない。
  // 保存に失敗したときは手元の記録をそのまま使い、notice に理由を入れて返す
  // （lastBonusDateは更新されないので、次に開いたときにもう一度付与を試みる＝取りこぼさない）。
  async function prepareVillage(v){
    let tile = null;
    if(!(v.territory && v.territory.length > 0)){
      try{
        const all = await listAllVillages({ force:true, strict:true });
        tile = findRandomValidTile(all, v.id) || { x:Math.floor(MAP_SIZE/2), y:Math.floor(MAP_SIZE/2) };
      }catch(e){
        console.warn('prepareVillage: could not check map; territory migration postponed', e);
      }
    }
    let bonusText = null;
    const res = await updateVillage(v.id, (f)=>{
      let changed = false;
      if(tile && applyTerritoryMigration(f, tile)) changed = true;
      bonusText = applyDailyBonus(f);
      if(bonusText) changed = true;
      return changed; // 何も変わらなければ false → 保存しない
    });
    if(!res.ok){
      return {
        village: v, bonusText: null,
        notice: '通信エラーのため、ログインボーナスなどの保存ができませんでした。しばらくしてからページを開き直してください。'
      };
    }
    return { village: res.village, bonusText, notice: null };
  }

  // 国を選んでゲーム画面に入る共通処理（ホームの「続ける」・起動時の自動ログイン）
  async function enterGame(v){
    const prep = await prepareVillage(v);
    state.village = prep.village;
    state.village.log = state.village.log || [];
    state.lastResult = prep.notice ? { text: prep.notice, cls: 'r' }
                     : prep.bonusText ? { text: prep.bonusText, cls: 'g' }
                     : null;
    state.pendingRetry = null;
    await renderGame();
  }

  // ---------- 伝言板（全プレイヤー共有） ----------
  const BOARD_MAX_LEN = 100;
  async function loadBoardMessages(){
    try{
      const listRes = await storage.list('board:', true);
      if(!listRes || !listRes.keys) return [];
      const out = [];
      for(const k of listRes.keys){
        try{
          const r = await storage.get(k, true);
          if(r && r.value){ out.push(JSON.parse(r.value)); }
        }catch(e){}
      }
      out.sort((a,b)=> (b.at||0) - (a.at||0));
      return out.slice(0, 30);
    }catch(e){ return []; }
  }
  async function postBoardMessage(name, text){
    const key = 'board:' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
    const msg = { name: (name||'名無しの国主').slice(0,10), text: text.slice(0,BOARD_MAX_LEN), at: Date.now(), date: localDateStr() };
    return await storage.set(key, JSON.stringify(msg), true);
  }
  async function showBoard(){
    const authorName = state.village ? state.village.name : '名無しの国主';
    const modal = openModal(`
      <div class="kiriban-title" style="font-size:14px;">📜 伝言板</div>
      <div class="msgbox" style="margin-bottom:6px; text-align:left;">
        すべてのプレイヤーが見られる共有の伝言板です。心無い言葉はご遠慮ください。
      </div>
      <div id="boardError" class="r" style="font-size:12px;margin-bottom:4px;min-height:14px;"></div>
      <textarea id="boardInput" maxlength="${BOARD_MAX_LEN}" rows="2" class="text-input" placeholder="ひとこと（${BOARD_MAX_LEN}文字まで）"></textarea>
      <button type="button" class="retro-btn btn-inline" id="boardPostBtn" style="margin-top:6px;">${esc(authorName)}として書き込む</button>
      <div class="loglist" id="boardList" style="margin-top:10px; text-align:left; max-height:220px; overflow-y:auto;"><div class="row">読み込み中…</div></div>
      <button type="button" class="retro-btn btn-inline" id="boardCloseBtn" style="margin-top:8px;">閉じる</button>
    `, 'map-box');
    document.getElementById('boardCloseBtn').addEventListener('click', modal.close);
    async function refresh(){
      const listEl = document.getElementById('boardList');
      if(!listEl) return;
      const msgs = await loadBoardMessages();
      listEl.innerHTML = msgs.length
        ? msgs.map(m=>`<div class="row"><span class="date">[${esc(m.date||'')}]</span> <b>${esc(m.name||'名無しの国主')}</b>：${esc(m.text||'')}</div>`).join('')
        : '<div class="row">まだ書き込みがありません。最初の一言をどうぞ。</div>';
    }
    await refresh();
    document.getElementById('boardPostBtn').addEventListener('click', async ()=>{
      const input = document.getElementById('boardInput');
      const errEl = document.getElementById('boardError');
      const text = input.value.trim();
      errEl.textContent = '';
      if(!text){ errEl.textContent = 'ひとことを入力してください。'; return; }
      if(isInappropriateName(text)){ errEl.textContent = 'その内容は書き込めません。'; return; }
      const ok = await postBoardMessage(authorName, text);
      if(!ok){ errEl.textContent = '書き込みに失敗しました。もう一度お試しください。'; return; }
      input.value = '';
      await refresh();
    });
  }

  // ---------- 廃墟（長期間行動が無い国）判定 ----------
  // 建国直後はlastActionAtが0（初期値）のままなので、それをそのまま使うと
  // 「建国したばかりの国」が誤って「廃墟」と判定されてしまう。
  // そのため、lastActionAtが無い場合は建国日をその国の最終活動時刻の代わりに使う。
  function lastActiveAt(o){
    let foundedAt = 0;
    try{ if(o.founded) foundedAt = new Date(o.founded + 'T00:00:00').getTime() || 0; }catch(e){}
    return o.lastActionAt ? o.lastActionAt : foundedAt;
  }
  function getAbandonedVillages(allVillages, selfId){
    const now = Date.now();
    return allVillages.filter(o => o.id !== selfId && (now - lastActiveAt(o)) > ABANDON_MS);
  }

  // ---------- cooldown timer (画面だけを1秒ごとに更新し、storageは叩かない) ----------
  function clearCooldownTimer(){
    if(cooldownInterval){ clearInterval(cooldownInterval); cooldownInterval = null; }
  }
  function startCooldownTimer(endAt){
    clearCooldownTimer();
    const tick = ()=>{
      const el = document.getElementById('cooldownSec');
      if(!el){ clearCooldownTimer(); return; }
      const remain = endAt - Date.now();
      if(remain <= 0){
        clearCooldownTimer();
        renderGame();
        return;
      }
      el.textContent = Math.ceil(remain/1000);
    };
    tick();
    cooldownInterval = setInterval(tick, 250);
  }

  // ---------- rendering ----------
  function statRow(k,v){ return `<tr><td class="k">${k}</td><td class="v">${v}</td></tr>`; }

  // ★バグ修正：以前は<form>のsubmitイベントに依存していたが、
  // artifactのプレビュー環境（サンドボックス化されたiframe）ではフォームの
  // 送信そのものがブロックされることがあり、その場合ボタンを押しても
  // submitイベントが発火せず「建国する！」を押しても何も起こらなかった。
  // フォームをやめて、ボタンのclickイベント（＋Enterキー）で直接処理するように変更。
  async function renderFoundingForm(){
    clearCooldownTimer();
    selectedFoundTile = null;
    const ids = await getMyIds();
    appEl.innerHTML = '<div class="loading">地図を読み込み中…</div>';
    const allVillages = await listAllVillages();
    const status = buildMapStatus(allVillages, { markBuffer:true });
    const gridHtml = renderMapGridHtml(status, { interactive:true });
    appEl.innerHTML = `
      <div class="panel">
        <div class="panel-head">▼ まずは国をひらこう</div>
        <div class="panel-body">
          <div class="msgbox" style="margin-bottom:10px;">
            灯りひとつを掲げ、荒野に小さな国をひらく。<br>
            20秒ごとに1回、「開拓」「訓練」「交易」「偵察」「侵攻」のいずれかを行える、のんびりとした国盗りごっこです。
          </div>
          <div id="foundError" class="r" style="font-size:12px;margin-bottom:6px;min-height:14px;"></div>
          <div class="foundform">
            <input type="text" id="nameInput" maxlength="10" placeholder="国の名前（10文字まで）">
          </div>
          <div class="msgbox" style="margin:8px 0 6px;">
            建国する場所を地図から選んでください。<br>
            斜線のマス＝他国の領土、またはその周囲5マス以内（設置不可）／それ以外の水色のマスなら設置できます。
          </div>
          <div class="msgbox" style="margin-bottom:6px;">
            地図は指でスワイプ（またはドラッグ）して見てください。
          </div>
          <div class="map-scroll" id="foundMapScroll">
            <div class="map-grid" id="foundMapGrid" style="grid-template-columns:repeat(${MAP_SIZE}, var(--map-cell));">${gridHtml}</div>
          </div>
          <div id="selectedTileInfo" class="msgbox" style="margin-top:8px;">まだ場所が選択されていません。地図のマスをタップして選んでください。</div>
          <button type="button" class="retro-btn" id="foundSubmitBtn" disabled style="margin-top:8px;">この場所に建国する！</button>
          ${ids.length > 0 ? `<button type="button" class="retro-btn btn-inline" id="toHomeFromFoundBtn" style="margin-top:8px;">🏠 ホームに戻る</button>` : ''}
        </div>
      </div>`;
    document.getElementById('foundSubmitBtn').addEventListener('click', submitFounding);
    document.getElementById('nameInput').addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        e.preventDefault();
        if(selectedFoundTile){ submitFounding(); }
      }
    });
    const gridEl = document.getElementById('foundMapGrid');
    const foundScrollEl = document.getElementById('foundMapScroll');
    scrollMapToTile(foundScrollEl, Math.floor(MAP_SIZE/2), Math.floor(MAP_SIZE/2));
    gridEl.addEventListener('click', (e)=>{
      const cell = e.target.closest('.map-cell');
      if(!cell) return;
      const x = Number(cell.dataset.x), y = Number(cell.dataset.y);
      const infoEl = document.getElementById('selectedTileInfo');
      if(!cell.classList.contains('free')){
        infoEl.textContent = 'そこには建国できません（他国の領土、またはその周囲5マス以内です）。別の場所を選んでください。';
        return;
      }
      const prev = gridEl.querySelector('.map-cell.selected');
      if(prev) prev.classList.remove('selected');
      cell.classList.add('selected');
      selectedFoundTile = { x, y };
      infoEl.textContent = `座標(${x},${y})を選択しました。よろしければ下のボタンで建国してください。`;
      document.getElementById('foundSubmitBtn').disabled = false;
    });
    const toHomeBtn = document.getElementById('toHomeFromFoundBtn');
    if(toHomeBtn){ toHomeBtn.addEventListener('click', renderHome); }
  }

  async function submitFounding(){
    const nameInput = document.getElementById('nameInput');
    const errorEl = document.getElementById('foundError');
    errorEl.textContent = '';
    const name = nameInput.value.trim().slice(0,10);
    if(!name){
      errorEl.textContent = '国の名前を入力してください。';
      return;
    }
    if(isInappropriateName(name)){
      errorEl.textContent = 'その名前は使用できません。別の名前を入力してください。';
      return;
    }
    if(!selectedFoundTile){
      errorEl.textContent = '地図から建国したい場所を選んでください。';
      return;
    }
    // 建国直前にもう一度だけ空きを確認する（選んでいる間に他の人が先に建国した可能性があるため）
    const freshVillages = await listAllVillages({ force:true }); // キャッシュではなく最新を確認する
    if(!isTileFree(selectedFoundTile.x, selectedFoundTile.y, freshVillages, null)){
      errorEl.textContent = 'その場所はたった今、他の誰かが使ったようです。地図を選び直してください。';
      await renderFoundingForm();
      return;
    }
    const id = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
    const tile = selectedFoundTile;
    const v = {
      id, name, population:10, military:5, gold:10,
      founded: localDateStr(), lastActionAt:0, lastBonusDate: localDateStr(),
      territory:[tile], capital:tile, log:[]
    };
    addLog(v, `${name} が座標(${tile.x},${tile.y})に建国された。`, 'g');
    recordScoreHistory(v);
    selectedFoundTile = null;
    await attemptFound(v, id);
  }

  // ---------- ホーム画面（複数アカウント切り替え） ----------
  async function renderHome(){
    clearCooldownTimer();
    state.lastResult = null; state.pendingRetry = null; // 別の国に切り替えても前の国の結果を引きずらない
    appEl.innerHTML = '<div class="loading">読み込み中…</div>';
    const ids = await getMyIds();
    const accounts = [];
    for(const id of ids){
      try{
        const v = await fetchVillage(id);
        if(v){ accounts.push(v); }
        // fetchVillageがnullを返した（データが本当に存在しない）場合はここで一覧から静かに除外する
        else{ await removeMyId(id); }
      }catch(e){
        // 一時的な読み込み失敗の可能性があるので、一覧からは消さずに「読み込み失敗」として出す
        accounts.push({ id, name:'（読み込み失敗）', __err:true });
      }
    }
    appEl.innerHTML = `
      <div class="panel">
        <div class="panel-head">▼ ホーム － あなたの国一覧</div>
        <div class="panel-body">
          ${accounts.length ? `
            <div class="loglist" style="margin-bottom:10px;">
              ${accounts.map(a => `
                <div class="account-row row-between">
                  <span>🏯 ${esc(a.name)}${a.__err ? '' : `（国力 ${score(a)}）`}</span>
                  <span class="row-between" style="gap:10px;">
                    ${a.__err ? '' : `<button type="button" class="retro-btn btn-inline" data-continue="${esc(a.id)}">続ける</button>`}
                    <a href="#" class="forget-link" data-forget="${esc(a.id)}">削除</a>
                  </span>
                </div>`).join('')}
            </div>
          ` : `<div class="msgbox" style="margin-bottom:10px;">この端末にはまだ国がありません。</div>`}
          <button type="button" class="retro-btn" id="newAccountBtn">＋ 新しく国を建国する</button>
        </div>
      </div>`;

    appEl.querySelectorAll('[data-continue]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-continue');
        appEl.innerHTML = '<div class="loading">読み込み中…</div>';
        try{
          const v = await fetchVillage(id);
          if(v){
            await setCurrentId(id);
            await enterGame(v);
          }else{
            await renderDataMissing(id);
          }
        }catch(e){
          renderLoadError();
        }
      });
    });

    // 削除リンクは2回押しの簡易確認式（confirm()はartifactのプレビュー環境で
    // 動かないことがあるため使わない）。1回目でラベルが変わり、2回目で確定する。
    appEl.querySelectorAll('[data-forget]').forEach(a=>{
      let confirming = false;
      a.addEventListener('click', async (e)=>{
        e.preventDefault();
        const id = a.getAttribute('data-forget');
        if(!confirming){
          confirming = true;
          a.textContent = '本当に削除する？';
          return;
        }
        await removeMyId(id);
        await renderHome();
      });
    });

    document.getElementById('newAccountBtn').addEventListener('click', renderFoundingForm);
  }

  // 建国データの保存（失敗時はリトライ用ボタンを出し、勝手に成功したことにしない）
  async function attemptFound(v, id){
    appEl.innerHTML = '<div class="loading">建国中…</div>';
    const saveOk = await saveVillage(v);
    const idOk = saveOk && await setCurrentId(id);
    if(!saveOk || !idOk){
      appEl.innerHTML = `
        <div class="panel">
          <div class="panel-head">▼ エラー</div>
          <div class="panel-body">
            <div class="msgbox r">建国データの保存に失敗しました。通信状況をご確認のうえ、もう一度お試しください。</div>
            <button class="retro-btn" id="retryFoundBtn" style="margin-top:8px;">もう一度試す</button>
          </div>
        </div>`;
      document.getElementById('retryFoundBtn').addEventListener('click', ()=> attemptFound(v, id));
      return;
    }
    await addMyId(id); // この端末のアカウント一覧に登録（失敗しても致命的ではないので待たない扱いでよい）
    state.village = v;
    state.lastResult = null; state.pendingRetry = null;
    await renderGame();
  }

  function renderLoadError(){
    appEl.innerHTML = `
      <div class="panel">
        <div class="panel-head">▼ 読み込みエラー</div>
        <div class="panel-body">
          <div class="msgbox r">国のデータの読み込みに失敗しました。通信状況をご確認のうえ、もう一度お試しください。</div>
          <button class="retro-btn" id="retryLoadBtn" style="margin-top:8px;">🔄 再読み込みする</button>
          <div style="text-align:center;margin-top:10px;">
            <a href="#" id="forceFoundLink" style="font-size:11px;">何度試しても解決しない場合はこちら（新しく建国する）</a><br>
            <a href="#" id="toHomeLink" style="font-size:11px;">🏠 ホームに戻る（他の国を選ぶ）</a>
          </div>
        </div>
      </div>`;
    document.getElementById('retryLoadBtn').addEventListener('click', init);
    document.getElementById('forceFoundLink').addEventListener('click', (e)=>{ e.preventDefault(); renderFoundingForm(); });
    document.getElementById('toHomeLink').addEventListener('click', async (e)=>{ e.preventDefault(); await goHome(); });
  }

  async function renderDataMissing(missingId){
    // 「データが見つからない」ことが確定した国だけを一覧から外す（一時的な通信エラーとは区別する）
    await clearCurrentId();
    if(missingId){ await removeMyId(missingId); }
    const ids = await getMyIds();
    appEl.innerHTML = `
      <div class="panel">
        <div class="panel-head">▼ お知らせ</div>
        <div class="panel-body">
          <div class="msgbox">以前の国のデータが見つかりませんでした。新しく国をひらいてください。</div>
          <button class="retro-btn" id="foundAgainBtn" style="margin-top:8px;">新しく建国する</button>
          ${ids.length > 0 ? `<button type="button" class="retro-btn btn-inline" id="toHomeBtn" style="margin-top:8px;">🏠 ホームに戻る</button>` : ''}
        </div>
      </div>`;
    document.getElementById('foundAgainBtn').addEventListener('click', renderFoundingForm);
    const toHomeBtn = document.getElementById('toHomeBtn');
    if(toHomeBtn){ toHomeBtn.addEventListener('click', renderHome); }
  }

  // ---------- ゲーム画面 ----------
  // ★C1：以前は行動のたびに画面全体を「処理中…」に置き換えてから作り直していたため、
  // 毎回チラついて開閉状態・スクロール位置・選択中の侵攻先も失われていた。
  // 画面の骨組み(#gameRoot)は最初の1回だけ作り、以後は「中身が変わったパネルの
  // 本文だけ」を差し替える。行動中はボタンを無効化して、行動パネルの中に「処理中…」を出すだけにする。
  const paintedHtml = new WeakMap(); // パネル本文ごとの「最後に描いたHTML」。同じなら再描画しない

  function gameShellHtml(){
    return `
      <div id="gameRoot">
        <div class="home-bar">
          <button type="button" class="retro-btn btn-inline" id="homeBtn">🏠 ホームに戻る</button>
        </div>
        <div class="panel" data-panel-id="status"><div class="panel-head"></div><div class="panel-body"></div></div>

        <div class="panel" data-panel-id="map">
          <div class="panel-head">▼ 地図</div>
          <div class="panel-body">
            <button type="button" class="retro-btn" id="mapBtn">🗺️ 世界地図を見る（クールタイムなし）</button>
          </div>
        </div>

        <div class="panel" data-panel-id="record">
          <div class="panel-head">▼ 記録</div>
          <div class="panel-body">
            <a href="Story.html" class="retro-btn btn-inline" style="display:inline-block;text-decoration:none;text-align:center;">📖 物語を読む（クールタイムなし）</a>
            <button type="button" class="retro-btn btn-inline" id="boardBtn" style="margin-top:6px;">📜 伝言板を見る</button>
          </div>
        </div>

        <div class="panel" data-panel-id="action"><div class="panel-head">▼ 行動</div><div class="panel-body"></div></div>
        <div class="panel" data-panel-id="log"><div class="panel-head">▼ できごと履歴</div><div class="panel-body"></div></div>
        <div class="panel" data-panel-id="nickname"><div class="panel-head">▼ 二つ名をつける</div><div class="panel-body"></div></div>

        <div class="panel" data-panel-id="search">
          <div class="panel-head">▼ 国名検索</div>
          <div class="panel-body">
            <input type="text" id="searchInput" class="text-input" placeholder="国名の一部を入力…">
            <div id="searchResult" class="loglist"><div class="row">国名を入力すると、参加中の国から検索します。</div></div>
          </div>
        </div>

        <div class="panel" data-panel-id="ranking"><div class="panel-head"></div><div class="panel-body"></div></div>
        <div class="panel" data-panel-id="achievements"><div class="panel-head"></div><div class="panel-body"></div></div>
        <div class="panel" data-panel-id="history"><div class="panel-head"></div><div class="panel-body"></div></div>
      </div>`;
  }

  // 骨組みに固定のイベントを1回だけ付ける（中身が差し替わっても骨組みは残るので付け直し不要）。
  // 行動ボタンや二つ名ボタンのように中身ごと差し替わる要素は、onGameClick で委譲して扱う。
  function bindGameShell(){
    document.getElementById('homeBtn').addEventListener('click', async ()=>{ await goHome(); });
    document.getElementById('mapBtn').addEventListener('click', showWorldMap);
    document.getElementById('boardBtn').addEventListener('click', showBoard);
    document.getElementById('searchInput').addEventListener('input', ()=>{
      const v = state.village;
      const q = document.getElementById('searchInput').value.trim().toLowerCase();
      const resultEl = document.getElementById('searchResult');
      if(!q){ resultEl.innerHTML = '<div class="row">国名を入力すると、参加中の国から検索します。</div>'; return; }
      const hits = state.allVillages.filter(o => o.name && o.name.toLowerCase().includes(q)).slice(0,20);
      resultEl.innerHTML = hits.length
        ? hits.map(o=>`<div class="row">🏯 ${dispName(v,o)}${o.id===v.id?'（あなた）':''}　国力${score(o)}　${esc(getTitle(score(o)))}</div>`).join('')
        : '<div class="row">該当する国が見つかりませんでした。</div>';
    });
  }

  // 1つのパネルの見出し・本文を更新する。本文は前回と同じHTMLなら触らない。
  // 差し替えるときも、選択中のプルダウンの値は（選択肢が残っていれば）引き継ぐ。
  // 見出しの先頭の ▼/▶ は、そのパネルが折りたたまれているかどうかに合わせる。
  function setPanel(id, headText, bodyHtml){
    const panel = appEl.querySelector('.panel[data-panel-id="' + id + '"]');
    if(!panel) return;
    const head = panel.querySelector('.panel-head');
    const body = panel.querySelector('.panel-body');
    if(head && headText != null){
      head.textContent = (panel.classList.contains('collapsed') ? '▶' : '▼') + ' ' + headText;
    }
    if(body && bodyHtml != null && paintedHtml.get(body) !== bodyHtml){
      const keep = {};
      body.querySelectorAll('select[id]').forEach(s=>{ keep[s.id] = s.value; });
      body.innerHTML = bodyHtml;
      paintedHtml.set(body, bodyHtml);
      Object.keys(keep).forEach(sid=>{
        const s = document.getElementById(sid);
        if(s && Array.from(s.options).some(o => o.value === keep[sid])) s.value = keep[sid];
      });
    }
  }

  function paintStatus(v){
    setPanel('status', `${v.name} の様子`, `
      <table class="stats">
        ${statRow('建国日', esc(v.founded))}
        ${statRow('拠点座標', v.capital ? `(${v.capital.x}, ${v.capital.y})` : '－')}
        ${statRow('領土', (v.territory ? v.territory.length : 0) + ' マス')}
        ${statRow('🌾 人口', v.population)}
        ${statRow('⚔️ 兵力', v.military)}
        ${statRow('💰 資金', v.gold)}
        ${statRow('連続来訪', (v.loginStreak||1) + ' 日目')}
        ${statRow('国力', '<b>'+score(v)+'</b> <span class="title-badge">'+esc(getTitle(score(v)))+'</span>')}
      </table>`);
  }

  // 行動パネル。クールダウン中・行動処理中はボタンを表示したままdisabledにする。
  // ★C3（最小限）：直近の行動結果をパネルの一番上に出す。ログ欄は画面の下の方にあるため、
  // 画面全体を置き換えなくなった今、結果が目に入る場所が必要になる。
  function paintAction(v, others){
    const busy = !!state.busy;
    const elapsed = Date.now() - (v.lastActionAt || 0);
    const canAct = !busy && elapsed >= COOLDOWN_MS;
    const abandoned = getAbandonedVillages(state.allVillages, v.id);
    const devNeed = devCost(v);
    const dis = canAct ? '' : 'disabled';
    const remainSec = Math.max(0, Math.ceil((COOLDOWN_MS - elapsed)/1000));
    const r = state.lastResult;
    const resultHtml = (!busy && r && r.text) ? `
      <div class="msgbox result-box ${esc(r.cls || '')}" role="status" style="margin-bottom:8px;">${esc(r.text)}${state.pendingRetry ? `<br><button type="button" class="retro-btn btn-inline" data-retry="1" style="margin-top:6px;">もう一度保存する</button>` : ''}</div>` : '';
    const statusLine = busy
      ? `<div class="msgbox" role="status" style="margin-top:8px;">処理中…</div>`
      : (!canAct ? `<div class="msgbox" style="margin-top:8px;">次の行動まで、あと <b id="cooldownSec">${remainSec}</b> 秒お待ちください。</div>` : '');

    setPanel('action', '行動', `
      ${resultHtml}
      <div class="action-grid">
        <button class="retro-btn" data-action="dev" ${dis}>🌾 開拓する${devNeed>0 ? `（資金${devNeed}）` : ''}</button>
        <button class="retro-btn" data-action="train" ${dis}>⚔️ 訓練する</button>
        <button class="retro-btn" data-action="trade" ${dis}>💰 交易する</button>
        <button class="retro-btn" data-action="scout" ${(!canAct || others.length===0)?'disabled':''}>🔍 偵察する</button>
      </div>
      <div style="margin-top:8px;">
        ${others.length>0 ? `
          <select class="retro-select" id="targetSelect" ${dis}>
            ${others.map(o=>`<option value="${esc(o.id)}">${dispName(v,o)}（国力目安 ${score(o)}・領土${o.territory ? o.territory.length : 0}マス）</option>`).join('')}
          </select>
          <button class="retro-btn" data-action="invade" ${dis}>⚔️ 侵攻する（勝てば領土を奪う）</button>
        ` : `<div class="msgbox">まだ他に国がありません。誰かが建国するのを待とう。</div>`}
      </div>
      ${abandoned.length>0 ? `
        <div style="margin-top:10px;border-top:1px dotted var(--line);padding-top:8px;">
          <div class="msgbox" style="margin-bottom:6px;">🏚️ 14日以上活動の無い廃墟が見つかっています。接収すると領土と資金を得られます。</div>
          <select class="retro-select" id="reclaimSelect" ${dis}>
            ${abandoned.map(o=>`<option value="${esc(o.id)}">${dispName(v,o)}（${(o.territory?o.territory.length:0)}マス・${Math.floor((Date.now()-lastActiveAt(o))/(24*60*60*1000))}日放置）</option>`).join('')}
          </select>
          <button class="retro-btn" data-action="reclaim" ${dis}>🏚️ 廃墟を接収する</button>
        </div>
      ` : ''}
      ${statusLine}`);

    // 行動中にホームへ戻られると、完了後の再描画がホーム画面を上書きしてしまうので止めておく
    const homeBtn = document.getElementById('homeBtn');
    if(homeBtn) homeBtn.disabled = busy;
  }

  // 行動パネルだけを（保存済みの状態のまま）描き直す。busyの切り替え時に使う。
  function paintActionOnly(){
    const v = state.village;
    if(!v) return;
    paintAction(v, state.allVillages.filter(o => o.id !== v.id));
  }

  function paintLog(v){
    setPanel('log', 'できごと履歴', `
      <div class="loglist">
        ${(v.log&&v.log.length) ? v.log.map(l=>`<div class="row"><span class="date">[${esc(l.date)}]</span><span class="${esc(l.cls||'')}">${esc(l.text)}</span></div>`).join('') : '<div class="row">まだ何も起きていない。</div>'}
      </div>`);
  }

  function paintNickname(v, others){
    setPanel('nickname', '二つ名をつける', others.length>0 ? `
      <div class="msgbox" style="margin-bottom:6px;">相手の国に、あなただけの呼び名をつけられます（あなたの画面にだけ反映されます）。</div>
      <select class="retro-select" id="nicknameTarget">
        ${others.map(o=>`<option value="${esc(o.id)}">${dispName(v,o)}</option>`).join('')}
      </select>
      <input type="text" id="nicknameInput" maxlength="8" class="text-input" placeholder="二つ名（8文字まで／空欄で解除）">
      <button type="button" class="retro-btn btn-inline" id="nicknameSubmitBtn">この名で呼ぶ</button>
    ` : `<div class="msgbox">まだ他に国がありません。</div>`);
  }

  function paintRanking(v, all){
    const ranked = all.slice().sort((a,b)=>score(b)-score(a)).slice(0,12);
    setPanel('ranking', `国力ランキング（参加中の全 ${all.length} 国中）`, `
      <table class="rank">
        <tr><th>順位</th><th>国名</th><th>称号</th><th>国力</th></tr>
        ${ranked.map((r,i)=>`
          <tr class="${r.id===v.id?'me':''} ${i===0?'top1':''}">
            <td class="rk">${i+1}位</td>
            <td>${dispName(v,r)}${r.id===v.id?'（あなた）':''}</td>
            <td>${esc(getTitle(score(r)))}</td>
            <td>${score(r)}</td>
          </tr>`).join('')}
      </table>`);
  }

  function paintAchievements(v){
    const achDone = ACHIEVEMENTS.filter(a=>a.check(v)).length;
    const achHtml = ACHIEVEMENTS.map(a=>{
      const done = !!a.check(v);
      return `<div class="row-between ach-row${done?' done':''}"><span>${done?'✅':'⬜'} ${esc(a.label)}</span><span class="ach-desc">${esc(a.desc)}</span></div>`;
    }).join('');
    setPanel('achievements', `実績（${achDone}/${ACHIEVEMENTS.length}）`, achHtml);
  }

  function paintHistory(v){
    const hist = v.scoreHistory || [];
    const histMax = Math.max(v.maxScore || score(v), ...hist.map(h=>h.score), 1);
    const histHtml = hist.length ? hist.slice().reverse().map(h=>{
      const pct = Math.max(4, Math.round(h.score / histMax * 100));
      return `<div class="hist-row"><span class="hist-date">${esc(h.date.slice(5))}</span><div class="hist-bar-track"><div class="hist-bar" style="width:${pct}%;"></div></div><span class="hist-val">${h.score}</span></div>`;
    }).join('') : '<div class="msgbox">まだ記録がありません（翌日以降のご来訪で記録されます）。</div>';
    setPanel('history', `国力の推移（歴代最高：${v.maxScore || score(v)}）`, histHtml);
  }

  function paintGame(){
    const v = state.village;
    const all = state.allVillages;
    const others = all.filter(o => o.id !== v.id);
    paintStatus(v);
    paintAction(v, others);
    paintLog(v);
    paintNickname(v, others);
    paintRanking(v, all);
    paintAchievements(v);
    paintHistory(v);
  }

  async function renderGame(){
    clearCooldownTimer();
    const hasShell = !!appEl.querySelector('#gameRoot');
    if(!hasShell){ appEl.innerHTML = '<div class="loading">読み込み中…</div>'; }
    state.allVillages = await listAllVillages();
    // 他のプレイヤーの侵攻・偵察で自国の記録が書き換わっていることがあるので、最新を取り直す。
    // 取得に失敗したときは手元の値のまま表示する。
    try{
      const latest = await fetchVillage(state.village.id);
      if(latest){ latest.log = latest.log || []; state.village = latest; }
    }catch(e){
      console.warn('renderGame: could not refresh own record', e);
    }
    if(!hasShell){
      appEl.innerHTML = gameShellHtml();
      bindGameShell();
    }
    paintGame();

    const v = state.village;
    if(!state.busy && (Date.now() - (v.lastActionAt || 0)) < COOLDOWN_MS){
      startCooldownTimer(v.lastActionAt + COOLDOWN_MS);
    }
  }

  // 行動ボタン・「もう一度保存する」・二つ名ボタンは、パネルの中身ごと差し替わるので
  // appElへのイベント委譲で受ける（差し替えのたびにリスナーを付け直さなくてよい）。
  function onGameClick(e){
    const actBtn = e.target.closest('[data-action]');
    if(actBtn && appEl.contains(actBtn)){
      if(actBtn.disabled) return;
      const action = actBtn.dataset.action;
      // 侵攻先・接収先は、行動パネルの描き直しで値が変わる前にここで読み取る
      let targetId = null;
      if(action === 'invade'){
        const sel = document.getElementById('targetSelect');
        targetId = sel ? sel.value : null;
      }else if(action === 'reclaim'){
        const sel = document.getElementById('reclaimSelect');
        targetId = sel ? sel.value : null;
      }
      handleAction(action, targetId);
      return;
    }
    if(e.target.closest('[data-retry]')){ handleRetry(); return; }
    const nickBtn = e.target.closest('#nicknameSubmitBtn');
    if(nickBtn && appEl.contains(nickBtn)){ handleNicknameSubmit(nickBtn); }
  }
  appEl.addEventListener('click', onGameClick);

  // 二つ名は自分のデータの中だけに持つ項目なので、差分（この1件だけ）を最新の記録に適用して保存する
  async function handleNicknameSubmit(btn){
    if(state.busy || !state.village) return;
    const sel = document.getElementById('nicknameTarget');
    const input = document.getElementById('nicknameInput');
    const targetId = sel ? sel.value : null;
    if(!targetId) return;
    const name = input.value.trim().slice(0,8);
    state.busy = true;
    btn.disabled = true;
    paintActionOnly();
    const res = await updateVillage(state.village.id, (f)=>{
      f.nicknames = f.nicknames || {};
      if(name){ f.nicknames[targetId] = name; } else { delete f.nicknames[targetId]; }
    });
    state.busy = false;
    if(res.ok && res.village){
      state.village = res.village;
    }else{
      state.lastResult = { text:'二つ名を保存できませんでした。通信状況をご確認のうえ、もう一度お試しください。', cls:'r' };
    }
    await renderGame();
  }

  // ---------- 行動 ----------
  // 行動は「計画(plan)」として組み立て、execPlan() が順番に実行する。
  // ・記録の書き込みは必ず updateVillage（保存直前に読み直して差分だけ適用）を通す（A1）。
  //   これは相手の国だけでなく自分の国も同じ：画面を開いている間に侵攻された分を巻き戻さないため。
  // ・資金が動く行動は「減る側を先に保存し、実際に減った額だけ増える側に足す」順にする。
  //   途中で通信が切れても、資金が増殖する（二重に付く）ことはなく、最悪でも消えるだけで済む。
  // ・途中のステップが失敗したときは、成功済みのステップはやり直さず、失敗したステップから再開する。
  // ・クールタイムはクライアント側の判定のみ（lastActionAtを国のデータに持たせる方式）。
  //   データを直接書き換えられれば回避できてしまうため、完全な防止は不可能で、これは許容する。
  async function handleAction(action, targetId){
    if(state.busy || !state.village) return;
    if(Date.now() - (state.village.lastActionAt || 0) < COOLDOWN_MS) return;
    state.busy = true;
    state.pendingRetry = null;
    paintActionOnly();
    let outcome;
    try{
      outcome = await runAction(action, targetId);
    }catch(e){
      console.warn('handleAction failed', action, e);
      outcome = { text:'処理中にエラーが発生しました。もう一度お試しください。', cls:'r' };
    }
    await finishOutcome(outcome);
  }

  async function handleRetry(){
    const fn = state.pendingRetry;
    if(state.busy || !fn) return;
    state.busy = true;
    state.pendingRetry = null;
    paintActionOnly();
    let outcome;
    try{
      outcome = await fn();
    }catch(e){
      console.warn('retry failed', e);
      outcome = { text:'処理中にエラーが発生しました。もう一度お試しください。', cls:'r' };
    }
    await finishOutcome(outcome);
  }

  async function finishOutcome(outcome){
    state.busy = false;
    if(outcome.village){ state.village = outcome.village; }
    state.lastResult = { text: outcome.text, cls: outcome.cls || '' };
    state.pendingRetry = outcome.retry || null;
    await renderGame();
  }

  async function execPlan(plan, from){
    for(let i = from; i < plan.steps.length; i++){
      let ok = false;
      try{ ok = await plan.steps[i](); }
      catch(e){ console.warn('action step failed', i, e); }
      if(!ok){
        return {
          text:'結果の保存に失敗しました。通信状況をご確認のうえ、もう一度お試しください。',
          cls:'r',
          village: plan.self || undefined,
          retry: ()=> execPlan(plan, i)
        };
      }
    }
    return { text: plan.text, cls: plan.cls, village: plan.self };
  }

  async function runAction(action, targetId){
    const vid = state.village.id;
    // 手元のstate.villageは古いことがあるので、判断に使う自国の値は最新を取り直す
    let me = null;
    try{ me = await fetchVillage(vid); }
    catch(e){ console.warn('runAction: could not read own record', e); }
    if(!me){
      return { text:'国のデータを読み込めませんでした。通信状況をご確認のうえ、もう一度お試しください。', cls:'r' };
    }
    me.log = me.log || [];
    // 別タブなどで先に行動していた場合もここで止まる
    if(Date.now() - (me.lastActionAt || 0) < COOLDOWN_MS){
      return { text:'まだ行動できません。クールタイムが明けるまでお待ちください。', cls:'', village: me };
    }

    const plan = { steps:[], text:'', cls:'', self:null };
    // 画面に出す結果文と、履歴に残す文を同じものにする
    const say = (f, text, cls)=>{ plan.text = text; plan.cls = cls || ''; addLog(f, text, cls); };
    // 自国への書き込み（lastActionAtも一緒に更新＝この保存でクールタイムが始まる）
    const selfStep = (mutate)=> async ()=>{
      const res = await updateVillage(vid, (f)=>{
        mutate(f);
        f.lastActionAt = Date.now();
      });
      if(res.ok && res.village){ plan.self = res.village; return true; }
      return false;
    };
    // 相手国への書き込み。相手がすでに存在しない(missing)場合は失敗扱いにせず、後続に伝える
    const targetStep = (id, mutate)=> async ()=>{
      const res = await updateVillage(id, mutate);
      if(res.ok) return true;
      if(res.reason === 'missing'){ plan.targetMissing = true; return true; }
      return false;
    };

    if(action === 'dev'){
      // 開拓＝人口が少し増えるのに加えて、領土に隣接する未所有マスを1つ獲得する。
      // 他国の領土と被っていた場合は、別の空いているマスを探す。
      // 他国の領土を確認できないまま進めると他国の土地に重ねてしまうので、取得失敗時は見送る。
      let freshVillages;
      try{ freshVillages = await listAllVillages({ force:true, strict:true }); }
      catch(e){
        return { text:'他国の領土を確認できなかったため、開拓を見送りました。もう一度お試しください。', cls:'r', village: me };
      }
      const gain = rand(2,5);
      plan.steps.push(selfStep((f)=>{
        f.population += gain;
        const frontier = shuffle(getFrontierTiles(f));
        let claimed = null;
        for(const tile of frontier){
          if(!isOwnedByOther(tile.x, tile.y, freshVillages, f.id)){ claimed = tile; break; }
        }
        // 領土を広げるには資金が要る（B1）。コストは保存直前の最新の領土数から決める。
        // 資金が足りないときは人口が増えるだけで、領土も資金も動かさない。
        const cost = devCost(f);
        if(claimed && f.gold < cost){
          say(f, `資金が足りず、領土は広げられなかった（必要${cost}・人口+${gain}）。`);
        }else if(claimed){
          f.territory = f.territory || [];
          f.territory.push(claimed);
          f.gold -= cost;
          say(f, `荒野を開拓し、座標(${claimed.x},${claimed.y})を新たな領土とした（人口+${gain}${cost>0 ? `・資金-${cost}` : ''}）。`, 'g');
        }else if(frontier.length > 0){
          say(f, `開拓を試みたが、周囲はすべて他国の領土に囲まれていた（人口+${gain}）。`);
        }else{
          say(f, `荒野を開拓した（人口+${gain}）。`, 'g');
        }
      }));

    }else if(action === 'train'){
      plan.steps.push(selfStep((f)=>{
        if(f.gold >= 5){
          const gain = rand(4,8);
          f.gold -= 5; f.military += gain;
          say(f, `資金を投じて兵を鍛え、兵力が ${gain} 増えた。`, 'g');
        }else{
          const gain = rand(1,3);
          f.military += gain;
          say(f, `資金が乏しく、思うように訓練できなかった（兵力+${gain}）。`);
        }
      }));

    }else if(action === 'trade'){
      const gain = rand(5,12);
      plan.steps.push(selfStep((f)=>{
        f.gold += gain;
        say(f, `交易により、資金が ${gain} 増えた。`, 'g');
      }));

    }else if(action === 'scout'){
      // 偵察先の選択にも、画面を描いた時点の古い一覧(state.allVillages)は使わない（D4）。
      // 選んだ相手の中身は、行動の直前に取り直す。
      const cands = (await listAllVillages()).filter(o => o.id !== vid);
      let t = null;
      if(cands.length > 0){
        const pick = cands[Math.floor(Math.random()*cands.length)];
        try{ t = await fetchVillage(pick.id); }
        catch(e){ console.warn('scout: could not read target', pick.id, e); }
      }
      if(cands.length === 0){
        plan.steps.push(selfStep((f)=>{ say(f, '偵察したが、他国は見つからなかった。'); }));
      }else if(!t){
        plan.steps.push(selfStep((f)=>{ say(f, '偵察を試みたが、対象の情報を取得できなかった。'); }));
      }else{
        // 相手には「偵察された」という履歴を1行足すだけ（差分適用）。これは付け足しの通知なので、
        // 失敗しても偵察そのものは成立させる。
        plan.steps.push(async ()=>{
          const r = await updateVillage(t.id, (g)=>{ addLog(g, `${dispNameRaw(g, me)} に偵察された。`, 'r'); });
          if(!r.ok) console.warn('scout: could not notify target', t.id, r.reason);
          return true;
        });
        plan.steps.push(selfStep((f)=>{
          f.stats = f.stats || {};
          f.stats.scoutCount = (f.stats.scoutCount||0) + 1;
          say(f, `${dispNameRaw(f,t)} を偵察した。人口${t.population}／兵力${t.military}／資金${t.gold}。`);
        }));
      }

    }else if(action === 'invade'){
      let t = null;
      if(targetId){
        try{ t = await fetchVillage(targetId); }
        catch(e){ console.warn('invade: could not read target', targetId, e); }
      }
      if(!t){
        plan.steps.push(selfStep((f)=>{ say(f, '攻め入る先が見つからなかった（データを取得できませんでした）。'); }));
      }else{
        // 勝敗は「いま取り直した」双方の値で決める。実際の増減は保存直前の最新の記録に対して
        // 差分で適用し、相手の資金が足りなければ奪える額もその分だけ減らす。
        const atk = me.military + rand(0,5);
        const def = t.military + rand(0,5);
        let actual = 0; // 実際に移動した資金
        let captured = null; // 勝利時に奪った領土マス（B2）。①で決まり、②で攻め手に足す
        if(atk > def){
          const want = Math.min(t.gold, rand(5,15));
          const milLoss = rand(1,4);
          plan.steps.push(targetStep(t.id, (g)=>{          // ① 奪われる側を先に減らす
            actual = Math.min(g.gold, want);
            g.gold -= actual;
            g.military = Math.max(0, g.military - milLoss);
            // 領土を1マス奪われる（首都は除く）。保存直前の最新の領土から選ぶ。
            captured = pickCapturableTile(g);
            if(captured){
              g.territory = g.territory.filter(tt => !(tt.x === captured.x && tt.y === captured.y));
            }
            const lost = captured ? `${actual} の資金と座標(${captured.x},${captured.y})の領土` : `${actual} の資金`;
            addLog(g, `${dispNameRaw(g,me)} に攻め込まれ、敗れた。${lost}を奪われた。`, 'r');
          }));
          plan.steps.push(selfStep((f)=>{                  // ② 実際に奪えた額だけ攻め手に足す
            f.stats = f.stats || {};
            if(plan.targetMissing){
              say(f, `${dispNameRaw(f,t)} に攻め込もうとしたが、すでにその国は無くなっていた。`);
              return;
            }
            f.gold += actual;
            if(captured){
              f.territory = f.territory || [];
              if(!f.territory.some(tt => tt.x === captured.x && tt.y === captured.y)) f.territory.push(captured);
            }
            f.stats.invadeWins = (f.stats.invadeWins||0) + 1;
            const spoils = captured ? `${actual} の資金と座標(${captured.x},${captured.y})の領土` : `${actual} の資金`;
            say(f, `${dispNameRaw(f,t)} に攻め込み、勝利した。${spoils}を得た。`, 'g');
          }));
        }else{
          const want = Math.min(me.gold, rand(3,10));
          const milLoss = rand(1,4);
          plan.steps.push(selfStep((f)=>{                  // ① 失う側（自国）を先に減らす
            actual = Math.min(f.gold, want);
            f.gold -= actual;
            f.military = Math.max(0, f.military - milLoss);
            f.stats = f.stats || {};
            f.stats.invadeLosses = (f.stats.invadeLosses||0) + 1;
            say(f, `${dispNameRaw(f,t)} に攻め込んだが、敗れた。${actual} の資金を失った。`, 'r');
          }));
          plan.steps.push(targetStep(t.id, (g)=>{          // ② 実際に失った額だけ相手に足す
            g.gold += actual;
            addLog(g, `${dispNameRaw(g,me)} に攻め込まれたが、撃退した。`, 'g');
          }));
        }
      }

    }else if(action === 'reclaim'){
      // 廃墟（14日以上未行動）となった国の領土・資金を接収する。
      let t = null;
      if(targetId){
        try{ t = await fetchVillage(targetId); }
        catch(e){ console.warn('reclaim: could not read target', targetId, e); }
      }
      if(!t){
        plan.steps.push(selfStep((f)=>{ say(f, '接収を試みたが、対象のデータを取得できなかった。'); }));
      }else if((Date.now() - lastActiveAt(t)) <= ABANDON_MS){
        plan.steps.push(selfStep((f)=>{ say(f, `${dispNameRaw(f,t)}は既に活動を再開していたため、接収できなかった。`); }));
      }else{
        // ① 削除の直前にもう一度読み直し、まだ廃墟のままなら削除する（読み直した内容を接収の元データにする）
        plan.steps.push(async ()=>{
          let cur;
          try{ cur = await fetchVillage(t.id); }
          catch(e){ console.warn('reclaim: could not re-read target', t.id, e); return false; }
          if(!cur){ plan.reclaimResult = 'gone'; return true; }
          if((Date.now() - lastActiveAt(cur)) <= ABANDON_MS){ plan.reclaimResult = 'active'; return true; }
          if(!(await deleteVillage(cur.id))) return false;
          plan.snap = cur;
          plan.reclaimResult = 'ok';
          return true;
        });
        // ② 自国に領土と資金を足す（領土の重複判定は従来どおり）
        plan.steps.push(selfStep((f)=>{
          f.stats = f.stats || {};
          if(plan.reclaimResult === 'gone'){
            say(f, `${dispNameRaw(f,t)}は、すでに他の誰かに接収されていた。`);
            return;
          }
          if(plan.reclaimResult === 'active'){
            say(f, `${dispNameRaw(f,t)}は既に活動を再開していたため、接収できなかった。`);
            return;
          }
          const snap = plan.snap;
          const gained = (snap.territory || []).length;
          const gotGold = snap.gold || 0;
          f.territory = f.territory || [];
          const owned = new Set(f.territory.map(tt=>tt.x+','+tt.y));
          for(const tile of (snap.territory||[])){
            const key = tile.x+','+tile.y;
            if(!owned.has(key)){ f.territory.push(tile); owned.add(key); }
          }
          f.gold += gotGold;
          f.stats.reclaimCount = (f.stats.reclaimCount||0) + 1;
          say(f, `荒廃した${dispNameRaw(f,snap)}を接収し、${gained}マスの領土と資金${gotGold}を得た。`, 'g');
        }));
      }

    }else{
      return { text:'その行動は実行できません。', cls:'r', village: me };
    }

    return await execPlan(plan, 0);
  }

  async function init(){
    bumpVisitorCounter();
    loadSiteSince();
    try{
      const r = await storage.get('koku-kiriban-hit', false);
      deviceKiribanHit = !!(r && r.value);
    }catch(e){}

    if(isLocalMode){
      const note = document.getElementById('localModeNote');
      if(note){
        note.innerHTML = '<span class="localnote">◆ローカルモードで動作中：データはこの端末のブラウザ内にのみ保存されます◆</span><br>';
      }
    }

    await migrateOldSingleAccount();

    const currentId = await getCurrentId();
    if(currentId){
      try{
        const v = await fetchVillage(currentId);
        if(v){
          await addMyId(currentId); // 一覧への登録漏れがあれば自己修復しておく
          await enterGame(v);
        }else{
          // idはあるがデータが本当に見つからない場合のみ、明示的な確認を出す
          await renderDataMissing(currentId);
        }
      }catch(e){
        // 読み込みが（リトライしても）失敗した場合は、既存の国を消さないよう
        // ここでは絶対に建国フォームへ進めない
        renderLoadError();
      }
      return;
    }

    // 選択中の国は無いが、この端末に作った国があればホーム画面から選ばせる
    const ids = await getMyIds();
    if(ids.length > 0){
      await renderHome();
    }else{
      await renderFoundingForm();
    }
  }

  init();
})();
