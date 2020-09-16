
// -----JS CODE-----

// Script with necessary functions
// @input Component.ScriptComponent lib
// Machine Learning Model: Input tensor must be named 'x'
// @input Asset.MLAsset model

// Hand Tracking Inputs
// @input Component.ScreenTransform screenTransform
// @input Component.ObjectTracking hand


// Display
//@input Component.Image image
//@input Component.Text distanceText

round2Fixed = script.lib.api.round2Fixed
script.lib.api.stringFormat();
var width = 28;
var height = 28;
var channels = 4; // RGBA

var newTex = ProceduralTextureProvider.create(width, height, Colorspace.RGBA);
var newData = new Uint8Array(width * height * channels);

coordinates = {
            '3': [0.18599716, 0.13150105],
            '5': [ 7.66874  , -7.4832926],
            '7': [20.019218 , -3.1254258],
            '0': [-3.2880588,  1.4403304]
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

function drawDigit(data){
    
    for (var y=0; y<height; y++) {
        for (var x=0; x<width; x++) {
            // Calculate index
            var index = (y * width + x) * channels;
            var dataIndex = ( (height - y) *width + x);
            // Set R, G, B, A
                
            color = Math.min(255,100 + (data[dataIndex] * 255));
             
               
            newData[index] =   255; 
            newData[index+1] = 255;
            newData[index+2] = 255; 
                
                if(color < 200){
                    newData[index+3] = 0;
                }
                else{
                    newData[index+3] = 255;
                }
            if (y < 1)  newData[index+3] = 0;
        }
    }
    newTex.control.setPixels(0, 0, width, height, newData);
    script.image.mainPass.baseTex = newTex;    
}


var mlComponent = script.sceneObject.createComponent('MLComponent');
mlComponent.model = script.model

var inputBuilder = MachineLearning.createInputBuilder();
inputBuilder.setName("x");
inputBuilder.setShape(new vec3(1, 2, 1));
var inputPlaceholder = inputBuilder.build();

var outputBuilder = MachineLearning.createOutputBuilder();
outputBuilder.setName('Identity');
outputBuilder.setShape(new vec3(1, 1, 784));
outputBuilder.setOutputMode(MachineLearning.OutputMode.Data);

mlComponent.onLoadingFinished = onLoadingFinished;
mlComponent.onRunningFinished = onRunningFinished;


function onLoadingFinished(){

    mlInput = mlComponent.getInput("x");
    inputData = mlInput.data;

    inputData[0] = getXY()['x'];
    inputData[1] = getXY()['y'];
    
    mlComponent.runScheduled(true, 
        MachineLearning.FrameTiming.OnRender, 
        MachineLearning.FrameTiming.None);
}

function getInterpolatedInput(x, y){
    var weights = cornerWeights(x, y);

    var A_ = round2Fixed(weights.upperLeft), 
        B_ = round2Fixed(weights.upperRight),
        C_ = round2Fixed(weights.lowerLeft),
        D_ = round2Fixed(weights.lowerRight);

    weightedX = (
        weights.upperLeft * coordinates['3'][0] + 
        weights.upperRight * coordinates['5'][0] +
        weights.lowerLeft * coordinates['7'][0]+ 
        weights.lowerRight * coordinates['0'][0]
    );

    weightedY = (
        weights.upperLeft * coordinates['3'][1] + 
        weights.upperRight * coordinates['5'][1] +
        weights.lowerLeft * coordinates['7'][1]+ 
        weights.lowerRight * coordinates['0'][1]
    );

    return {x: weightedX, y: weightedY, A:A_, B:B_, C:C_, D:D_}
}

function onRunningFinished() {
    //process output

    var outputData = mlComponent.getOutput("Identity");
    data = outputData.data;
    draw_digit(data);

    var interpolated = getInterpolatedInput(getXY['x'], getXY['y']);
    inputData[0] = interpolated['x'];
    inputData[1] = interpolated['y'];

    setDisplayText(interpolated);
    
}

function setDisplayText(interpolatedVector){

    var xString = round2Fixed(getXY['x'])
    var yString = round2Fixed(getXY['y'])

    var distanceString = String.format(
            'Weights: \n A: {0},  B: {1} \n C: {2},  D: {3}',
             interpolatedVector.A, interpolatedVector.B, 
             interpolatedVector.C, interpolatedVector.D);
    
    var coordinateString = String.format(
            'Coordinates: \n X: {0},  Y: {1}',
             xString, yString);
        
    script.distanceText.text = distanceString + '\n' + coordinateString;
}


var outputPlaceholder = outputBuilder.build();
mlComponent.build([inputPlaceholder, outputPlaceholder]);