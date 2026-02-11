// GBLGA Conference Story Generator
// All logic for canvas rendering, image upload, text update, export, and sharing

const canvas = document.getElementById('story-canvas');
const ctx = canvas.getContext('2d');
const profileUpload = document.getElementById('profile-upload');
const firstNameInput = document.getElementById('first-name');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');

// Crop modal elements
const cropModal = document.getElementById('crop-modal');
const cropImage = document.getElementById('crop-image');
const closeCropModalBtn = document.getElementById('close-crop-modal');
const cancelCropBtn = document.getElementById('cancel-crop');
const applyCropBtn = document.getElementById('apply-crop');
let cropper = null;

// Share modal elements
const shareModal = document.getElementById('share-modal');
const closeShareModalBtn = document.getElementById('close-share-modal');
const copyImageBtn = document.getElementById('copy-image');
const downloadImageBtn = document.getElementById('download-image');
let currentBlob = null;

// Welcome modal elements
const welcomeModal = document.getElementById('welcome-modal');
const closeWelcomeModalBtn = document.getElementById('close-welcome-modal');
const startBtn = document.getElementById('start-btn');

// Asset paths
const assets = {
  background: 'assets/background.png',
  logo: 'assets/gblga-logo.png',
  qr: 'assets/qr.png',
  linkedin: 'assets/linkedin.png',
  instagram: 'assets/instagram.png',
  sponsor1: 'assets/black-women-talk-tech.png',
  sponsor2: 'assets/nyblackmba.png',
  sponsor3: 'assets/fordham.png',
  sponsor4: 'assets/msaib.png',
};

// Default name
let firstName = 'Your Name';
let profileImage = null;
let profileImageObj = null;

// Placeholder profile settings
const placeholderColor = '#888';
const placeholderInitials = 'YN';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function renderCanvas() {
  // Load all static assets

  try {
    const assetNames = [
      'background',
      'logo',
      'qr',
      'linkedin',
      'instagram',
      'sponsor1',
      'sponsor2',
      'sponsor3',
      'sponsor4',
    ];
    const assetPromises = assetNames.map((name) =>
      loadImage(assets[name]).catch((err) => {
        console.error(`Failed to load asset: ${name} (${assets[name]})`, err);
        return null;
      }),
    );
    const [bg, logo, qr, linkedin, instagram, sponsor1, sponsor2, sponsor3, sponsor4] =
      await Promise.all(assetPromises);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (bg) ctx.drawImage(bg, 0, 0, 1080, 1920);

    // Sponsors section commented out
    /*
    ctx.save();
    ctx.fillStyle = 'rgba(242, 241, 236, 0.5)';
    ctx.filter = 'blur(2px)';
    ctx.beginPath();
    ctx.roundRect(191, 211, 702, 88, 88);
    ctx.fill();
    ctx.restore();

    if (sponsor1) ctx.drawImage(sponsor1, 223, 227, 103, 56);
    if (sponsor2) ctx.drawImage(sponsor2, 342, 227, 138, 56);
    if (sponsor3) ctx.drawImage(sponsor3, 496, 227, 190, 56);
    if (sponsor4) ctx.drawImage(sponsor4, 702, 227, 159, 56);
    */

    // Draw GBLGA logo (20% bigger: 310.18×83 → 372×100)
    if (logo) ctx.drawImage(logo, 354, 96, 372, 100);

    // Draw separator
    ctx.fillStyle = '#f2f1ec';
    ctx.fillRect(328, 1042, 424, 4);

    // Draw profile image in circular frame with border
    const profileX = 220;
    const profileY = 320;
    const profileSize = 640;
    const borderWidth = 4;
    const padding = 8;
    const totalSize = profileSize + padding * 2;
    const centerX = profileX + profileSize / 2;
    const centerY = profileY + profileSize / 2;
    const radius = profileSize / 2;

    ctx.save();

    // Draw border circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + padding + borderWidth / 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#F2F1EC';
    ctx.lineWidth = borderWidth;
    ctx.stroke();

    // Create circular clip
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (profileImageObj) {
      ctx.drawImage(profileImageObj, profileX, profileY, profileSize, profileSize);
    } else {
      // Draw placeholder
      ctx.fillStyle = placeholderColor;
      ctx.fillRect(profileX, profileY, profileSize, profileSize);
      ctx.fillStyle = '#fff';
      ctx.font = "200 120px 'Lato', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(placeholderInitials, centerX, centerY);
    }
    ctx.restore();

    // Draw event text (40px, weight 500, increased line height)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#F2F1EC';
    ctx.font = "600 40px 'Lato', 'Forum', sans-serif";
    const eventText = `Hi there, I'm ${firstName}, and I'll be attending the Gabelli Black and LatinX Graduate Association Conference on Feb 18th by 5:00 PM. Let's dive into strategy and tech together, scan the QR code below to grab your spot!`;
    wrapText(ctx, eventText, 540, 1124, 888, 56);

    // Draw QR code
    if (qr) ctx.drawImage(qr, 408, 1408, 264, 262);

    // Draw social media icons and org name
    if (linkedin) ctx.drawImage(linkedin, 220, 1755, 40, 40);
    if (instagram) ctx.drawImage(instagram, 278, 1755, 40, 40);
    ctx.font = "26px 'Lato', 'Forum', sans-serif";
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Gabelli Black and Latinx Graduate Association', 335, 1775);
    ctx.textBaseline = 'top';

    // Draw hashtags
    ctx.font = "24px 'Forum', 'Lato', sans-serif";
    ctx.fillStyle = '#f2f1ec';
    ctx.textAlign = 'center';
    ctx.fillText('#BlackandLatinX #AI #Strategy #Leadership #GBLGA', 540, 1824);
  } catch (err) {
    console.error('Error rendering canvas:', err);
  }
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}

profileUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    profileImage = evt.target.result;
    // Show crop modal
    cropImage.src = profileImage;
    cropModal.classList.add('active');

    // Initialize cropper after image loads
    cropImage.onload = function () {
      if (cropper) {
        cropper.destroy();
      }
      cropper = new Cropper(cropImage, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.8,
        responsive: false,
        guides: true,
        background: false,
        cropBoxResizable: true,
        cropBoxMovable: true,
        dragMode: 'move',
        restore: false,
        checkCrossOrigin: false,
        toggleDragModeOnDblclick: false,
      });
    };
  };
  reader.readAsDataURL(file);
});

// Close crop modal
function closeCropModal() {
  cropModal.classList.remove('active');
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  cropImage.src = '';
  profileUpload.value = '';
}

closeCropModalBtn.addEventListener('click', closeCropModal);
cancelCropBtn.addEventListener('click', closeCropModal);

// Apply crop
applyCropBtn.addEventListener('click', () => {
  if (!cropper) return;

  // Get cropped canvas
  const croppedCanvas = cropper.getCroppedCanvas({
    width: 640,
    height: 640,
    fillColor: '#fff',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });

  // Convert to image
  profileImageObj = new window.Image();
  profileImageObj.onload = function () {
    renderCanvas();
    closeCropModal();
  };
  profileImageObj.src = croppedCanvas.toDataURL('image/png');
});

// Close modal when clicking outside
cropModal.addEventListener('click', (e) => {
  if (e.target === cropModal) {
    closeCropModal();
  }
});

// Handle escape key to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cropModal.classList.contains('active')) {
    closeCropModal();
  }
});

firstNameInput.addEventListener('input', (e) => {
  firstName = e.target.value || 'Your Name';
  renderCanvas();
});

downloadBtn.addEventListener('click', () => {
  canvas.toBlob(function (blob) {
    const link = document.createElement('a');
    link.download = 'GBLGA-Conference-Story.png';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, 'image/png');
});

// Mobile detection
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Hide share button on desktop
if (!isMobile()) {
  shareBtn.style.display = 'none';
}

// Share modal functions
function openShareModal() {
  canvas.toBlob(function (blob) {
    currentBlob = blob;
    shareModal.classList.add('active');
    lucide.createIcons();
  }, 'image/png');
}

function closeShareModal() {
  shareModal.classList.remove('active');
  currentBlob = null;
}

// Copy image to clipboard
function copyImageToClipboard() {
  if (!currentBlob) return;

  if (navigator.clipboard && window.ClipboardItem) {
    navigator.clipboard
      .write([new ClipboardItem({ 'image/png': currentBlob })])
      .then(() => {
        alert('Image copied! Now open Instagram or WhatsApp and paste into your story.');
        closeShareModal();
      })
      .catch(() => {
        alert('Could not copy image. Try downloading instead.');
      });
  } else {
    alert('Copy not supported. Try downloading instead.');
  }
}

// Download image
function downloadImage() {
  if (!currentBlob) return;

  const link = document.createElement('a');
  link.download = 'GBLGA-Conference-Story.png';
  link.href = URL.createObjectURL(currentBlob);
  link.click();
  URL.revokeObjectURL(link.href);
  closeShareModal();
}

// Share button click (mobile only)
shareBtn.addEventListener('click', openShareModal);
closeShareModalBtn.addEventListener('click', closeShareModal);
copyImageBtn.addEventListener('click', copyImageToClipboard);
downloadImageBtn.addEventListener('click', downloadImage);

// Close share modal when clicking outside
shareModal.addEventListener('click', (e) => {
  if (e.target === shareModal) {
    closeShareModal();
  }
});

// Welcome modal functions
function openWelcomeModal() {
  // Show welcome modal on every page load/refresh
  welcomeModal.classList.add('active');
  lucide.createIcons();
}

function closeWelcomeModal() {
  welcomeModal.classList.remove('active');
}

// Welcome modal event listeners
closeWelcomeModalBtn.addEventListener('click', closeWelcomeModal);
startBtn.addEventListener('click', closeWelcomeModal);

// Close welcome modal when clicking outside
welcomeModal.addEventListener('click', (e) => {
  if (e.target === welcomeModal) {
    closeWelcomeModal();
  }
});

// Handle escape key to close welcome modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && welcomeModal.classList.contains('active')) {
    closeWelcomeModal();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  renderCanvas();
  openWelcomeModal();
});
