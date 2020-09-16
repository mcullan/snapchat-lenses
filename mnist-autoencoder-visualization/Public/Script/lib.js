// -----JS CODE-----


script.api.coordinates = {
            '3': [0.18599716, 0.13150105],
            '5': [ 7.66874  , -7.4832926],
            '7': [20.019218 , -3.1254258],
            '0': [-3.2880588,  1.4403304]
}

script.api.getXY = function(hand, screenTransform){
        var transform = hand.getTransform();
        var position = transform.getWorldPosition();
        var screenPosition = screenTransform.worldPointToLocalPoint(position);
        
        return screenPosition
}

script.api.getInterpolatedInput = function(x, y){
    var weights = cornerWeights(x, y);

    var A_ = round2Fixed(weights.upperLeft), 
        B_ = round2Fixed(weights.upperRight),
        C_ = round2Fixed(weights.lowerLeft),
        D_ = round2Fixed(weights.lowerRight);

    var weightedX = (
        weights.upperLeft * coordinates['3'][0] + 
        weights.upperRight * coordinates['5'][0] +
        weights.lowerLeft * coordinates['7'][0]+ 
        weights.lowerRight * coordinates['0'][0]
    );

    var weightedY = (
        weights.upperLeft * coordinates['3'][1] + 
        weights.upperRight * coordinates['5'][1] +
        weights.lowerLeft * coordinates['7'][1]+ 
        weights.lowerRight * coordinates['0'][1]
    );

    return {x: weightedX, y: weightedY, A:A_, B:B_, C:C_, D:D_}
}

script.api.cornerWeights = function (x, y){

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

script.api.round2Fixed = function(value) {
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

script.api.stringFormat  = function() {
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
}


script.api.setDisplayText = function(interpolatedVector, textObject){

    var xString = round2Fixed(getXY()['x'])
    var yString = round2Fixed(getXY()['y'])

    var distanceString = String.format(
            'Weights: \n A: {0},  B: {1} \n C: {2},  D: {3}',
             interpolatedVector.A, interpolatedVector.B, 
             interpolatedVector.C, interpolatedVector.D);
    
    var coordinateString = String.format(
            'Coordinates: \n X: {0},  Y: {1}',
             xString, yString);
        
    textObject.text = distanceString + '\n' + coordinateString;
}



