# P5 TileRenderer Library with LVL LVL
Take note of the listed [Unsupported LVL LVL Features](#unsupported-lvl-lvl-features).



## First Steps
In LVL LVL, click Export --> JSON. Use the following settings (should be defaults).

![lvllvl_settings](https://user-images.githubusercontent.com/56776763/180666857-cf1057f0-90c7-4c5d-9a8e-3167779d4033.PNG)

Include the tile renderer script in your `index.html` head:
```javascript
<script src="tileRenderer.js" type="text/javascript"></script>
```
In your sketch's `preload()` function, load the JSON file:
```javascript
function preload(){
  myLvlLvlJSON = loadJSON("lvlllvlexport.json")
}
```
In your sketch's `setup()` function, create a new TileRenderer using your new JSON object:
```javascript
function setup(){
  myTileRenderer = new TileRenderer(myLvlLvlJSON);
}
```







## How To...
![Capture](https://user-images.githubusercontent.com/56776763/180682856-cc484d52-4551-4bb3-8644-a7a92b1935c9.PNG)

- [How to Draw Graphics](#how-to-draw-graphics)
- [How to Draw Text Graphics](#how-to-draw-text-graphics)
- [IMPORTANT: How to prevent memory leakage with `deleteUnusedGraphics()`](#important-how-to-prevent-memory-leakage-with-deleteunusedgraphics)
- [How to Manually Delete Graphics](#deletegraphic) (redirects to `deleteGraphic()`)
- [How to Modify Graphics](#settile) (redirects to `setTile()`)

## How To Draw Graphics
In your `draw` loop...
1. Create or retrieve a graphic using [`getGraphic()`](Instructions_withLVLLVL.md#getGraphic)
    - First argument: a name for your graphic (string; can be anything)
    - Second argument: a layer object retrieved using the TileRenderer's [`getLayer()` method](Instructions_withLVLLVL.md#getlayer)
    - Third argument (optional): should be an object containing settings for your graphic. [See here.](Instructions_withLVLLVL.md#getGraphic)
2. Call the graphic's [`update()`](Instructions_withLVLLVL.md#update) method so that it will start or continue rendering
3. Draw the graphic to the canvas using p5's `image()` function
4. Remember to [prevent memory leakage with `deleteUnusedGraphics`](Instructions_HowTo_withLVLLVL.md#important-how-to-prevent-memory-leakage-with-deleteunusedgraphics)
```javascript
//Example
function draw(){
  /*Step 1*/  let walkwaysGraphic = myTileRenderer.getGraphic("walkways", walkwaysLayer, walkwaysSettings )
  /*Step 2*/  walkwaysGraphic.update()
  /*Step 3*/  image(walkwaysGraphic, 0, 0)
}
```
## How to Draw Text Graphics
In your `setup` function...
1. Set your TileRenderer's `alphabet` property to the name of the tileset you used in LVL LVL

Then, in your `draw` loop...

2. Create or retrieve a text graphic using [`getTextGraphic()`](Instructions_withLVLLVL.md#getTextGraphic)
    - First argument: the text you wish to display *(a new graphic will be created every time this text changes)*
    - Second argument (required): an object containing settings for the graphic, including a textColor. [See here.](Instructions_withLVLLVL.md#getTextGraphic)
3. Call the graphic's [`update()`](Instructions_withLVLLVL.md#update) method so that it will start or continue rendering
4. Draw the graphic to the canvas using p5's `image()` function
5. Remember to [prevent memory leakage with `deleteUnusedGraphics`](Instructions_HowTo_withLVLLVL.md#important-how-to-prevent-memory-leakage-with-deleteunusedgraphics)
```javascript
//Example
function setup(){
  /*Step 1*/ myTileRenderer.alphabet = "Commodore 64"
}
function draw(){
  /*Step 2*/  let playerScoreGraphic = myTileRenderer.getTextGraphic("Score: " + playerScore, myTextSettings )
  /*Step 3*/  playerScoreGraphic.update()
  /*Step 4*/  image(playerScoreGraphic, 0, 0)
}
```
## IMPORTANT: How to prevent memory leakage with `deleteUnusedGraphics()`
If unused graphics are not deleted, they may quickly pile up (especially text graphics*), which can drastically slow down or freeze your sketch.

In your `draw` loop...
1. Before any graphics are updated, call your TileRenderer's `setGraphicsToUnused()` method.
2. After all graphics are updated and drawn, call your TileRenderer's `deleteUnusedGraphics()` method
3. To make a graphic immune to deletion, set its `protected` setting to true in [the graphic's settings](Instructions_withLVLLVL.md#getGraphic)

To make sure it worked...
1. Check how many graphics are in the `graphics` object: `console.log( Object.keys(myTileRenderer.graphics).length )` There should be a reasonable number.
2. Check the Elements tab of Chrome Dev Tools. There should be a reasonable number of canvas elements.

If your sketch is still running slow...
- Make sure the unused graphics are not being referenced anywhere else, like a variable or array you created. Use `let` or `var` to avoid storing graphics objects in global variables. [Learn more about memory management and garbage collection](https://javascript.info/garbage-collection)
```javascript
//Example
function draw(){
  /*Step 1*/ myTileRenderer.setGraphicsToUnused();
  
  //all graphics are updated and drawn...
  let graphic1 = myTileRenderer.graphics["graphic1"]
  graphic1.update();
  image(graphic1, 0, 0);
  let graphic2 = myTileRenderer.graphics["graphic2"]
  graphic2.update();
  image(graphic2, 0, 0);
  
  /*Step 2*/ myTileRenderer.deleteUnusedGraphics();
  
}
```
**A new text graphic is created every time the text changes when you call `getTextGraphic()`. For example, if you call `getTextGraphic()` to display the frame rate (as is done in the provided [example sketch](Instructions_withLVLLVL.md#example-sketch)), a new graphic will be created every time the frame rate changes. So deleting old text graphics is especially important.*






## TileRenderer Properties
The TileRenderer object comes with the following properties:
```javascript
myTileRenderer.graphics //An array of graphics created with getGraphic() and getTextGraphic()
myTileRenderer.layers //An array of layers imported from LVL LVL. The layer objects will be slightly different from the layer objects in your JSON file
myTileRenderer.colorPalette //An array of p5 color objects. Palette is imported from LVL LVL
myTileRenderer.sheet //A p5 graphic that displays all the tiles in your tileset (see below)
myTileRenderer.sheetRenderComplete //Boolean storing whether the sheet graphic has fully rendered. No other graphics will be drawn until this is done.
myTileRenderer.sheetJSON //The JSON file imported from LVL LVL 
myTileRenderer.sheetTileCount //Integer -- how many tiles are in your tileset
myTileRenderer.tileSize //The width and height of each tile in pixels (tiles must be square)
myTileRenderer.rendersPerFrame //An integer that stores how many tiles were rendered in the last animation frame (you can check this for debugging purposes)
myTileRenderer.alphabet //String -- If you plan to use text graphics, set this to the name of the tileset you used in LVL LVL
```
### The tilesheet:
This is an example of what the `myTileRenderer.sheet` graphic looks like. You can draw it in your sketch with `image()`

![Capture](https://user-images.githubusercontent.com/56776763/180670499-76f6824e-73bf-4701-b297-82fc2e752dcb.PNG)

The sheet graphic comes with useful properties of its own:
```javascript
myTileRenderer.sheet.positionOf //An object storing the x y coordinates of all tiles in the sheet graphic. Use like so:
// console.log(myTileRenderer.sheet.positionOf[0]) //Returns the coordinates of the 0th tile: {x: 0, y: 0}
myTileRenderer.sheet.rowSize //Size (in tiles) of rows in the tile sheet (should be 10 if importing from lvl lvl)
myTileRenderer.sheet.columnSize //Size (in tiles) of columns in the tile sheet
myTileRenderer.sheet.renderProgress //How many tiles have been rendered in the sheet so far (tiles only need to render once)
myTileRenderer.sheet.tilesPerFrame //How many tiles to draw to the sheet per animation frame (defaults to 50)
```




## TileRenderer Methods
### `getGraphic()`
```javascript
myTileRenderer.getGraphic( name, layerObject, [graphicSettingsObject] )
```
Creates a new p5 graphic named `name` and adds it to the TileRenderer's `graphics` object. Or, if a graphic named `name` already exists, it just returns that graphic. The tiles described in `layerObject` will be drawn to this graphic when its `update()` method is called.

- `name`: String. Name of the graphic to create/retrieve
- `layerObject`: Object. A layer from the TileRenderer's `layers` array (or one imported with `importLayers()`)
- `graphicSettingsObject`: Optional Object. Stores your preferred settings for this graphic. It can have any of the properties below (any properties not included default to the values shown below)
```javascript
graphicSettingsObject = {
  tilesPerFrame: 10, //How many tiles from this graphic will be rendered to the screen each animation frame
  protected: false, //When true, graphic will not be deleted by the TileRenderer's deleteUnusedGraphics() method.
  tileSize: [defaults to the tile size in the sheet graphic],  //The desired width and height of tiles in this graphic in pixels
  width: [default is calculated based on tileSize], //The desired width of the graphic in pixels
  height: [default is calculated based on tileSize], //The desired height of the graphic in pixels
}
```
### `getTextGraphic()`
```javascript
myTileRenderer.getTextGraphic( textString, [graphicSettingsObject] )
```
Creates a new p5 graphic that will render the text in `textString`, and adds it to the TileRenderer's `graphics` object. Or, if a text graphic containing the text in `textString` already exists, it just returns that graphic.
- `textString`: String. The text to render in the text graphic
- `graphicSettingsObject`: Optional. An object with all the same settings options when calling `getGraphic()`, but with two additions:
```javascript
graphicSettingsObject = {
  textColor: __, //REQUIRED: index of the desired text color in the color palette
  widthInCharacters: __, //Optional: For word wrapping, how many characters wide the text is allowed to be (if not set, there will be no word wrapping)
}
```
IMPORTANT NOTE: The `getTextGraphic` method requires the TileRenderer's `alphabet` property to be set to the name of the tileset used in LVL LVL:
```javascript
//Example...
myTileRenderer.alphabet = "Commodore 64"
```
### `setGraphicsToUnused() and deleteUnusedGraphics()`
See [here](Instructions_HowTo_withLVLLVL.md#important-how-to-prevent-memory-leakage-with-deleteunusedgraphics)
### `deleteGraphic()`
```javascript
myTileRenderer.deleteGraphic( graphicName )
```
Deletes the graphic named `graphicName` from the `graphics` object (even if the graphic's `protected` setting is set to `true`). It is recommended to use this method instead of trying to delete the graphic yourself.
### `sheetIndexOf()`
```javascript
myTileRenderer.sheetIndexOf( character )
```
Returns the index (in the [tilesheet](Instructions_withLVLLVL.md#the-tilesheet)) of the given character. This method requires the TileRenderer's `alphabet` property to be set to the name of the tileset used in LVL LVL.
- `character`: A string of length 1
### `getLayer()`
```javascript
myTileRenderer.getLayer( layerLabelOrIndex )
```
Returns the layer object from LVL LVL that is labelled (or has an index of) `layerLabelOrIndex`
- `layerLabelOrIndex`: A string (name of the layer) or an integer (index of the layer in the TileRenderer's `layers` array)
### `importLayers()`
```javascript
myTileRenderer.importLayers( layersObject )
```
Imports an object that was exported with the TileRenderer's `exportLayers()` method (not meant to import content directly from LVL LVL).

Use this if you want to use a map made with LVL LVL, but with a [tilesheet](Instructions_withLVLLVL.md#the-tilesheet) that is not from LVL LVL.

### `exportLayers()`
```javascript
myTileRenderer.exportLayers( fileName )
```
Exports information about the TileRenderer's layers to a JSON file named `fileName`.
- `fileName`: String. Name of the json file that will be downloaded.




## Graphics Properties
Properties of graphics objects stored in `graphics`:
```javascript
myGraphic.name //String; Name of the graphic that was given when this graphic was created
myGraphic.used //Boolean storing whether this graphic's update() method has been called sometime in the current animation frame
myGraphic.renderProgress //Integer; how many tiles in this graphic have rendered so far
myGraphic.renderComplete //Boolean; whether the graphic has finished rendering
myGraphic.tileChangeQueue //Array of tile changes that were made with the setTile() method
myGraphic.settings //Object containing all the settings that were given when this graphic was created
myGraphic.layerObject //The layer object that was given when this graphic was created

// ...in addition to the properties that all p5 graphics objects have
```




## Graphics Methods
Methods of graphics objects stored in `graphics`:
### `update()`
```javascript
myGraphic.update()
```
Updates the graphic: renders new tiles, and makes any tile changes in the graphic's `tileChangeQueue`. This should be called once per frame for every graphic being drawn. A graphic will stay blank if its `update()` method is never called.
### `setTile()`
```javascript
myGraphic.setTile( tileIndexInGraphic, propertiesOfNewTile )
//or...
myGraphic.setTile( tileX, tileY, propertiesOfNewTile )
```
In the graphic, sets the tile at index `tileIndexInGraphic` (or at the coordinates `tileX, tileY`) to have the properties in `propertiesOfNewTile`

- `tileIndexInGraphic`: Integer. Index of the tile you wish to change
- `tileX`: Integer. X coordinate of the tile you wish to change
- `tileY`: Integer. Y coordinate of the tile you wish to change
- `propertiesOfNewTile`: Object, formatted like this:
```javascript
propertiesOfNewTile = {
  sheetIndex: __, //Integer. index (in the tilesheet) of the character that the tile should be set to
  tileColor: __, //Optional integer. Index of the new desired color in the color palette
  priority: false, //Optional boolean (default is false). When true, this tile change will be added to
  //the front of the `tileChangeQueue` and will be rendered before any other tile changes or before
  //the graphic even finishes fully rendering.
}
```
### `getTile()`
```javascript
myGraphic.getTile( tileIndexInGraphic )
//or...
myGraphic.getTile( tileX, tileY )
```
Returns an object (formatted like below) containing data about the tile at index `tileIndexInGraphic` or at the coordinates `tileX, tileY`
```javascript
propertiesOfNewTile = {
  sheetIndex: __, //Integer. index (in the tilesheet) of the character this tile is set to
  tileColor: __ //Optional integer. Index of this tile's color in the color palette
}
```
### `locateCharacter()`
```javascript
myGraphic.locateCharacter( sheetIndex, [tileColor] )
```
Returns an array of tile indeces in the graphic that are set to a particular character. (This character is the character with an index of `sheetIndex` in the [tilesheet](Instructions_withLVLLVL.md#the-tilesheet)). If a `tileColor` is provided (optional), only tiles that have that color will be returned.
- `sheetIndex`: Integer. Index of the desired character in the [tilesheet](Instructions_withLVLLVL.md#the-tilesheet)
- `tileColor`: Integer. Index of a color in the TileRenderer's color palette.
### `indexToCoordinates()`
```javascript
myGraphic.indexToCoordinates( tileIndex )
```
Given the index of a tile in the graphic, returns the x and y coordinates of that tile.
- `tileIndex`: Integer. Index (in the graphic) of a tile
### `coordinatesToIndex()`
```javascript
myGraphic.coordinatesToIndex( tileX, tileY )
```
Given the x and y coordinates of a tile, returns the index of that tile in the graphic.
- `tileX`: X coordinate of a tile
- `tileY`: Y coordinate of a tile




## Example Sketch
See this example run live [here](https://ikeb108.github.io/P5-TileRenderer-Library/Example/).

To see this example project in LVL LVL, download the JSON file [here](Example/LvlLvlExport.json) and import it to LVL LVL.
```javascript
function preload(){
  //Load a json file that was exported from https://lvllvl.com/
  //( you can also make one from scratch without LVLLVL )
  myLvlLvlJSON = loadJSON("LvlLvlExport.json")
}

function setup(){
  createCanvas(500,500)
  
  //Create a new tile renderer using the json from https://lvllvl.com/
  myTileRenderer = new TileRenderer(myLvlLvlJSON);
  
  //The tile renderer automatically creates layer objects from the json data
  //and stores them in an array called layers.
  //We will create a graphic using the data from each layer.
  for(let i in myTileRenderer.layers){
    let thisLayer = myTileRenderer.layers[i];
    myTileRenderer.getGraphic(thisLayer.label, thisLayer) //a graphic is created and added to myTileRenderer's array called graphics
  }
  
  frameRateText = "The framerate is " + round(frameRate());
  frameRateText = frameRateText.toUpperCase();
  
}

function draw(){
  background(0);
  
  //scaling by an integer like 2 ensures that the tiles will appear exactly as they
  //do in the original tileset (scaling by a decimal will cause distortion when using noSmooth())
  scale(2); noSmooth();
  
  
  // Draw a light green background behind the map
  // ===============================================
  fill( myTileRenderer.colorPalette[0] )
  // Get the dimensions of a graphic from myTileRenderer (doesn't matter which, they're all the same)
  let w = myTileRenderer.graphics["Triangle Background"].width
  let h = myTileRenderer.graphics["Triangle Background"].height
  rect(0, 0, w, h)
  
  
  // Draw each graphic from myTileRenderer to the screen
  // ===============================================
  myTileRenderer.setGraphicsToUnused(); //This feature will later help delete unused graphics
  
  for(let i in myTileRenderer.graphics){
    let thisGraphic = myTileRenderer.graphics[i];
    if(!thisGraphic.name.includes("FRAMERATE")){ //We don't yet want to draw the framerate graphic (see below)
      thisGraphic.update();
      image(thisGraphic, 0, 0)
    }
  }
  
  //Create a text graphic that displays the framerate
  //=========================
  myTileRenderer.alphabet = "Commodore 64" //Tell the tile renderer which tileset we used in lvllvl.com so that it knows which tile indeces correspond to which letters (only needs to be done once)
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
  myTextGraphic = myTileRenderer.getTextGraphic(frameRateText, myTextSettings)
  myTextGraphic.update();
  image(myTextGraphic, 90, 180 )
  
  myTileRenderer.deleteUnusedGraphics(); //This feature helps clear out unused graphics (especially important when creating text graphics).
}
```




## Unsupported LVL LVL Features
- Rotating and flipping tiles
  - LVL LVL does not include this data when exporting to JSON.
  - However, you can rotate and flip and redraw tiles as much as you like in LVL LVL's **tile editor**.
- Tile background colors
  - This is intentionally unsupported because it would require drawing a `rect()` behind every tile, which is very inefficient and not appropriate for most sketches.
  - However, you can draw one `rect()` behind the entire layer to do backgrounds (see the provided example).
- Multiple Frames
  - This library assumes your LVL LVL project has only one frame for simplicity.
  - However, you could create multiple instances of `TileRenderer` to use multiple frames.
- Non-square tilesets
  - Your chosen tile set must have square tiles (sorry)
