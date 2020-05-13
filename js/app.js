$('#clear-button').on('shown.bs.modal', function () {
  $('#clear-button').trigger('focus')
});

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

//Global variable declarations


let $selectedImage;
// let canvas = $('#canvas')[0];
//
// // canvas.width = 1000; //set canvas width to 2x max-width. This make image resolution look good on hig resolution screens
//
// let ctx = canvas.getContext('2d');
let img = document.createElement('img');

let currentRotationDegree = 0;
let textPosition = 0;


function assignSelectedFileFromInput (event) {
  $selectedImage = this.files[0];
  img.src = URL.createObjectURL($selectedImage);
  img.id = 'canvas-img';
  $('#upload-form').submit();
}

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

// function drawImage() {
//   img.onload = function() {
//     canvas.height = img.naturalHeight * canvas.width / img.naturalWidth; // -- Set canvas height based on aspect ratio of selected image. Canvas width is constant.
//
//     $('#canvas').height(img.naturalHeight / img.naturalWidth * $('#canvas').width());
//     ctx.drawImage(img,0,0,canvas.width,canvas.height); // -- Set canvas apparent height to match aspect ratio of image selected. This is important when this function is called after a crop had be previously applied.
//
//     $('#square-crop').removeClass('active');
//   }
//
// }

// -- Download canvas image to file


function rotateCanvas() {

  function calcTranslate(deg) {
    if (deg === 0) {
      return [-canvas.width, 0, canvas.width, canvas.height];
    }

    if (deg === -90) {
      return [0, canvas.height, canvas.height, canvas.width];
    }

    if (deg === -180) {
      return [0, 0, canvas.width, canvas.height];
    }

    if (deg === -270) {
      return [0, -canvas.height, canvas.height, canvas.width];
    }
  }

  function storeCurrentRotationDegree() {
    if (currentRotationDegree === -270) {
      currentRotationDegree = 0;
    }

    else {
      currentRotationDegree -= 90;
    }
  }

  ctx.clearRect(0,0,canvas.width, canvas.height);
  $('#canvas').height($('#canvas').width()*$('#canvas').width()/$('#canvas').height());
  ctx.save();
  storeCurrentRotationDegree();

  ctx.translate(calcTranslate(currentRotationDegree)[0], calcTranslate(currentRotationDegree)[1]);

  ctx.restore();
  // ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(-90 * Math.PI/180);

  ctx.drawImage(img,0,0,calcTranslate(currentRotationDegree)[2],calcTranslate(currentRotationDegree)[3]);

  ctx.translate(-calcTranslate(currentRotationDegree)[0], -calcTranslate(currentRotationDegree)[1]);
}

// -- Crop image to square


// -- !! Not working properly, refactor later.
// -- Crop to 2:3 aspect ratio
function cropImageTwobyThree() {
  if (canvas.height > canvas.width) {
    let offset = canvas.height - canvas.width;
    let multiple = canvas.height*3 / canvas.width/2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    $('#canvas').height($('#canvas').width()/2*3);
    canvas.height = canvas.width/2*3;
    ctx.drawImage(img,0,-offset/2,canvas.width,canvas.height);
  }
}

// -- Clear canvas, hide editor and restore upload nutton


function setTextBottom() {
  textPosition = 1;
  $('#text-position').text('Bottom');
}

function drawText() {
  ctx.font = '48px serif';
  ctx.fillText($('#meme-text').val(), 10, 10);

}




/// <<<--- Begin Code Refactor Using Knova Library --->>>

let stage = new Konva.Stage({
  container: 'stage',
  width: 500,
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
  x: 0,
  y: 50,
  fontSize: 60,
  fontFamily: 'Impact',
  fontStyle: 'bold',
  fill: 'white',
  align: 'center',
  stroke: 'black',
  strokeWidth: 1,
  width: stage.width(),
  height: 400,
  draggable: true

});

textLayer.add(topText);

let bottomText = new Konva.Text({
  x: $('#stage').width()/2,
  y: stage.height()-150
})

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

    $('#square-crop').removeClass('active');
  }

}

function replacePicture() {
  topText.x(0);
  topText.y(50);
  $('#upload-input')[0].value = '';
  $('#upload-input').click();

}

function clearArtboard() {
  stage.clear();
  $('#upload-input')[1].value = '';
  $('.editor').addClass('hidden');
  $('#upload-form').removeClass('hidden');
}

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



    $('#square-crop').toggleClass('active');
}

function setTopText() {
  topText.text($('#meme-text').val());
  textLayer.batchDraw();
}

function saveCanvas() {

  function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
  };
  let savedImage = stage.toDataURL({
    pixelRatio: 2
  });
  if (isMobileDevice()) {

  }

  let link = document.createElement('a');
  link.href = savedImage;
  link.download = 'image.png';
  link.click();

}



// -- Bind event listeners to function buttons
$('#download-button').click(saveCanvas);
$('#rotate-button').click(rotateCanvas);
$('#square-crop').click(cropImageSquare);
$('#clear-button').click(clearArtboard);
$('#change-pic-button').click(replacePicture);
$('#top-text-button').click(setTopText);
$('#bottom-text-button').click(setTextBottom);
$('#meme-text').keyup(setTopText);
// $('#two-by-three-button').click(cropImageTwobyThree);


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
