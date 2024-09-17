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

    async function startRecording() {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder = RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: StereoAudioRecorder,
            desiredSampRate: 16000
        });
        recorder.startRecording();
        console.log('Recording started');
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
