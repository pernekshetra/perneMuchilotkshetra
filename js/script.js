/**
 * Profile Picture Generator
 */

// Get references to HTML elements
const imageInput = document.getElementById('imageInput');
const uploadContainer = document.getElementById('uploadElements');
const resultContainer = document.getElementById('resultContainer');
const resultImage = document.getElementById('resultImage');
const downloadButton = document.getElementById('downloadButton');
const profileCanvas = document.getElementById('profileCanvas');

const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');
const panLeftButton = document.getElementById('panLeftButton');
const panRightButton = document.getElementById('panRightButton');
const panUpButton = document.getElementById('panUpButton');
const panDownButton = document.getElementById('panDownButton');

const context = profileCanvas.getContext('2d');

let zoomLevel = 1;
let panX = 0;
let panY = 0;

zoomInButton.addEventListener('click', () => zoom(1.05));
zoomOutButton.addEventListener('click', () => zoom(0.95));
panLeftButton.addEventListener('click', () => pan(-10, 0));
panRightButton.addEventListener('click', () => pan(10, 0));
panUpButton.addEventListener('click', () => pan(0, -10));
panDownButton.addEventListener('click', () => pan(0, 10));

// Mouse and Touch Events for Panning
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;

profileCanvas.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
profileCanvas.addEventListener('mousemove', (e) => dragImage(e.clientX, e.clientY));
profileCanvas.addEventListener('mouseup', endDrag);
profileCanvas.addEventListener('mouseleave', endDrag);

profileCanvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  }
});
profileCanvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1) {
    dragImage(e.touches[0].clientX, e.touches[0].clientY);
  }
});
profileCanvas.addEventListener('touchend', endDrag);

function zoom(factor) {
  zoomLevel *= factor;
  zoomLevel = Math.max(0.5, Math.min(zoomLevel, 2));
  updateCanvas();
}

function pan(dx, dy) {
  panX += dx;
  panY += dy;
  updateCanvas();
}

function startDrag(x, y) {
  isDragging = true;
  dragStartX = x;
  dragStartY = y;
}

function dragImage(x, y) {
  if (isDragging) {
    panX += x - dragStartX;
    panY += y - dragStartY;
    dragStartX = x;
    dragStartY = y;
    updateCanvas();
  }
}

function endDrag() {
  isDragging = false;
}

function updateCanvas() {
  if (imageInput.files && imageInput.files.length > 0) {
    generateProfilePic();
  }
}

imageInput.addEventListener('change', function() {
  generateProfilePic();
  setTimeout(() => uploadContainer.style.display = "none", 300);
});

/* This function is to debug the issue of canvas not working, need this to be
 * deployed to test it on live site since this bug does not happen on local */
function isCanvasEmpty(canvas) {
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data; // Pixel data array

  // Iterate through the pixel data array
  for (let i = 0; i < data.length; i += 4) {
    // Check if any non-transparent pixels are present
    if (data[i + 3] !== 0) { // Check alpha channel (transparency)
      return false; // Canvas is not empty
    }
  }
  return true; // Canvas is empty
}

function generateProfilePic() {
  /* This will need to be manually changed if we need to use for another event */
  const selectedOverlay = "../../Resource/kaliyata/overlay1.png";

  if (!imageInput.files || imageInput.files.length === 0) {
    alert('Please select your photo before generating a profile photo.');
    return;
  }

  const overlayImage = new Image();
  overlayImage.src = selectedOverlay;

  const reader = new FileReader();
  reader.onload = function(event) {
    const userImage = new Image();
    userImage.src = event.target.result;

    userImage.onload = function() {
      profileCanvas.width = overlayImage.width;
      profileCanvas.height = overlayImage.height;

      const aspectRatio = userImage.width / userImage.height;
      let userWidth, userHeight, userX, userY;

      // Ensure the user image covers the circle in the overlay
      let circleDiameter = Math.min(overlayImage.width, overlayImage.height); // Assuming circle diameter is the smaller dimension of the overlay
      if (aspectRatio >= 1) { // Wide or square image
        userHeight = circleDiameter;
        userWidth = userHeight * aspectRatio;
      } else { // Tall image
        userWidth = circleDiameter;
        userHeight = userWidth / aspectRatio;
      }

      // Centering the image within the canvas
      userX = (overlayImage.width - userWidth) / 2;
      userY = (overlayImage.height - userHeight) / 2;

      context.clearRect(0, 0, profileCanvas.width, profileCanvas.height);
      context.drawImage(
        userImage,
        userX + panX,
        userY + panY,
        userWidth * zoomLevel,
        userHeight * zoomLevel
      );
      context.drawImage(overlayImage, 0, 0, overlayImage.width, overlayImage.height);

      if(isCanvasEmpty(profileCanvas)) {
        alert("There was some error with the image, try again");
        return;
      }

      resultImage.src = profileCanvas.toDataURL('image/png');
      resultContainer.style.display = 'block';
      downloadButton.href = profileCanvas.toDataURL('image/png');
    };
  };
  reader.readAsDataURL(imageInput.files[0]);
}
