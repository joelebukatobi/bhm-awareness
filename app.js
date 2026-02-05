// GBLGA Conference Story Generator
// All logic for canvas rendering, image upload, text update, export, and sharing

const canvas = document.getElementById('story-canvas');
const ctx = canvas.getContext('2d');
const profileUpload = document.getElementById('profile-upload');
const firstNameInput = document.getElementById('first-name');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');

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

    // Draw sponsors container background
    ctx.save();
    ctx.fillStyle = 'rgba(242, 241, 236, 0.5)';
    ctx.filter = 'blur(2px)';
    ctx.beginPath();
    ctx.roundRect(191, 211, 702, 88, 88);
    ctx.fill();
    ctx.restore();

    // Draw header logos (positions from Figma)
    if (sponsor1) ctx.drawImage(sponsor1, 223, 227, 103, 56);
    if (sponsor2) ctx.drawImage(sponsor2, 342, 227, 138, 56);
    if (sponsor3) ctx.drawImage(sponsor3, 496, 227, 190, 56);
    if (sponsor4) ctx.drawImage(sponsor4, 702, 227, 159, 56);

    // Draw GBLGA logo
    if (logo) ctx.drawImage(logo, 385, 96, 310.18, 83);

    // Draw separator
    ctx.fillStyle = '#f2f1ec';
    ctx.fillRect(328, 1042, 424, 4);

    // Draw profile image in circular frame
    const profileX = 220;
    const profileY = 346;
    const profileSize = 640;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(profileX, profileY, profileSize, profileSize, 240);
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
      ctx.fillText(placeholderInitials, profileX + profileSize / 2, profileY + profileSize / 2);
    }
    ctx.restore();

    // Draw event text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#F2F1EC';
    ctx.font = "300 32px 'Lato', 'Forum', sans-serif";
    const eventText = `Hello there! My name is ${firstName} and I'm looking forward to attending the Gabelli Black and Latinx Graduate Association's upcoming conference on the 18th of February, 2026 by 5:00 PM. I'm particularly excited to dive into the discussion on how strategy, technology, and community intersect to drive purposeful leadership. Scan the QR Code to join me.`;
    wrapText(ctx, eventText, 540, 1124, 888, 40);

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
    profileImageObj = new window.Image();
    profileImageObj.onload = renderCanvas;
    profileImageObj.src = profileImage;
  };
  reader.readAsDataURL(file);
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

shareBtn.addEventListener('click', () => {
  canvas.toBlob(function (blob) {
    const file = new File([blob], 'GBLGA-Conference-Story.png', { type: 'image/png' });
    
    // Try native sharing first (mobile)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: 'GBLGA Conference Story',
        text: 'Share your personalized conference flyer!',
      });
    } else {
      // Fallback for desktop: copy to clipboard
      if (navigator.clipboard && window.ClipboardItem) {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]).then(() => {
          alert('Image copied to clipboard! You can now paste it anywhere.');
        }).catch(() => {
          // If clipboard fails, trigger download
          const link = document.createElement('a');
          link.download = 'GBLGA-Conference-Story.png';
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        });
      } else {
        // Final fallback: download
        const link = document.createElement('a');
        link.download = 'GBLGA-Conference-Story.png';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }
    }
  }, 'image/png');
});

window.addEventListener('DOMContentLoaded', renderCanvas);
