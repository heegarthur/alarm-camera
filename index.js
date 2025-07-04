const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const alarm = document.getElementById('alarm');

let prevFrame = null;
let playing = false;

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        requestAnimationFrame(checkMotion);
    })
    .catch(err => {
        console.error("camera permission denied", err);
        statusText.textContent = "can't open camera.";
    });

alarm.onended = () => {
    playing = false;
};

function checkMotion() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (prevFrame) {
        let diff = 0;
        for (let i = 0; i < frame.data.length; i += 4) {
            const gray1 = 0.2989 * frame.data[i] + 0.5870 * frame.data[i + 1] + 0.1140 * frame.data[i + 2];
            const gray2 = 0.2989 * prevFrame.data[i] + 0.5870 * prevFrame.data[i + 1] + 0.1140 * prevFrame.data[i + 2];
            diff += Math.abs(gray1 - gray2);
        }
        if (diff > 700000) {
            statusText.textContent = "Status: movement detected";
            if (!playing) {
                alarm.play();
                playing = true;
            }
        } else {
            statusText.textContent = "Status: no movement detected";
        }
    }

    prevFrame = frame;
    requestAnimationFrame(checkMotion);
}
