/*

tileRenderer( sheet, tileSize )
sheet = p5 image of the tile sheet, or
        a 0/1 object like lvl lvl gives you
tileSize = size of a tile in pixels

tileRenderer.sheet = p5 graphic of the base sheet of this tileset 
tileRenderer.graphics = {
  Object containing all p5 graphics rendered with the tileset,
  with names chosen by the user.
}

tileRenderer.alphabet = [];
Array or object dictating what indeces (from the tileset) correspond
to what characters (for rendering text strings)
An alphabet will automatically be set if tileRenderer detects that the
tileset is equal to one from Lvl Lvl.

tileRenderer.setGraphicsToUnused();
tileRenderer.deleteUnusedGraphics();

tileRenderer.graphic("graphic name", mapObj, settingsObj)
If there is already a graphic with this name, do the following:
  - Send mapObj on its way where it will be checked for changes
  - Return the graphics object
If graphic doesn't exist, initiate it and add it to the graphics storage
object.
settingsObj = {
  tileSize: 5,
  width: 50, //trumps tileSize
  height: 50,
  renderMode: "step", //"buffer", "immediate" (step is default)
  tilesPerFrame: 50 (this is a good default if every tile uses tint())
}

mapObj = {
  gridWidth: ...
  gridHeight: ...
  data: //2d array
}

NOTE: The tileRenderer will not start rendering any graphics until it
knows that the sheet has finished rendering.

tileRenderer.textGraphic("graphic name", textString, settingsObj)
Same as above, except use the tileRenderer's alphabet to
draw the textString to the graphic.

settingsObj additional parameters:
{
  textWidth: 10, //default = Infinity
  
}

*/
function TileRenderer( sheet, tileSize ){
  let thisCopy = this;
  this.tileSize = tileSize;
  
  //Create this.sheet
  let _sheetType = "p5 image"; //assume p5 image unless proven otherwise
  let _sheetRenderComplete = false;
  let _containsUndefined = function(arr){
    for(let i of arr){
      if(i === undefined)return true;
    }
    return false;
  }
  let col_is_white = function(col) {
    return 
    col.levels[0] == 255 &&
    col.levels[1] == 255 &&
    col.levels[2] == 255 &&
    col.levels[3] == 255
  }
  
  if( !_containsUndefined([sheet.colorPalette, sheet.tileMap, sheet.tileSet, sheet.version]) ){
    _sheetType = "lvl lvl"
  }
  
  if(_sheetType == "p5 image"){
    this.sheet = sheet;
    this.sheet.rowSize = ceil ( sheet.width / tileSize); //width of image in TILES
    this.sheet.columnSize = ceil ( sheet.height / tileSize );
    
    this.sheet.positionOf = {};
    
    for(let tileIndex = 0; tileIndex < this.sheet.rowSize * this.sheet.columnSize; tileIndex ++){
      let gridx = (tileIndex % this.sheet.rowSize);
      let gridy = floor(tileIndex / this.sheet.rowSize);
      gridx *= tileSize;
      gridy *= tileSize;
      this.sheet.positionOf[tileIndex] = {x: gridx, y: gridy}
    }
    
    _sheetRenderComplete = true; //tile sheet is already rendered.
    thisCopy.sheetRenderComplete = true;
    thisCopy.colorPalette = "none";
  }
  
  if(_sheetType == "lvl lvl"){
    this.tileSize = sheet.tileSet.width; //ignore tileSize set by user if any
    
    let _rowSize = 10; //we can pick whatever row size we want. 10 is good
    let _columnSize = ceil(sheet.tileSet.tiles.length / _rowSize )
    
    this.sheet = createGraphics(_rowSize * this.tileSize, _columnSize * this.tileSize)
    this.sheet.rowSize = _rowSize;
    this.sheet.columnSize = _columnSize;
    this.sheet.positionOf = {}; //we'll use this to convert symbol indeces to coordinates on the sheet
    this.sheetTileCount = sheet.tileSet.tiles.length;
    //_sheetRenderComplete is still false.
    this.sheet.renderProgress = 0; //index of the tile currently being drawn to the sheet. Rendering should only take a few frames.
    this.sheet.tilesPerFrame = 50;
    
    this.sheetJSON = sheet; //store the JSON object we were given
    
    this.colorPalette = sheet.colorPalette.data;
    for(let i in this.colorPalette){
      let new_col = this.colorPalette[i].toString(16);
      let a = new_col.slice(0, 2)
      let rgb = new_col.slice(2, new_col.length)
      this.colorPalette[i] = color("#" + rgb + a)
    }
    this.sheet.elt.id = "tileRenderer_Sheet_" + round(millis() + random(100))
  }
  
  
  // this.pixelIndexToXY = function( pixelIndex, graphicWidth ){
  //   pixelIndex = floor(pixelIndex/4)
  //   let x = pixelIndex % graphicWidth;
  //   let y = floor(pixelIndex / graphicWidth)
  //   return {x, y}
  // }
  
  let XYtoPixelIndex = function( x, y, graphicWidth) {
    return ( (y * graphicWidth) + x ) * 4;
  }
  
  // this.tileIndexToXY = function ( tileIndex ){ //Get XY coordinates of where this tile is on this renderer's tile sheet.
  //   let tileX = tileIndex % thisCopy.sheet.rowSize;
  //   let tileY = floor( tileIndex / thisCopy.sheet.rowSize );
  //   let x = tileX * thisCopy.tileSize;
  //   let y = tileY * thisCopy.tileSize;
  //   return {x, y}
  // }
  
  let renderSheet = function(){
    if(thisCopy.sheet.pixels.length == 0){
      thisCopy.sheet.loadPixels(); //we only need and want to load pixels once
    }
    let px = thisCopy.sheet.pixels;
    
    for(let j = 0; j < thisCopy.sheet.tilesPerFrame; j ++){
      if(!_sheetRenderComplete){
        
        let tileIndex = thisCopy.sheet.renderProgress; //index of tile to render
        //We assume we are working with an object from lvl lvl...
        let tileArray = thisCopy.sheetJSON.tileSet.tiles[tileIndex].data[0];
        
        let tileCornerX = (tileIndex % thisCopy.sheet.rowSize) * thisCopy.tileSize;
        let tileCornerY = floor(tileIndex / thisCopy.sheet.rowSize) * thisCopy.tileSize;
        
        let tileCornerIndex = XYtoPixelIndex(tileCornerX, tileCornerY, thisCopy.sheet.width)
        // px[tileCornerIndex] = 0;
        // px[tileCornerIndex + 1] = 0;
        // px[tileCornerIndex + 2] = 255;
        // px[tileCornerIndex + 3] = 255;
        thisCopy.sheet.positionOf[tileIndex] = {x: tileCornerX, y: tileCornerY}
        
        for(let i in tileArray){
          if( tileArray[i] == 1 ){
            let x = (i % thisCopy.tileSize);
            let y = floor( i / thisCopy.tileSize);
            let px_i = XYtoPixelIndex( x + tileCornerX, y + tileCornerY, thisCopy.sheet.width)
            px[px_i] = 255;
            px[px_i + 1] = 255;
            px[px_i + 2] = 255;
            px[px_i + 3] = 255;
          }
        }
        
        thisCopy.sheet.renderProgress ++;
        if(thisCopy.sheet.renderProgress >= thisCopy.sheetJSON.tileSet.tiles.length){
          thisCopy.sheet.updatePixels();
          _sheetRenderComplete = true;
          thisCopy.sheetRenderComplete = true;
        }
        
        
      }
    }
    
    
  }
  
  this.getLayer = function( layerIndexOrLabel ) {
    if(typeof layerIndexOrLabel == "number")return thisCopy.layers[layerIndexOrLabel]
    else {
      for(let i of thisCopy.layers){
        if( i.label == layerIndexOrLabel )return i;
      }
    }
    console.warn("Warning: Could not find a layer labeled " + layerIndexOrLabel)
    return null;
  }
  
  if(_sheetType == "lvl lvl"){
    let jsonLayers = this.sheetJSON.tileMap.layers
    this.layers = []
    for(let l of jsonLayers){
      let this_layer = {}; 
      this_layer.label = l.label
      this_layer.gridWidth = l.gridWidth
      this_layer.gridHeight = l.gridHeight
      
      this_layer.data = {
        tiles: new Uint16Array( l.gridWidth * l.gridHeight ),
        tileColors: new Uint16Array( l.gridWidth * l.gridHeight )
      }; //convert lvl lvl's 2D array into a 1D array
      
      
      let t = 0;
      
      for(let row in l.frames[0].data){
        for(let column in l.frames[0].data[row]){
          this_layer.data.tiles[t] =  l.frames[0].data[row][column].t 
          this_layer.data.tileColors[t] =  l.frames[0].data[row][column].fc
          t ++;
        }
      }
      
      this.layers.push(this_layer)
    }
    
    
    
  }
  
  this.exportLayers = function( fileName = "tilesetLayers.json"){
    let j = {
      colorPalette: thisCopy.colorPalette,
      layers: []
    }
    for(let g in thisCopy.graphics){
      j.layers.push( thisCopy.graphics[g].layerObject )
    }
    saveJSON(j, fileName)
  }
  
  this.importLayers = function( layersObject ){
    thisCopy.colorPalette = layersObject.colorPalette;
    thisCopy.layers = layersObject.layers;
  }
  
  this.graphics = {};
  
  this.rendersPerFrame = 0;
  let _pFrameCount = 0;
  
  this.setGraphicsToUnused = function(){
    for(let i in thisCopy.graphics){
      thisCopy.graphics[i].used = false;
    }
  }
  this.deleteUnusedGraphics = function(){
    //MAKE SURE you also delete any references to the graphics object (variables or being stored in arrays), or else it will not be picked up by a garbage collector
    for(let i in thisCopy.graphics){
      if(thisCopy.graphics[i].used === false && thisCopy.graphics[i].settings.protected === false){
        thisCopy.deleteGraphic( i )
      }
    }
  }
  
  this.deleteGraphic = function( graphicName ){
    thisCopy.graphics[graphicName].remove()
    delete thisCopy.graphics[graphicName]
  }
  
  this.getGraphic = function(graphicName, layerObj, settingsObj){
    
    let currentGraphic = null;
    
    if(graphicName === undefined || layerObj == undefined){
      console.warn("Warning: the graphic() method requires a graphicName and layer object")
    }
    
    let objectHasProperties = function( obj, propertyArray ){
      for(let i of propertyArray){
        if( obj[i] === undefined )return false;
      }
      return true;
    }
    
    if(thisCopy.graphics[graphicName]){
      //if a graphic with this name already exists...
      currentGraphic = thisCopy.graphics[graphicName]
    } else {
      //create this graphic for the first time
      
      if(typeof layerObj == "string"){
        layerObj = thisCopy.getLayer(layerObj)
      }
      if(typeof layerObj == "number"){
        let i = layerObj;
        layerObj = thisCopy.layers[i]
        if(layerObj === undefined)
        console.warn("Warning: Could not find a layer with an index of " + i)
      }
      
      if(!objectHasProperties(layerObj, "gridWidth gridHeight label data".split(' ') ) ){
        console.warn("Warning: the layer object for graphic: " + graphicName + " is missing one or more of the following properties: gridWidth gridHeight label data")
      } else {
        if( typeof layerObj.data.tiles === "object" ){
          let k = Object.keys(layerObj.data.tiles)
          let new_tiles = new Uint16Array(k.length)
          for(let i in k)new_tiles[i] = layerObj.data.tiles[ k[i] ];
          layerObj.data.tiles = new_tiles;
        }
        if( typeof layerObj.data.tileColors === "object" ){
          let k = Object.keys(layerObj.data.tileColors)
          let new_tileColors = new Uint16Array(k.length)
          for(let i in k)new_tileColors[i] = layerObj.data.tileColors[ k[i] ];
          layerObj.data.tileColors = new_tileColors;
        }
        
        //Confirm that data.tiles === data.tileColors or data.tiles === data.tileColors * 4
        if( layerObj.data.tiles && layerObj.data.tileColors &&
           !(layerObj.data.tiles.length === layerObj.data.tileColors.length || layerObj.data.tiles.length * 4 === layerObj.data.tileColors.length) ){
          console.warn("Warning: In the provided layer object, the tiles and tileColors arrays should meet one of the following conditions:\ntiles.length === tileColors.length\ntiles.length * 4 === tileColors.length")
        }
        
        if( layerObj.data.tiles && layerObj.gridWidth && layerObj.gridHeight){
          if(layerObj.data.tiles.length !== layerObj.gridWidth * layerObj.gridHeight){
            console.warn("Warning: The number of tiles in the layer object's tiles array is not equal to the gridWidth * gridHeight ")
          }
        }
        if( _sheetType === "p5 image" && layerObj.data.tileColors.length === layerObj.data.tiles.length ){
          console.warn("Warning: In the provided layer object, the tileColors array is equal in length to the tiles array, but it should be 4 times the length if not using data from lvl lvl.")
        }
      }
      
      
      
      
      //start by making the settings for this graphic the defaults.
      //then we will change anything that has been specified by settingsObj
      let newSettings = {
        tileSize: thisCopy.tileSize,
        width: layerObj.gridWidth * thisCopy.tileSize,
        height: layerObj.gridHeight * thisCopy.tileSize,
        tilesPerFrame: 10,
        protected: false, //protected from getting deleted by deleteUnused()
      }
      if(settingsObj){
        for(let i in settingsObj){
          newSettings[i] = settingsObj[i]
        }
        
        if(!settingsObj.width)newSettings.width = newSettings.tileSize * layerObj.gridWidth
        
        if(!settingsObj.height)newSettings.height = newSettings.tileSize * layerObj.gridHeight
        
        if( !Number.isInteger(newSettings.tilesPerFrame) ){
          console.warn("tilesPerFrame setting must be an integer.")
          newSettings.tilesPerFrame = 10;
        }
        
        if(newSettings.tilesPerFrame < 1){
          console.warn("tilesPerFrame cannot be set to a value less than 1. As an alternative, try only calling update() every few frames.")
          newSettings.tilesPerFrame = 1;
        }
        
      }
      
      currentGraphic = createGraphics(newSettings.width, newSettings.height)
      currentGraphic.settings = newSettings;
      currentGraphic.layerObject = layerObj;
      currentGraphic.renderProgress = 0; //index of the tile currently being rendered
      currentGraphic.renderComplete = false;
      currentGraphic.name = graphicName;
      currentGraphic.tileChangeQueue = [];
      currentGraphic.used = true;
      currentGraphic.noSmooth();
      currentGraphic.elt.id = "tileRenderer__" + graphicName
      
      currentGraphic.setTile = function(a, b, c){
        //Arguments can be either:
        // - tileIndexInGraphic, {properties of new tile}, or
        // - tileXInGraphic, tileYInGraphic, {properties of new tile}
        
        // properties of new tile = {
        //   sheetIndex: 0, //index of tile in tilesheet 
        //   tileColor: color('red') //optional p5 color value (or index of color in color palette)
        // }
        
        let tileIndexInGraphic = null;
        let tileXInGraphic = null;
        let tileYInGraphic = null;
        let newTileProperties = null;
        
        if(c !== undefined){
          tileXInGraphic = a;
          tileYInGraphic = b;
          newTileProperties = c;
          
          
          tileIndexInGraphic = (tileYInGraphic * this.layerObject.gridWidth) + tileXInGraphic;
          
          if(typeof this.layerObject.data.tiles[tileIndexInGraphic] === 'undefined' || tileXInGraphic < 0 || tileYInGraphic < 0){
            console.warn("Warning: tile at coordinates x:" + tileXInGraphic + ", y:" + tileYInGraphic + " in graphic: " + this.name + " is out of range or invalid")
          }
          
        }
        
        if(c === undefined){
          tileIndexInGraphic = a;
          tileXInGraphic = tileIndexInGraphic % this.layerObject.gridWidth;
          tileYInGraphic = floor(tileIndexInGraphic / this.layerObject.gridWidth);
          
          newTileProperties = b;
          if(typeof this.layerObject.data.tiles[tileIndexInGraphic] === 'undefined' ){
            console.warn("Warning: tile index of " + tileIndexInGraphic + " in graphic: " + this.name + " is out of range or invalid")
          }
        }
        let data = this.layerObject.data
        if(newTileProperties.sheetIndex !== undefined){ //if a tile index is provided... (otherwise we would only be changing the tile's color)
          
          data.tiles[tileIndexInGraphic] = newTileProperties.sheetIndex
          
        }
        
        if(newTileProperties.tileColor){ //if a tileColor is provided...
          
          if(data.tileColors.length == 4 * data.tiles.length){
            if(newTileProperties.tileColor.levels === undefined){
              console.warn("Warning: graphic " + this.name + " requires tileColor to be a p5 Color object when calling changeTile()")
            }
            data.tileColors[tileIndexInGraphic * 4] = red(newTileProperties.tileColor);
            data.tileColors[tileIndexInGraphic * 4 + 1] = green(newTileProperties.tileColor);
            data.tileColors[tileIndexInGraphic * 4 + 2] = blue(newTileProperties.tileColor);
            data.tileColors[tileIndexInGraphic * 4 + 3] = alpha(newTileProperties.tileColor);
          } else {
            if(typeof newTileProperties.tileColor !== "number"){
              console.warn("Warning: graphic " + this.name + " requires tileColor to be the index of the desired color in the provided color palette.")
            } else if( thisCopy.colorPalette[newTileProperties.tileColor] === undefined ){
              console.warn("Warning: tileColor " + newTileProperties.tileColor + " is invalid or out of range of the provided color palette." )
            }
            data.tileColors[tileIndexInGraphic] = newTileProperties.tileColor;
          }
        }
        
        let tileQueueAddition = { tileIndexInGraphic, tileXInGraphic, tileYInGraphic }
        
        if( newTileProperties.sheetIndex !== undefined ) tileQueueAddition.tileIndexInSheet = newTileProperties.sheetIndex
        if( newTileProperties.tileColor !== undefined ) tileQueueAddition.newTileColor = newTileProperties.tileColor
        
        if(newTileProperties.priority){
          this.tileChangeQueue.unshift( tileQueueAddition )
        } else {
          this.tileChangeQueue.push( tileQueueAddition )
        }
        
      }
      
      currentGraphic.getTile = function(a, b){
        let tileIndexInGraphic = null;
        let tileXInGraphic = null;
        let tileYInGraphic = null;
        let g = this;
        if(b === undefined){
          tileIndexInGraphic = a;
        }
        if(b !== undefined){
          //a and b are grid coordinates
          tileXInGraphic = a;
          tileYInGraphic = b;
          tileIndexInGraphic = (tileYInGraphic * g.layerObject.gridWidth) + tileXInGraphic
        }
        let ret = {}
        ret.sheetIndex = g.layerObject.data.tiles[tileIndexInGraphic]
        ret.tileColor = g.layerObject.data.tileColors[tileIndexInGraphic]
        return ret;
      }
      
      currentGraphic.locateCharacter = function( sheetIndex, tileColor ){
        let data = this.layerObject.data
        let matches = [];
        for(let i in data.tiles){
          let tileColorMatches = false;
          if(tileColor !== undefined){
            
            if( tileColor.levels !== undefined ){
              tileColorMatches = ( 
                tileColor.levels[0] == data.tileColors[i].levels[0] &&
                tileColor.levels[1] == data.tileColors[i].levels[1] &&
                tileColor.levels[2] == data.tileColors[i].levels[2] &&
                tileColor.levels[3] == data.tileColors[i].levels[3]
              )
            } else {
              tileColorMatches = tileColor === data.tileColors[i]
            }
            
          } else {
            tileColorMatches = true;
          }
          if(data.tiles[i] === sheetIndex && tileColorMatches)
          matches.push( int(i) )
        }
        return matches;
      }
      
      currentGraphic.indexToCoordinates = function( tileIndex ){
        let w = this.layerObject.gridWidth
        let x = tileIndex % w;
        let y = floor(tileIndex/w)
        return {x, y}
      }
      
      currentGraphic.coordinatesToIndex = function( x, y ){
        let w = this.layerObject.gridWidth
        return (y * w) + x;
      }
      
      currentGraphic.update = function() {
        //This function is for rendering new tiles to a graphic. However...
        //..it's here where we continue rendering the tile sheet if not done yet.
        
        let g = this;
        
        g.used = true;
        
        if(!thisCopy.sheetRenderComplete){
          renderSheet();
          if(thisCopy.sheetRenderComplete){
            thisCopy.sheet.updatePixels();
          }
        }
        
        if(frameCount !== _pFrameCount){
          thisCopy.rendersPerFrame = 0;
          _pFrameCount = frameCount;
        }
          
        for(let i = 0; i < g.settings.tilesPerFrame; i ++){
          
          if( thisCopy.sheetRenderComplete ){
            
            
            
            //first, check for any changes in this graphic's tileChangeQueue
            //after that, just make sure the rest of the graphic is rendered
            if( g.tileChangeQueue.length > 0 ){
              let change = g.tileChangeQueue[0]
              
              let si = change.tileIndexInSheet || g.layerObject.data.tiles[ change.tileIndexInGraphic ]
              
              let sx = thisCopy.sheet.positionOf[si].x
              let sy = thisCopy.sheet.positionOf[si].y
              let sw = thisCopy.tileSize;
              
              let dx = change.tileXInGraphic * g.settings.tileSize;
              let dy = change.tileYInGraphic * g.settings.tileSize;
              let dw = g.settings.tileSize;
              
              let newColor = null;
              if(change.newTileColor !== undefined)newColor = change.newTileColor;
              
              // console.log(
              //   {si, sx, sy, sw, dx, dy, dw, newColor}
              // )
              
              g.erase();
              for(let i = 0; i < 5; i ++)g.rect(dx+1, dy+1, dw-2, dw-2);
              g.noErase();
              
              if(typeof newColor === "number" && thisCopy.colorPalette){
                if(newColor < 0)newColor = 0; //just in case the fc is -1 for some reason
                newColor = thisCopy.colorPalette[newColor]
                newColor = color(
                  newColor.levels[0],
                  newColor.levels[1],
                  newColor.levels[2],
                  newColor.levels[3]
                )
              }
              
              if(newColor && !col_is_white(newColor)){
                g.tint(newColor)
              } else {
                g.noTint();
              }
              g.erase(); g.noStroke();
              g.rect(dx, dy, dw, dw)
              g.noErase();
              g.image( thisCopy.sheet, dx, dy, dw, dw, sx, sy, sw, sw )
              thisCopy.rendersPerFrame ++;
              
              g.tileChangeQueue.shift();
            }
            
            if(g.tileChangeQueue.length === 0 && !g.renderComplete){
              
              let tileDestinationIndex = g.renderProgress;
              let data = g.layerObject.data;
              
              let tileSourceIndex = data.tiles[tileDestinationIndex]
              
              let tileDestinationGridX = tileDestinationIndex % g.layerObject.gridWidth;
              let tileDestinationGridY = floor(tileDestinationIndex/g.layerObject.gridWidth);
              
              let sx = thisCopy.sheet.positionOf[tileSourceIndex].x
              let sy = thisCopy.sheet.positionOf[tileSourceIndex].y
              let sw = thisCopy.tileSize;
              
              let dw = g.settings.tileSize;
              let dx = tileDestinationGridX * dw;
              let dy = tileDestinationGridY * dw;
              
              let dcolor = null;
              
              if(thisCopy.colorPalette !== "none"){
                
                dcolor = data.tileColors[tileDestinationIndex]
                if(dcolor < 0)dcolor = 0; //just in case the fc is -1 for some reason
                dcolor = thisCopy.colorPalette[dcolor]
                dcolor = color(
                  dcolor.levels[0],
                  dcolor.levels[1],
                  dcolor.levels[2],
                  dcolor.levels[3]
                )
                
              }
              if(thisCopy.colorPalette === "none" && g.layerObject.data.tileColors !== undefined ){
                //assume tileColors array is 4 times the size of tiles array
                let dcolor_r = data.tileColors[tileDestinationIndex * 4 ]
                let dcolor_g = data.tileColors[tileDestinationIndex * 4 + 1 ]
                let dcolor_b = data.tileColors[tileDestinationIndex * 4 + 2 ]
                let dcolor_a = data.tileColors[tileDestinationIndex * 4 + 3 ]
                dcolor = color(dcolor_r, dcolor_g, dcolor_b, dcolor_a)
              }
              
              if(dcolor !== null){
                
                if(!col_is_white(dcolor) )g.tint(dcolor);
                else {
                  g.noTint();
                }
                
              }
              
              g.image( thisCopy.sheet, dx, dy, dw, dw, sx, sy, sw, sw )
              thisCopy.rendersPerFrame ++;
              
              g.renderProgress ++;
              if(g.renderProgress == g.layerObject.gridWidth * g.layerObject.gridHeight){
                g.renderComplete = true;
              }
              
            }
            
          }
          
        }
          
        
        
      }
      
      
      
      thisCopy.graphics[graphicName] = currentGraphic;
    }
    
    return currentGraphic;
  }
  
  //The data below that matches characters to their indeces was ripped
  //from the lvllvl.com website via a long and complicated and imperfect process
  //FOLD> tileSetCharacterToIndex
  let tileSetCharacterToIndex = {"Amiga":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Amstrad CPC":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Atari ST":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"ATASCII":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"BBC Micro":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Coleco":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Commodore 16":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Commodore 64":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":1,"b":2,"c":3,"d":4,"e":5,"f":6,"g":7,"h":8,"i":9,"j":10,"k":11,"l":12,"m":13,"n":14,"o":15,"p":16,"q":17,"r":18,"s":19,"t":20,"u":21,"v":22,"w":23,"x":24,"y":25,"z":26,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":27,"]":29,"\\":28,"'":39,")":41,"(":40,"&":38,"^":30,"%":37,"$":36,"#":35,"@":0,"!":33,"_":91,"{":122,"}":95,"|":105,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Commodore 128":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":1,"b":2,"c":3,"d":4,"e":5,"f":6,"g":7,"h":8,"i":9,"j":10,"k":11,"l":12,"m":13,"n":14,"o":15,"p":16,"q":17,"r":18,"s":19,"t":20,"u":21,"v":22,"w":23,"x":24,"y":25,"z":26,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":27,"]":29,"\\":28,"'":39,")":41,"(":40,"&":38,"^":30,"%":37,"$":36,"#":35,"@":0,"!":33,"_":91,"{":122,"}":95,"|":105,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Commodore PET":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Compukit UK101":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"IBM CGA":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Intellivision":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Magnavox Odyssey 2_Philips Videopac":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Mattel Aquarius":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"MSX":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Robotron":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"SC-3000":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Sharp MZ 80":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Sharp MZ 700":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"Tatung Einstein":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"VIC 20":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77},"ZX Spectrum":{"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"=":61," ":32,"a":97,"b":98,"c":99,"d":100,"e":101,"f":102,"g":103,"h":104,"i":105,"j":106,"k":107,"l":108,"m":109,"n":110,"o":111,"p":112,"q":113,"r":114,"s":115,"t":116,"u":117,"v":118,"w":119,"x":120,"y":121,"z":122,"*":42,"+":43,"-":45,"/":47,";":59,",":44,".":46,"[":91,"]":93,"\\":92,"'":39,")":41,"(":40,"&":38,"^":94,"%":37,"$":36,"#":35,"@":64,"!":33,"_":95,"{":123,"}":125,"|":124,":":58,"\"":34,"<":60,">":62,"?":63,"Q":81,"W":87,"E":69,"R":82,"T":84,"Y":89,"U":85,"I":73,"O":79,"P":80,"A":65,"S":83,"D":68,"F":70,"G":71,"H":72,"J":74,"K":75,"L":76,"Z":90,"X":88,"C":67,"V":86,"B":66,"N":78,"M":77}}
  //<FOLD
  
  
  
  let addLineBreaksForWordWrapping = function(textString, width_in_characters){
    if(typeof width_in_characters == "undefined")return textString;
    var lineLength = 0;
    var newString = ''
    var performed_linebreak = false;
    textString = textString.replaceAll('\n', ' \n ')
    textString = textString.split(' ')
    for(var i = 0; i < textString.length; i ++){
      if(textString[i] == "\n"){
        newString += "\n"
        lineLength  = 0;
      }
      var wordLength = textString[i].length + 1
      if(wordLength > 0 && textString[i] !== '\n'){
        if(lineLength + wordLength > width_in_characters){
          newString += "\n" + textString[i] + " "
          lineLength = wordLength;
        } else {
          newString += textString[i] + " "
          lineLength += wordLength
        }
      }
    }
    return newString;
  }
  
  let createTextLayer = function(alphabet, text, widthInCharacters, textColor){
    if(!Number.isFinite(widthInCharacters))widthInCharacters = undefined;
    if(alphabet == "default"){
      alphabet = {}
      let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 "
      for(let i in str){
        alphabet[i] = str[i];
      }
    }
    
    if( typeof alphabet == "string" && alphabet !== "default"){
      if( tileSetCharacterToIndex[alphabet] === undefined ){
        console.warn("Warning:  Could not find an alphabet named " + alphabet + " from lvllvl.com")
      } else {
        alphabet =  tileSetCharacterToIndex[alphabet]
      }
    }
    
    let lines = addLineBreaksForWordWrapping(text, widthInCharacters).split('\n')
    let longestLineLength = 0;
    for(let l in lines){
      if( lines[l].length > longestLineLength ){
        longestLineLength = lines[l].length
      }
    }
    
    let newLines = []
    for(let l in lines){
      lines[l] = lines[l].padEnd(longestLineLength, " ")
      
      let indexArray = [];
      
      for(let c in lines[l]){
        let thisIndex = null;
        if( alphabet[ lines[l][c] ] === undefined )thisIndex = alphabet[" "]
        else { thisIndex = alphabet[ lines[l][c] ] }
        indexArray.push( thisIndex )
        
      }
      newLines.push(indexArray)
    }
    
    lines = newLines;
    
    let tileColorCount = null;
    let tileColorQuad = false;
    if( textColor.levels !== undefined ){
      tileColorCount = new Uint16Array(lines[0].length * lines.length * 4)
      tileColorQuad = true;
    }
    else {
      tileColorCount = new Uint16Array(lines[0].length * lines.length)
      
    }
    
    
    let ret = {
      label: "Generated_Layer_" + text,
      gridWidth: longestLineLength,
      gridHeight: lines.length,
      data: {
        tiles: new Uint16Array(lines[0].length * lines.length),
        tileColors: tileColorCount,
      }
    }
    
    let cy = 0;
    for(let l in lines){
      let cx = 0;
      for(let c in lines[l]){
        let ci = (cy * ret.gridWidth) + cx;
        ret.data.tiles[ci] = lines[l][c]
        if(tileColorQuad){
          ret.data.tileColors[ci*4] =   int(red(textColor))
          ret.data.tileColors[ci*4+1] = int(green(textColor))
          ret.data.tileColors[ci*4+2] = int(blue(textColor))
          ret.data.tileColors[ci*4+3] = int(alpha(textColor))
        } else {
          if( thisCopy.colorPalette[textColor] === undefined )
          console.warn("Warning: could not find color: " + textColor + " in the color palette for use in graphic: " + ret.label)
          
          ret.data.tileColors[ci] = int( textColor )
        }
        cx ++;
      }
      cy ++;
    }
    
    return ret;
  }
  
  this.sheetIndexOf = function( characterString ){
    if(typeof characterString !== "string" || characterString.length > 1){
      console.warn("Warning: the .sheetIndexOf() method requires a string of length 1")
      return undefined;
    }
    
    let alphabet = thisCopy.alphabet;
    if(thisCopy.alphabet === undefined){
      console.warn("Warning: the .sheetIndexOf() method requires the tile renderer to have a defined alphabet property (it should be either an object, or a string containing the name of your LVL LVL tileset).")
    }
    
    if(alphabet == "default"){
      alphabet = {}
      let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 "
      for(let i in str){
        alphabet[i] = str[i];
      }
    }
    
    if( typeof alphabet == "string" && alphabet !== "default"){
      if( tileSetCharacterToIndex[alphabet] === undefined ){
        console.warn("Warning:  Could not find an alphabet named " + alphabet + " from lvllvl.com")
      } else {
        alphabet =  tileSetCharacterToIndex[alphabet]
      }
    }
    return alphabet[characterString]
  }
  
  this.getTextGraphic = function(text, settingsObj){
    //settings object takes all the settings of getGraphic() but ALSO widthInCharacters and textColor
    let alphabet = thisCopy.alphabet;
    if(thisCopy.alphabet === undefined){
      console.warn("Warning: the .getTextGraphic() method requires the tile renderer to have a defined alphabet property (it should be either an object, or a string containing the name of your LVL LVL tileset).")
    }
    
    let missingEssentialSettings = false;
    if(settingsObj === undefined)missingEssentialSettings = true;
    if(settingsObj.textColor === undefined)missingEssentialSettings = true;
    if(missingEssentialSettings)console.warn("Warning: getTextGraphic() must be passed a settings object containing a text color (either a p5 color or an index in your color palette)")
    else {
      let widthInCharacters = Infinity;
      if(settingsObj.widthInCharacters !== undefined)widthInCharacters = settingsObj.widthInCharacters;
      
      let graphicNameLength = constrain(200, 0, text.length)
      let graphicName = "autoGeneratedTextGraphic__" + text.slice(0,graphicNameLength)
      for(let i in settingsObj){
        graphicName += "_" + settingsObj[i].toString()
      }
      
      let layer = "this string will be ignored"
      if( thisCopy.graphics[graphicName] === undefined ){
        layer = createTextLayer( alphabet, text, widthInCharacters, settingsObj.textColor )
        //console.log("Created a text graphic")
      }
      
      return thisCopy.getGraphic(graphicName, layer, settingsObj )
      
    }
  }
  
}
