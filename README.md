# Platform Improvement

A 2D Top-scrolling platformer built with [Phaser 3](https://phaser.io/) and Arcade Physics. Guide your character through multi-layered tile maps, collect coins, and enjoy juicy particle effects and sound design as you run, jump, and land across platforms.

---

## 🎮 Controls

| Key | Action |
|---|---|
| **← Left Arrow** | Move left |
| **→ Right Arrow** | Move right |
| **↑ Up Arrow** | Jump (must be on the ground) |
| **R** | Restart the level |
| **D** | Toggle physics debug overlay |

---

## ✨ Features

- Smooth acceleration and drag-based movement (no "ice" feel by default)
- Multi-tileset level built in Tiled — includes standard, industry, and secret layers
- Collectible coins with overlap detection
- Particle VFX for walking dust, jump burst, air trail, and landing impact
- Contextual sound effects: footsteps, jump, and landing
- Looping background music ("Tricky.mp3")
- Camera smoothly follows the player with a deadzone and 2× zoom

---

## 🛠️ Tech Stack

- **Phaser 3** (v3.70.0) — game framework
- **Arcade Physics** — collision and overlap handling
- **Tiled** — level design (`.tmj` tilemap format)
- **Kenny Assets** — tiles, characters, and particle sprites

---

## 🚀 Running the Game

Because the game loads assets via `fetch`, it must be served over HTTP (opening `index.html` directly in the browser will not work).

```bash
# Using Node.js (http-server)
npx http-server .

# Using Python
python -m http.server
```

Then open `http://localhost:8080` (or the port shown) in your browser.

---

## 📁 Project Structure

```
├── assets/          # Sprites, tilemaps, audio
├── lib/             # Phaser library
├── src/
│   ├── main.js      # Game config and entry point
│   └── Scenes/
│       ├── Load.js       # Asset preloading and animation setup
│       └── Platformer.js # Main gameplay scene
└── index.html
```

---

## 🖼️ Credits

Visual assets courtesy of [Kenney Assets](https://kenney.nl/assets).

---

## 💼 LinkedIn Description

> Built a browser-based 2D platformer from scratch using **Phaser 3** and **Arcade Physics**. The project features a multi-layer tilemap level designed in Tiled, coin collection mechanics, responsive acceleration-based movement, and a full suite of particle effects (walking dust, jump bursts, air trails, and landing impacts) paired with contextual sound design. Implemented camera follow with smoothing and deadzone, and a scalable scene architecture (Load → Platformer) for clean asset management. Packaged and served entirely on the client side with no back-end dependencies.
