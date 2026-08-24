# fireball-firestarter-examples-reactjs

FireStarter game client examples in React for Fireball RGS (Doof Troop).

## Setup

```bash
npm install
npm run dev
```

Dev proxies `/api/livekit-token` to the dt-dashboard viewer token endpoint.

## Layout

```
src/
  app/                 # app shell
  assets/              # brand, fonts, ui chrome, doof sprites
  domain/round/        # round_state, commands, overlay mapping
  features/
    betting/           # PLACE YOUR BETS / NO MORE BETS overlay
    loading/           # branded LOADING / CONNECTING screens
    stream/            # LiveKit fullscreen viewer
  styles/              # global styles
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
