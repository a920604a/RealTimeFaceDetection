function loadBackGround(input) {
    const file = input.files[0]; // 使得使用者選擇的檔案
    // 把檔案物件變成圖片物件
    background.src = URL.createObjectURL(file); // 產生一個隨機的網址，對應到檔案物件
    background.addEventListener("load", () => {
        ctx.canvas.width = background.width;
        ctx.canvas.height = background.height;
    });

}

async function init_model() {
    // 載入模型
    // Load the model.
    model = await blazeface.load();

}


function init_video() {
    // 偵測到資料才開始做人臉辨識
    video.addEventListener("loadeddata", () => {
        window.setInterval(realTimeFaceRecogntion, 10);  // 每0.01秒 執行ㄧ次 realTimeFaceRecogntion
    });
    // 取得使用者攝影機影像或聲音
    window.navigator.mediaDevices.getUserMedia({
        audio: false, video: true
    }).then((stream) => {
        video.srcObject = stream;
        video.play();

    });
}

function loadFile(input) {
    const file = input.files[0]; // 使得使用者選擇的檔案
    // 把檔案物件變成圖片物件
    const img = new Image();
    img.src = URL.createObjectURL(file); // 產生一個隨機的網址，對應到檔案物件
    img.addEventListener("load", () => {
        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        detect(img);
    });

}

async function detect(img) {

    // 利用模型對 圖片 做 臉部辨識
    // Pass in an image or video to the model. The model returns an array of
    // bounding boxes, probabilities, and landmarks, one for each detected face.

    const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
    // estimateFaces(圖片物件/影片物件/Canvas物件)
    // const predictions = await model.estimateFaces(document.querySelector("img"), returnTensors);
    const predictions = await model.estimateFaces(img, returnTensors);

    if (predictions.length > 0) {
        // 圖片中有臉存在

        // 一張圖片可能不只一張臉
        for (let i = 0; i < predictions.length; i++) {
            /*
            `predictions` is an array of objects describing each detected face, for example:
        
            [
            {
                topLeft: [232.28, 145.26],
                bottomRight: [449.75, 308.36],
                probability: [0.998],
                landmarks: [
                [295.13, 177.64], // right eye
                [382.32, 175.56], // left eye
                [341.18, 205.03], // nose
                [345.12, 250.61], // mouth
                [252.76, 211.37], // right ear
                [431.20, 204.93] // left ear
                ]
            }
            ]
            */
            const rightEye = predictions[i].landmarks[0];
            const leftEye = predictions[i].landmarks[1];
            const start = predictions[i].topLeft;
            const end = predictions[i].bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];
            // 把臉部區塊畫出來
            const faceArea = new Path2D();
            // 橢圓
            faceArea.ellipse(
                (leftEye[0] + rightEye[0]) / 2, (leftEye[1] + rightEye[1]) / 2,
                size[0] * 0.6, size[1] * 0.8,
                0, 0, 2 * Math.PI
            );
            // faceArea.rect(start[0], start[1], size[0], size[1]);
            // 只把圖片畫在上面定義的路徑
            ctx.save();
            ctx.clip(faceArea);
            ctx.drawImage(img, 0, 0);
            ctx.restore();
        }
    }
    // 補上模糊的背景
    ctx.save();
    ctx.filter = "blur(20px)";
    ctx.globalCompositeOperation = "destination-atop";
    ctx.drawImage(img, 0, 0);
    ctx.restore();
}

async function realTimeFaceRecogntion() {

    // 利用模型對 圖片 做 臉部辨識
    // Pass in an image or video to the model. The model returns an array of
    // bounding boxes, probabilities, and landmarks, one for each detected face.

    const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
    // estimateFaces(圖片物件/影片物件/Canvas物件)
    // const predictions = await model.estimateFaces(document.querySelector("img"), returnTensors);
    const predictions = await model.estimateFaces(video, returnTensors);
    ctx.canvas.width = video.videoWidth;
    ctx.canvas.height = video.videoHeight;
    
    if (predictions.length > 0) {
        // 圖片中有臉存在
        // 一張圖片可能不只一張臉
        for (let i = 0; i < predictions.length; i++) {
            /*
            `predictions` is an array of objects describing each detected face, for example:
        
            [
            {
                topLeft: [232.28, 145.26],
                bottomRight: [449.75, 308.36],
                probability: [0.998],
                landmarks: [
                [295.13, 177.64], // right eye
                [382.32, 175.56], // left eye
                [341.18, 205.03], // nose
                [345.12, 250.61], // mouth
                [252.76, 211.37], // right ear
                [431.20, 204.93] // left ear
                ]
            }
            ]
            */
            const rightEye = predictions[i].landmarks[0];
            const leftEye = predictions[i].landmarks[1];
            const start = predictions[i].topLeft;
            const end = predictions[i].bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];
            
            // 把臉部區塊畫出來
            const faceArea = new Path2D();
            // 橢圓
            faceArea.ellipse(
                (leftEye[0] + rightEye[0]) / 2, (leftEye[1] + rightEye[1]) / 2,
                size[0] * 0.5, size[0] * 0.8,
                0, 0, 2 * Math.PI
            );
            faceArea.rect(start[0], start[1], size[0], size[1]);
            // 只把圖片畫在上面定義的路徑
            ctx.save();
            ctx.clip(faceArea);
            ctx.drawImage(video, 0, 0);
            ctx.restore();
        }
    }
    // 補上模糊的背景
    ctx.save();
    ctx.filter = "blur(5px)";
    ctx.globalCompositeOperation = "destination-atop";
    ctx.drawImage(background, 0, 0, video.videoWidth, video.videoHeight);
    ctx.restore();
}
