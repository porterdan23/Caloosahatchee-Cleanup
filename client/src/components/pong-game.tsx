import { useEffect, useRef, useCallback } from "react";

const W = 800;
const H = 500;
const PADDLE_W = 12;
const PADDLE_H = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 400;
const WINNING_SCORE = 11;

interface PongState {
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  leftY: number;
  rightY: number;
  leftScore: number;
  rightScore: number;
  phase: "start" | "playing" | "point" | "gameover";
  phaseTimer: number;
  winner: "left" | "right" | null;
  leftAI: boolean;
  rightAI: boolean;
}

function initState(): PongState {
  return {
    ballX: W / 2,
    ballY: H / 2,
    ballVX: 260 * (Math.random() > 0.5 ? 1 : -1),
    ballVY: 180 * (Math.random() > 0.5 ? 1 : -1),
    leftY: H / 2 - PADDLE_H / 2,
    rightY: H / 2 - PADDLE_H / 2,
    leftScore: 0,
    rightScore: 0,
    phase: "start",
    phaseTimer: 0,
    winner: null,
    leftAI: false,
    rightAI: true,
  };
}

function resetBall(state: PongState, towardLeft: boolean) {
  state.ballX = W / 2;
  state.ballY = H / 2;
  const speed = 260;
  state.ballVX = speed * (towardLeft ? -1 : 1);
  state.ballVY = (80 + Math.random() * 120) * (Math.random() > 0.5 ? 1 : -1);
}

function updateAI(paddleY: number, ballY: number, ballVX: number, side: "left" | "right", dt: number): number {
  // AI reacts only when ball moving toward its side
  const relevant = side === "left" ? ballVX < 0 : ballVX > 0;
  const center = paddleY + PADDLE_H / 2;
  const target = relevant ? ballY : H / 2;
  const diff = target - center;
  const maxMove = PADDLE_SPEED * 0.72 * dt;
  const move = Math.max(-maxMove, Math.min(maxMove, diff));
  return Math.max(0, Math.min(H - PADDLE_H, paddleY + move));
}

function draw(ctx: CanvasRenderingContext2D, state: PongState) {
  // Background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // Center dashed line
  ctx.setLineDash([10, 14]);
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  // Scores
  ctx.fillStyle = "#fff";
  ctx.font = "bold 64px monospace";
  ctx.textAlign = "center";
  ctx.fillText(String(state.leftScore), W / 2 - 100, 80);
  ctx.fillText(String(state.rightScore), W / 2 + 100, 80);

  // Paddles
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.roundRect(20, state.leftY, PADDLE_W, PADDLE_H, 4);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(W - 20 - PADDLE_W, state.rightY, PADDLE_W, PADDLE_H, 4);
  ctx.fill();

  // Ball
  if (state.phase !== "gameover") {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(state.ballX - BALL_SIZE / 2, state.ballY - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE, 2);
    ctx.fill();
  }

  // Overlays
  if (state.phase === "start") {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PONG", W / 2, H / 2 - 50);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#aaa";
    ctx.fillText("W/S  — Left paddle", W / 2, H / 2 + 10);
    ctx.fillText("↑/↓  — Right paddle (vs AI: AI plays)", W / 2, H / 2 + 40);
    ctx.fillText("Press SPACE to start", W / 2, H / 2 + 90);
  } else if (state.phase === "gameover" && state.winner) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 42px monospace";
    ctx.textAlign = "center";
    const label = state.winner === "left" ? "LEFT WINS!" : "RIGHT WINS!";
    ctx.fillText(label, W / 2, H / 2 - 20);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#aaa";
    ctx.fillText("Press SPACE to play again", W / 2, H / 2 + 40);
  }

  ctx.textAlign = "left";
}

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<PongState>(initState());
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      const state = stateRef.current;

      if (e.key === " ") {
        e.preventDefault();
        if (state.phase === "start" || state.phase === "gameover") {
          stateRef.current = initState();
          stateRef.current.phase = "playing";
        }
      }
      if (["ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function loop(ts: number) {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((ts - lastRef.current) / 1000, 0.05);
      lastRef.current = ts;
      const state = stateRef.current;
      const keys = keysRef.current;

      if (state.phase === "playing") {
        // Left paddle (human W/S)
        if (!state.leftAI) {
          if (keys.has("w") || keys.has("W")) state.leftY = Math.max(0, state.leftY - PADDLE_SPEED * dt);
          if (keys.has("s") || keys.has("S")) state.leftY = Math.min(H - PADDLE_H, state.leftY + PADDLE_SPEED * dt);
        } else {
          state.leftY = updateAI(state.leftY, state.ballY, state.ballVX, "left", dt);
        }

        // Right paddle (human arrows or AI)
        if (!state.rightAI) {
          if (keys.has("ArrowUp")) state.rightY = Math.max(0, state.rightY - PADDLE_SPEED * dt);
          if (keys.has("ArrowDown")) state.rightY = Math.min(H - PADDLE_H, state.rightY + PADDLE_SPEED * dt);
        } else {
          state.rightY = updateAI(state.rightY, state.ballY, state.ballVX, "right", dt);
        }

        // Ball movement
        state.ballX += state.ballVX * dt;
        state.ballY += state.ballVY * dt;

        // Top/bottom bounce
        if (state.ballY - BALL_SIZE / 2 <= 0) {
          state.ballY = BALL_SIZE / 2;
          state.ballVY = Math.abs(state.ballVY);
        }
        if (state.ballY + BALL_SIZE / 2 >= H) {
          state.ballY = H - BALL_SIZE / 2;
          state.ballVY = -Math.abs(state.ballVY);
        }

        // Left paddle collision
        if (
          state.ballX - BALL_SIZE / 2 <= 20 + PADDLE_W &&
          state.ballX - BALL_SIZE / 2 >= 20 &&
          state.ballY >= state.leftY - BALL_SIZE / 2 &&
          state.ballY <= state.leftY + PADDLE_H + BALL_SIZE / 2
        ) {
          state.ballX = 20 + PADDLE_W + BALL_SIZE / 2;
          const relY = (state.ballY - (state.leftY + PADDLE_H / 2)) / (PADDLE_H / 2);
          const angle = relY * (Math.PI / 3);
          const speed = Math.min(Math.hypot(state.ballVX, state.ballVY) * 1.05, 700);
          state.ballVX = Math.abs(Math.cos(angle) * speed);
          state.ballVY = Math.sin(angle) * speed;
        }

        // Right paddle collision
        if (
          state.ballX + BALL_SIZE / 2 >= W - 20 - PADDLE_W &&
          state.ballX + BALL_SIZE / 2 <= W - 20 &&
          state.ballY >= state.rightY - BALL_SIZE / 2 &&
          state.ballY <= state.rightY + PADDLE_H + BALL_SIZE / 2
        ) {
          state.ballX = W - 20 - PADDLE_W - BALL_SIZE / 2;
          const relY = (state.ballY - (state.rightY + PADDLE_H / 2)) / (PADDLE_H / 2);
          const angle = relY * (Math.PI / 3);
          const speed = Math.min(Math.hypot(state.ballVX, state.ballVY) * 1.05, 700);
          state.ballVX = -(Math.abs(Math.cos(angle) * speed));
          state.ballVY = Math.sin(angle) * speed;
        }

        // Score
        if (state.ballX < 0) {
          state.rightScore++;
          if (state.rightScore >= WINNING_SCORE) {
            state.winner = "right";
            state.phase = "gameover";
          } else {
            resetBall(state, false);
          }
        } else if (state.ballX > W) {
          state.leftScore++;
          if (state.leftScore >= WINNING_SCORE) {
            state.winner = "left";
            state.phase = "gameover";
          } else {
            resetBall(state, true);
          }
        }
      }

      draw(ctx!, state);
    }

    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-white text-4xl font-bold tracking-widest font-mono">PONG</h1>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="border-2 border-gray-700 rounded"
        style={{ imageRendering: "pixelated" }}
        tabIndex={0}
      />
      <p className="text-gray-500 text-sm font-mono">W/S — Left · Arrow Up/Down — Right (AI) · SPACE — Start</p>
    </div>
  );
}
