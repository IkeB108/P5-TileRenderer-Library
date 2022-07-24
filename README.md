# P5 TileRenderer Library
![Capture](https://user-images.githubusercontent.com/56776763/180667373-ac130083-f43c-4197-8eac-cb31158053f7.PNG)

Renders tile maps (especially those made with https://lvllvl.com) to your P5JS sketch without slowing the framerate.

(Can also render tile maps not made with LVL LVL)

## How to Use with LVL LVL
In LVL LVL, click Export => JSON. Use the following settings (should be defaults).

**WARNING:** Take note of the listed [Unsupported LVL LVL Features](https://github.com/IkeB108/P5-TileRenderer-Library/new/main?readme=1#unsupported-lvl-lvl-features) when exporting.

![lvllvl_settings](https://user-images.githubusercontent.com/56776763/180666857-cf1057f0-90c7-4c5d-9a8e-3167779d4033.PNG)

In your sketch's `preload()` function, load the JSON file:
```javascript
function preload(){
  myMapJSON = loadJSON("myMap.json")
}
```
Include the tile renderer script in your `index.html` head:
```javascript
<script src="libraries/tileset.js" type="text/javascript"></script>
```
In your sketch's `setup()` function, create a new TileRenderer:
```javascript
function setup(){
  myMap = new TileRenderer(myMapJSON);
}
```

## Unsupported LVL LVL Features
- Tile rotating and flipping
  - LVL LVL does not include this data when exporting to JSON.
  - However, you can rotate and flip and edit tiles as much as you like in LVL LVL's **tile editor**.
- Tile background colors
  - This is intentionally unsupported because it would require drawing a `rect()` behind every tile, which is very inefficient and not appropriate for most projects.
  - However, you can draw one `rect()` behind the entire layer to do backgrounds (see the provided example).
