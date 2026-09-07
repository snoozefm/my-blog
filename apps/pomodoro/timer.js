(function () {
  'use strict';

  // ---- DOM refs ----
  var timeDisplay = document.getElementById('time-display');
  var sessionLabel = document.getElementById('session-label');
  var sessionCountEl = document.getElementById('session-count');
  var toggleBtn = document.getElementById('toggle-btn');
  var resetBtn = document.getElementById('reset-btn');
  var workSlider = document.getElementById('work-slider');
  var breakSlider = document.getElementById('break-slider');
  var workValue = document.getElementById('work-value');
  var breakValue = document.getElementById('break-value');
  var body = document.body;

  // ---- State ----
  var sessionType = 'work'; // 'work' | 'break'
  var timerState = 'idle'; // 'idle' | 'running' | 'paused'
  var sessionCount = 0; // completed work sessions
  var remainingMs = Number(workSlider.value) * 60 * 1000;
  var targetTimestamp = null;
  var intervalId = null;

  var TICK_MS = 250;

  // ---- Helpers ----
  function currentSliderMinutes(type) {
    return Number((type === 'work' ? workSlider : breakSlider).value);
  }

  function formatMs(ms) {
    var totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
  }

  function renderTime() {
    timeDisplay.textContent = formatMs(remainingMs);
  }

  function renderSessionInfo() {
    sessionLabel.textContent = sessionType === 'work' ? '집중 시간' : '쉬는 시간';
    sessionCountEl.textContent = sessionCount + '번째 뽀모도로 완료';
    document.title = (sessionType === 'work' ? '집중 시간' : '쉬는 시간') + ' - 뽀모도로';
  }

  function renderMode() {
    body.classList.remove('mode-work', 'mode-break');
    body.classList.add(sessionType === 'work' ? 'mode-work' : 'mode-break');
  }

  function renderToggleBtn() {
    toggleBtn.textContent = timerState === 'running' ? '일시정지' : '시작';
  }

  function renderAll() {
    renderTime();
    renderSessionInfo();
    renderMode();
    renderToggleBtn();
  }

  // ---- Audio beep ----
  var audioCtx = null;
  function playBeep() {
    try {
      if (!audioCtx) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      var oscillator = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // Web Audio unavailable; fail silently.
    }
  }

  // ---- Interval / countdown ----
  function tick() {
    var now = Date.now();
    var remaining = targetTimestamp - now;
    if (remaining <= 0) {
      handleSessionEnd();
      return;
    }
    remainingMs = remaining;
    renderTime();
  }

  function startInterval() {
    if (intervalId !== null) return;
    intervalId = setInterval(tick, TICK_MS);
  }

  function stopInterval() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function handleSessionEnd() {
    // Session finished: play notification, switch session type, auto-start next.
    if (sessionType === 'work') {
      sessionCount += 1;
    }
    sessionType = sessionType === 'work' ? 'break' : 'work';

    playBeep();

    remainingMs = currentSliderMinutes(sessionType) * 60 * 1000;
    targetTimestamp = Date.now() + remainingMs;
    // timerState stays 'running'; interval keeps going.
    renderAll();
  }

  // ---- Controls ----
  function handleToggle() {
    if (timerState === 'running') {
      // pause
      remainingMs = targetTimestamp - Date.now();
      if (remainingMs < 0) remainingMs = 0;
      stopInterval();
      timerState = 'paused';
      renderToggleBtn();
      renderTime();
      return;
    }

    // start (from idle or paused)
    if (timerState === 'idle') {
      remainingMs = currentSliderMinutes(sessionType) * 60 * 1000;
    }
    targetTimestamp = Date.now() + remainingMs;
    timerState = 'running';
    startInterval();
    renderToggleBtn();
    renderTime();
  }

  function handleReset() {
    stopInterval();
    timerState = 'idle';
    targetTimestamp = null;
    remainingMs = currentSliderMinutes(sessionType) * 60 * 1000;
    renderToggleBtn();
    renderTime();
  }

  function handleSliderInput(type) {
    var valueEl = type === 'work' ? workValue : breakValue;
    var sliderEl = type === 'work' ? workSlider : breakSlider;
    valueEl.textContent = sliderEl.value + '분';

    if (timerState === 'idle' && type === sessionType) {
      remainingMs = Number(sliderEl.value) * 60 * 1000;
      renderTime();
    }
  }

  // ---- Wire up events ----
  toggleBtn.addEventListener('click', handleToggle);
  resetBtn.addEventListener('click', handleReset);
  workSlider.addEventListener('input', function () { handleSliderInput('work'); });
  breakSlider.addEventListener('input', function () { handleSliderInput('break'); });

  // ---- Initial render ----
  renderAll();
})();
