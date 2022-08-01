# P5 TileRenderer Library without LVL LVL

## Your tilesheet image
The tiles in your tile sheet must all be square and all the same size. There must be no spaces between them. They can have any colors, including transparent colors. Your tilesheet should have an empty tile if you plan to have empty spaces in your tilemap.

This tilesheet from [Kenney NL](https://kenney.nl/) is used in the example sketch at the bottom.

![monochrome-transparent_packed](https://user-images.githubusercontent.com/56776763/181135485-eb912d08-e69e-47d9-85e8-e3741436eacd.png)

## Your tilemap (layerObject)
The data for the tilemap / graphic you wish to *render* with your tilesheet is called a **layerObject**. Your TileRenderer can render multiple layerObjects. LayerObjects should follow this format:
```javascript
//Example
myLayer = {
  label: "city", //String. A name for the layer object
  gridWidth: 30, //Integer. Width of the grid in tiles
  gridHeight: 30, //Integer. Height of the grid in tiles
  data: {
    tiles: [...], //An array (can optionally be a Uint16Array) that lists what sprite is at each tile (or rather, the index of the sprite in your tilesheet)
    tileColors: [...], //An array (can optionally be a Uint16Array) that lists the RGBA color values of each tile (should be 4 times the length of the tiles array).
    //NOTE: p5's tint() function will be used to apply colors in the tileColors array. If no tint is desired, set the tile's color to white, i.e. 255, 255, 255, 255
  }
}
```

A tile's index in the tilesheet is its position in the tilesheet if you were to read it from left to right (starting from zero). For example, the tile in the upper-left corner would have an index of 0, then the tile to its right would have an index of 1, etc.

If you plan to render text using from tilesheet using `getTextGraphic()`, you will need to set your TileRenderer's `alphabet` property to an object that maps text characters to indeces in the tilesheet:
```javascript
myTileRenderer.alphabet = {
  "A": 917,
  "B": 918,
  "C": 919,
  //...
  "a": 401,
  "b": 402,
  "c": 403,
  //...
  //etc. Map as many or as few characters as you like.
}
```

## First Steps
Include the tile renderer script in your `index.html` head:
```javascript
<script src="tileRenderer.js" type="text/javascript"></script>
```
In your sketch's `preload()` function, load the tilesheet image:
```javascript
function preload(){
  tilesheetImage = loadImage("myTilesheet.png")
}
```
In your sketch's `setup()` function, create a new TileRenderer.
- First argument: Your tilesheet image
- Second argument: The size (width and height) of the tiles in your tilesheet (in pixels)
```javascript
function setup(){
  myTileRenderer = new TileRenderer( tilesheetImage, 16 );
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
1. Create or retrieve a graphic using [`getGraphic()`](#getGraphic)
    - First argument: a name for your graphic (string; can be anything)
    - Second argument: a [layer object](#your-tilemap-layerobject)
    - Third argument (optional): should be an object containing settings for your graphic. [See here.](#getGraphic)
2. Call the graphic's [`update()`](#update) method so that it will start or continue rendering
3. Draw the graphic to the canvas using p5's `image()` function
4. Remember to [prevent memory leakage with `deleteUnusedGraphics`](#important-how-to-prevent-memory-leakage-with-deleteunusedgraphics)
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
1. Set your TileRenderer's `alphabet` property [(see here)](#your-tilemap-layerobject)

Then, in your `draw` loop...

2. Create or retrieve a text graphic using [`getTextGraphic()`](#getTextGraphic)
    - First argument: the text you wish to display *(a new graphic will be created every time this text changes)*
    - Second argument (required): an object containing settings for the graphic, including a textColor. [See here.](#getTextGraphic)
3. Call the graphic's [`update()`](#update) method so that it will start or continue rendering
4. Draw the graphic to the canvas using p5's `image()` function
5. Remember to [prevent memory leakage with `deleteUnusedGraphics`](#important-how-to-prevent-memory-leakage-with-deleteunusedgraphics)
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
3. To make a graphic immune to deletion, set its `protected` setting to true in [the graphic's settings](#getGraphic)

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
**A new text graphic is created every time the text changes when you call `getTextGraphic()`. For example, if you call `getTextGraphic()` to display the frame rate (as is done in the provided [example sketch](#example-sketch)), a new graphic will be created every time the frame rate changes. So deleting old text graphics is especially important.*






## TileRenderer Properties
The TileRenderer object comes with the following properties:
```javascript
myTileRenderer.graphics //An array of graphics created with getGraphic() and getTextGraphic()
myTileRenderer.sheet //The p5 image given when the TileRenderer was created
myTileRenderer.sheetRenderComplete //Boolean; defaults to true when not using LVL LVL
myTileRenderer.tileSize //The width and height of each tile in pixels (tiles must be square)
myTileRenderer.rendersPerFrame //An integer that stores how many tiles were rendered in the last animation frame (you can check this for debugging purposes)
myTileRenderer.alphabet //Object -- If you plan to use text graphics, set this yourself (see "Your Tilemap")
//myTileRenderer.layers //Only if importing data from LVL LVL
//myTileRenderer.colorPalette //Only if importing data from LVL LVL
//myTileRenderer.sheetTileCount //Only if importing data from LVL LVL
```
### Properties added to your tilesheet...
After you create your TileRenderer, you'll notice your tilesheet image has been given some additional useful properties...
```javascript
myTileRenderer.sheet.positionOf //An object storing the x y coordinates of all tiles in the sheet graphic. Use like so:
// console.log(myTileRenderer.sheet.positionOf[0]) //Returns the coordinates of the 0th tile: {x: 0, y: 0}
myTileRenderer.sheet.rowSize //Size (in tiles) of rows in the tile sheet
myTileRenderer.sheet.columnSize //Size (in tiles) of columns in the tile sheet
//myTileRenderer.sheet.renderProgress //Only if using LVL LVL
//myTileRenderer.sheet.tilesPerFrame //Only if using LVL LVL

// ...in addition to the properties that all p5 image objects have
```




## TileRenderer Methods
### `getGraphic()`
```javascript
myTileRenderer.getGraphic( name, layerObject, [graphicSettingsObject] )
```
Creates a new p5 graphic named `name` and adds it to the TileRenderer's `graphics` object. Or, if a graphic named `name` already exists, it just returns that graphic. The tiles described in `layerObject` will be drawn to this graphic when its `update()` method is called.

- `name`: String. Name of the graphic to create/retrieve
- `layerObject`: Object. A layer object (can be imported with `importLayers()`
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
myTileRenderer.getTextGraphic( textString, graphicSettingsObject )
```
Creates a new p5 graphic that will render the text in `textString`, and adds it to the TileRenderer's `graphics` object. Or, if a text graphic containing the text in `textString` already exists, it just returns that graphic.
- `textString`: String. The text to render in the text graphic
- `graphicSettingsObject`: Required. An object with all the same settings options when calling `getGraphic()`, but with two additions:
```javascript
graphicSettingsObject = {
  textColor: __, //REQUIRED: a p5 color object
  widthInCharacters: __, //Optional: For word wrapping, how many characters wide the text is allowed to be (if not set, there will be no word wrapping)
}
```
IMPORTANT NOTE: The `getTextGraphic` method requires the TileRenderer's `alphabet` property to be set [(see here)](#your-tilemap-layerobject)

### `setGraphicsToUnused() and deleteUnusedGraphics()`
See [here](#important-how-to-prevent-memory-leakage-with-deleteunusedgraphics)
### `deleteGraphic()`
```javascript
myTileRenderer.deleteGraphic( graphicName )
```
Deletes the graphic named `graphicName` from the `graphics` object (even if the graphic's `protected` setting is set to `true`). It is recommended to use this method instead of trying to delete the graphic yourself.
### `sheetIndexOf()`
```javascript
myTileRenderer.sheetIndexOf( character )
```
Returns the index (in the [tilesheet](#your-tilesheet-image)) of the given character. This method requires the TileRenderer's `alphabet` property to be set [(see here)](#your-tilemap-layerobject)
- `character`: A string of length 1
### `getLayer()`
```javascript
myTileRenderer.getLayer( layerLabelOrIndex )
```
This feature is only available if importing data from LVL LVL.
### `importLayers()`
```javascript
myTileRenderer.importLayers( layersObject )
```
Imports an object that was exported with the TileRenderer's `exportLayers()` method.

### `exportLayers()`
```javascript
myTileRenderer.exportLayers( fileName )
```
Exports information about all layerObjects (all that were used to make graphics) to a JSON file named `fileName`.
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
Returns an array of tile indeces in the graphic that are set to a particular character. (This character is the character with an index of `sheetIndex` in the [tilesheet](#your-tilesheet-image)). If a `tileColor` is provided (optional), only tiles that have that color will be returned.
- `sheetIndex`: Integer. Index of the desired character in the [tilesheet](#your-tilesheet-image)
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
See this example run live [here](https://ikeb108.github.io/P5-TileRenderer-Library/Example_WithoutLVLLVL/).

See the layerObject data for this sketch [here](https://ikeb108.github.io/P5-TileRenderer-Library/Example_WithoutLVLLVL/myLayer.json)
```javascript
function preload(){
  //Tilesheet image courtesy of Kenney NL https://www.kenney.nl/
  tilesheetImage = loadImage("monochrome-transparent_packed.png")
  
  //Load the layer object (data for our map)
  myLayer = loadJSON("myLayer.json")
}
function setup(){
  createCanvas(550, 300)

  //Create an instance of the TileRenderer
  myTileRenderer = new TileRenderer(tilesheetImage, 16)
  
  //Set the 'alphabet' property so we can use it to draw text using our tileset
  myTileRenderer.alphabet = {"A":917,"B":918,"C":919,"D":920,"E":921,"F":922,"G":923,"H":924,"I":925,"J":926,"K":927,"L":928,"M":929,"N":966,"O":967,"P":968,"Q":969,"R":970,"S":971,"T":972,"U":973,"V":974,"W":975,"X":1018,"Y":977,"Z":978,"0":868,"1":869,"2":870,"3":871,"4":872,"5":873,"6":874,"7":875,"8":876,"9":877,":":878,".":879,"%":880,"#":1015,"+":1016,"-":1017,"/":1019,"=":1020,"@":1021}
  
  frameRateText = "The framerate is " + round(frameRate())
  frameRateText = frameRateText.toUpperCase();
}

function draw(){
  background(0)
  
  //Draw the map graphic to the screen
  //=====================================================
  myTileRenderer.setGraphicsToUnused(); //This feature will later help delete unused graphics
  
  let cityGraphic = myTileRenderer.getGraphic("city", myLayer)
  cityGraphic.update();
  image(cityGraphic, 0, 0)
  
  
  // Create a text graphic that displays the framerate 
  //=====================================================
  if(frameCount % 100 == 0){
    frameRateText = "The framerate is " + round(frameRate())
    frameRateText = frameRateText.toUpperCase();
  }
  
  let myTextSettings = {
    textColor: color(255),
    tilesPerFrame: 1
  }
  //This will use the TileRenderer's alphabet property that was set in setup()
  let frameRateTextGraphic = myTileRenderer.getTextGraphic( frameRateText, myTextSettings )
  frameRateTextGraphic.update();
  image(frameRateTextGraphic, 50, 250)
  
  myTileRenderer.deleteUnusedGraphics(); //Delete any graphics that weren't updated in the last frame
}
```
