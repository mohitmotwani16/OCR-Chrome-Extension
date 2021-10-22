function Slider(name, startingValue) {
	this.createSlider(name, startingValue);
}

Slider.prototype.createSlider = function(name , startingValue){
	var sliderTemplate = `<div id="slider">
          <div class="slidecontainer">
          <h2>${name}</h2>
            <input type="range" min="1" max="100" value="${startingValue}" class="slider" id="rangeSlider">
          </div>
          <div class="apply-button" id="apply-button">
            Apply Changes
          </div>  
        </div>`;

	var slider = document.createElement('div');

	slider.innerHTML = sliderTemplate;

	document.body.appendChild(slider); 
};









