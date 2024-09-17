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

    function startRecording() {
        console.log('Recording started');
        // Implement start recording logic
    }

    function startRecording() {
        console.log('Recording started');
        fetch('/record', { method: 'POST' })
            .then(response => response.text())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    }

    function pauseRecording() {
        console.log('Recording paused');
        // Implement pause recording logic
    }

    function stopRecording() {
        console.log('Recording stopped');
        // Implement stop recording logic
    }

    function saveSettings(event) {
        event.preventDefault();
        const notionToken = document.getElementById('notion-token').value;
        const databaseId = document.getElementById('database-id').value;
        console.log('Settings saved:', { notionToken, databaseId });
        // Implement settings save logic
    }
});
