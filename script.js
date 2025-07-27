const timerBars = document.getElementById("timer-bars");

function playAlert() {
  const vibrateOnly = document.getElementById("vibrate-only").checked;

  if (vibrateOnly && navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
    return;
  }

  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'square'; // ピッとした音
      osc.frequency.setValueAtTime(1200, now + i * 0.3);

      gain.gain.setValueAtTime(0.3, now + i * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 0.2);

      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + i * 0.3);
      osc.stop(now + i * 0.3 + 0.2);
    }
  } catch (e) {
    console.warn("AudioContextエラー:", e);
  }
}

function createTimer(minutes) {
  const container = document.createElement("div");
  container.className = "bar-container";

  const fill = document.createElement("div");
  fill.className = "bar-fill";

  const label = document.createElement("div");
  label.className = "bar-label";
  label.textContent = `${minutes}分`;

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "🔁";
  resetBtn.className = "reset-btn";

  let timerId = null;
  let remaining = minutes * 60;

  const updateFill = () => {
    const percent = (remaining / (minutes * 60)) * 100;
    fill.style.width = `${percent}%`;
    label.textContent = `${Math.floor(remaining / 60)}分${remaining % 60}秒`;
  };

  const tick = () => {
    remaining--;
    updateFill();
    if (remaining <= 0) {
      clearInterval(timerId);
      label.textContent = "完了！";
      fill.style.width = "0%";
      playAlert();
    }
  };

  container.addEventListener("click", () => {
    if (!timerId && remaining > 0) {
      timerId = setInterval(tick, 1000);
    } else {
      clearInterval(timerId);
      timerId = null;
    }
  });

  resetBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearInterval(timerId);
    timerId = null;
    remaining = minutes * 60;
    updateFill();
  });

  container.appendChild(fill);
  container.appendChild(label);
  container.appendChild(resetBtn);
  timerBars.appendChild(container);
  updateFill();
}

function createAllTimers(times) {
  timerBars.innerHTML = "";
  times.forEach(min => createTimer(min));
}

function renderTimeInputs() {
  const container = document.getElementById("custom-times");
  container.innerHTML = "";
  for (let i = 1; i <= 10; i++) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = 1;
    input.max = 60;
    input.value = i;
    input.dataset.index = i;
    input.style.width = "60px";
    container.appendChild(document.createTextNode(`${i}番:`));
    container.appendChild(input);
    container.appendChild(document.createElement("br"));
  }
}

document.getElementById("theme-select").addEventListener("change", e => {
  document.body.className = e.target.value;
});

document.getElementById("reset-all").addEventListener("click", () => {
  const inputs = document.querySelectorAll("#custom-times input");
  const newTimes = Array.from(inputs).map(input => Number(input.value));
  createAllTimers(newTimes);
});

document.getElementById("toggle-settings").addEventListener("click", () => {
  const panel = document.getElementById("settings-panel");
  panel.style.display = (panel.style.display === "none") ? "block" : "none";
});

document.getElementById("apply-times").addEventListener("click", () => {
  const inputs = document.querySelectorAll("#custom-times input");
  const newTimes = Array.from(inputs).map(input => Number(input.value));
  createAllTimers(newTimes);
});

window.addEventListener("load", () => {
  renderTimeInputs();
  createAllTimers([1,2,3,4,5,6,7,8,9,10]);
});
