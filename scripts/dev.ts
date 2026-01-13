#!/usr/bin/env bun

import { existsSync, mkdirSync } from "fs";

// Ensure dist directory exists
if (!existsSync("dist")) {
  mkdirSync("dist", { recursive: true });
}

// Build CSS once first to ensure file exists
console.log("Building initial CSS...");
const buildResult = Bun.spawn([
  "bunx",
  "@tailwindcss/cli",
  "-i",
  "src/styles/input.css",
  "-o",
  "dist/styles.css",
], {
  stdout: "inherit",
  stderr: "inherit",
});

await buildResult.exited;
if (buildResult.exitCode !== 0) {
  console.error("Failed to build initial CSS");
  process.exit(1);
}

console.log("Starting Tailwind CSS watch and dev server...");

// Start Tailwind CSS watch process
const tailwind = Bun.spawn([
  "bunx",
  "@tailwindcss/cli",
  "-i",
  "src/styles/input.css",
  "-o",
  "dist/styles.css",
  "--watch",
], {
  stdout: "inherit",
  stderr: "inherit",
});

// Start the dev server
const devServer = Bun.spawn([
  "bun",
  "run",
  "--hot",
  "src/index.ts",
], {
  stdout: "inherit",
  stderr: "inherit",
});

// Handle cleanup on exit
process.on("SIGINT", () => {
  tailwind.kill();
  devServer.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  tailwind.kill();
  devServer.kill();
  process.exit(0);
});

// Wait for both processes (they should run indefinitely)
await Promise.all([
  tailwind.exited,
  devServer.exited,
]);
