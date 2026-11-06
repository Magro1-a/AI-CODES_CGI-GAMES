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
              { text: '早馬が一頭、ガレド砦の門をくぐったのは前の晩のことだった。閂を下ろす間際に駆け込んできた馬は口の端に白い泡をためていて、乗り手は水も飲まずに指揮所へ走ったという。運んできたのは書付が一枚きり。本国から策士が一人差し向けられる、とあるだけで、名前も、いつ着くのかも書かれていなかった。\n\n書付の中身は、その晩のうちに砦じゅうに知れ渡った。炊事場でも厩でも、人から人へ渡るたびに話は少しずつ大きくなって、どの兵舎も灯りを落とすのが早かった。翌朝の調練は掛け声がいつもより小さく、鍛冶場の槌音は昼前に一度止んだきり、戻ってこなかった。\n\n昼過ぎ、馬車が一台、砦門の前で止まった。\n\n降りてきたのは痩せた男だった。四十は過ぎているだろう。外套の襞には半月ぶんの埃が詰まり、目の下の隈は濃く、白目の端には赤い筋まで走っている。踏み台から石段へ足を移したところで、革の靴底が滑った。とっさに馬車の縁をつかんで転ぶのは免れたが、出迎えの列の何人かはその一部始終を見ていた。\n\n誰も笑わなかった。男は咳払いをひとつして、名乗った。\n\n「アンドロタリスと申します」\n\n笑顔をつくったつもりが、口の端だけが遅れて持ち上がった。自分でも作り笑いと分かる出来だった。おまけに足の裏がまだ揺れている。半月ぶんの揺れが体に残っていて、立っているのに、地面のほうが少し傾いているような気がした。\n\n半月のあいだに寝台で眠れたのは六晩だけで、あとは馬車の座席に背中を押しつけて夜を明かした。御者の老人は無口で、道中で聞いた言葉といえば、三日目の「尻に敷く布を買っておきなされ」くらいのものだ。買わなかったので、いま腰が痛い。砦が丘の上に見えてきたのは昼前で、聞いていたより小さかった。揺られながら考えた指揮官への挨拶は三通りあって、どれを使うかはまだ決めていない。\n\n出迎えは十人ばかりいた。並び方は揃っているのに、鎧の手入れはまちまちで、磨き込んだ胸当ての隣に、錆を布でこすっただけの肩当てを着けた男が立っている。列の端の若い兵は、こちらを見ないふりをして、目が合いそうになるたびに慌てて逸らすので、かえって目立った。\n\n門をくぐるあいだも、目があちこちへ動いた。新しい任地ではまず兵糧と水と出入口を見る。昔、上役に叩き込まれた順番で、いまは考えなくても目のほうが先に働く。門柱の漆喰は縦に剥げて、下の石が覗いていた。詰所の前には木箱が十四、二段に積んである。荷札の紙はまだ白く、届いたばかりの補給物資に見えた。この量なら当面、兵糧の心配はいらない。それだけで、今日の仕事の半分は済んだ気がした。\n\nあれだけの箱を荷車で入れたにしては、門から詰所の前までの地面に、車輪の跡がほとんどない。踏み固められた土は乾ききっていた。乾いた土なら、重い車が通っても跡は残らないのかもしれない。人足が担いで入れた、ということもあるだろう。いずれにせよ、兵糧のことで気を揉むのは、今日はもうやめにしたかった。\n\n気を取り直したところへ、出迎えの中から門番が一人、前に出た。\n\n「手が空いておりますので、ご案内します。こちらへ」\n\n断る理由はなかった。足はもう限界で、案内してくれるというなら誰でもありがたい。礼を言って、歩き出した。\n\n「現地の実情を見極め、必要な手を打て」。赴任のたびに渡される命令は、いつもこの一行だった。実情が何を指し、手がどこまで許されるのか、書いた本人にも分かっていないのではないかと思っている。前の任地では、出迎えるはずの書記官が先月のうちに夜逃げしていたと聞かされたのが、着いて三日目だった。それでも最後に問われるのは結果だけで、途中で何度頭を下げたかなど、誰も訊いてはくれない。\n\n砦の中は土と錆の匂いがして、その下に獣くささが沈んでいた。厩が近いのだろう。しばらく雨が降っていないのか、手の甲が粉をふいたようにかさついて、外套の袖が触れるたびにひりついた。\n\n中庭に入ると、足元が石畳に変わった。石の上に荷車の轍が二本、深く刻まれている。長い年月、重い荷を積んだ車輪が同じ筋を通ってきた跡だ。轍は詰所の裏手へ回り込んでいて、首を伸ばして追うと、裏の空き地の手前で、ふっつりと途切れていた。\n\n裏手、という言葉から、東の街道筋の町を思い出した。市場に麦袋が山と積まれているのを見て、これなら冬を越せると報告書に書いたことがある。山の裏が空樽ばかりだと分かったのは三日あとで、書き直した報告書が着いたときには、本国はもう、先の報告を信じて穀物の手配を取りやめたあとだった。\n\nあれとこれは別の話だ。\n\n「こちらです」\n\n少し先で、門番が待っていた。急かす声ではなかった。アンドロタリスは慌てて頭を下げ、小走りに追いついた。並んで歩きながら首の後ろを掻くと、爪の先に砂の粒が触れた。' }
            ]
          },
          {
            id: 'a1c1',
            num: '第一章',
            title: '（仮題）未定',
            unlock: { type: 'auto' },
            skipSequenceGate: true, // 序章を読んでいなくても第一章から読める
            sections: [
              { text: '門番は名乗らなかった。訊いてもよかったのだが、口を開くのが億劫で、そのまま後ろについて歩いた。こちらが息をつくと向こうも足を緩めてくれる。案内には慣れた様子だった。\n\n「こちらが兵糧庫です。あちらが詰所。井戸はこの先を右で」\n\n説明は短く、世間話は挟まないし、取り入ろうという気配もない。兵糧庫の間口を目で測っている自分に気づいて、やめた。今日は見ないと決めたのに。井戸の脇では兵が二人、桶を挟んで黙々と黒い小粒の豆を選り分けていて、通り過ぎるときこちらを見たが、手は止めなかった。釣瓶の縄は新しく、井戸端の石も濡れていて、水は枯れていない。それだけ確かめて目を離したところへ、炊事場のほうから煮豆の匂いが流れてきた。朝から口に入れたのは、御者に分けてもらった干し無花果が二つきりだった。\n\n「長くこの砦に?」\n\n軽く投げた問いに、返事は前を向いたまま返ってきた。\n\n「三年ほどです」\n「それは長い」\n\n社交辞令で言ったのに、言ってしまうと本当にそう思えてきた。三年もいれば、どの壁がどこで崩れかけているかまで頭に入っているだろう。案内を頼むなら、これ以上の相手はいない。いい人に当たった、と少し気が楽になった。\n\nしばらく歩くうちに、また口のほうが先に動いた。\n\n「この辺りは、案外静かですね」\n\n言った途端に後悔した。寝ていないと、いつもこうなる。昨日も宿の亭主に、頼まれもしないのにパンの焼き方について意見を述べて、妙な顔をされたばかりだ。\n\n門番は小さく頷いた。\n\n「静かなのが、一番です」\n\n答えるまでに、靴底が石を二度鳴らすほどの間があった。口の重い男なのだろう、と受け取った。\n\n「そうですね」\n\n当たり障りのない相槌を返して、口を閉じた。閉じたまま歩いたが、気詰まりに耐えかねて、結局また開いた。\n\n「夜は、冷えますか」\n「冷えます。毛布を余分に出すよう、言っておきます」\n「助かります」\n\n思ったより大きな声が出た。門番がちらりとこちらを見て、すぐ前に向き直った。\n\n「先に、指揮官殿にご挨拶をしたいのですが」\n\nそう言ってから、本当は一刻も早く横になりたかったことを思い出した。\n\n「承知しました。奥の棟です」\n\n門番はそれ以上は何も言わず、歩く向きを変えた。' },
              { text: '指揮官の詰める棟は、砦の一番奥、詰所よりもう一段高い場所にあった。石積みが他の建物よりはっきり新しく、継ぎ目には乾ききらない漆喰が白く盛り上がっている。廊下に入ると石灰の匂いが鼻の奥にきつかった。\n\n大抵の砦では、段取りは決まっている。案内の兵が扉を叩き、中から取り次ぎの兵が出てきて、案内は持ち場へ戻る。ここでもそうなるものと思っていた。\n\n「こちらが、砦を預かる方の——」\n\n言いかけたまま、門番は扉を叩かずに取っ手を引いた。取り次ぎの兵は出てこない。門番は扉を開け放して、そこに立っているだけだった。\n\n「どうぞ、中へ」\n\n声は落ち着いていた。右足は敷居の内側に入ったまま動かない。\n\nアンドロタリスは会釈を返しながら、部屋の中をのぞいた。指揮官の部屋だというのに、出迎えの者が一人もいない。壁際の燭台には火が入っていた。窓の細い棟だから、昼でも灯りは要る。蝋は根元まで白く、ほとんど減っていなかった。\n\n「ここまでで結構です。お役目、ご苦労さまでした」\n\n言ってから、偉そうな言い方をしたかと気になって、頭を下げ直した。顔を上げると、門番の目が部屋の奥の書棚のあたりから戻ってくるところだった。息を吸うほどの間があった。\n\n「……失礼しました」\n\n一礼して離れていく足音は、来たときより踵が強く石を打った。引き返すなら来た道のはずなのに、背中は途中の角を別のほうへ折れて、見えなくなった。持ち場は他にもあるのだろう。\n\n取り次ぎを通さないとは、ずいぶん気さくな砦だ。そう思いながら、開いている扉の枠を二度叩いた。開いているのに叩くのも妙な話だが、黙って入るよりはましだと思った。' },
              { text: '部屋は思っていたより質素だった。卓が一つ、広げた地図の四隅をインク壺と錫の水差しが押さえていて、壁際に書棚があるほかは、客のための椅子の一脚さえ置かれていない。地図は砦の周辺を描いたものに見えた。書き込みは細かそうだが、立っている場所からは読めない。\n\n卓の向こうの男が指揮官のはずだった。鎧は着けず、袖口の擦り切れた上衣姿で、書記ですと紹介されたら、そうかと思っただろう。肘をついたまま顔だけを上げて、歓迎の口上も、居住まいを正す素振りも見せなかった。\n\n「ああ、来たか」\n\n名乗りもしなければ、楽にしろとも言わない。目だけがこちらを向いている。\n\n「アンドロタリスと申します。本国より遣わされ——」\n「用件は」\n\n名乗りの途中で切られた。声に棘はなかったが、儀礼を挟む余地は最初からないらしい。\n\n「この砦の実情を見極めよ、との命を受けております」\n「調査、ね」\n\nふん、と鼻が鳴って、視線は卓上の書類へ戻っていった。本国の使いは見飽きているのかもしれない。錫の水差しが目に入り、喉が渇いていたことを思い出したが、勧められるはずもなかった。\n\n「好きにするといい。通行の証は出しておく。どこでも見て回れ」\n\n断られるものと思っていた。そうでなければ、のらりくらりと日延べされるか。半月の道中、考えていたのはそのことばかりで、挨拶も三通り用意してきたのに、どれも使いどころを失った。立ったまま、口の中に残った台詞を持て余した。\n\n「……よろしいのですか。かなり広く見て回ることになりますが」\n「構わん」\n\n指揮官はそこでようやく顔を上げ、初めてまともにこちらを見た。灰色の目だった。\n\n「見せて困るものは、端からここには置いていない」\n\n言い終えると、視線はまた書類に落ちた。ずいぶんな自信だ、と思った。話は終わりらしい。そのまま少し立っていたが、何も言われないので、一礼して下がった。\n\n出がけに書棚の前を通った。革の背表紙が二段、薄く埃をかぶって並んでいる。題字を読もうとしたが、薄暗くて読めなかった。\n\n廊下に出ると、門番の姿はどこにもなかった。礼を言い足そうにも、名前を聞いていない。顔を思い出そうとしたが、ずっと後ろを歩いていたせいで、浮かぶのは背中ばかりだった。宿舎の場所を訊いておけばよかった。毛布を余分に出してくれるという話だったが、その毛布がどこにあるのかも知らなかった。' }
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
      // 本編 Script.js の score() と同じ式にすること（領土×TERRITORY_SCORE を含む）。
      // 食い違うと「国力〇〇以上で解ける章」の判定が本編の国力表示とずれる。
      const TERRITORY_SCORE = 5;
      cachedScore = (v.population||0) + (v.military||0)*3 + (v.gold||0)
                  + (Array.isArray(v.territory) ? v.territory.length : 0) * TERRITORY_SCORE;
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
