# P5 TileRenderer Library with LVL LVL
## Example
See this example run live [here](https://ikeb108.github.io/P5-TileRenderer-Library/Example/).

To see this example project in LVL LVL, download the JSON file [here](Example/myMap.json) and import it to LVL LVL.
```javascript
function preload(){
  //Load a json file that was exported from https://lvllvl.com/
  //( you can also make one from scratch without LVLLVL )
  myMapJSON = loadJSON("myMap.json")
}

function setup(){
  createCanvas(500,500)
  
  //Create a new tile renderer using the json from https://lvllvl.com/
  myMap = new TileRenderer(myMapJSON);
  
  //The tile renderer automatically creates layer objects from the json data
  //and stores them in an array called layers.
  //We will create a graphic using the data from each layer.
  for(let i in myMap.layers){
    let thisLayer = myMap.layers[i];
    myMap.getGraphic(thisLayer.label, thisLayer) //a graphic is created and added to myMap's array called graphics
  }
  
  frameRateText = "The framerate is " + round(frameRate());
  frameRateText = frameRateText.toUpperCase();
  
}

function draw(){
  background(0);
  
  //scaling by an integer like 2 ensures that the tiles will appear exactly as they
  //do in the original tileset (scaling by a decimal will cause distortion when using noSmooth())
  scale(2); noSmooth();
  
  
  // Draw a light green background behind the map graphic
  // ===============================================
  fill( myMap.colorPalette[0] )
  // Get the dimensions of a graphic from myMap (doesn't matter which, they're all the same)
  let w = myMap.graphics["Triangle Background"].width
  let h = myMap.graphics["Triangle Background"].height
  rect(0, 0, w, h)
  
  
  // Draw each graphic from myMap to the screen
  // ===============================================
  myMap.setGraphicsToUnused(); //This feature will later help delete unused graphics
  
  for(let i in myMap.graphics){
    let thisGraphic = myMap.graphics[i];
    if(!thisGraphic.name.includes("FRAMERATE")){ //We don't yet want to draw the framerate graphic (see below)
      thisGraphic.update();
      image(thisGraphic, 0, 0)
    }
  }
  
  
  //Create a text graphic that displays the framerate
  //=========================
  myMap.alphabet = "Commodore 64" //Tell the tile renderer which tileset we used in lvllvl.com so that it knows which tile indeces correspond to which letters (only needs to be done once)
  let myTextSettings = {
    textColor: 3, //text color must be an index from the color palette when using lvllvl.com
    widthInCharacters: 10, //text will wrap after 10 characters
    tilesPerFrame: 1, //Only one tile will be drawn each frame
  }
  if(frameCount % 100 == 0){
    //Once every 100 frames, update the framerate text
    frameRateText = "The framerate is " + round(frameRate())
    frameRateText = frameRateText.toUpperCase(); //With the Commodore 64 tileset, all letters must be uppercase. This varies depending on the tileset.
  }
  myTextGraphic = myMap.getTextGraphic(frameRateText, myTextSettings)
  myTextGraphic.update();
  image(myTextGraphic, 90, 180 )
  
  myMap.deleteUnusedGraphics(); //This feature helps clear out unused graphics (especially important when creating text graphics).
}

```
## First Steps
In LVL LVL, click Export --> JSON. Use the following settings (should be defaults).

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
