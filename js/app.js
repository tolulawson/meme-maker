$('#clear-button').on('shown.bs.modal', function () {
  $('#clear-button').trigger('focus')
}); // Code snippet to enable bootstrap modal

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
}); // Code snippet to enable bootstrap tooltip



// -- Global variable declarations


let $selectedImage;
let img = document.createElement('img');


// -- Extract image object from selected file input
function assignSelectedFileFromInput (event) {
  $selectedImage = this.files[0];
  img.src = URL.createObjectURL($selectedImage);
  img.id = 'canvas-img';
  $('#upload-form').submit(); // Painting the selected image to stage is handled upon submit of the form the input is a field of
}

// -- Bind image object function to changes in input
$('#upload-input').on('input', assignSelectedFileFromInput);

function highlightOnDragOver() {
  //-- Add styling to notify user of dragover uploar area; change text of upload area
  $('.upload-area').addClass('dragged-over')[0].childNodes[0].nodeValue = 'Drop image';
}

function restoreOnDragEnd() {
  // -- Remove all changes made by dragover
  $('.upload-area').removeClass('dragged-over')[0].childNodes[0].nodeValue = 'Drag an image or click below';
}

function imageDropped(event) {

  // -- Raise alert if more than 1 file is dropped
  if(event.originalEvent.dataTransfer.files.length > 1) {
    window.alert('Select 1 image file');
    restoreOnDragEnd();
  }

  // -- Raise alert if dropped file does not end with an image extension
  else if(!/^.+\.(jpg|png|jpeg|gif|bmp|tif|tiff)$/gi.test(event.originalEvent.dataTransfer.files[0].name)) {
    window.alert('Select a valid image file');
    restoreOnDragEnd();
  }
  else {
    //Assign dropped file to holding variable
    $selectedImage = event.originalEvent.dataTransfer.files[0];

    // -- Submit form which contains the file input;
    $('#upload-form').submit();
  }

}

/// <<<--- Begin Code Refactor Using Knova Library --->>>

let stage = new Konva.Stage({
  container: 'stage',
  width: $('#stage').width(),
  height: 500
});



let picLayer = new Konva.Layer();
let textLayer = new Konva.Layer();

stage.add(picLayer);
stage.add(textLayer);

let image = new Konva.Image({
  x: 0,
  y: 0
});


picLayer.add(image);

let topText = new Konva.Text({
  x: 20,
  fontSize: $('#font-size-select').val(),
  fontFamily: $('#font-family-select').val(),
  fontStyle: 'bold',
  fill: 'white',
  align: 'center',
  stroke: 'black',
  strokeWidth: 1,
  width: stage.width()-40,
  draggable: true,
  name: 'text',
  id: 'top'

});

let bottomText = new Konva.Text({
  x: 20,
  fontSize: $('#font-size-select').val(),
  fontFamily: $('#font-family-select').val(),
  fontStyle: 'bold',
  fill: 'white',
  align: 'center',
  stroke: 'black',
  strokeWidth: 1,
  width: stage.width()-40,
  draggable: true,
  name: 'text',
  id: 'bottom'

});

let middleText = new Konva.Text({
  x: 20,
  fontSize: $('#font-size-select').val(),
  fontFamily: $('#font-family-select').val(),
  fontStyle: 'bold',
  fill: 'white',
  align: 'center',
  stroke: 'black',
  strokeWidth: 1,
  width: stage.width()-40,
  draggable: true,
  name: 'text',
  id: 'middle'

});



textLayer.add(topText);
textLayer.add(bottomText);
textLayer.add(middleText);

// -- Transformer class that handles transformation handles
let tr = new Konva.Transformer();
textLayer.add(tr);

// -- Reveal tranformation handles around text when clicked or touched
let selectedTextObject;

function selectTextObjectOnClick(event) {
    if(!event.target.hasName('text')) {
      tr.nodes([]);
      textLayer.draw();
    }
    else {
      selectedTextObject = textObjects[event.target.id()];
      tr.nodes([event.target]);
      textLayer.draw();
    }
}

stage.on('mouseup touchend', selectTextObjectOnClick);


function drawImage() {
  img.onload = function() {

  picLayer.offsetX(0);
  picLayer.offsetY(0);

  stage.height(img.naturalHeight * stage.width() / img.naturalWidth); // -- Set stage height based on aspect ratio of selected image. Canvas width is constant.

    image.image(img);
    image.width(stage.width());
    image.height(stage.height());




    $('#stage').height(img.naturalHeight / img.naturalWidth * $('#stage').width());// -- Set stage apparent height to match aspect ratio of image selected. This is important when this function is called after a crop had be previously applied.

    picLayer.batchDraw();

    // -- Reset text position when drawing image. This is useful for correcting the position of text object in cases where there has been a crop, or where a new image of a different dimension is being drawn
    topText.y(stage.height()*0.05);
    middleText.y((stage.height()/2) - 60);
    bottomText.y(stage.height()*0.85);
    textLayer.draw();

    $('#square-crop').removeClass('active');
  }

}

// -- Replace current image
function replacePicture() {
  $('#upload-input')[0].value = '';
  $('#upload-input').click();

}

// -- Clear stage of all content, image and text. Opens modal for confirmation
function clearArtboard() {
  stage.clear();
  $('#upload-input')[0].value = '';
  $('.editor').addClass('hidden');
  $('#upload-form').removeClass('hidden');
}


// -- Crop image to square. Restore previous aspect ration when toggled
function cropImageSquare() {
  if (!$('#square-crop').hasClass('active')) { // -- Check if the crop button is currently active
    if (stage.height() > stage.width()) {

      picLayer.offsetY((stage.height() - stage.width())/2);
      $('#stage').height($('#stage').width());
      stage.height(stage.width());
      picLayer.batchDraw();
    }

    if (stage.height() < stage.width()){


      $('#stage').height($('#stage').width());
      stage.height(stage.width());
      image.height(stage.height());
      image.width(img.naturalWidth / img.naturalHeight * image.height());
      picLayer.offsetX((image.width() - image.height())/2);
      picLayer.batchDraw();
    }
  }
  else {

    picLayer.offsetX(0);
    picLayer.offsetY(0);
    stage.height(img.naturalHeight / img.naturalWidth * stage.width());
    $('#stage').height(img.naturalHeight / img.naturalWidth * $('#stage').width());
    image.width(stage.width());
    image.height(stage.height());
    picLayer.batchDraw();
  }

  topText.y(stage.height()*0.05);
  middleText.y((stage.height()/2) - 60);
  bottomText.y(stage.height()*0.85);
  textLayer.draw();

  $('#square-crop').toggleClass('active');
}


let textContentHolder = {
  top: '',
  middle: '',
  bottom: ''
}

let textObjects = {
  top: topText,
  middle: middleText,
  bottom: bottomText
}

function setText() {
  textContentHolder[$('#text-position').text().toLowerCase()] = $('#meme-text').val(); // Store the content of the text field in an object holder for the respective text position currently selected

  // -- Set y position of text objects
  topText.y(stage.height()*0.05);
  middleText.y((stage.height()/2) - 60);
  bottomText.y(stage.height()*0.85);

  // -- Store the current text object being edited. The font family and font size functions are applied to this particular text object
  selectedTextObject = textObjects[$('#text-position').text().toLowerCase()];
  tr.nodes([]);

  // -- Set the respective text object's text to the content stored for it in the placeholder object (stored from the text input in an earlier function)

  topText.text(textContentHolder['top']);
  middleText.text(textContentHolder['middle']);
  bottomText.text(textContentHolder['bottom']);

  textLayer.draw();

  setTimeout(function() {
    $('#text-edit-instruction').removeClass('hidden');
  }, 500);
}

// This function is bound to changes in the font family drop down. It sets the value font family value of the current selected text object to the dropdown value and redraws the layer
function setFontFamily() {
  selectedTextObject.fontFamily($('#font-family-select').val());
  textLayer.draw();
}

// This function is bound to changes in the font size drop down. It sets the value font size value of the current selected text object to the dropdown value and redraws the layer
function setFontSize() {
  selectedTextObject.fontSize($('#font-size-select').val());
  textLayer.draw();
}


// This function changes the visible text on the drop down button for changing text position. It then sets the input field to the tored value for the text object of the respective position
function setTextPosition(event) {

  $('#text-position').text(event.target.innerHTML.trim());
  $('#meme-text').val(textContentHolder[$('#text-position').text().toLowerCase()]);

}

function saveCanvas() {

  // -- Deselect any current selections so they don't reflect in the saved image
  tr.nodes([]);
  textLayer.draw();


  function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
  };
  let savedImage = stage.toDataURL({
    pixelRatio: 2
  });

  // -- Check if device is mobile. Direct image download is not supported on iOS (download works but file name and extension no supported. In mobile, append the canvas image to a modal popup so user can mannualy save to mobile device)
  if (isMobileDevice()) {
    let img = document.createElement('img');
    img.src = savedImage;
    img.id = 'stage-img';
    $('#save-image-spot').empty()
    $('#save-image-spot').append(img);
    $('#image-save-modal-button').click();
  }

  // -- If not on mobile device, download file automatically.
  else {
    let link = document.createElement('a');
    link.href = savedImage;
    link.download = 'image.png';
    link.click();
  }

}



// -- Bind event listeners to function buttons
$('#download-button').click(saveCanvas);
$('#square-crop').click(cropImageSquare);
$('#clear-button').click(clearArtboard);
$('#change-pic-button').click(replacePicture);
$('.position-selector-button').click(setTextPosition);
$('#meme-text').keyup(setText);
$('#font-family-select').change(setFontFamily);
$('#font-size-select').change(setFontSize);


// -- Hide upload area, reveal canvas and draw image
function imageInputFormSubmitted(event) {
  // -- Prevent default form submit action
  event.preventDefault();
  // -- Hide upload area and reveal image editor
  $('.upload-area').addClass('hidden');
  $('.editor').removeClass('hidden');
  drawImage();
}

$('#upload-form').submit(imageInputFormSubmitted);

// -- Attach drag event listeners to upload area
$('.upload-area').on('drag dragstart dragend dragover dragenter dragleave drop', function(event) {
  event.preventDefault();
  event.stopPropagation();
})
.on('dragenter dragover', highlightOnDragOver)
.on('dragend dragleave', restoreOnDragEnd)
.on('drop', imageDropped);
