const MODEL_URL = 'https://gitcdn.xyz/repo/justadudewhohacks/face-api.js/master/weights';

window.onload = start;

let canvas, ctx, mid;


const Point = function(x, y) {
	this.x = x;
	this.y = y;
};
Point.prototype.getX = function() {
	return this.x;
};
Point.prototype.getY = function() {
	return this.y;
};

const IMG_TO_URL = {
  'tear': 'https://cdn.glitch.me/ef88e080-67af-4955-ac6a-d5fdc8a1866e%2Ftear.png?v=1638546626364',
  'tear2': 'https://cdn.glitch.me/ef88e080-67af-4955-ac6a-d5fdc8a1866e%2Ftear2.png?v=1638546629209',
  'bolt': 'https://cdn.glitch.me/ef88e080-67af-4955-ac6a-d5fdc8a1866e%2FYellow-Thunderbolt-Transparent%20(2).png?v=1638981087260'
}

async function start() {
  const loading = document.getElementById('loading');
  loading.classList.toggle('hidden');
  
  await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
  await faceapi.loadFaceLandmarkModel(MODEL_URL);
  
  const fileinput = document.getElementById('fileinput');
  loading.classList.toggle('hidden');
  fileinput.removeAttribute('disabled');

  canvas = document.getElementById('overlay');
  ctx = canvas.getContext('2d');
  
  function midpoint(x1, y1, x2, y2) {
    return [(x1 + x2) / 2, (y1 + y2) / 2];
  }

  function download(e) {
    e.target.download = "the-end.png";
    
    let imgToDownload;
    try {
      imgToDownload = document.getElementById('overlay').toDataURL();
    } catch(e) {
      console.log(e);
    } finally {
      e.target.href = imgToDownload;
    }
  }

  async function loadFile(event) {
    const img = document.getElementById('uploaded');
	  img.src = URL.createObjectURL(event.target.files[0]);
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    img.onload = async function() {

      let faceDescriptions = await faceapi.detectAllFaces(img);
      img.crossOrigin = "Anonymous";

      faceapi.matchDimensions(canvas, img);
      faceDescriptions = faceapi.resizeResults(faceDescriptions, img);

      const points = [];
      faceDescriptions.forEach(d => {
        points.push(new Point(d.box.x, d.box.y));
      });

      const closestPoints = getClosest(points);
      mid = midpoint(closestPoints.pair[0].x,  closestPoints.pair[0].y, closestPoints.pair[1].x, closestPoints.pair[1].y);
      
      drawTear();
    }

    async function drawTear(e) {
      let url;
      if (e) {
        url = IMG_TO_URL[e.target.getAttribute('id')];
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const tear = new Image();
      tear.crossOrigin = "Anonymous";
      tear.src = url || 'https://cdn.glitch.me/ef88e080-67af-4955-ac6a-d5fdc8a1866e%2Ftear.png?v=1638546626364';
      await tear.decode();

      const tearWidth = canvas.height * 223 / 1702;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(tear, mid[0], 0, tearWidth, canvas.height);
      document.getElementById('download').classList.remove('hidden');
    }

    Array.from(document.getElementsByClassName('tear')).forEach(function(element) {
      element.addEventListener('click', drawTear);
    });
  }
  

  const downloadLink = document.getElementById('download');
  downloadLink.addEventListener('click', download);
  fileinput.addEventListener('change', loadFile);
}
