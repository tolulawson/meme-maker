$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

let $selectedImage;
let canvas = $('#canvas')[0];
let ctx = canvas.getContext('2d');
console.dir(ctx);

function assignSelectedFileFromInput (event) {
  $selectedImage = this.files[0];
  $('#upload-form').submit();
}

$('#upload-input').change(assignSelectedFileFromInput)

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
  if(!/^.+\.(jpg|png|jpeg|gif|bmp|tif|tiff)$/gi.test(event.originalEvent.dataTransfer.files[0].name)) {
    window.alert('Select a valid image file');
    restoreOnDragEnd();
  }

  //Assign dropped file to holding variable
  $selectedImage = event.originalEvent.dataTransfer.files[0];

  // -- Submit form which contains the file input;
  $('#upload-form').submit();
}

function imageInputFormSubmitted(event) {
  // -- Prevent default form submit action
  event.preventDefault();
  // -- Hide upload area and reveal image editor
  $('.upload-area').addClass('hidden');
  $('.editor').removeClass('hidden');
  console.log($selectedImage);
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
