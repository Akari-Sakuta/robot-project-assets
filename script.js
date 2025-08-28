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
        button.onclick = () => setColor(color); // クリックイベントを設定
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
    const duration = 0.2 * (6 - intensity);

    // すべてのスタイルをリセット
    // これにより、以前のアニメーションやスタイルが残るのを防ぎます。
    leftEyeLed.style.cssText = '';
    rightEyeLed.style.cssText = '';
    leftEyeLed.style.animationName = 'none';
    rightEyeLed.style.animationName = 'none';
    leftEyeLed.classList.remove('rotate', 'split-drop', 'split-up');
    rightEyeLed.classList.remove('rotate', 'split-drop', 'split-up');
    
    // 疑似要素のスタイルをリセットするための処理
    leftEyeLed.style.setProperty('--split-drop-gradient', '');
    rightEyeLed.style.setProperty('--split-drop-gradient', '');
    leftEyeLed.style.removeProperty('--split-up-gradient');
    rightEyeLed.style.removeProperty('--split-up-gradient');
    leftEyeLed.style.setProperty('--animation-duration', '');
    rightEyeLed.style.setProperty('--animation-duration', '');

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

/** 色選択ボタンがクリックされた時の処理 */
function setColor(color) {
    currentColor = color;
    const currentPattern = document.getElementById('pattern').value;
    const currentIntensity = document.getElementById('intensity').value;
    updateLeds(currentColor, currentPattern, currentIntensity);
}

/** パターンが変更された時の処理 */
function setPattern() {
    const currentIntensity = document.getElementById('intensity').value;
    updateLeds(currentColor, document.getElementById('pattern').value, currentIntensity);
}

/** 強度が変更された時の処理 */
function setIntensity() {
    const currentPattern = document.getElementById('pattern').value;
    const currentIntensity = document.getElementById('intensity').value;
    intensityValueSpan.textContent = currentIntensity;
    updateLeds(currentColor, currentPattern, currentIntensity);
}

/**
 * ページの初期化処理とタイマー機能の修正
 */
document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得をこの中に入れる
    const timerDisplay = document.getElementById('timer-display');
    let seconds = 0;
    let minutes = 0;
    let timerInterval;

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
    }
    // タイマーを開始する関数
    function startTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        timerInterval = setInterval(updateTimer, 1000);
    }

    // 初期処理とタイマーの開始
    positionColorButtons(); // 色ボタンの配置
    updateLeds('red', 'fade-blink', 3); // 初期表示
    startTimer(); // タイマーの開始
});