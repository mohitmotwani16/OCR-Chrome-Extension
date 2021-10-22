function Imagely() {
	console.log("Sucessfully bound Imagely");	
}

Imagely.prototype.threshold = function(pixels, threshold){

	var data = pixels.data;

  	for (var index = 0; index < data.length; index += 4) {
    	var red = data[index];
    	var green = data[index + 1];
    	var blue = data[index + 2];
    	var alpha = (0.2126 * red + 0.7152 * green + 0.0722 * blue >= threshold) ? 255 : 0;
    	data[index] = data[index + 1] = data[index + 2] = alpha;
    }
  	
  	return pixels;

};

Imagely.prototype.invert = function(pixels, strength){

  var data = pixels.data;

    for (var i = 0; i < data.length; i+= 4) {
      data[i] = data[i] ^ (strength * 2.55); // Invert Red
      data[i+1] = data[i+1] ^ (strength * 2.55); // Invert Green
      data[i+2] = data[i+2] ^ (strength * 2.55); // Invert Blue
    }
    
    return pixels;

};
