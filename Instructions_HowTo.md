# How To...
## How To Draw Graphics
In your draw loop...
1. Create or retrieve a graphic using [`getGraphic()`](Instructions_withLVLLVL.md#getGraphic)
2. Call the graphic's `update()` method so that it will start or continue rendering
3. Draw the graphic to the canvas using p5's `image()` function
```javascript
//Example
function draw(){
/*Step 1*/  let walkwaysGraphic = myTileRenderer.getGraphic("walkways", walkwaysLayer, walkwaysSettings )
/*Step 2*/  walkwaysGraphic.update()
/*Step 3*/  image(walkwaysGraphic, 0, 0)
}
```
