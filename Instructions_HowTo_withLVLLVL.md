# How To...
![Capture](https://user-images.githubusercontent.com/56776763/180682856-cc484d52-4551-4bb3-8644-a7a92b1935c9.PNG)
- [How to Draw Graphics](Instructions_HowTo_withLVLLVL.md#how-to-draw-graphics)
- [How to Draw Text Graphics](Instructions_HowTo_withLVLLVL.md#how-to-draw-text-graphics)
## How To Draw Graphics
In your draw loop...
1. Create or retrieve a graphic using [`getGraphic()`](Instructions_withLVLLVL.md#getGraphic)
2. Call the graphic's [`update()`](Instructions_withLVLLVL.md#update) method so that it will start or continue rendering
3. Draw the graphic to the canvas using p5's `image()` function
```javascript
//Example
function draw(){
  /*Step 1*/  let walkwaysGraphic = myTileRenderer.getGraphic("walkways", walkwaysLayer, walkwaysSettings )
  /*Step 2*/  walkwaysGraphic.update()
  /*Step 3*/  image(walkwaysGraphic, 0, 0)
}
```
## How to Draw Text Graphics
In your setup function...
1. Set your TileRenderer's `alphabet` property to the name of the tileset you used in LVL LVL
