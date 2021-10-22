var selection = {};
var drag = false;

var imageManipulator = new Imagely();
var originalCroppedImage;
var offset;
var imageProportions = {};

async function setScreenshotUrl(url) {
  var canvas = document.getElementById("canvas");
  toggleInstructions("selecting");

  //document.getElementById('target').src = url;

  document.addEventListener("keydown", onSelectedRegion, false);
  canvas.addEventListener("mousedown", mouseDown, false);
  canvas.addEventListener("mouseup", mouseUp, false);
  canvas.addEventListener("mousemove", mouseMove, false);

  var ctx = canvas.getContext("2d");
  var img = new Image();
  var originalImage = new Image();

  iniatlizeToolbar();

  var browserWidth = getWidth();
  var browserHeight = getHeight();

  ctx.canvas.width = browserWidth;
  ctx.canvas.height = browserHeight;

  var urlCopy = (" " + url).slice(1);
  img.src = url;
  originalImage.src = urlCopy;

  await loadImage();

  await loadImageOriginalImage();
  offset = imageOffsetCalculations(originalImage);

  var newUrl = canvas.toDataURL("image/png", 1.0);

  img.src = newUrl;

  await loadImage();

  function mouseDown(e) {
    selection.startX = e.pageX - this.offsetLeft;
    selection.startY = e.pageY - this.offsetTop;
    drag = true;
  }

  function mouseUp() {
    drag = false;
  }
  function iniatlizeToolbar() {
    document.getElementById("thresholdButton").addEventListener(
      "click",
      function (event) {
        onButtonClick("Threshold", event, updateThreshold, 50);
      },
      false
    );
    document.getElementById("invertButton").addEventListener(
      "click",
      function (event) {
        onButtonClick("Invert", event, invertImage, 100);
      },
      false
    );
    document
      .getElementById("analyseButton")
      .addEventListener("click", submitImage, false);
  }

  function onButtonClick(name, event, manipulate, startingValue) {
    //discardUnappliedChanges();
    removeActiveClassFromAllButtons();
    event.target.classList.add("active");
    removeElementFromDOM("#slider");
    addNewSlider(name, manipulate, startingValue);
  }

  function removeActiveClassFromAllButtons() {
    var buttons = document.querySelectorAll(".setting-button-choose");
    buttons.forEach(function (button) {
      button.classList.remove("active");
    });
  }

  function addNewSlider(name, manipulate, startingValue) {
    currentSlider = new Slider(name, startingValue);
    manipulate();
    document
      .getElementById("rangeSlider")
      .addEventListener("change", manipulate, false);
    document
      .getElementById("apply-button")
      .addEventListener("click", applyChanges, false);
  }

  function removeElementFromDOM(name) {
    var element = document.querySelector(name);

    if (element) {
      element.parentNode.removeChild(element);
    }
  }

  async function applyChanges() {
    removeElementFromDOM("#slider");
    originalCroppedImage = ctx.getImageData(
      0,
      0,
      imageProportions.width,
      imageProportions.height
    );
  }

  function discardUnappliedChanges() {
    cropImage();
    // ctx.clearRect(0,0,canvas.width,canvas.height);
    // ctx.drawImage(originalCroppedImage,rect.startX, rect.startY, rect.w, rect.h, rect.startX, rect.startY, rect.w, rect.h);
  }

  function mouseMove(e) {
    if (drag) {
      toggleSetting(false);
      toggleInstructions("selecting");
      removeElementFromDOM('#slider');
      setSelectionWidth(e.pageX - this.offsetLeft - selection.startX);
      setSelectionHeight(
        (selection.h = e.pageY - this.offsetTop - selection.startY)
      );
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw();
    }
  }

  function setSelectionHeight(value) {
    selection.h = value;
  }

  function setSelectionWidth(value) {
    selection.w = value;
  }
  function draw() {
    ctx.globalAlpha = 0.7;
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      browserWidth,
      browserHeight
    );
    ctx.globalAlpha = 0.1;
    ctx.fillRect(selection.startX, selection.startY, selection.w, selection.h);
    ctx.globalAlpha = 1.0;
  }

  function onSelectedRegion(e) {
    if (13 == e.keyCode) {
      onEnter();
    }

    if (e.key === "Escape") {
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        0,
        0,
        browserWidth,
        browserHeight
      );
      drag = false;
      toggleInstructions("selecting");
      toggleSetting(false);
      removeElementFromDOM("#slider");
      removeElementFromDOM("#code-box");
    }
  }

  function onEnter() {
    cropImage();
    toggleSetting(true);
    toggleInstructions("settings");
  }

  function toggleLoader(state) {
    if (state) {
      document.getElementById("load").style.display = "block";
      return;
    }

    document.getElementById("load").style.display = "none";
  }

  function toggleSetting(state) {
    if (state) {
      document.getElementById("image-settings").style.display = "block";
      return;
    }

    document.getElementById("image-settings").style.display = "none";
  }

  function toggleInstructions(state) {
    if (state === "selecting") {
      document.getElementById("select-instructions").style.display = "block";
      document.getElementById("setting-instructions").style.display = "none";
      return;
    }

    document.getElementById("select-instructions").style.display = "none";
    document.getElementById("setting-instructions").style.display = "block";
  }
  document.getElementById("analyseButton").addEventListener("click", submitImage, false);

  function submitImage() {
    var Image64 = canvas.toDataURL("image/jpeg"); // It converts the image to string(base64 conversion)
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ image64: Image64 });
    // Here doing a post request
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    fetch("http://127.0.0.1:5000/json", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        chrome.windows.create({
          // Just use the full URL if you need to open an external page
          url: chrome.runtime.getURL(`./code-box.html?${result}`),
          // state: "maximized",
          width: 800,
          height: 800,
          type: "normal",
        });
      })
      .catch((error) => console.log("error", error));
  }

  function copyImageData(context, src) {
    var dst = context.createImageData(src.width, src.height);
    dst.data.set(src.data);
    return dst;
  }

  function invertImage() {
    var value = document.getElementById("rangeSlider").value;
    var copy = copyImageData(ctx, originalCroppedImage);
    var adjustedImage = imageManipulator.invert(copy, value);
    ctx.putImageData(adjustedImage, 0, 0);
  }

  function updateThreshold() {
    var value = document.getElementById("rangeSlider").value;
    var copy = copyImageData(ctx, originalCroppedImage);
    var adjustedImage = imageManipulator.threshold(copy, value);
    ctx.putImageData(adjustedImage, 0, 0);
  }


  function cropImage() {
    if (!selection.startX) {
      alert("Please create a selection");
      toggleSetting(false);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var startX = selection.startX * offset.width;
    var startY = selection.startY * offset.height;

    var width = selection.w * offset.width;
    var height = selection.h * offset.height;

    setImageProportions(browserWidth * 0.9, browserHeight * 0.9, height, width);

    ctx.drawImage(
      originalImage,
      startX,
      startY,
      width,
      height,
      0,
      0,
      imageProportions.width,
      imageProportions.height
    );

    originalCroppedImage = ctx.getImageData(
      0,
      0,
      imageProportions.width,
      imageProportions.width
    );
  }

  function setImageProportions(maxWidth, maxHeight, height, width) {
    var ratio = 0; // Used for aspect ratio

    // Check if the current width is larger than the max
    if (width > maxWidth) {
      ratio = maxWidth / width; // get ratio for scaling image
      height = height * ratio; // Reset height to match scaled image
      width = width * ratio; // Reset width to match scaled image
    }

    //Check if current height is larger than max
    if (height > maxHeight) {
      ratio = maxHeight / height; // get ratio for scaling image
      width = width * ratio; // Reset width to match scaled image
      height = height * ratio; // Reset height to match scaled image
    }

    imageProportions.height = height;
    imageProportions.width = width;
  }

  function loadImageOriginalImage() {
    return new Promise(function (resolve, reject) {
      try {
        originalImage.onload = function () {
          resolve();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  function loadImage() {
    return new Promise(function (resolve, reject) {
      try {
        img.onload = function () {
          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            0,
            0,
            browserWidth,
            browserHeight
          );
          resolve();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  function getWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

  function getHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
  }

  function imageOffsetCalculations(image) {
    var offset = {};
    offset.width = image.width / browserWidth;
    offset.height = image.height / browserHeight;

    return offset;
  }
  function formatReturnedData(data) {
    return data.replace(/\n/g, "%0D%0A");
  }
}
