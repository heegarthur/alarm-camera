const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const alarm = document.getElementById('alarm');
const startBtn = document.getElementById('startBtn');

let prevFrame = null;
let playing = false;

startBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        // wacht tot video een frame heeft
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            startBtn.style.display = 'none';
            checkMotion(); // start direct na klik én na videoload
        };
    } catch (err) {
        console.error("Camera access denied:", err);
        statusText.textContent = "Camera toegang geweigerd.";
    }
});

alarm.onended = () => {
    playing = false;
};

function checkMotion() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    let frame;
    try {
        frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
        console.warn("Canvas read blocked:", e);
        return setTimeout(checkMotion, 100); // probeer opnieuw later
    }

    if (prevFrame) {
        let diff = 0;
        for (let i = 0; i < frame.data.length; i += 4) {
            const gray1 = 0.2989 * frame.data[i] + 0.5870 * frame.data[i+1] + 0.1140 * frame.data[i+2];
            const gray2 = 0.2989 * prevFrame.data[i] + 0.5870 * prevFrame.data[i+1] + 0.1140 * prevFrame.data[i+2];
            const delta = Math.abs(gray1 - gray2);
            if (delta > 30) diff++;
        }

        console.log("Pixel diff:", diff);

        if (diff > 10000) {
            statusText.textContent = "Status: beweging gedetecteerd";
            if (!playing) {
                alarm.play().catch(err => console.warn("Alarm play blocked", err));
                playing = true;
            }
        } else {
            statusText.textContent = "Status: geen beweging";
        }
    }

    prevFrame = frame;
    requestAnimationFrame(checkMotion);
}
