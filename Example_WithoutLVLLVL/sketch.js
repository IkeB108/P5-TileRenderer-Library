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
