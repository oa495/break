const MODEL_URL = '/models'
window.onload = start();

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


async function start() {
  await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
  await faceapi.loadFaceLandmarkModel(MODEL_URL);
  await faceapi.loadFaceRecognitionModel(MODEL_URL);
  await faceapi.loadFaceExpressionModel(MODEL_URL);

  function midpoint(x1, y1, x2, y2) {
    return [(x1 + x2) / 2, (y1 + y2) / 2];
  }

  function download(el) {
    const imgToDownload = canvas.toDataURL("image/jpg");
    el.href = imgToDownload;
  }

  const fileinput = document.getElementById('fileinput');
  const downloadLink = document.getElementById('download');
  downloadLink.addEventListener('click', download);

  async function loadFile(event) {
    const img = document.getElementById('uploaded');
	  img.src = URL.createObjectURL(event.target.files[0]);

    let faceDescriptions = await faceapi.detectAllFaces(img);
    const canvas = document.getElementById('overlay');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');

    faceapi.matchDimensions(canvas, img);
    faceDescriptions = faceapi.resizeResults(faceDescriptions, img);

    const points = [];
    faceDescriptions.forEach(d => {
      points.push(new Point(d.box.x, d.box.y));
    });

    const closestPoints = getClosest(points);
    const mid = midpoint(closestPoints.pair[0].x,  closestPoints.pair[0].y, closestPoints.pair[1].x, closestPoints.pair[1].y);

    async function drawTear(e) {
      debugger;
      let url;
      if (e) {
        url = `/${e.target.getAttribute('id')}.png`;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const tear = new Image();
      tear.src = url || '/tear.png';
      await tear.decode();

      const tearWidth = canvas.height * 223 / 1702;
      ctx.drawImage(tear, mid[0], 0, tearWidth, canvas.height);
    }

    Array.from(document.getElementsByClassName('tear')).forEach(function(element) {
      element.addEventListener('click', drawTear);
    });

    drawTear();
  }

  fileinput.addEventListener('change', loadFile);
}
