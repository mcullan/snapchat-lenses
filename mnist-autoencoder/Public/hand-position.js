// -----JS CODE-----
// @input Component.ScreenTransform screenTransform
// @input Component.ObjectTracking hand
// @input Component.ScreenTransform imageTransform
// -----JS CODE-----
//@input Component.Text coordinateText
//@input Component.Text distanceText

// Round numbers to 2 decimal points

function round2Fixed(value) {
      // Uniform spacing for postive and negative values
      if(value > 0) 
        spacer = ' ';
      else
        spacer = '';
     
      // Shift
      value = +value;
      value = value.toString().split('e');
      value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + 2) : 2)));

      // Shift back
      value = value.toString().split('e');
      value = (+(spacer + value[0] + 'e' + (value[1] ? (+value[1] - 2) : -2))).toFixed(2)
      
      return String.format('{0}{1}', spacer, value)
}  

  
// Python-like String formatting
        if (!String.format) {
          String.format = function(format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function(match, number) { 
              return typeof args[number] != 'undefined'
                ? args[number] 
                : match
              ;
            });
          };
        }

function getXY(){
        var transform = script.hand.getTransform();
        position = transform.getWorldPosition();
        screenPosition = script.screenTransform.worldPointToLocalPoint(position);
        
        return screenPosition
}

function cornerWeights(x, y){
        var alphaX = (x + 1.0) / 2.0
        var alphaY = (y + 1.0) / 2.0
        
        var output = {
        upperLeft : (1 - alphaX) *alphaY,
        upperRight : (alphaX * alphaY),
        lowerLeft : (1 - alphaX) * (1 - alphaY),
        lowerRight : alphaX * (1 - alphaY),
        }
        
        return output
}


// This runs at the beginning of every frame
var event = script.createEvent("UpdateEvent");
event.bind(function (eventData){
   
       var XY = getXY();
           x = XY['x'];
           y = XY['y'];
        //print(typeof(x));
        
       var weights = cornerWeights(x, y);
       var A = round2Fixed(weights.upperLeft), 
           B = round2Fixed(weights.upperRight),
           C = round2Fixed(weights.lowerLeft),
           D = round2Fixed(weights.lowerRight);
        
        
        var distanceString = String.format(
                'Weights: \n A: {0},  B: {1} \n C: {2},  D: {3}',
                 A, B, C, D);
        
        var coordinateString = String.format(
                'Coordinates: \n X: {0},  Y: {1}',
                 round2Fixed(x), round2Fixed(y));
            
        script.distanceText.text = distanceString + '\n' + coordinateString;
        });

