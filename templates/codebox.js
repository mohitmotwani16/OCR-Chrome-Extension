
function createHtml(ocr_data) {
	ocr_data = decodeURIComponent(ocr_data)
	var patt1 = "\\n";
	var patt2 = "\\f";
	
	var rows = ocr_data.split(patt1);
	var dummy = "";
	for(let i = 0; i < rows.length; i++) {
		
		if(rows[i].length > 1 && rows[i][0] != " ")
			dummy += rows[i].trim()  + "\n";
	}
	// console.log(dummy);
	// console.log(numberOfRows);
	var numberOfRows =  dummy.split("\n").length;
	var numberOfColumns = getColumnCount(dummy);
	var newdata = dummy.replace(patt2,"");
	var i = newdata.length - 2;
	while(newdata[i] == " ")
		i--;
	
	
	var newdata1 = newdata.substring(0,i+1);
	
	newdata1.trim();
	newdata1 = replaceAllBackSlash(newdata1);
	// console.log(ocr_data);
	
	var div = document.createElement('div');
	div.innerHTML = `
	<div class="code-box" id="code-box"> 
		<div class="text-container">
			<textarea rows="${numberOfRows}" cols="${numberOfColumns}" id="resultText">${newdata1}</textarea>
		</div>
		<div class="button-container">
			<div class="copy-button"  id="copyButton">
				Copy to Clipbpard
			</div>
		</div>

	</div>`;
	document.body.appendChild(div);

	document.getElementById('copyButton').addEventListener('click', copyResultToClipboard, false)
}
function replaceAllBackSlash(targetStr){
    var index=targetStr.indexOf("\\");
    while(index >= 0){
        targetStr=targetStr.replace("\\","");
        index=targetStr.indexOf("\\");
    }
    return targetStr;
}
function getColumnCount(text) {
	var lines =  text.split("\n");

	var longestLine = lines.reduce(function (a, b) { return a.length > b.length ? a : b; })

	return longestLine.length ; 
}

function copyResultToClipboard() {

	document.oncopy = function (event) {
		var text = document.getElementById('resultText').value;
		event.clipboardData.setData('text/plain',text);
		event.preventDefault();
	};
	document.execCommand("copy", false, null);
}

function getParameters (url) {
	var target = url.substring(url.indexOf('?') + 1);
	return target.replace(new RegExp('%2520', 'g'), ' ');
};


var ocr_data = decodeURI(getParameters(window.location.href));
createHtml(ocr_data);




