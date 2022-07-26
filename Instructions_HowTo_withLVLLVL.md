# How To...
![Capture](https://user-images.githubusercontent.com/56776763/180682856-cc484d52-4551-4bb3-8644-a7a92b1935c9.PNG)
- [How to Draw Graphics](Instructions_HowTo_withLVLLVL.md#how-to-draw-graphics)
- [How to Draw Text Graphics](Instructions_HowTo_withLVLLVL.md#how-to-draw-text-graphics)
- [IMPORTANT: How to prevent memory leakage with `deleteUnusedGraphics()`](Instructions_HowTo_withLVLLVL.md#important-how-to-prevent-memory-leakage-with-deleteunusedgraphics)
## How To Draw Graphics
In your `draw` loop...
1. Create or retrieve a graphic using [`getGraphic()`](Instructions_withLVLLVL.md#getGraphic)
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
If unused graphics are not deleted, they may quickly pile up (especially text graphics), which can drastically slow down or freeze your sketch.

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
