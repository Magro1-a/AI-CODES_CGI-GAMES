(function(){

  // =====================================================================
  // 物語データ
  // ---------------------------------------------------------------------
  //   'auto'      : 常に解放済み（第1章など）
  //   'score'     : ゲーム側の国力(score)がしきい値以上で自動解放
  //   'passphrase': 文字列を入力して照合する（現時点では平文比較のダミー。）
  // =====================================================================
  const STORY = {
    title: '灯火異聞',
    eyebrow: 'CLASSIFIED ARCHIVE',
    desc: '国盗りの陰で語られなかった、もうひとつの記録。',
    acts: [
      {
        id: 'act1',
        num: 'Act Ⅰ',
        title: '灰の使者',
        sub: '仮稿：ここにAct Ⅰの世界観・発端となる事件の紹介文が入る予定。',
        chapters: [
          {
            id: 'a1c0',
            num: '序章',
            title: '到着',
            unlock: { type: 'auto' },
            sections: [
              { text: '風の匂いが、変わっていた。\n\n昨夜遅く、早馬が一頭、ガレド砦の門をくぐった。運ばれてきたのは、本国から策士が一人差し向けられる、というだけの報せだった。名も、用向きも記されていない。それだけの報せに、砦は妙に静まり返った。\n\n翌日の昼過ぎ、馬車が一台、砦門の前で止まった。降りてきたのは、痩せた男だった。年の頃は四十過ぎ。半月にわたる長旅の埃をかぶり、目の下には隠しようのない隈ができている。\n\n石段を降りるとき、わずかに足を滑らせた。とっさに馬車の縁をつかんで堪えたが、出迎えの列の何人かは、それを見ていた。取り繕うように咳払いをひとつ挟んでから、男は名乗った。\n\n「アンドロタリスと申します」\n\nそう名乗ると、柔らかく笑った。作り笑いだと、自分でも分かっている。旅の疲れで、いつもより表情の作りが硬いのが、鏡もないのに分かった。\n\n門をくぐりながら、目だけは習慣で動いていた。門柱の漆喰が欠けている。詰所の前に積まれた木箱。荷札の色が新しい。届いたばかりの補給物資だ。ならば、この砦の兵糧はそう心配するほどではない。そう判断しかけたところで、ふと手を止めた。木箱の数にしては、荷を運び込んだはずの轍が、あまりに少ない。\n\n考えを最後まで詰める前に、案内の門番が「こちらへ」と促した。疲れた頭は、その続きを追いかけるのをやめてしまった。あとで思い出せばいい。そう自分に言い聞かせたが、長旅のあとに限って、そういう「あとで」は大抵忘れられることを、彼自身よく知っていた。\n\n以前にも、似たような見立てで足をすくわれたことがある。豊かに見えた土地が、実際には底を突いていた。あの失敗を思い出すたび、今度こそ同じ轍は踏むまいと思うのだが、思うようにいった試しは、あまりない。\n\n「現地の実情を見極め、必要な手を打て」\n\n本国から渡される命令は、いつも同じ文句だった。数えるのをやめて久しい。行く先々で似たような歓迎を受け、似たような沈黙に迎えられ、それでも結果だけを問われてきた。\n\n門番の一人が、案内を買って出た。会釈だけを返し、アンドロタリスは歩き出す。砦の空気には、土と錆と、獣の匂いが混じっていた。しばらく雨が降っていないのだろう、手が乾燥している。\n\n石畳には、荷車の轍が深く残っている。だが、それは詰所の裏手までしか続いていない。歩みが、わずかに遅くなった。\n\n門をくぐる。まだ何も始まってはいない。それでも何か、ひとつ見落としている。そんな予感だけが、うなじに冷たく張りついている。' }
            ]
          },
          {
            id: 'a1c1',
            num: '第一章',
            title: '（仮題）未定',
            unlock: { type: 'auto' },
            skipSequenceGate: true, // 序章を読んでいなくても第一章から読める
            sections: [
              { text: '案内の門番は、名を明かさなかった。\n\n尋ねれば答えるのだろうが、そこまでする気になれない。長旅の疲れが、そういう些事を後回しにさせる。歩調はちょうどよく、急かしも待たせもしない。案内役として、場数を踏んでいるのが分かった。\n\n「こちらは兵糧庫です。あちらが詰所。井戸はこの先を右に」\n\n無駄のない説明だった。聞けば答える、それだけの距離感が、今はかえって楽だった。世間話も、へつらいもない。\n\n「長くこの砦に?」\n\n何気ない調子で尋ねる。相手の呼吸を崩さない程度の問いを、当たり前の顔で差し込む。\n\n「三年ほどです」\n\n「それは長い」\n\n三年もいれば、砦のことは隅々まで知っているはずだ。案内役として、これ以上の人選もない。\n\n歩きながら、聞いてもいないことを口にした。\n\n「この辺りは、案外静かですね」\n\n社交辞令のつもりだった。言った端から、しまったと思う。旅の疲れで、口が普段より軽い。\n\n門番は、小さく頷いただけだった。\n\n「静かなのが、一番です」\n\n短い返事だった。ただの相槌にしては、間の置き方が妙に重い。疲れた頭では、それが気のせいなのか判別がつかない。\n\n「そうですね」\n\n当たり障りのない相槌を返し、アンドロタリスは口を閉じた。今は余計なことを言わない方がいい——分かっていながら、悔やんだ端から、もう次の言葉を探している。\n\nその癖だけは、何年経っても抜けない。' },
              { text: '砦の奥、詰所よりもさらに一段高い場所に、指揮官の詰める棟があった。石造りの壁は他の建物より新しく、継ぎ目にはまだ乾ききらない漆喰の跡が残っている。案内の門番は、その扉の前で足を止めた。\n\n「こちらが、砦を預かる方の——」\n\n言いかけて、門番は扉に手をかけた。取り次ぎの兵が代わりに現れ、門番は持ち場に戻る。何十という砦で繰り返してきた、勝手知ったる段取りだ。\n\nだが、門番は扉を開けたまま、動かなかった。\n\n「どうぞ、中へ」\n\n促す声に不自然なところはない。むしろ、いつもの落ち着いた調子そのものだった。足元だけが、外に向かうでもなく、詰所へ帰るでもなく、扉の内側に半分踏み込んだままだ。\n\nアンドロタリスは会釈を返しながら、視線だけをわずかに動かした。取り次ぎの兵の姿がない。指揮官の私室にしては、出迎えの人数が少なすぎる。壁際の燭台は、蝋がまだ半分ほど残っていた。灯したばかりだ。\n\n「ここまでで結構です。お役目、感謝します」\n\n角を立てず、しかしはっきりと。三年勤めた門番なら、この程度の言い回しで汲むはずだった。\n\n門番は、一拍だけ間を置いた。ほんのわずかな間だが、旅の疲れた頭にも引っかかる長さではあった。視線が一瞬、部屋の奥——書棚のあたりに動いた。\n\n「……失礼しました」\n\n一礼して離れる足取りは、来たときより心なしか重い。廊下を戻る背中は、詰所の方角ではなく、いったん違う方向へ折れた。\n\n書棚に向いた視線。整えられたばかりの部屋。方向を違えた足取り。三年もこの砦にいる門番が、取り次ぎの作法を知らないはずがない。知っていて、なお離れがたかったのだとすれば、扉の内側にはまだ何か——聞かれたくない話か、聞かせておきたい誰かが。\n\n考えを打ち切り、扉の奥へと足を踏み入れた。' },
              { text: '扉の奥は、思いのほか質素な部屋だった。地図の広げられた卓、壁際の書棚、それだけ。指揮官と思しき男は、卓に肘をついたまま顔を上げた。歓迎の口上も、居住まいを正す気配もなかった。\n\n「ああ、来たか」\n\n名乗りもせず、席を勧めるでもない。視線だけをアンドロタリスに向けている。\n\n「アンドロタリスと申します。本国より遣わされ——」\n\n「用件は」\n\n自己紹介を遮って、短く問いが返ってきた。険のある声ではない。儀礼を挟む余地を、最初から持たない口調だった。\n\n「この砦の実情を見極めよ、との命を受けております」\n\n「調査、ね」\n\n指揮官は卓上の書類に目を落としたまま、ふん、と鼻を鳴らした。この手の来客を何度も相手にしてきた者の、慣れた素っ気なさだった。\n\n「好きにするといい。通行の証は出しておく。どこでも見て回れ」\n\nあまりにあっさりとした返答だった。渋られることも、遠回しに拒まれることも覚悟していた。その心づもりの方が、無駄になった。\n\n「……よろしいのですか。かなり広範に見て回ることになりますが」\n\n「構わん」\n\n指揮官はようやく顔を上げ、初めてまともにこちらを見た。値踏みするような目ではなかった。かといって、歓迎しているふうでもない。\n\n「見せて困るものは、端からここには置いていない」\n\n言い終えると、また書類に目を戻した。会話は終わりだ、という合図だった。\n\nその言葉を、そのまま受け取っていいものか。アンドロタリスは一礼して部屋を辞しながら、顔には出さずに考えていた。\n\n見せて困るものはない——なるほど、都合のいい言葉だ。困るものが、最初からここになければの話だが。' }
            ]
          },
          {
            id: 'a1c2',
            num: '第二章',
            title: '（仮題）密書',
            unlock: { type: 'score', value: 120 },
            sections: [
              { text: 'ここに第二章の本文が入ります。ダミーテキストです。' }
            ]
          },
          {
            id: 'a1c3',
            num: '第三章',
            title: '（仮題）約定',
            unlock: { type: 'passphrase', hash: '24d7f2d40c235f85c4982395a044bbe1f6d8aa82e67f74bf98439c468e7b8004', hint: '「Mneaxgfq xmwq」' },
            sections: [
              { text: 'ここに第三章の本文が入ります。ダミーテキストです。' }
            ]
          }
        ]
      },
      {
        id: 'act2',
        num: 'Act Ⅱ',
        title: '（未定）',
        sub: '仮稿：Act Ⅱは未着手。',
        chapters: [
          {
            id: 'a2c1',
            num: '第一章',
            title: '（仮題・未執筆）',
            unlock: { type: 'passphrase', cipherHash: '7e61134a352723be0cd1ddb89f30aa3778d1d98911649def9c6b6c1638918c90', hint: '「000　0000　00　0010　1　　0　010　111　010　1011　1011　0001　1000　01」' },
            sections: [
              { text: '（未執筆）' }
            ]
          }
        ]
      }
    ]
  };

  // 読む順の一本道リスト（Act跨ぎもこの並び順のまま連結）。
  // 「前の章」を判定するために使う。
  const FLAT_CHAPTERS = [];
  STORY.acts.forEach(act => {
    act.chapters.forEach(ch => FLAT_CHAPTERS.push(ch));
  });
  function prevChapterOf(chapter){
    const idx = FLAT_CHAPTERS.findIndex(c => c.id === chapter.id);
    return idx > 0 ? FLAT_CHAPTERS[idx-1] : null;
  }

  // =====================================================================
  // 進行状況の保存（読了フラグ・解放済みフラグ）
  // ゲーム側と同じ storage アダプタ方式。window.storage が無ければ
  // localStorage で代用する（story専用の名前空間を切る）。
  // =====================================================================
  // 本編（Script.js）のローカルフォールバックと同じ名前空間・キー形式を使う。
  // こうしておくことで、window.storageが無い環境（.htmlを直接開いた場合）でも
  // 本編側が保存した国データ（koku-my-id / koku:id など）をそのまま読める。
  let isLocalMode = false;
  const storage = (function(){
    if(window.storage && typeof window.storage.get === 'function'){
      return window.storage;
    }
    isLocalMode = true;
    const NS = 'tokoku_local_v1:'; // 本編Script.jsと同一のNS
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
      }
    };
  })();

  const PROGRESS_KEY = 'story_progress_v1';
  let progress = { read:{}, unlocked:{} }; // read[chapterId]=true, unlocked[chapterId]=true

  async function loadProgress(){
    try{
      const r = await storage.get(PROGRESS_KEY, false);
      if(r && r.value){ progress = JSON.parse(r.value); }
    }catch(e){ /* 読めなければ初期値のまま */ }
    progress.read = progress.read || {};
    progress.unlocked = progress.unlocked || {};
  }
  async function saveProgress(){
    try{ await storage.set(PROGRESS_KEY, JSON.stringify(progress), false); }catch(e){}
  }

  // =====================================================================
  // 表示設定（テーマ・文字サイズ）
  // =====================================================================
  const THEME_KEY = 'story_theme_v1';
  const FONTSIZE_KEY = 'story_fontsize_v1';
  const FONT_SIZES = ['sm','md','lg','xl'];
  const FONT_SIZE_LABELS = { sm:'小', md:'標準', lg:'大', xl:'特大' };
  let currentTheme = 'dark';
  let currentFontSize = 'md';

  function applyDisplaySettings(){
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.setAttribute('data-fontsize', currentFontSize);
  }

  async function loadDisplaySettings(){
    try{
      const t = await storage.get(THEME_KEY, false);
      if(t && (t.value === 'dark' || t.value === 'light')) currentTheme = t.value;
    }catch(e){}
    try{
      const f = await storage.get(FONTSIZE_KEY, false);
      if(f && FONT_SIZES.includes(f.value)) currentFontSize = f.value;
    }catch(e){}
    applyDisplaySettings();
  }

  async function setTheme(theme){
    currentTheme = theme;
    applyDisplaySettings();
    try{ await storage.set(THEME_KEY, theme, false); }catch(e){}
    renderSettingsBar();
  }

  async function setFontSize(size){
    currentFontSize = size;
    applyDisplaySettings();
    try{ await storage.set(FONTSIZE_KEY, size, false); }catch(e){}
    renderSettingsBar();
  }

  function settingsBarHtml(){
    return `
      <div class="settings-bar">
        <div class="seg-group" id="fontSizeGroup">
          ${FONT_SIZES.map(s=>`<button type="button" data-fontsize-btn="${s}" class="${currentFontSize===s?'active':''}">${FONT_SIZE_LABELS[s]}</button>`).join('')}
        </div>
        <button type="button" class="theme-toggle-btn" id="themeToggleBtn" title="表示を切り替える">${currentTheme==='dark' ? '☀' : '🌙'}</button>
      </div>
    `;
  }

  function bindSettingsBar(){
    const themeBtn = document.getElementById('themeToggleBtn');
    if(themeBtn) themeBtn.addEventListener('click', ()=> setTheme(currentTheme==='dark' ? 'light' : 'dark'));
    document.querySelectorAll('[data-fontsize-btn]').forEach(btn=>{
      btn.addEventListener('click', ()=> setFontSize(btn.getAttribute('data-fontsize-btn')));
    });
  }

  // 設定バーだけを差し替える（一覧・リーダーどちらの画面でも呼べる）
  function renderSettingsBar(){
    const holder = rootEl.querySelector('.settings-bar');
    if(!holder) return;
    holder.outerHTML = settingsBarHtml();
    bindSettingsBar();
  }

  // =====================================================================
  // ゲーム側データとの連携（国力しきい値のダミー判定に使う）
  // ゲームのプレイヤー国データを読む。取得できない場合はscore=0扱いにして、
  // score系の章はすべてロックされたままになる（安全側に倒す）。
  // =====================================================================
  let cachedScore = 0;
  async function loadPlayerScore(){
    try{
      const currentIdRes = await storage.get('koku-my-id', false);
      const currentId = currentIdRes ? currentIdRes.value : null;
      if(!currentId){ cachedScore = 0; return; }
      const vRes = await storage.get('koku:' + currentId, true);
      if(!vRes || !vRes.value){ cachedScore = 0; return; }
      const v = JSON.parse(vRes.value);
      cachedScore = (v.population||0) + (v.military||0)*3 + (v.gold||0);
    }catch(e){
      cachedScore = 0;
    }
  }

  // =====================================================================
  // 解放判定
  // =====================================================================
  function sequenceSatisfied(chapter){
    if(chapter.skipSequenceGate) return true; // 前章の読了を必須としない章（例：序章の後に置かれる第一章）
    const prev = prevChapterOf(chapter);
    if(!prev) return true; // 最初の章には前提章がない
    return !!progress.read[prev.id]; // 前の章を最後まで読んでいるか
  }

  function isUnlocked(chapter){
    if(progress.unlocked[chapter.id]) return true;
    if(!sequenceSatisfied(chapter)) return false; // 前の章を読破していなければ問答無用でロック
    if(chapter.unlock.type === 'auto') return true;
    if(chapter.unlock.type === 'score') return cachedScore >= chapter.unlock.value;
    return false; // passphrase等は明示的な解放操作が必要
  }

  // crypto.subtleはfile://で直接開いた場合にブラウザによって使えないことがあるため、
  // 依存しない軽量な純JS SHA-256実装を使う。
  function sha256Hex(str){
    function rrot(x,n){ return (x>>>n)|(x<<(32-n)); }
    const K = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];
    let h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const bytes = new TextEncoder().encode(str);
    const bitLen = bytes.length * 8;
    const withOne = new Uint8Array(((bytes.length + 9 + 63) & ~63));
    withOne.set(bytes);
    withOne[bytes.length] = 0x80;
    const dv = new DataView(withOne.buffer);
    dv.setUint32(withOne.length - 4, bitLen >>> 0);
    dv.setUint32(withOne.length - 8, Math.floor(bitLen / 4294967296));
    const w = new Uint32Array(64);
    for(let off=0; off<withOne.length; off+=64){
      for(let i=0;i<16;i++) w[i] = dv.getUint32(off + i*4);
      for(let i=16;i<64;i++){
        const s0 = rrot(w[i-15],7) ^ rrot(w[i-15],18) ^ (w[i-15]>>>3);
        const s1 = rrot(w[i-2],17) ^ rrot(w[i-2],19) ^ (w[i-2]>>>10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0;
      }
      let [a,b,c,d,e,f,g,hh] = h;
      for(let i=0;i<64;i++){
        const S1 = rrot(e,6) ^ rrot(e,11) ^ rrot(e,25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
        const S0 = rrot(a,2) ^ rrot(a,13) ^ rrot(a,22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        hh=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
      }
      h[0]=(h[0]+a)>>>0; h[1]=(h[1]+b)>>>0; h[2]=(h[2]+c)>>>0; h[3]=(h[3]+d)>>>0;
      h[4]=(h[4]+e)>>>0; h[5]=(h[5]+f)>>>0; h[6]=(h[6]+g)>>>0; h[7]=(h[7]+hh)>>>0;
    }
    return h.map(x => x.toString(16).padStart(8,'0')).join('');
  }

  // 固定鍵で1バイトずつXORしたのち、その結果をさらにSHA-256でハッシュ化する。
  // XOR単体は可逆で読み替えが容易だが、最終的にハッシュを通すことで、ソース上の値から平文へ逆算する数学的な手段がなくなる
  const CIPHER_KEY = 'HAI';
  function xorHex(str, key){
    const bytes = new TextEncoder().encode(str);
    const keyBytes = new TextEncoder().encode(key);
    let out = '';
    for(let i=0;i<bytes.length;i++){
      const x = bytes[i] ^ keyBytes[i % keyBytes.length];
      out += x.toString(16).padStart(2,'0');
    }
    return out;
  }
  function cipherHashOf(str){
    return sha256Hex(xorHex(str, CIPHER_KEY));
  }

  function tryPassphrase(chapter, input){
    const norm = String(input||'').trim().toUpperCase();
    if(norm.length === 0) return false;
    // unlock.cipherHash があれば XOR→SHA256 の鍵付きハッシュ方式で照合。
    if(chapter.unlock.cipherHash){
      return cipherHashOf(norm) === chapter.unlock.cipherHash;
    }
    // それ以外（従来章）は SHA-256 ハッシュのみで照合。
    // 入力側を同じ手順（trim→大文字化→SHA-256）で変換して比較する。
    return sha256Hex(norm) === chapter.unlock.hash;
  }

  // =====================================================================
  // 描画
  // =====================================================================
  const rootEl = document.getElementById('storyRoot');
  let currentReader = null; // { chapter, sectionIndex }

  function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function chapterMetaText(chapter, unlocked){
    if(!unlocked){
      if(!sequenceSatisfied(chapter)){
        return '封印中 ―― 前の章を読み終えると開示される';
      }
      if(chapter.unlock.type === 'score'){
        return `封印中 ―― 国力 ${chapter.unlock.value} 以上で解ける`;
      }
      if(chapter.unlock.type === 'passphrase'){
        return '封印中 ―― 合言葉を要する';
      }
      return '封印中';
    }
    const readCount = progress.read[chapter.id] ? '既読' : '未読';
    return `${esc(chapter.num)} ${chapter.sections.length}節 ・ ${readCount}`;
  }

  function render(){
    if(currentReader){ renderReaderPage(); return; }

    let html = `
      <div class="story-header">
        <a href="Index.html" class="back-link">◀ 国へ戻る</a>
        ${settingsBarHtml()}
        <div class="story-eyebrow">${esc(STORY.eyebrow)}</div>
        <h1 class="story-title">${esc(STORY.title)}</h1>
        <div class="story-desc">${esc(STORY.desc)}</div>
      </div>
    `;

    STORY.acts.forEach(act => {
      html += `
        <div class="act-block">
          <div class="act-head">
            <span class="act-num">${esc(act.num)}</span>
            <span class="act-title">${esc(act.title)}</span>
          </div>
          <div class="act-sub">${esc(act.sub)}</div>
          <div class="chapter-list">
      `;
      act.chapters.forEach(chapter => {
        const unlocked = isUnlocked(chapter);
        const read = !!progress.read[chapter.id];
        html += `
          <div class="chapter ${unlocked?'':'locked'} ${read?'read':''}" data-chapter="${chapter.id}">
            <div class="chapter-row" data-open="${unlocked ? chapter.id : ''}">
              <div class="chapter-seal">${unlocked ? (read?'済':(chapter.num.match(/[一二三四五六七八九十]+/)||['●'])[0]) : '封'}</div>
              <div class="chapter-body">
                <div class="chapter-name">${unlocked ? esc(chapter.title) : '（封じられた章）'}</div>
                <div class="chapter-meta">${chapterMetaText(chapter, unlocked)}</div>
              </div>
              <div class="chapter-arrow">▶</div>
            </div>
            ${(!unlocked && sequenceSatisfied(chapter)) ? `<button type="button" class="unlock-trigger" data-unlock="${chapter.id}">封を確かめる…</button>` : ''}
          </div>
        `;
      });
      html += `</div></div>`;
    });

    html += `
      <div class="story-footer-note">◆この記録は語り手の視点により再構成されたものである◆</div>
    `;

    rootEl.innerHTML = html;
    bindListEvents();
    bindSettingsBar();
  }

  function bindListEvents(){
    rootEl.querySelectorAll('[data-open]').forEach(el=>{
      const id = el.getAttribute('data-open');
      if(!id) return;
      el.addEventListener('click', ()=> openReader(id, 0));
    });
    rootEl.querySelectorAll('[data-unlock]').forEach(el=>{
      el.addEventListener('click', ()=> openUnlockModal(el.getAttribute('data-unlock')));
    });
  }

  function findChapter(chapterId){
    for(const act of STORY.acts){
      for(const ch of act.chapters){
        if(ch.id === chapterId) return { act, chapter: ch };
      }
    }
    return null;
  }

  // ---------------- リーダー ----------------
  function openReader(chapterId, sectionIndex){
    const found = findChapter(chapterId);
    if(!found) return;
    currentReader = { chapter: found.chapter, act: found.act, sectionIndex: sectionIndex||0 };
    renderReaderPage();
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  function closeReader(){
    currentReader = null;
    render();
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  function renderReaderPage(){
    if(!currentReader) return;
    const { chapter, sectionIndex } = currentReader;
    const total = chapter.sections.length;
    const sec = chapter.sections[sectionIndex];

    // 最後の節まで到達したら、その章を「読破」として記録する
    // （＝次の章／次のActの解放条件に使われる）
    if(sectionIndex >= total-1 && !progress.read[chapter.id]){
      progress.read[chapter.id] = true;
      saveProgress();
    }

    rootEl.innerHTML = `
      <div class="story-header">
        <a href="Index.html" class="back-link">◀ 国へ戻る</a>
        ${settingsBarHtml()}
        <div class="story-eyebrow">${esc(STORY.eyebrow)}</div>
      </div>
      <div class="reader active">
        <div class="reader-nav">
          <button type="button" class="close-reader" id="closeReaderBtn">◀ 目次へ</button>
          <span class="reader-pos">${sectionIndex+1} / ${total}</span>
        </div>
        <div class="reader-chapter-title">${esc(chapter.title)}</div>
        <div class="reader-chapter-sub">${esc(chapter.num)}</div>
        <div class="section-block">
          <span class="section-num">${esc(chapter.num)} §${String(sectionIndex+1).padStart(2,'0')}</span>
          ${sec.text.split(/\n\s*\n/).map(para => `<p>${esc(para)}</p>`).join('')}
        </div>
        <div class="reader-footer">
          <button type="button" id="prevSecBtn" ${sectionIndex===0?'disabled':''}>◀ 前の節</button>
          <button type="button" id="nextSecBtn" ${sectionIndex>=total-1?'disabled':''}>次の節 ▶</button>
        </div>
      </div>
    `;
    document.getElementById('closeReaderBtn').addEventListener('click', closeReader);
    bindSettingsBar();
    const prevBtn = document.getElementById('prevSecBtn');
    const nextBtn = document.getElementById('nextSecBtn');
    if(prevBtn) prevBtn.addEventListener('click', ()=>{ currentReader.sectionIndex--; renderReaderPage(); window.scrollTo({top:0,behavior:'smooth'}); });
    if(nextBtn) nextBtn.addEventListener('click', ()=>{ currentReader.sectionIndex++; renderReaderPage(); window.scrollTo({top:0,behavior:'smooth'}); });
  }

  // ---------------- 解放モーダル ----------------
  function openUnlockModal(chapterId){
    const found = findChapter(chapterId);
    if(!found) return;
    const chapter = found.chapter;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    if(chapter.unlock.type === 'passphrase'){
      overlay.innerHTML = `
        <div class="unlock-box">
          <h3>封印を解く</h3>
          <p class="hint">${chapter.unlock.hint ? 'ヒント：' + esc(chapter.unlock.hint) : '合言葉を入力せよ。'}</p>
          <input type="text" id="unlockInput" autocomplete="off" placeholder="合言葉">
          <div class="unlock-actions">
            <button type="button" id="unlockCancel">やめる</button>
            <button type="button" id="unlockSubmit" class="primary">試す</button>
          </div>
          <div class="unlock-msg" id="unlockMsg"></div>
        </div>
      `;
    }else{
      const need = chapter.unlock.type === 'score' ? `国力 ${chapter.unlock.value} 以上` : '不明な条件';
      overlay.innerHTML = `
        <div class="unlock-box">
          <h3>封印されている</h3>
          <p class="hint">この章はまだ読めない。必要な条件：${esc(need)}<br>（現在の国力：${cachedScore}）</p>
          <div class="unlock-actions">
            <button type="button" id="unlockCancel" class="primary">閉じる</button>
          </div>
        </div>
      `;
    }

    document.body.appendChild(overlay);
    const cancelBtn = overlay.querySelector('#unlockCancel');
    if(cancelBtn) cancelBtn.addEventListener('click', ()=> overlay.remove());
    overlay.addEventListener('click', (e)=>{ if(e.target===overlay) overlay.remove(); });

    const submitBtn = overlay.querySelector('#unlockSubmit');
    if(submitBtn){
      const doSubmit = async ()=>{
        const input = overlay.querySelector('#unlockInput');
        const msg = overlay.querySelector('#unlockMsg');
        if(tryPassphrase(chapter, input.value)){
          progress.unlocked[chapter.id] = true;
          await saveProgress();
          msg.textContent = '封印が解けた……';
          msg.className = 'unlock-msg ok';
          setTimeout(()=>{ overlay.remove(); render(); openReader(chapter.id, 0); }, 500);
        }else{
          msg.textContent = 'その言葉では封は解けない。';
          msg.className = 'unlock-msg err';
        }
      };
      submitBtn.addEventListener('click', doSubmit);
      const input = overlay.querySelector('#unlockInput');
      input.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSubmit(); });
      input.focus();
    }
  }

  // =====================================================================
  // 初期化
  // =====================================================================
  async function init(){
    await loadDisplaySettings();
    await loadProgress();
    await loadPlayerScore();
    render();
  }

  init();
})();
