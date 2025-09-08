// URLのGET値を取得する関数
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// GSAPライブラリを動的に読み込む関数
function loadGSAP() {
  return new Promise((resolve, reject) => {
    if (typeof gsap !== 'undefined') {
      resolve(gsap);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    script.onload = () => resolve(gsap);
    script.onerror = () => reject(new Error('GSAPの読み込みに失敗しました'));
    document.head.appendChild(script);
  });
}

// アニメーション画像のURL配列
const animeImageUrls = [
  './assets/images/member001.png',
  './assets/images/member002.png',
  './assets/images/member003.png',
  './assets/images/member004.png',
  './assets/images/member005.jpg' 
];

// ランダムな画像URLを取得する関数
function getRandomImageUrl() {
  const randomIndex = Math.floor(Math.random() * animeImageUrls.length);
  return animeImageUrls[randomIndex];
}

// アニメーション用のHTML要素を作成する関数
function createAnimationElements() {
  // 既に存在する場合は削除
  const existingContainer = document.getElementById("animeContainer");
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // アニメーションコンテナを作成
  const animeContainer = document.createElement('div');
  animeContainer.id = 'animeContainer';
  animeContainer.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center;';
  
  // アニメーション画像を作成
  const animeImage = document.createElement('img');
  animeImage.id = 'animeImage';
  animeImage.src = getRandomImageUrl(); // ランダムな画像URLを設定
  animeImage.alt = 'おくらアニメーション';
  animeImage.style.cssText = 'opacity: 0; transform: translateY(-50px); max-width: 300px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);';
  
  animeContainer.appendChild(animeImage);
  document.body.appendChild(animeContainer);
  
  return { animeContainer, animeImage };
}

// iOS Safari 判定
function isIOSSafari() {
  const ua = window.navigator.userAgent;
  const isIOS = /iP(hone|od|ad)/.test(ua);
  const isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua) && !/CriOS\//.test(ua);
  return isIOS && isSafari;
}

// iOS で秒まで入力可能にするための time 入力対策
function ensureRallyTimeSecondsSupport() {
  const rallyInput = document.getElementById("rallyTime");
  if (!rallyInput) return;
  if (isIOSSafari()) {
    // iOS Safari は type=time で秒を表示できないため text に切り替える
    rallyInput.setAttribute("type", "text");
    rallyInput.setAttribute("inputmode", "numeric");
    rallyInput.setAttribute("placeholder", "HH:MM:SS");
    rallyInput.setAttribute("pattern", "^\\d{2}:\\d{2}:\\d{2}$");
    rallyInput.setAttribute("maxlength", "8");
  }
}

// アニメーションを実行する関数
async function playOkuraAnimation() {
  try {
    // GSAPライブラリを読み込み
    await loadGSAP();
    
    // アニメーション用のHTML要素を作成
    const { animeContainer, animeImage } = createAnimationElements();
    
    // アニメーションコンテナを表示
    animeContainer.style.display = "flex";
    
    // 画像を初期状態にリセット
    gsap.set(animeImage, {
      opacity: 0,
      y: -50,
      rotation: 0,
      scale: 1,
      x: 0
    });
    
    const tl = gsap.timeline({
      onComplete: () => {
        // アニメーション完了後にコンテナを削除
        animeContainer.remove();
      }
    });

    // フェードイン（上から表示）
    tl.to(animeImage, {
      duration: 1,
      opacity: 1,
      y: 0,
      ease: "power2.out"
    })

    // 3秒間回転（360度）
    .to(animeImage, {
      duration: 1,
      rotation: 360,
      ease: "linear"
    })

    // 3秒間、拡大縮小を繰り返し（scale 3倍以上）
    .to(animeImage, {
      duration: 0.5,
      scale: 3.2,
      repeat: 5,   // 0.5秒×6回 = 3秒間
      yoyo: true,
      ease: "power1.inOut"
    })

    // 右にフェードアウト
    .to(animeImage, {
      duration: 1,
      opacity: 0,
      x: 200,
      ease: "power2.in"
    });
  } catch (error) {
    console.error('アニメーションの実行に失敗しました:', error);
  }
}

// テーマを適用する関数
function applyTheme() {
  const mode = getUrlParameter("mode");
  const imgParam = getUrlParameter("img");
  const body = document.getElementById("body");

  if (mode === "okura") {
    // ピンク系テーマ（おくらテーマ）
    body.classList.remove("theme-default");
    body.classList.add("theme-okura");
    
    // おくらテーマの場合で、img=offが指定されていない場合はアニメーションを実行
    if (imgParam !== "off") {
      setTimeout(() => {
        playOkuraAnimation();
      }, 500); // 0.5秒後にアニメーション開始
    }
  } else {
    // 青系テーマ（デフォルト）
    body.classList.remove("theme-okura");
    body.classList.add("theme-default");
  }
}

// ページ読み込み時に現在時刻の5分後をデフォルト値として設定し、プレイヤー入力欄を生成
window.onload = function () {
  // テーマを適用
  applyTheme();
  // iOS の time 秒対策
  ensureRallyTimeSecondsSupport();

  const now = new Date();
  const threeMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
  const timeString = threeMinutesLater
    .toTimeString()
    .split(" ")[0]
    .substring(0, 8); // HH:MM:SS までセット

  // Flatpickr で時刻（秒まで）ピッカーを初期化
  const rallyTimeInput = document.getElementById("rallyTime");
  if (typeof flatpickr !== "undefined" && rallyTimeInput) {
    flatpickr(rallyTimeInput, {
      enableTime: true,
      enableSeconds: true,
      noCalendar: true,
      dateFormat: "H:i:S",
      time_24hr: true,
      defaultDate: timeString,
      minuteIncrement: 1,
      secondIncrement: 1,
      allowInput: true,
      // iOS SafariでネイティブUIを無効化してFlatpickrを強制
      disableMobile: true,
    });
  } else if (rallyTimeInput) {
    // フォールバック（ライブラリ未読込時）
    rallyTimeInput.value = timeString;
  }

  // 初期状態でプレイヤー数=2で入力欄を生成
  generatePlayers();
};

function generatePlayers() {
  const form = document.getElementById("playersForm");
  form.innerHTML = "";
  const count = Number(document.getElementById("playerCount").value);
  for (let i = 1; i <= count; i++) {
    form.innerHTML += `
    <div class="theme-default:bg-slate-700/50 theme-okura:bg-white rounded-3xl p-4 mb-3 shadow-xl theme-default:border theme-default:border-slate-600 theme-okura:border-2 theme-okura:border-okura-light-pink theme-default:shadow-cyan-500/20 theme-okura:shadow-pink-200/20">
      <div class="flex flex-wrap items-center gap-3 mb-3">
        <label class="font-semibold theme-default:text-cyan-300 theme-okura:text-okura-pink text-base min-w-[60px]">名前:</label>
        <input type="text" id="name${i}" placeholder="Player${i}" 
               class="px-4 py-3 rounded-xl border-2 font-noto text-base transition-all duration-300 focus:outline-none focus:ring-4 theme-default:bg-slate-600 theme-default:border-cyan-400 theme-default:text-white theme-default:focus:border-cyan-300 theme-default:focus:ring-cyan-500/30 theme-okura:bg-white theme-okura:border-okura-light-pink theme-okura:text-gray-800 theme-okura:focus:border-okura-pink theme-okura:focus:ring-pink-200 flex-1 min-w-[150px]">
      </div>
      <div class="flex flex-nowrap items-center gap-3 mb-3 whitespace-nowrap">
        <label class="font-semibold theme-default:text-cyan-300 theme-okura:text-okura-pink text-base min-w-[60px] label-narrow whitespace-nowrap">移動<br class="br-mobile">時間:</label>
        <span class="time-inline">
          <input type="number" id="min${i}" min="0" max="59" placeholder="分"
                 class="px-4 py-3 rounded-xl border-2 font-noto text-base transition-all duration-300 focus:outline-none focus:ring-4 theme-default:bg-slate-600 theme-default:border-cyan-400 theme-default:text-white theme-default:focus:border-cyan-300 theme-default:focus:ring-cyan-500/30 theme-okura:bg-white theme-okura:border-okura-light-pink theme-okura:text-gray-800 theme-okura:focus:border-okura-pink theme-okura:focus:ring-pink-200 text-center width-time">
          <span class="time-sep">：</span>
          <input type="number" id="sec${i}" min="0" max="59" placeholder="秒"
                 class="px-4 py-3 rounded-xl border-2 font-noto text-base transition-all duration-300 focus:outline-none focus:ring-4 theme-default:bg-slate-600 theme-default:border-cyan-400 theme-default:text-white theme-default:focus:border-cyan-300 theme-default:focus:ring-cyan-500/30 theme-okura:bg-white theme-okura:border-okura-light-pink theme-okura:text-gray-800 theme-okura:focus:border-okura-pink theme-okura:focus:ring-pink-200 text-center width-time">
        </span>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <label class="font-semibold theme-default:text-cyan-300 theme-okura:text-okura-pink text-base min-w-[60px]">調整:</label>
        <select id="adjust${i}" 
                class="px-4 py-3 rounded-xl border-2 font-noto text-base transition-all duration-300 focus:outline-none focus:ring-4 theme-default:bg-slate-600 theme-default:border-cyan-400 theme-default:text-white theme-default:focus:border-cyan-300 theme-default:focus:ring-cyan-500/30 theme-okura:bg-white theme-okura:border-okura-light-pink theme-okura:text-gray-800 theme-okura:focus:border-okura-pink theme-okura:focus:ring-pink-200 w-24">
          <option value="0">±0秒</option>
          <option value="-5">-5秒</option>
          <option value="-2">-2秒</option>
          <option value="-1">-1秒</option>
          <option value="1">+1秒</option>
          <option value="2">+2秒</option>
          <option value="5">+5秒</option>
        </select>
      </div>
    </div>`;
  }
}

function calculate() {
  const rallyTimeStr = document.getElementById("rallyTime").value;
  if (!rallyTimeStr) {
    alert("集結開始時刻を入力してください");
    return;
  }
  const rallyTime = new Date(`1970-01-01T${rallyTimeStr}`);

  let table = `<div class="overflow-x-auto rounded-3xl shadow-xl theme-default:shadow-cyan-500/20 theme-okura:shadow-pink-200/20">
    <table class="w-full theme-default:bg-slate-700 theme-okura:bg-white rounded-3xl overflow-hidden">
      <thead>
        <tr class="theme-default:bg-gradient-to-r theme-default:from-cyan-500 theme-default:to-blue-600 theme-okura:bg-gradient-to-r theme-okura:from-pink-500 theme-okura:to-pink-600">
          <th class="px-4 py-3 text-white font-semibold text-center font-noto">名前</th>
          <th class="px-4 py-3 text-white font-semibold text-center font-noto">移動時間</th>
          <th class="px-4 py-3 text-white font-semibold text-center font-noto">調整</th>
          <th class="px-4 py-3 text-white font-semibold text-center font-noto">出発時刻</th>
        </tr>
      </thead>
      <tbody>`;
  let textOutput = `集結開始: ${rallyTimeStr}\n`;

  const count = Number(document.getElementById("playerCount").value);
  let hasValidPlayers = false;

  for (let i = 1; i <= count; i++) {
    const name = document.getElementById(`name${i}`).value.trim();
    const min = Number(document.getElementById(`min${i}`).value) || 0;
    const sec = Number(document.getElementById(`sec${i}`).value) || 0;
    const adjust = Number(document.getElementById(`adjust${i}`).value) || 0;

    // 名前と移動時間の秒が入力されているかチェック
    if (name && sec > 0) {
      hasValidPlayers = true;

      const travelSec = min * 60 + sec + adjust;
      const depart = new Date(rallyTime.getTime() - travelSec * 1000);
      const departStr = depart.toTimeString().split(" ")[0];

      table += `<tr class="border-b theme-default:border-slate-600 theme-okura:border-okura-light-pink hover:theme-default:bg-slate-600/50 hover:theme-okura:bg-pink-50">
        <td class="px-4 py-3 text-center font-noto theme-default:text-cyan-100 theme-okura:text-gray-800" data-label="名前">${name}</td>
        <td class="px-4 py-3 text-center font-noto theme-default:text-cyan-100 theme-okura:text-gray-800" data-label="移動時間">${min > 0 ? min + '分' : ''}${sec}秒</td>
        <td class="px-4 py-3 text-center font-noto theme-default:text-cyan-100 theme-okura:text-gray-800" data-label="調整">${
          adjust >= 0 ? "+" + adjust : adjust
        }秒</td>
        <td class="px-4 py-3 text-center font-noto theme-default:text-cyan-100 theme-okura:text-gray-800" data-label="出発時刻">${departStr}</td>
      </tr>`;

      textOutput += `${name}<br> 出発 ${departStr}\n`;
    }
  }

  // 有効なプレイヤーがいない場合はエラーメッセージ
  if (!hasValidPlayers) {
    alert("名前と移動時間の秒を入力してください");
    return;
  }

  table += `</tbody></table></div>`;

  document.getElementById("result").innerHTML = table;
  document.getElementById(
    "textResult"
  ).innerHTML = `<h3 class="font-semibold text-center text-lg mb-4 font-noto theme-default:text-cyan-300 theme-okura:text-okura-pink">同盟チャットコピペ用</h3>
     <pre id='copyText' class="border-2 rounded-xl p-4 font-mono text-sm font-normal cursor-pointer select-none transition-all duration-300 hover:scale-105 theme-default:border-cyan-400 theme-default:bg-slate-600 theme-default:text-cyan-100 theme-default:hover:bg-slate-500 theme-default:hover:border-cyan-300 theme-okura:border-okura-light-pink theme-okura:bg-pink-50 theme-okura:text-gray-800 theme-okura:hover:bg-pink-100 theme-okura:hover:border-okura-pink">${textOutput}</pre>
     <p class="text-sm theme-default:text-cyan-200 theme-okura:text-gray-600 mt-2 text-center">タップするとコピーできるよ</p>`;

  // 結果テーブルの先頭までスクロール
  const resultElement = document.getElementById("result");
  resultElement.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  // コピー機能を追加
  const copyElement = document.getElementById("copyText");
  if (copyElement) {
    copyElement.addEventListener("click", function () {
      // HTMLタグを除去してテキストのみを取得
      const textToCopy = textOutput.replace(/<br>/g, "\n");

      // フラッシュメッセージ要素を取得
      const flashMessage = document.getElementById("flashMessage");
      
      // クリップボードにコピー
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(function () {
            // フラッシュメッセージを表示
            if (flashMessage) {
              flashMessage.classList.add("show");
              
              // 2秒後に非表示
              setTimeout(function () {
                flashMessage.classList.remove("show");
              }, 2000);
            }
          })
          .catch(function (err) {
            console.error("コピーに失敗しました: ", err);
            // フォールバック: 古いブラウザ対応
            fallbackCopyTextToClipboard(textToCopy, flashMessage);
          });
      } else {
        // フォールバック: 古いブラウザ対応
        fallbackCopyTextToClipboard(textToCopy, flashMessage);
      }
    });
  }
}

// フォールバック用のコピー機能（古いブラウザ対応）
function fallbackCopyTextToClipboard(text, flashMessage) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // 画面外に配置
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      // フラッシュメッセージを表示
      if (flashMessage) {
        flashMessage.classList.add("show");
        
        // 2秒後に非表示
        setTimeout(function () {
          flashMessage.classList.remove("show");
        }, 2000);
      }
    } else {
      console.error('フォールバック: コピーに失敗しました');
      alert("コピーに失敗しました");
    }
  } catch (err) {
    console.error('フォールバック: コピーに失敗しました', err);
    alert("コピーに失敗しました");
  }
  
  document.body.removeChild(textArea);
}
