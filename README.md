# Drive Thru Coffee — Three.js GitHub Pages Starter

A self-contained browser game inspired by the uploaded isometric drive-thru/coffee-shop reference.

## Run locally

Because ES modules are used, serve the folder with a local web server.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Publish on GitHub Pages

1. Create a repository.
2. Put the contents of this folder in the repository root.
3. Enable **Settings → Pages → Deploy from branch**.
4. Select `main` and `/ (root)`.
5. Your game will run from the generated GitHub Pages URL.

No Node build step is required.

## Current prototype

- Isometric 3D Three.js scene
- Drive-thru roads and shop
- Stylised low-poly lighting/shadows
- Cars arriving automatically
- Customer NPCs
- Clickable coffee machine, counter and till
- Cash, gems, XP/level and task UI
- Upgrade button
- Responsive/mobile-friendly UI
- GLTFLoader included and ready for custom `.glb` models

## Custom models

Put `.glb`/`.gltf` assets in `assets/models/`, then load them with `GLTFLoader`.

The next stage should replace the primitive shop/cars/people with proper models and add:
- queue/pathfinding
- recipes and order tickets
- staff hiring
- furniture placement
- shop expansion
- multiple locations
- save/load with localStorage
- progression and missions
- sound/music
- particles and polish
- touch controls
- proper menus
