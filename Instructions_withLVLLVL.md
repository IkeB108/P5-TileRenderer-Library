# P5 TileRenderer Library with LVL LVL
Take note of the listed [Unsupported LVL LVL Features](README_withLVLLVL.md#unsupported-lvl-lvl-features).
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

- [How to draw graphics](Instructions_HowTo.md#how-to-draw-graphics)
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
myTileRenderer.rendersPerFrame //An integer that stores how many tiles were rendered in the last frame (use for debugging)
myTileRenderer.alphabet //String -- If you plan to use text graphics, set this to the name of the tileset you used in LVL LVL
```
### `sheet` property:
This is an example of what the `myTileRenderer.sheet` graphic looks like. You can draw it in your sketch with `image()`

![Capture](https://user-images.githubusercontent.com/56776763/180670499-76f6824e-73bf-4701-b297-82fc2e752dcb.PNG)

The sheet graphic comes with useful properties of its own:
```javascript
myTileRenderer.sheet.positionOf //An object storing the x y coordinates of all tiles in the sheet graphic. Use like so:
// console.log(myTileRenderer.sheet.positionOf[0]) //Returns the coordinates of the 0th tile: {x: 0, y: 0}
myTileRenderer.sheet.rowSize //Size (in tiles) of rows in the tile sheet (should be 10 if importing from lvl lvl)
myTileRenderer.sheet.columnSize //Size (in tiles) of columns in the tile sheet
myTileRenderer.sheet.renderProgress //How many tiles have been rendered in the sheet so far (tiles only need to render once)
myTileRenderer.sheet.tilesPerFrame //How many tiles to draw to the sheet per frame (defaults to 50)
```
## TileRenderer Methods
### `getGraphic()`
```javascript
myTileRenderer.getGraphic( name, layerObject, [graphicSettingsObject] )
```
Creates a new p5 graphic named `name` and adds it to the TileRenderer's `graphics` array. Or, if a graphic named `name` already exists, it just retrieves that graphic. The tiles described in `layerObject` will be drawn to this graphic when its `update()` method is called.

- `name`: String. Name of the graphic to create/retrieve
- `layerObject`: Object. A layer from the TileRenderer's `layers` array (or one imported with `importLayers()`)
- `graphicSettingsObject`: Object. Stores your preferred settings for this graphic. It can have any of the properties below (any properties not included default to the values shown below)
```javascript
graphicSettingsObject = {
  tilesPerFrame: 10, //How many tiles from this graphic will be rendered to the screen each frame
  protected: false, //When true, graphic will not be deleted by the TileRenderer's deleteUnusedGraphics() method.
  tileSize: [defaults to the tile size in the sheet graphic],  //The desired width and height of tiles in this graphic in pixels
  width: [default is calculated based on tileSize], //The desired width of the graphic in pixels
  height: [default is calculated based on tileSize], //The desired height of the graphic in pixels
}
```
## Graphics Properties
Properties of graphics objects stored in `graphics`:
```javascript
myGraphic.name //String; Name of the graphic that was given when this graphic was created
myGraphic.used //Boolean storing whether this graphic's update() method has been called in the current frame
myGraphic.renderProgress //Integer; how many tiles in this graphic have rendered so far
myGraphic.renderComplete //Boolean; whether the graphic has finished rendering
myGraphic.tileChangeQueue //Array of tile changes that were made with the setTile() method
myGraphic.settings //Object containing all the settings that were given when this graphic was created
myGraphic.layerObject //The layer object that was given when this graphic was created

// ...in addition to the properties that all p5 graphics objects have
```
## Graphics Methods
Methods of graphics objects stored in the `graphics`:
### `setTile()`
```javascript
myGraphic.setTile( tileIndexInGraphic, propertiesOfNewTile )
//or...
myGraphic.setTile( tileX, tileY, propertiesOfNewTile )
```
In the graphic, sets the tile of index `tileIndexInGraphic` or at the coordinates `tileX, tileY` to have the properties in `propertiesOfNewTile`

- `tileIndexInGraphic`: Integer. Index of the tile you wish to change
- `tileX`: Integer. X coordinate of the tile you wish to change
- `tileY`: Integer. Y coordinate of the tile you wish to change
- `propertiesOfNewTile`: Object, formatted like this:
```javascript
propertiesOfNewTile = {
  sheetIndex: //index (in the tile sheet) of the tile this should be set to
  tileColor: //Optional. Index of the new desired color in the color palette
}
```
## Example Sketch
See this example run live [here](https://ikeb108.github.io/P5-TileRenderer-Library/Example/).

To see this example project in LVL LVL, download the JSON file [here](Example/myTileRenderer.json) and import it to LVL LVL.
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
  - This library assumes your project has only one frame for simplicity.
  - However, you could create multiple instances of `TileRenderer` to use multiple frames.
- Non-square tilesets
  - Your chosen tile set must have square tiles (sorry)
