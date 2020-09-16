
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


// Constants
var width = 28;
var height = 28;
var channels = 4; // RGBA
var newTex = ProceduralTextureProvider.create(width, height, Colorspace.RGBA);
var newData = new Uint8Array(width * height * channels);

// Import from lib script
api = script.lib.api

round2Fixed = api.round2Fixed;  
    
coordinates = api.coordinates;
cornerWeights = api.cornerWeights;
getInterpolatedInput = api.getInterpolatedInput;

getXY = function(){
    return api.getXY(script.hand, script.screenTransform)};
    
setDisplayText = function(interpolatedVector){
    api.setDisplayText(interpolatedVector, script.distanceText)};

api.stringFormat();


// Build Tensorflow Model
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
var outputPlaceholder = outputBuilder.build();
mlComponent.build([inputPlaceholder, outputPlaceholder]);



//-------MLComponent Callbacks------
function onLoadingFinished(){

    mlInput = mlComponent.getInput("x");
    inputData = mlInput.data;

    inputData[0] = getXY()['x'];
    inputData[1] = getXY()['y'];
    
    
    mlComponent.runScheduled(true, 
        MachineLearning.FrameTiming.OnRender, 
        MachineLearning.FrameTiming.None);
}

function onRunningFinished() {
    //process output
    var outputData = mlComponent.getOutput("Identity");
    data = outputData.data;
    drawDigit(data, newTex, script.image);

    var interpolated = getInterpolatedInput(getXY()['x'], getXY()['y']);
    inputData[0] = interpolated['x'];
    inputData[1] = interpolated['y'];

    setDisplayText(interpolated);

}

//-------Draw decoded digit in box------
function drawDigit(data, targetTexture, targetImage){
    
    for (var y=0; y<height; y++) {
        for (var x=0; x<width; x++) {
            // Calculate index
            var index = (y * width + x) * channels;
            var dataIndex = ( (height - y) *width + x);
            // Set R, G, B, A
                
            var color = Math.min(255,100 + (data[dataIndex] * 255));
                   
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
    targetTexture.control.setPixels(0, 0, width, height, newData);
    targetImage.mainPass.baseTex = newTex;    
}



