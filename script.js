// DOM要素の取得: ロボットの目のLEDと操作パネル
const leftEyeLed = document.getElementById('left-eye-led');
const rightEyeLed = document.getElementById('right-eye-led');
const intensityValueSpan = document.getElementById('intensity-value');
let currentColor = 'red'; // 現在選択されている色を保持する変数
const colorOptionsDiv = document.querySelector('.color-options');

// 使用する色の定義
const colors = [
    'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'magenta'
];

// 各色のRGBA値を定義
const colorMap = {
    'red': 'rgba(255, 0, 0, 1)',
    'orange': 'rgba(255, 165, 0, 1)',
    'yellow': 'rgba(255, 255, 0, 1)',
    'green': 'rgba(0, 128, 0, 1)',
    'cyan': 'rgba(0, 255, 255, 1)',
    'blue': 'rgba(0, 0, 255, 1)',
    'purple': 'rgba(128, 0, 128, 1)',
    'magenta': 'rgba(255, 0, 255, 1)'
};

// 選択項目を保持するグローバル変数
// 初期値は、ページの初期表示値に合わせて設定する
let selectedColorIndex = 1;
let selectedPatternIndex = 1;
let selectedIntensityIndex = 5;

// 選択項目を一時的に保存する配列
const savedSelections = [];

// DOM要素の取得: タイマー機能
const timerDisplay = document.getElementById('timer-display');
let seconds = 0;
let minutes = 0;
let timerInterval;

// DOM要素の取得: 進捗の保存
let currentSet = 1;
const totalSets = 10;
const emotionList = [
    '怒り',
    '緑、点滅(チカチカ)、速さ4',
    '恐れ',
    '信頼',
    '嫌悪',
    '驚き',
    '期待',
    '赤、下へ流れる、速さ2',
    '悲しみ',
    '喜び'
];

// DOM要素の取得: 結果の表示画面
const resultsPage = document.getElementById('results-page');
const resultColorSpan = document.getElementById('result-color');
const resultPatternSpan = document.getElementById('result-pattern');
const resultIntensitySpan = document.getElementById('result-intensity');

// DOM要素の取得: 終了ボタンと次のタスクへボタンと戻るボタン
let endButton;
let nextTaskButton;
let backButton;

// Googleフォームの項目IDとURLを定義
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSfq_hRIW0YguOmrTz_N_01j5Yl2PspdSc5IMLgpXhIxZ4B3fg/formResponse';

// 各タスク（感情）ごとの質問IDをオブジェクトにまとめて管理
const GOOGLE_FORM_ENTRIES = {
    '怒り': { color: 'entry.491303356', pattern: 'entry.409806865', intensity: 'entry.1878336323' },
    '緑、点滅(チカチカ)、速さ4': { color: 'entry.1204286337', pattern: 'entry.802237711', intensity: 'entry.1801506477' },
    '恐れ': { color: 'entry.777098917', pattern: 'entry.589697965', intensity: 'entry.2113351545' },
    '信頼': { color: 'entry.1742265329', pattern: 'entry.245111734', intensity: 'entry.2028868153' },
    '嫌悪': { color: 'entry.350150990', pattern: 'entry.1570778382', intensity: 'entry.833062927' },
    '驚き': { color: 'entry.286520453', pattern: 'entry.102870304', intensity: 'entry.1927795365' },
    '期待': { color: 'entry.652292470', pattern: 'entry.585916459', intensity: 'entry.944012706' },
    '赤、下へ流れる、速さ2': { color: 'entry.512180379', pattern: 'entry.2063122289', intensity: 'entry.1130457384' },
    '悲しみ': { color: 'entry.996065062', pattern: 'entry.5850225', intensity: 'entry.1817038972' },
    '喜び': { color: 'entry.1073520370', pattern: 'entry.1512407861', intensity: 'entry.1185022503' }
};

// 参加者情報の質問IDも追加する必要があります。
const PARTICIPANT_FORM_ENTRIES = {
    age: 'entry.AGE_ID',
    gender: 'entry.GENDER_ID'
};

/**
 * 色選択ボタンを色相環状に配置する関数
 * この関数は、`colors`配列に基づいて動的にボタンを生成します。
 */
function positionColorButtons() {
    const radius = 65; // 円の半径
    const totalColors = colors.length;
    const angleIncrement = (2 * Math.PI) / totalColors; // 角度の増分

    colors.forEach((color, index) => {
        const angle = index * angleIncrement - Math.PI / 2; // 上から開始するために調整
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const button = document.createElement('button');
        button.className = color;
        button.style.backgroundColor = color;
        button.style.position = 'absolute';
        button.style.left = `calc(50% + ${x}px)`;
        button.style.top = `calc(50% + ${y}px)`;
        button.style.transform = 'translate(-50%, -50%)';
        button.onclick = () => setColor(color, index); // クリックイベントを設定
        colorOptionsDiv.appendChild(button);
    });
}

/**
 * LEDの表示を更新するメイン関数
 * ユーザーの選択に応じて、LEDのスタイルとアニメーションを適用します。
 * @param {string} color - 選択された色
 * @param {string} pattern - 選択されたパターン
 * @param {number} intensity - 選択された強度
 */
function updateLeds(color, pattern, intensity) {
    const duration = 0.2 * (11 - intensity);

    // すべてのスタイルをリセット
    leftEyeLed.style.cssText = '';
    rightEyeLed.style.cssText = '';
    leftEyeLed.style.animationName = 'none';
    rightEyeLed.style.animationName = 'none';
    leftEyeLed.classList.remove('rotate', 'split-drop', 'split-up');
    rightEyeLed.classList.remove('rotate', 'split-drop', 'split-up');
    
    // 疑似要素のスタイルをリセットするための処理
    leftEyeLed.style.removeProperty('--split-drop-gradient');
    rightEyeLed.style.removeProperty('--split-drop-gradient');
    leftEyeLed.style.removeProperty('--split-up-gradient');
    rightEyeLed.style.removeProperty('--split-up-gradient');
    leftEyeLed.style.removeProperty('--animation-duration');
    rightEyeLed.style.removeProperty('--animation-duration');

    // わずかな遅延を挟んでから、新しいアニメーションを適用
    void leftEyeLed.offsetWidth; // 強制的にリフローを発生させる
    void rightEyeLed.offsetWidth; // 強制的にリフローを発生させる
    
    const rgbaColor = colorMap[color];
    
    // --- 各発光パターンの処理 ---
    if (pattern === 'step-blink') {
        // 点滅（断続）: 透明度を瞬間的に切り替えて点滅を表現
        leftEyeLed.style.backgroundColor = rgbaColor;
        rightEyeLed.style.backgroundColor = rgbaColor;
        leftEyeLed.style.border = `4px solid ${color}`;
        rightEyeLed.style.border = `4px solid ${color}`;
        leftEyeLed.style.animationName = 'step-blink';
        rightEyeLed.style.animationName = 'step-blink';
    } else if (pattern === 'fade-blink') {
        // 点滅（滑らか）: 透明度を滑らかに変化させてフェードイン・アウトを表現
        leftEyeLed.style.backgroundColor = rgbaColor;
        rightEyeLed.style.backgroundColor = rgbaColor;
        leftEyeLed.style.border = `4px solid ${color}`;
        rightEyeLed.style.border = `4px solid ${color}`;
        leftEyeLed.style.animationName = 'fade-blink';
        rightEyeLed.style.animationName = 'fade-blink';
    } else if (pattern === 'rotate' || pattern === 'asymmetric-rotate') {
        // 回転パターン: conic-gradientで光る扇形を表現
        const conicGradient = `conic-gradient(from -65deg, ${rgbaColor} 0deg, ${rgbaColor} 130deg, transparent 130deg 360deg)`;
        leftEyeLed.style.backgroundImage = conicGradient;
        rightEyeLed.style.backgroundImage = conicGradient;
        leftEyeLed.classList.add('rotate');
        rightEyeLed.classList.add('rotate');
        // 回転方向を決定
        if (pattern === 'rotate') {
            leftEyeLed.style.animationName = 'rotate-sector';
            rightEyeLed.style.animationName = 'rotate-sector';
        } else if (pattern === 'asymmetric-rotate') {
            leftEyeLed.style.animationName = 'rotate-sector-reverse';
            rightEyeLed.style.animationName = 'rotate-sector';
        }
    } else if (pattern === 'split-drop') {
        // 下へ流れる（左右分割）
        leftEyeLed.classList.add('split-drop');
        rightEyeLed.classList.add('split-drop');
        // conic-gradientの定義
        const splitGradient = `
            conic-gradient(from -22deg, ${rgbaColor} 0deg, ${rgbaColor} 45deg, transparent 45deg, transparent 360deg),
            conic-gradient(from -22deg, ${rgbaColor} 0deg, ${rgbaColor} 45deg, transparent 45deg, transparent 360deg)
        `;
        // CSS変数を設定
        leftEyeLed.style.setProperty('--split-drop-gradient', splitGradient);
        rightEyeLed.style.setProperty('--split-drop-gradient', splitGradient);
        leftEyeLed.style.setProperty('--animation-duration', duration + 's');
        rightEyeLed.style.setProperty('--animation-duration', duration + 's');
    } else if (pattern === 'split-up') {
        // 上へ流れる（左右分割）
        leftEyeLed.classList.add('split-up');
        rightEyeLed.classList.add('split-up');
        // conic-gradientの開始位置を真下（90deg）に設定
        const upGradient = `
            conic-gradient(from 158deg, ${rgbaColor} 0deg, ${rgbaColor} 45deg, transparent 45deg, transparent 360deg),
            conic-gradient(from 158deg, ${rgbaColor} 0deg, ${rgbaColor} 45deg, transparent 45deg, transparent 360deg)
        `;
        // CSS変数を設定
        leftEyeLed.style.setProperty('--split-up-gradient', upGradient);
        rightEyeLed.style.setProperty('--split-up-gradient', upGradient);
        leftEyeLed.style.setProperty('--animation-duration', duration + 's');
        rightEyeLed.style.setProperty('--animation-duration', duration + 's');
    }
    
    // 共通のアニメーション設定
    leftEyeLed.style.animationDuration = duration + 's';
    rightEyeLed.style.animationDuration = duration + 's';
    leftEyeLed.style.animationPlayState = 'running';
    rightEyeLed.style.animationPlayState = 'running';
}

/**
 * 色選択ボタンがクリックされた時の処理
 * @param {string} color - 選択された色の名前
 * @param {number} index - 0から始まるインデックス
 */
function setColor(color, index) { 
    currentColor = color;
    selectedColorIndex = index + 1; // 1から始まる番号に変換
    const currentPattern = document.getElementById('pattern').value;
    const currentIntensity = document.getElementById('intensity').value;
    updateLeds(currentColor, currentPattern, currentIntensity);
}

/**
 * パターンが変更された時の処理
 */
function setPattern() {
    const patternSelect = document.getElementById('pattern');
    const currentPattern = patternSelect.value;
    const currentIntensity = document.getElementById('intensity').value;
    selectedPatternIndex = patternSelect.selectedIndex + 1; // 1から始まる番号に変換
    updateLeds(currentColor, currentPattern, currentIntensity);
}

/**
 * 強度が変更された時の処理
 */
function setIntensity() {
    const currentPattern = document.getElementById('pattern').value;
    const currentIntensity = document.getElementById('intensity').value;
    selectedIntensityIndex = currentIntensity;
    intensityValueSpan.textContent = currentIntensity;
    updateLeds(currentColor, currentPattern, currentIntensity);
}

/**
 * ページの初期状態をリセットし、メインページを開始する関数
 */
function startMainPage() {
    // メインページの要素を表示する
    document.querySelector('h1').style.display = 'block';
    document.querySelector('p').style.display = 'block';
    document.getElementById('timer-container').style.display = 'block';
    document.getElementById('end-button-container').style.display = 'block';
    document.querySelector('.container').style.display = 'flex';
    document.querySelector('.back-button-container').style.display = 'block';
    // 結果ページと最終ページを非表示にする
    document.getElementById('results-page').style.display = 'none';
    document.getElementById('final-page').style.display = 'none';
    // 終了ボタンを非表示にする
    document.getElementById('end-button').style.display = 'none';

    // タイマーをリセットして再開
    seconds = 0;
    minutes = 0;
    document.getElementById('timer-display').textContent = '00:00';
    startTimer();

    // 進捗バーとテキストを更新
    document.querySelector('.progress-bar').style.width = `${(currentSet / totalSets) * 100}%`;
    document.getElementById('current-set').textContent = currentSet;

    // 上部の指示文の感情のテキストを更新
    const emotionTextSpan = document.getElementById('emotion-text');
    if (emotionTextSpan) {
        // currentSet-1 をインデックスとして使用（0から始まる配列のため）
        emotionTextSpan.textContent = emotionList[currentSet - 1];
    }

    // ここでUIの状態を復元する
    const currentSelection = savedSelections[currentSet - 1];
    const prevColorName = colors[currentSelection.color - 1];
    const prevPatternValue = document.getElementById('pattern').options[currentSelection.pattern - 1].value;
    const prevIntensityValue = currentSelection.intensity;

    // UI要素の値を設定
    currentColor = prevColorName;
    selectedColorIndex = currentSelection.color;
    selectedPatternIndex = currentSelection.pattern;
    selectedIntensityIndex = prevIntensityValue;
    document.getElementById('pattern').value = prevPatternValue;
    document.getElementById('intensity').value = prevIntensityValue;
    intensityValueSpan.textContent = prevIntensityValue;

    // ロボットの目を更新
    updateLeds(prevColorName, prevPatternValue, prevIntensityValue);
}

/**
 * 結果ページを表示する関数
 */
function showResultsPage() {
    document.querySelector('h1').style.display = 'none';
    document.querySelector('p').style.display = 'none';
    document.getElementById('timer-container').style.display = 'none';
    document.getElementById('end-button-container').style.display = 'none';
    document.querySelector('.container').style.display = 'none';
    document.getElementById('final-page').style.display = 'none'; // 最終ページを非表示にする処理を追加
    
    // 結果ページを表示
    document.getElementById('results-page').style.display = 'flex';

    // 戻るボタンのコンテナを表示する
    document.querySelector('.back-button-container').style.display = 'block';

    // タイトルを更新
    document.querySelector('#results-page h2').textContent = `タスク${currentSet}　設定結果`;

    // 選択された項目を次のページに表示
    document.getElementById('result-color').textContent = selectedColorIndex;
    document.getElementById('result-pattern').textContent = selectedPatternIndex;
    document.getElementById('result-intensity').textContent = selectedIntensityIndex;
    
    // 10セット完了後、ボタンの名前を変更
    if (currentSet === totalSets) {
        document.getElementById('next-task-button').textContent = 'タスクを終了する';
    } else {
        document.getElementById('next-task-button').textContent = '次のタスクへ';
    }
}

/**
 * 最終ページを表示する関数
 */
function showFinalPage() {
    // すべてのUIを非表示にする
    document.querySelector('h1').style.display = 'none';
    document.querySelector('p').style.display = 'none';
    document.getElementById('timer-container').style.display = 'none';
    document.getElementById('end-button-container').style.display = 'none';
    document.querySelector('.container').style.display = 'none';
    document.getElementById('results-page').style.display = 'none'; // 結果ページも非表示にする

    // 戻るボタンのコンテナを表示する
    document.querySelector('.back-button-container').style.display = 'block';

    // 最終ページを表示
    document.getElementById('final-page').style.display = 'flex';
    document.getElementById('password-display').textContent = 'RobotEye2025'; // パスワードを設定
}

/**
 * データをGoogleフォームに送信する関数
 */
function sendDataToGoogleForm(allData) {
    const dataToSend = {};

    for (let i = 0; i < allData.length; i++) {
        const currentTask = allData[i];
        const emotion = emotionList[i];
        const entries = GOOGLE_FORM_ENTRIES[emotion];

        dataToSend[entries.color] = currentTask.color;
        dataToSend[entries.pattern] = currentTask.pattern;
        dataToSend[entries.intensity] = currentTask.intensity;
    }

    const params = new URLSearchParams(dataToSend);
    const url = `${GOOGLE_FORM_URL}?${params.toString()}`;

    fetch(url, {
        method: 'POST',
        mode: 'no-cors'
    })
    .then(() => {
        console.log('すべてのデータ送信に成功しました。');
    })
    .catch(error => {
        console.error('データ送信中にエラーが発生しました:', error);
    });
}

/**
 * タイマーのカウントアップを行うための関数
 */
// 時間を「00:00」形式にフォーマットする関数
function formatTime(num) {
    return num < 10 ? `0${num}` : num;
}
// 1秒ごとにタイマーを更新する関数
function updateTimer() {
    seconds++;
    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }
    const formattedMinutes = formatTime(minutes);
    const formattedSeconds = formatTime(seconds);
    timerDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
    
    if (currentSet === 2 || currentSet === 8) {
        // 確認タスク（タスク2と8）ではすぐに終了ボタンを表示
        if (seconds >= 1 && endButton.style.display === 'none') {
            endButton.style.display = 'block';
        }
    } else {
        // 30秒後に終了ボタンを表示する
        if (seconds >= 1 && endButton.style.display === 'none') {
            endButton.style.display = 'block';
        }
    }
}
// タイマーを開始する関数
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(updateTimer, 1000);
}

/**
 *ページの初期化処理とタイマー機能
 */ 
document.addEventListener('DOMContentLoaded', () => {
    endButton = document.getElementById('end-button');
    nextTaskButton = document.getElementById('next-task-button');
    backButton = document.getElementById('back-button');

    // savedSelections配列を初期値で埋める
    for (let i = 0; i < totalSets; i++) {
        savedSelections.push({
            color: 1, // 初期の色: 赤
            pattern: 1, // 初期の発光パターン: 点滅（チカチカ）
            intensity: 5  // 初期の発光速度: 5
        });
    }

    // 「戻る」ボタンがクリックされた時の処理
    backButton.addEventListener('click', () => {
        const isResultsPageVisible = document.getElementById('results-page').style.display === 'flex';
        const isFinalPageVisible = document.getElementById('final-page').style.display === 'flex';

        if (isResultsPageVisible) {
            // 結果ページからメインページに戻る
            startMainPage();        
        } else if (isFinalPageVisible) {
            showResultsPage(); // 最終ページから結果ページに戻る
        } else {
            // メインページから前のタスクの結果ページに戻る
            if (currentSet > 1) {
                currentSet--;
                showResultsPage();
            } else {
                alert("これ以上戻るタスクはありません。");
            }
        }
    });

    // 「選択を終える」ボタンがクリックされた時の処理
    endButton.addEventListener('click', () => {
        // 現在の選択内容を保存
        const currentTaskData = {
            color: selectedColorIndex,
            pattern: selectedPatternIndex,
            intensity: selectedIntensityIndex
        };
        savedSelections[currentSet - 1] = currentTaskData; // ここで上書き

        clearInterval(timerInterval);
        showResultsPage();
    });

    // 「次のタスクへ」ボタンがクリックされた時の処理
    nextTaskButton.addEventListener('click', () => {
        const currentTaskData = {
            color: selectedColorIndex,
            pattern: selectedPatternIndex,
            intensity: selectedIntensityIndex
        };
        savedSelections[currentSet - 1] = currentTaskData;

        if (currentSet === totalSets) {
            sendDataToGoogleForm(savedSelections);
            showFinalPage();
        } else {
            currentSet++;
            startMainPage(); // この関数が復元も担当する
        }
    });

    positionColorButtons();
    //updateLeds('red', 'step-blink', 5);
    //document.querySelector('.progress-bar').style.width = '0%';
    startMainPage();
});
