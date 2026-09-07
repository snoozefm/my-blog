(function () {
  "use strict";

  var SIZE = 4;
  var GAP_PERCENT = 3; // must match --gap in style.css
  var CELL_PERCENT = (100 - (SIZE - 1) * GAP_PERCENT) / SIZE;

  var boardEl = document.getElementById("board");
  var gridCellsEl = document.getElementById("grid-cells");
  var tileLayerEl = document.getElementById("tile-layer");
  var scoreEl = document.getElementById("score");
  var bestEl = document.getElementById("best");
  var restartBtn = document.getElementById("restart-btn");
  var overlayEl = document.getElementById("overlay");
  var overlayMessageEl = document.getElementById("overlay-message");
  var overlayContinueBtn = document.getElementById("overlay-continue-btn");
  var overlayRestartBtn = document.getElementById("overlay-restart-btn");

  var BEST_SCORE_KEY = "game-2048-best-score";

  var board = [];
  var score = 0;
  var best = 0;
  var hasWon = false;
  var continueAfterWin = false;
  var gameOver = false;

  // ---- Setup static grid cell backgrounds (4x4) ----
  function buildGridCells() {
    gridCellsEl.innerHTML = "";
    for (var i = 0; i < SIZE * SIZE; i++) {
      var cell = document.createElement("div");
      cell.className = "grid-cell";
      gridCellsEl.appendChild(cell);
    }
  }

  // ---- Board helpers ----
  function createEmptyBoard() {
    var b = [];
    for (var r = 0; r < SIZE; r++) {
      b.push([0, 0, 0, 0]);
    }
    return b;
  }

  function cloneBoard(b) {
    return b.map(function (row) {
      return row.slice();
    });
  }

  function boardsEqual(a, b) {
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (a[r][c] !== b[r][c]) return false;
      }
    }
    return true;
  }

  function transpose(b) {
    var t = createEmptyBoard();
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        t[c][r] = b[r][c];
      }
    }
    return t;
  }

  function reverseRow(row) {
    return row.slice().reverse();
  }

  // ---- Core slide/merge logic (single source of truth) ----
  // Slides a single row to the left, merging adjacent equal values once per move.
  // Index-skipping over the compacted array naturally prevents a merged tile
  // from being re-merged again within the same move (spec 3.3).
  // Returns { row: newRow(len 4), scoreGained, mergedIndices } where
  // mergedIndices are positions in the *output* row that resulted from a merge.
  function slideRowLeft(row) {
    var compact = row.filter(function (v) {
      return v !== 0;
    });

    var result = [];
    var mergedIndices = [];
    var scoreGained = 0;
    var i = 0;
    while (i < compact.length) {
      if (i + 1 < compact.length && compact[i] === compact[i + 1]) {
        var mergedValue = compact[i] * 2;
        result.push(mergedValue);
        mergedIndices.push(result.length - 1);
        scoreGained += mergedValue;
        i += 2;
      } else {
        result.push(compact[i]);
        i += 1;
      }
    }

    while (result.length < SIZE) {
      result.push(0);
    }

    return { row: result, scoreGained: scoreGained, mergedIndices: mergedIndices };
  }

  // Applies slideRowLeft to the whole board for a given direction, reusing the
  // single left-slide implementation via rotate/reverse (spec 3.2).
  // direction: 'left' | 'right' | 'up' | 'down'
  // Returns { board: newBoard, scoreGained, moved, merged: [{row,col}, ...] }
  function computeMove(sourceBoard, direction) {
    var working = cloneBoard(sourceBoard);
    var transposed = false;
    var reversed = false;

    if (direction === "up" || direction === "down") {
      working = transpose(working);
      transposed = true;
    }
    if (direction === "right" || direction === "down") {
      working = working.map(reverseRow);
      reversed = true;
    }

    var totalScoreGained = 0;
    var newRows = [];
    var mergedPositions = []; // in `working` coordinate space (post transpose/reverse)

    for (var r = 0; r < SIZE; r++) {
      var slid = slideRowLeft(working[r]);
      newRows.push(slid.row);
      totalScoreGained += slid.scoreGained;
      for (var m = 0; m < slid.mergedIndices.length; m++) {
        mergedPositions.push({ row: r, col: slid.mergedIndices[m] });
      }
    }
    working = newRows;

    // Map merge positions back through reverse/transpose to original board coords.
    var mapped = mergedPositions.map(function (pos) {
      var row = pos.row;
      var col = pos.col;
      if (reversed) {
        col = SIZE - 1 - col;
      }
      if (transposed) {
        var tmp = row;
        row = col;
        col = tmp;
      }
      return { row: row, col: col };
    });

    if (reversed) {
      working = working.map(reverseRow);
    }
    if (transposed) {
      working = transpose(working);
    }

    var moved = !boardsEqual(sourceBoard, working);

    return { board: working, scoreGained: totalScoreGained, moved: moved, merged: mapped };
  }

  // ---- Random tile generation ----
  function getEmptyCells(b) {
    var cells = [];
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (b[r][c] === 0) {
          cells.push({ row: r, col: c });
        }
      }
    }
    return cells;
  }

  function addRandomTile(b) {
    var empties = getEmptyCells(b);
    if (empties.length === 0) return null;
    var choice = empties[Math.floor(Math.random() * empties.length)];
    var value = Math.random() < 0.9 ? 2 : 4;
    b[choice.row][choice.col] = value;
    return { row: choice.row, col: choice.col, value: value };
  }

  // ---- Win / lose detection ----
  function hasTileValue(b, target) {
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (b[r][c] >= target) return true;
      }
    }
    return false;
  }

  function isGameOver(b) {
    if (getEmptyCells(b).length > 0) return false;
    var directions = ["left", "right", "up", "down"];
    for (var i = 0; i < directions.length; i++) {
      if (computeMove(b, directions[i]).moved) {
        return false;
      }
    }
    return true;
  }

  // ---- Rendering ----
  // We keep an array of tile view-model objects for rendering with simple
  // fade/pop animation. Each render fully redraws the tile layer based on
  // current `board`, which is sufficient for spec's animation requirements
  // (CSS transition/keyframes handle the visual effect).
  function tileClassForValue(value) {
    if (value <= 2048) {
      return "tile-" + value;
    }
    return "tile-super";
  }

  function render(newlyMergedCells, newlySpawnedCell) {
    tileLayerEl.innerHTML = "";
    newlyMergedCells = newlyMergedCells || [];
    newlySpawnedCell = newlySpawnedCell || null;

    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var value = board[r][c];
        if (value === 0) continue;

        var tile = document.createElement("div");
        tile.className = "tile " + tileClassForValue(value);
        tile.textContent = String(value);

        var leftPercent = c * (CELL_PERCENT + GAP_PERCENT);
        var topPercent = r * (CELL_PERCENT + GAP_PERCENT);
        tile.style.left = leftPercent + "%";
        tile.style.top = topPercent + "%";
        tile.style.width = CELL_PERCENT + "%";
        tile.style.height = CELL_PERCENT + "%";

        var isMerged = newlyMergedCells.some(function (cell) {
          return cell.row === r && cell.col === c;
        });
        if (isMerged) {
          tile.classList.add("tile-merged");
        }
        // Newly spawned tiles get the default `.tile` appear animation (scale-in);
        // no extra class needed for them.

        tileLayerEl.appendChild(tile);
      }
    }

    scoreEl.textContent = String(score);
    bestEl.textContent = String(best);
  }

  // ---- Score / best score ----
  function loadBest() {
    try {
      var stored = localStorage.getItem(BEST_SCORE_KEY);
      var parsed = stored ? parseInt(stored, 10) : 0;
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      return 0;
    }
  }

  function saveBest(value) {
    try {
      localStorage.setItem(BEST_SCORE_KEY, String(value));
    } catch (e) {
      // localStorage unavailable (e.g. privacy mode); ignore silently.
    }
  }

  // ---- Overlay ----
  function showOverlay(message, showContinue) {
    overlayMessageEl.textContent = message;
    overlayContinueBtn.hidden = !showContinue;
    overlayEl.hidden = false;
  }

  function hideOverlay() {
    overlayEl.hidden = true;
  }

  // ---- Move handling (shared by keyboard + touch) ----
  function handleMove(direction) {
    if (gameOver) return;
    if (hasWon && !continueAfterWin) return;

    var result = computeMove(board, direction);

    if (!result.moved) {
      return;
    }

    board = result.board;
    score += result.scoreGained;
    if (score > best) {
      best = score;
      saveBest(best);
    }

    var spawned = addRandomTile(board);

    render(result.merged, spawned);

    if (!hasWon && hasTileValue(board, 2048)) {
      hasWon = true;
      showOverlay("You Win!", true);
    }

    // Always check game-over too, even on the same move that first wins
    // (spec 3.7 treats these as two independent checks). Without this, a
    // move that both creates 2048 AND fills the last empty cell with no
    // further moves possible would leave the game silently stuck: the win
    // overlay's "Continue" button would hide itself and every subsequent
    // key press would be swallowed with no feedback at all.
    if (isGameOver(board)) {
      gameOver = true;
      showOverlay("Game Over!", false);
    }
  }

  // ---- Game lifecycle ----
  function startNewGame() {
    board = createEmptyBoard();
    score = 0;
    hasWon = false;
    continueAfterWin = false;
    gameOver = false;
    hideOverlay();

    addRandomTile(board);
    addRandomTile(board);

    render();
  }

  // ---- Input: keyboard ----
  var KEY_DIRECTION_MAP = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    W: "up",
    s: "down",
    S: "down",
    a: "left",
    A: "left",
    d: "right",
    D: "right"
  };

  document.addEventListener("keydown", function (event) {
    var direction = KEY_DIRECTION_MAP[event.key];
    if (!direction) return;
    event.preventDefault();
    handleMove(direction);
  });

  // ---- Input: touch swipe ----
  var touchStartX = 0;
  var touchStartY = 0;
  var touchActive = false;
  var MIN_SWIPE_DISTANCE = 20;

  boardEl.addEventListener(
    "touchstart",
    function (event) {
      if (event.touches.length !== 1) return;
      touchActive = true;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  boardEl.addEventListener(
    "touchmove",
    function (event) {
      if (touchActive) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  boardEl.addEventListener("touchend", function (event) {
    if (!touchActive) return;
    touchActive = false;

    var touch = event.changedTouches[0];
    var dx = touch.clientX - touchStartX;
    var dy = touch.clientY - touchStartY;

    if (Math.abs(dx) < MIN_SWIPE_DISTANCE && Math.abs(dy) < MIN_SWIPE_DISTANCE) {
      return;
    }

    var direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? "right" : "left";
    } else {
      direction = dy > 0 ? "down" : "up";
    }

    handleMove(direction);
  });

  // ---- Buttons ----
  restartBtn.addEventListener("click", startNewGame);
  overlayRestartBtn.addEventListener("click", startNewGame);
  overlayContinueBtn.addEventListener("click", function () {
    continueAfterWin = true;
    hideOverlay();
  });

  // ---- Init ----
  buildGridCells();
  best = loadBest();
  startNewGame();
})();
