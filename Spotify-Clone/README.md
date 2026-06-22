# 🎵 Spotify Web Player Clone

Welcome to my Spotify Web Player Clone! This isn't just a static mockup; it's a fully functional frontend music player built completely from scratch. No frameworks, no magic libraries—just pure Vanilla JavaScript, CSS, and HTML.

## ✨ Features That Actually Work

*   **Dynamic Playlist Generation:** Drop a folder of MP3s, a `cover.jpg`, and an `info.json` into the `songs/` directory, and the app *automatically* builds a new playlist card on the homepage. Look mom, no hardcoded HTML!
*   **Fully Functional Audio Player:** Play, pause, next, previous, loop, and shuffle. It does it all.
*   **Interactive Seekbar:** Click and drag to skip to your favorite part of the track. The time updates dynamically as you listen.
*   **Responsive Design:** Looks great on a massive desktop monitor and scales down perfectly with a custom hamburger menu for mobile devices.
*   **Familiar UI:** Styled to look and feel exactly like the real Spotify web interface.

## 🛠️ Tech Stack

*   **HTML5:** The skeleton.
*   **CSS3:** The styling, flexbox layouts, and buttery smooth hover transitions.
*   **Vanilla JavaScript (ES6+):** The brains. Handles the `fetch` API for dynamic file loading, DOM manipulation, and HTML5 Audio events.

## 🚀 How to Run This Locally

Because this app uses JavaScript `fetch` to dynamically read folders and JSON files, you can't just double-click the `index.html` file to open it (your browser will block it for security reasons!). 

You need a local server. Here is the easiest way:

1. Clone this repository to your machine.
2. Open the `Spotify-Clone` folder in VS Code.
3. Install the **Live Server** extension.
4. Click **"Go Live"** in the bottom right corner of VS Code.
5. Grab your headphones and vibe out. 🎧

## 📁 How to Add Your Own Music

Want to add your own playlist? It's ridiculously easy:

1. Create a new folder inside the `songs/` directory (e.g., `songs/my-awesome-mix/`). *Pro-tip: Don't use spaces in the folder name!*
2. Drop in your `.mp3` files.
3. Add a square image named exactly `cover.jpg`.
4. Create a file named exactly `info.json` and add this code:
```json
   {
       "title": "My Awesome Mix",
       "description": "The greatest songs ever recorded."
   }