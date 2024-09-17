import os
import json
from flask import Flask, request, render_template
import speech_recognition as sr
from notion_client import Client

app = Flask(__name__)

# Load configuration
def load_config():
    if os.path.exists('config.json'):
        with open('config.json', 'r') as f:
            return json.load(f)
    return {}

# Save configuration
def save_config(config):
    with open('config.json', 'w') as f:
        json.dump(config, f, indent=4)

config = load_config()

# Initialize Notion client
notion = Client(auth=config.get("notion_integration_token", "your_notion_integration_token"))

@app.route('/record', methods=['POST'])
def record_audio():
    recognizer = sr.Recognizer()
    # Ensure the uploads directory exists
    os.makedirs('uploads', exist_ok=True)

    with sr.Microphone() as source:
        print("Recording...")
        audio = recognizer.listen(source)
        print("Recording complete.")

    # Save the audio file
    audio_file_path = os.path.join('uploads', 'recording.wav')
    with open(audio_file_path, 'wb') as f:
        f.write(audio.get_wav_data())

    try:
        # Transcribe audio to text
        text = recognizer.recognize_google(audio)
        print(f"Transcription: {text}")

        # Create a new page in Notion
        notion.pages.create(
            parent={"database_id": "your_database_id"},
            properties={
                "title": {
                    "title": [
                        {
                            "text": {
                                "content": text
                            }
                        }
                    ]
                }
            }
        )
        # Save the transcription to config
        config['last_transcription'] = text
        save_config(config)

        return "Notion page created successfully and settings saved!", 200
    except Exception as e:
        return str(e), 400

@app.route('/')
def index():
    return render_template('index.html')
    
    app.run(host='0.0.0.0', port=80)
