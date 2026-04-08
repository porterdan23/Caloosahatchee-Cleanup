import { useEffect, useRef, useCallback } from "react";

// ----- Maze layout -----
// 0 = dot, 1 = wall, 2 = empty (ghost house), 3 = power pellet, 4 = empty path
const MAZE_TEMPLATE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,4,1,1,4,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,4,1,1,4,1,1,1,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,4,4,4,4,4,4,4,4,4,4,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,4,1,1,1,2,2,1,1,1,4,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,4,1,2,2,2,2,2,2,1,4,1,1,0,1,1,1,1,1,1],
  [4,4,4,4,4,4,0,4,4,4,1,2,2,2,2,2,2,1,4,4,4,0,4,4,4,4,4,4],
  [1,1,1,1,1,1,0,1,1,4,1,2,2,2,2,2,2,1,4,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,4,4,4,4,4,4,4,4,4,4,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1],
  [1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,3,0,0,1,1,0,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,1,1,0,0,3,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const COLS = 28;
const ROWS = 32;
const CELL = 20;
const W = COLS * CELL;
const H = ROWS * CELL;

type Dir = { x: number; y: number };
const UP: Dir = { x: 0, y: -1 };
const DOWN: Dir = { x: 0, y: 1 };
const LEFT: Dir = { x: -1, y: 0 };
const RIGHT: Dir = { x: 1, y: 0 };
const NONE: Dir = { x: 0, y: 0 };

interface Ghost {
  x: number;
  y: number;
  dir: Dir;
  nextDir: Dir;
  color: string;
  frightened: boolean;
  eaten: boolean;
  blinkTimer: number;
  scatterTarget: { col: number; row: number };
  exitingHouse: boolean;
  inHouse: boolean;
  dotCounter: number;
  dotThreshold: number;
  homeCol: number;
  homeRow: number;
}

interface GameState {
  maze: number[][];
  pacX: number;
  pacY: number;
  pacDir: Dir;
  pacNextDir: Dir;
  pacMouthAngle: number;
  pacMouthOpen: boolean;
  ghosts: Ghost[];
  score: number;
  lives: number;
  level: number;
  dotsLeft: number;
  totalDots: number;
  frightTimer: number;
  gamePhase: "playing" | "dead" | "won" | "start" | "gameover";
  phaseTimer: number;
  globalDotCounter: number;
  globalDotLimit: number;
  modeTimer: number;
  chaseMode: boolean;
  modeIndex: number;
  animFrame: number;
}

const SCATTER_DURATIONS = [7, 7, 5, 5];
const CHASE_DURATIONS = [20, 20, 20, 999];
const FRIGHT_DURATION = 6;

function cloneMaze(t: number[][]): number[][] {
  return t.map(r => [...r]);
}

function countDots(maze: number[][]): number {
  let c = 0;
  for (const row of maze) for (const cell of row) if (cell === 0 || cell === 3) c++;
  return c;
}

function initState(level = 1): GameState {
  const maze = cloneMaze(MAZE_TEMPLATE);
  const totalDots = countDots(maze);
  const ghosts: Ghost[] = [
    {
      x: 13.5 * CELL, y: 11 * CELL, dir: LEFT, nextDir: LEFT,
      color: "#FF0000", frightened: false, eaten: false,
      blinkTimer: 0, scatterTarget: { col: 25, row: 0 },
      exitingHouse: false, inHouse: false,
      dotCounter: 0, dotThreshold: 0,
      homeCol: 13, homeRow: 11,
    },
    {
      x: 11.5 * CELL, y: 13.5 * CELL, dir: DOWN, nextDir: DOWN,
      color: "#FFB8FF", frightened: false, eaten: false,
      blinkTimer: 0, scatterTarget: { col: 2, row: 0 },
      exitingHouse: true, inHouse: true,
      dotCounter: 0, dotThreshold: 0,
      homeCol: 11, homeRow: 13,
    },
    {
      x: 13.5 * CELL, y: 13.5 * CELL, dir: DOWN, nextDir: DOWN,
      color: "#00FFFF", frightened: false, eaten: false,
      blinkTimer: 0, scatterTarget: { col: 27, row: 31 },
      exitingHouse: true, inHouse: true,
      dotCounter: 0, dotThreshold: 30,
      homeCol: 13, homeRow: 13,
    },
    {
      x: 15.5 * CELL, y: 13.5 * CELL, dir: DOWN, nextDir: DOWN,
      color: "#FFB852", frightened: false, eaten: false,
      blinkTimer: 0, scatterTarget: { col: 0, row: 31 },
      exitingHouse: true, inHouse: true,
      dotCounter: 0, dotThreshold: 60,
      homeCol: 15, homeRow: 13,
    },
  ];
  return {
    maze,
    pacX: 13.5 * CELL,
    pacY: 23 * CELL,
    pacDir: NONE,
    pacNextDir: NONE,
    pacMouthAngle: 0.25,
    pacMouthOpen: true,
    ghosts,
    score: 0,
    lives: 3,
    level,
    dotsLeft: totalDots,
    totalDots,
    frightTimer: 0,
    gamePhase: "start",
    phaseTimer: 3,
    globalDotCounter: 0,
    globalDotLimit: 0,
    modeTimer: SCATTER_DURATIONS[0],
    chaseMode: false,
    modeIndex: 0,
    animFrame: 0,
  };
}

function tileAt(maze: number[][], col: number, row: number): number {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return 1;
  return maze[row][col];
}

function isWall(tile: number): boolean {
  return tile === 1;
}

function canMove(maze: number[][], col: number, row: number, forGhost = false): boolean {
  const t = tileAt(maze, col, row);
  if (isWall(t)) return false;
  if (!forGhost && t === 4) return false; // ghost-only paths
  return true;
}

function pixToTile(px: number): number {
  return Math.floor(px / CELL);
}

function tileCenter(t: number): number {
  return t * CELL + CELL / 2;
}

function wrapX(px: number): number {
  if (px < -CELL) return W + px;
  if (px > W) return px - W - CELL;
  return px;
}

function dirEqual(a: Dir, b: Dir): boolean {
  return a.x === b.x && a.y === b.y;
}

function opposite(d: Dir): Dir {
  return { x: -d.x, y: -d.y };
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return (ax - bx) ** 2 + (ay - by) ** 2;
}

function updatePacman(state: GameState, dt: number) {
  const speed = (CELL * 8) * dt;
  const col = pixToTile(state.pacX);
  const row = pixToTile(state.pacY);
  const cx = tileCenter(col);
  const cy = tileCenter(row);

  // Try to switch to nextDir when near tile center
  const nd = state.pacNextDir;
  if (!dirEqual(nd, NONE)) {
    const dx = Math.abs(state.pacX - cx);
    const dy = Math.abs(state.pacY - cy);
    if (dx < speed + 2 && dy < speed + 2) {
      const nc = col + nd.x;
      const nr = row + nd.y;
      if (canMove(state.maze, nc, nr)) {
        state.pacDir = nd;
        state.pacNextDir = NONE;
        state.pacX = cx;
        state.pacY = cy;
      }
    }
  }

  const d = state.pacDir;
  if (!dirEqual(d, NONE)) {
    const nc = col + d.x;
    const nr = row + d.y;
    const ahead = canMove(state.maze, nc, nr);
    if (ahead) {
      state.pacX += d.x * speed;
      state.pacY += d.y * speed;
      state.pacX = wrapX(state.pacX);
    } else {
      // snap to center if wall ahead
      const dx = Math.abs(state.pacX - cx);
      const dy = Math.abs(state.pacY - cy);
      if (dx < speed + 1) state.pacX = cx;
      if (dy < speed + 1) state.pacY = cy;
    }
  }

  // Mouth animation
  if (!dirEqual(state.pacDir, NONE)) {
    if (state.pacMouthOpen) {
      state.pacMouthAngle += dt * 4;
      if (state.pacMouthAngle >= 0.25) { state.pacMouthAngle = 0.25; state.pacMouthOpen = false; }
    } else {
      state.pacMouthAngle -= dt * 4;
      if (state.pacMouthAngle <= 0.01) { state.pacMouthAngle = 0.01; state.pacMouthOpen = true; }
    }
  }

  // Eat dots
  const pc = pixToTile(state.pacX);
  const pr = pixToTile(state.pacY);
  const tile = tileAt(state.maze, pc, pr);
  if (tile === 0) {
    state.maze[pr][pc] = 4;
    state.score += 10;
    state.dotsLeft--;
    state.globalDotCounter++;
  } else if (tile === 3) {
    state.maze[pr][pc] = 4;
    state.score += 50;
    state.dotsLeft--;
    state.globalDotCounter++;
    state.frightTimer = FRIGHT_DURATION;
    for (const g of state.ghosts) {
      if (!g.eaten) {
        g.frightened = true;
        g.blinkTimer = 0;
        g.dir = opposite(g.dir);
      }
    }
  }
}

function chooseGhostDir(state: GameState, ghost: Ghost): Dir {
  const col = pixToTile(ghost.x);
  const row = pixToTile(ghost.y);
  const dirs: Dir[] = [UP, LEFT, DOWN, RIGHT];
  const opp = opposite(ghost.dir);

  let target: { col: number; row: number };
  if (ghost.frightened) {
    // Random
    const valid = dirs.filter(d => {
      if (dirEqual(d, opp)) return false;
      return canMove(state.maze, col + d.x, row + d.y, true);
    });
    if (valid.length === 0) return opp;
    return valid[Math.floor(Math.random() * valid.length)];
  }

  if (ghost.eaten) {
    target = { col: 13, row: 11 };
  } else if (state.chaseMode) {
    const pc = pixToTile(state.pacX);
    const pr = pixToTile(state.pacY);
    if (ghost.color === "#FF0000") {
      // Blinky: direct chase
      target = { col: pc, row: pr };
    } else if (ghost.color === "#FFB8FF") {
      // Pinky: 4 tiles ahead
      target = { col: pc + state.pacDir.x * 4, row: pr + state.pacDir.y * 4 };
    } else if (ghost.color === "#00FFFF") {
      // Inky: complex
      const ax = pc + state.pacDir.x * 2;
      const ay = pr + state.pacDir.y * 2;
      const bx = pixToTile(state.ghosts[0].x);
      const by = pixToTile(state.ghosts[0].y);
      target = { col: ax + (ax - bx), row: ay + (ay - by) };
    } else {
      // Clyde: chase if far, scatter if near
      const dx = pc - col, dy = pr - row;
      if (dx * dx + dy * dy > 64) target = { col: pc, row: pr };
      else target = ghost.scatterTarget;
    }
  } else {
    target = ghost.scatterTarget;
  }

  const valid = dirs.filter(d => {
    if (dirEqual(d, opp) && !ghost.eaten) return false;
    return canMove(state.maze, col + d.x, row + d.y, true);
  });
  if (valid.length === 0) return opp;

  return valid.reduce((best, d) => {
    const nx = col + d.x, ny = row + d.y;
    const bx = col + best.x, by = row + best.y;
    return dist(nx, ny, target.col, target.row) < dist(bx, by, target.col, target.row) ? d : best;
  });
}

function updateGhosts(state: GameState, dt: number) {
  const baseSpeed = CELL * 7.5 * dt;

  for (const ghost of state.ghosts) {
    let speed = baseSpeed;
    if (ghost.frightened) speed = baseSpeed * 0.5;
    if (ghost.eaten) speed = baseSpeed * 2;

    // Exit ghost house
    if (ghost.inHouse) {
      ghost.dotCounter++;
      if (ghost.dotCounter >= ghost.dotThreshold || state.globalDotCounter >= ghost.dotThreshold) {
        ghost.inHouse = false;
        ghost.exitingHouse = true;
      }
      if (ghost.inHouse) {
        // Bob up and down inside house
        ghost.y += ghost.dir.y * speed;
        const homeY = ghost.homeRow * CELL + CELL / 2;
        if (ghost.y < homeY - CELL) ghost.dir = DOWN;
        if (ghost.y > homeY + CELL) ghost.dir = UP;
        continue;
      }
    }

    if (ghost.exitingHouse) {
      const exitX = 13.5 * CELL;
      const exitY = 11 * CELL;
      const dx = exitX - ghost.x;
      const dy = exitY - ghost.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < speed + 1) {
        ghost.x = exitX;
        ghost.y = exitY;
        ghost.exitingHouse = false;
        ghost.dir = LEFT;
      } else {
        ghost.x += (dx / len) * speed;
        ghost.y += (dy / len) * speed;
      }
      continue;
    }

    const col = pixToTile(ghost.x);
    const row = pixToTile(ghost.y);
    const cx = tileCenter(col);
    const cy = tileCenter(row);
    const dx = Math.abs(ghost.x - cx);
    const dy = Math.abs(ghost.y - cy);

    if (dx < speed + 2 && dy < speed + 2) {
      // at intersection — pick direction
      const newDir = chooseGhostDir(state, ghost);
      ghost.dir = newDir;
      ghost.x = cx;
      ghost.y = cy;

      // If eaten and reached home
      if (ghost.eaten && col === 13 && row === 11) {
        ghost.eaten = false;
        ghost.frightened = false;
        ghost.inHouse = true;
        ghost.exitingHouse = true;
        ghost.y = ghost.homeRow * CELL + CELL / 2;
        ghost.x = ghost.homeCol * CELL + CELL / 2;
        continue;
      }
    }

    ghost.x += ghost.dir.x * speed;
    ghost.y += ghost.dir.y * speed;
    ghost.x = wrapX(ghost.x);
  }

  // Fright timer
  if (state.frightTimer > 0) {
    state.frightTimer -= dt;
    if (state.frightTimer <= 0) {
      state.frightTimer = 0;
      for (const g of state.ghosts) {
        g.frightened = false;
        g.blinkTimer = 0;
      }
    }
  }
}

function checkCollisions(state: GameState): boolean {
  const pr = pixToTile(state.pacX);
  const pc = pixToTile(state.pacY);
  let eatScore = 200;
  for (const ghost of state.ghosts) {
    if (ghost.eaten) continue;
    const gc = pixToTile(ghost.x);
    const gr = pixToTile(ghost.y);
    const dx = Math.abs(ghost.x - state.pacX);
    const dy = Math.abs(ghost.y - state.pacY);
    if (dx < CELL * 0.8 && dy < CELL * 0.8) {
      if (ghost.frightened) {
        ghost.eaten = true;
        ghost.frightened = false;
        state.score += eatScore;
        eatScore *= 2;
      } else {
        return true; // pac dies
      }
    }
  }
  return false;
}

// ---- Drawing ----

function drawMaze(ctx: CanvasRenderingContext2D, maze: number[][]) {
  ctx.fillStyle = "#000033";
  ctx.fillRect(0, 0, W, H);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = maze[r][c];
      const x = c * CELL;
      const y = r * CELL;
      if (t === 1) {
        ctx.fillStyle = "#1a1aff";
        ctx.fillRect(x, y, CELL, CELL);
        // Inner highlight
        ctx.strokeStyle = "#0000aa";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
      } else if (t === 0) {
        ctx.fillStyle = "#ffff99";
        ctx.beginPath();
        ctx.arc(x + CELL / 2, y + CELL / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (t === 3) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x + CELL / 2, y + CELL / 2, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawPacman(ctx: CanvasRenderingContext2D, state: GameState) {
  const { pacX, pacY, pacDir, pacMouthAngle } = state;
  let angle = 0;
  if (dirEqual(pacDir, RIGHT)) angle = 0;
  else if (dirEqual(pacDir, LEFT)) angle = Math.PI;
  else if (dirEqual(pacDir, UP)) angle = -Math.PI / 2;
  else if (dirEqual(pacDir, DOWN)) angle = Math.PI / 2;

  const mouth = pacMouthAngle * Math.PI;

  ctx.fillStyle = "#FFE000";
  ctx.beginPath();
  ctx.moveTo(pacX + CELL / 2, pacY + CELL / 2);
  ctx.arc(pacX + CELL / 2, pacY + CELL / 2, CELL / 2 - 1, angle + mouth, angle + 2 * Math.PI - mouth);
  ctx.closePath();
  ctx.fill();
}

function drawGhost(ctx: CanvasRenderingContext2D, ghost: Ghost, frightTimer: number) {
  const x = ghost.x + CELL / 2;
  const y = ghost.y + CELL / 2;
  const r = CELL / 2 - 1;

  let color = ghost.color;
  if (ghost.frightened) {
    const blink = frightTimer < 2 && Math.floor(frightTimer * 4) % 2 === 0;
    color = blink ? "#ffffff" : "#0000ff";
  }
  if (ghost.eaten) color = "rgba(0,0,0,0)";

  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - r / 4, r, Math.PI, 0, false);
  ctx.lineTo(x + r, y + r * 0.75);
  const waves = 3;
  const ww = (r * 2) / waves;
  for (let i = waves - 1; i >= 0; i--) {
    const wx = x - r + ww * i + ww / 2;
    const wy = y + r * 0.75;
    ctx.quadraticCurveTo(wx, wy - r * 0.4, wx - ww / 2, wy);
  }
  ctx.lineTo(x - r, y - r / 4);
  ctx.fill();

  if (!ghost.eaten) {
    // Eyes
    const eyeOffX = r * 0.35;
    const eyeY = y - r * 0.2;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.ellipse(x - eyeOffX, eyeY, r * 0.28, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + eyeOffX, eyeY, r * 0.28, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    if (!ghost.frightened) {
      ctx.fillStyle = "#0000ff";
      const pupilX = ghost.dir.x * r * 0.12;
      const pupilY = ghost.dir.y * r * 0.12;
      ctx.beginPath(); ctx.ellipse(x - eyeOffX + pupilX, eyeY + pupilY, r * 0.14, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + eyeOffX + pupilX, eyeY + pupilY, r * 0.14, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      // Frightened face
      ctx.fillStyle = "#ffb8ff";
      ctx.beginPath();
      ctx.arc(x - eyeOffX, eyeY, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + eyeOffX, eyeY, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Eyes only for eaten ghost
    const eyeOffX = r * 0.35;
    const eyeY = y - r * 0.2;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.ellipse(x - eyeOffX, eyeY, r * 0.28, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + eyeOffX, eyeY, r * 0.28, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0000ff";
    ctx.beginPath(); ctx.ellipse(x - eyeOffX, eyeY, r * 0.14, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + eyeOffX, eyeY, r * 0.14, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px monospace";
  ctx.fillText(`SCORE: ${state.score}`, 10, H + 22);
  ctx.fillText(`LEVEL: ${state.level}`, W / 2 - 40, H + 22);
  // Lives
  for (let i = 0; i < state.lives; i++) {
    const lx = W - 30 - i * 24;
    ctx.fillStyle = "#FFE000";
    ctx.beginPath();
    ctx.moveTo(lx + 9, 9 + H + 8);
    ctx.arc(lx + 9, 9 + H + 8, 9, 0.25 * Math.PI, 1.75 * Math.PI);
    ctx.closePath();
    ctx.fill();
  }
}

function drawOverlay(ctx: CanvasRenderingContext2D, state: GameState) {
  if (state.gamePhase === "start") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#FFE000";
    ctx.font = "bold 28px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PAC-MAN", W / 2, H / 2 - 40);
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px monospace";
    ctx.fillText("READY!", W / 2, H / 2);
    ctx.font = "14px monospace";
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText("Arrow keys / WASD to move", W / 2, H / 2 + 40);
    ctx.textAlign = "left";
  } else if (state.gamePhase === "dead") {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#FF4444";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.fillText("WAKA WAKA...", W / 2, H / 2);
    ctx.textAlign = "left";
  } else if (state.gamePhase === "won") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#00FF88";
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.fillText("LEVEL CLEAR!", W / 2, H / 2);
    ctx.textAlign = "left";
  } else if (state.gamePhase === "gameover") {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#FF0000";
    ctx.font = "bold 30px monospace";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", W / 2, H / 2 - 20);
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px monospace";
    ctx.fillText(`SCORE: ${state.score}`, W / 2, H / 2 + 20);
    ctx.font = "14px monospace";
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText("Press ENTER to restart", W / 2, H / 2 + 55);
    ctx.textAlign = "left";
  }
}

export default function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(initState(1));
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const resetGame = useCallback(() => {
    stateRef.current = initState(1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      const state = stateRef.current;

      if (e.key === "Enter" && state.gamePhase === "gameover") {
        stateRef.current = initState(1);
        return;
      }
      if (state.gamePhase === "start") {
        // Any key starts
        stateRef.current.gamePhase = "playing";
      }

      const map: Record<string, Dir> = {
        ArrowUp: UP, ArrowDown: DOWN, ArrowLeft: LEFT, ArrowRight: RIGHT,
        w: UP, s: DOWN, a: LEFT, d: RIGHT,
        W: UP, S: DOWN, A: LEFT, D: RIGHT,
      };
      if (map[e.key]) {
        state.pacNextDir = map[e.key];
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function loop(ts: number) {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = ts;

      const state = stateRef.current;

      // Update mode timer
      if (state.gamePhase === "playing") {
        state.modeTimer -= dt;
        if (state.modeTimer <= 0 && state.modeIndex < 7) {
          state.chaseMode = !state.chaseMode;
          state.modeIndex++;
          const durations = state.chaseMode ? CHASE_DURATIONS : SCATTER_DURATIONS;
          state.modeTimer = durations[Math.min(Math.floor(state.modeIndex / 2), durations.length - 1)];
        }

        updatePacman(state, dt);
        updateGhosts(state, dt);

        const died = checkCollisions(state);
        if (died) {
          state.lives--;
          state.gamePhase = state.lives <= 0 ? "gameover" : "dead";
          state.phaseTimer = 2;
        }

        if (state.dotsLeft === 0) {
          state.gamePhase = "won";
          state.phaseTimer = 3;
        }
      } else if (state.gamePhase === "dead" || state.gamePhase === "won") {
        state.phaseTimer -= dt;
        if (state.phaseTimer <= 0) {
          if (state.gamePhase === "won") {
            stateRef.current = initState(state.level + 1);
            stateRef.current.score = state.score;
            stateRef.current.lives = state.lives;
            stateRef.current.gamePhase = "start";
          } else {
            // Respawn
            const ns = initState(state.level);
            ns.score = state.score;
            ns.lives = state.lives;
            ns.maze = state.maze;
            ns.dotsLeft = state.dotsLeft;
            ns.gamePhase = "start";
            stateRef.current = ns;
          }
        }
      }

      // Draw
      ctx!.clearRect(0, 0, W, H + 40);
      drawMaze(ctx!, state.maze);
      drawPacman(ctx!, state);
      for (const g of state.ghosts) drawGhost(ctx!, g, state.frightTimer);
      drawHUD(ctx!, state);
      drawOverlay(ctx!, state);
    }

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-yellow-400 text-4xl font-bold tracking-widest font-mono">PAC-MAN</h1>
      <canvas
        ref={canvasRef}
        width={W}
        height={H + 40}
        className="border-2 border-blue-600 rounded"
        style={{ imageRendering: "pixelated" }}
        tabIndex={0}
      />
      <p className="text-gray-400 text-sm font-mono">Arrow keys or WASD to move · ENTER to restart</p>
    </div>
  );
}
