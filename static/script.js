document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const recordingsList = document.getElementById('recordings-list');
    const transcriptionField = document.getElementById('transcription-field');
    const settingsForm = document.getElementById('settings-form');
    const audioInputsSelect = document.getElementById('audio-inputs');
    const sensitivitySlider = document.getElementById('sensitivity-slider');

    // Get available audio input devices
    navigator.mediaDevices.enumerateDevices().then(devices => {
        devices.forEach(device => {
            if (device.kind === 'audioinput') {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Microphone ${audioInputsSelect.length + 1}`;
                audioInputsSelect.appendChild(option);
            }
        });
    });

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
        const gainNode = audioContext.createGain();
        gainNode.gain.value = sensitivitySlider.value / 50; // Default to 1.0
        sensitivitySlider.addEventListener('input', () => {
            gainNode.gain.value = sensitivitySlider.value / 50;
        });
        source.connect(gainNode);
        gainNode.connect(analyser);
        // gainNode.connect(audioContext.destination); // Remove this line to prevent audio playback
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
        startTranscription();
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

            // Calculate the average volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Display the volume level
            const volumeLevel = document.getElementById('volume-level');
            volumeLevel.textContent = `Volume: ${Math.round(average)}`;
        }

        draw();
    }

    function startTranscription() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Web Speech API is not supported by this browser. Upgrade to Chrome version 25 or later.');
        } else {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = true;
            recognition.interimResults = true;
            let lastFinalTranscript = '';
            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                if (finalTranscript !== lastFinalTranscript) {
                    transcriptionField.value += finalTranscript + ' ';
                    lastFinalTranscript = finalTranscript;
                }
                transcriptionField.value = transcriptionField.value.trim() + ' ' + interimTranscript;
            };
            recognition.start();
        }
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

                // Display transcription status
                const statusElement = document.createElement('li');
                statusElement.textContent = 'Transcription in progress...';
                recordingsList.appendChild(statusElement);

                // Simulate server request for transcription
                setTimeout(() => {
                    statusElement.textContent = 'Transcription completed!';
                }, 5000); // Simulate delay
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
