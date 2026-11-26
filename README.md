# Tidy Robot

[Play on GitHub Pages](https://carlosalbaladejo.github.io/tidy-robot/).

A small third-person tidying game in Spanish, for a console controller in Link Arcade. Import the launch page with **Add by URL**; there is no separate APK.

- D-pad: walk forward/back and turn.
- Cross (bottom face button): pick up a toy, retrieve one from a box, or confirm a menu.
- Square (left face button): put down the held toy, or go back in menus.
- Select: open **Contrarreloj: Sí/No**. Start: pause.

The review runs after every toy is inside a container. Misplaced toys take precedence over the timer and can be corrected without resetting the room. Time starts on the first movement or pickup and advances only during play. Running out of time doesn't stop the player from tidying. The timer preference is saved on the game's origin and defaults to off.

The standalone version also supports arrow keys, X to pick up, Z to drop, V for settings, Escape for pause, and touch buttons on narrow or touch screens. If a WebView requires a direct gesture for audio, tap the musical-note button once.

Serve only `docs/`. The launch page links its same-origin Link Arcade manifest and original cover. All runtime files are local; the vendored renderer license is in `docs/vendor/LICENSE`.

```sh
python3 -m http.server 8097 --bind 127.0.0.1 --directory docs
```
