// -----JS CODE-----
//@input Asset.MLAsset model
//@input Asset.Texture texture
// @input Component.Image image
//@input string inputName
//@input float red = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01}
//@input float green = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01}
//@input float blue = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.01}



var width = 28;
var height = 28;
var channels = 4; // RGBA

var newTex = ProceduralTextureProvider.create(width, height, Colorspace.RGBA);
var newData = new Uint8Array(width * height * channels);


var mlComponent = script.sceneObject.createComponent('MLComponent');
mlComponent.model = script.model

var inputBuilder = MachineLearning.createInputBuilder();
inputBuilder.setName("x");
inputBuilder.setShape(new vec3(1, 2, 1));
//inputBuilder.setInputTexture(script.texture);
var inputPlaceholder = inputBuilder.build();

var outputBuilder = MachineLearning.createOutputBuilder();
outputBuilder.setName('Identity');
outputBuilder.setShape(new vec3(1, 1, 784));
outputBuilder.setOutputMode(MachineLearning.OutputMode.Data);

mlComponent.onLoadingFinished = onLoadingFinished;
function onLoadingFinished(){
    print('loaded');
    //do something
    //access inputs and outputs
    //start running
   var input1 = mlComponent.getInput("x");
    inputData = input1.data;
    //print(inputData[0]);
    //print(inputData[1]);
    two = new Array(2);
    two[0] = 2.1666656;
    two[1] = -2.1639538;
    
    inputData[0] = two[0];
    inputData[1] = two[1];
    
    mlComponent.runScheduled(true, MachineLearning.FrameTiming.Update, MachineLearning.FrameTiming.None);
    //mlComponent.runImmediate(true);
}

mlComponent.onRunningFinished = onRunningFinished;
function onRunningFinished() {
    //process output
    //print("running finished");
    var outputData = mlComponent.getOutput("Identity");
    data = outputData.data
    //print(data)
    
    for (var y=0; y<height; y++) {
    for (var x=0; x<width; x++) {
        // Calculate index
        var index = (y * width + x) * channels;
        var dataIndex = ( (height - y) *width + x);
        // Set R, G, B, A
            
        color = Math.min(255,100 + (data[dataIndex] * 255));
         
           
        newData[index] =  script.red * 255; 
        newData[index+1] = script.green * 255;
        newData[index+2] = script.blue * 255; 
            
            if(color < 200){
                newData[index+3] = 0;
            }
            else{
                newData[index+3] = 255;
            }
        if (y < 1)  newData[index+3] = 0;
        
    }
        getTime()
        
    zero = new Array(2);
    zero[0] = -2.3188725;
    zero[1] = 11.148399;
    cosine_ = Math.cos(2 * getTime());    
    inputData[0] = CosineInterpolate(two[0], zero[0], cosine_);
    inputData[1] = CosineInterpolate(two[1], zero[1], cosine_);
         
        
        //print(inputData[0]);
}
function CosineInterpolate(pt1, pt2, cosine)
{
   var mu2;
   mu2 = (1-cosine)/2;
   return(pt1*(1-mu2)+pt2*mu2);
}

newTex.control.setPixels(0, 0, width, height, newData);
script.image.mainPass.baseTex = newTex;
}

print('about to build');
var outputPlaceholder = outputBuilder.build();
mlComponent.build([inputPlaceholder, outputPlaceholder]);

print('built');
