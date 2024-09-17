document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const recordingsList = document.getElementById('recordings-list');
    const settingsForm = document.getElementById('settings-form');

    startBtn.addEventListener('click', startRecording);
    pauseBtn.addEventListener('click', pauseRecording);
    stopBtn.addEventListener('click', stopRecording);
    settingsForm.addEventListener('submit', saveSettings);

    let recorder;
    let stream;
    let audioContext;
    let analyser;
    let dataArray;
    let bufferLength;
    let animationId;

    async function startRecording() {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 2048;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        recorder = RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: StereoAudioRecorder,
            desiredSampRate: 16000
        });
        recorder.startRecording();
        console.log('Recording started');
        drawWaveform();
    }

    function drawWaveform() {
        const canvas = document.getElementById('waveform');
        const canvasCtx = canvas.getContext('2d');

        function draw() {
            animationId = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        }

        draw();
    }

    function pauseRecording() {
        if (recorder) {
            recorder.pauseRecording();
            console.log('Recording paused');
        }
    }

    function stopRecording() {
        if (recorder) {
            recorder.stopRecording(() => {
                let blob = recorder.getBlob();
                invokeSaveAsDialog(blob);
                stream.getTracks().forEach(track => track.stop());
                console.log('Recording stopped');
            });
        }
    }

    function saveSettings(event) {
        event.preventDefault();
        const notionToken = document.getElementById('notion-token').value;
        const databaseId = document.getElementById('database-id').value;
        console.log('Settings saved:', { notionToken, databaseId });
        // Implement settings save logic
    }
});
