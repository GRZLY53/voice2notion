import os
import json
import time
from datetime import datetime
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

    if request.method == 'POST':
        with sr.Microphone() as source:
            print("Recording...")
            audio = recognizer.listen(source)
            print("Recording complete.")

    # Save the audio file with metadata
    audio_file_name = f"recording_{int(time.time())}.mp3"
    audio_file_path = os.path.join('uploads', audio_file_name)
    with open(audio_file_path, 'wb') as f:
        f.write(audio.get_wav_data())

    # Save metadata
    metadata = {
        "filename": audio_file_name,
        "date": datetime.now().isoformat(),
        "duration": len(audio.get_wav_data()) / 16000,  # Assuming 16kHz sample rate
        "user_id": "default_user"  # Placeholder for user ID
    }
    with open(os.path.join('uploads', f"{audio_file_name}.json"), 'w') as f:
        json.dump(metadata, f, indent=4)

    try:
        # Transcribe audio to text
        text = recognizer.recognize_google(audio)
        print(f"Transcription: {text}")

        # Create a new page in Notion with metadata
        notion.pages.create(
            parent={"database_id": config.get("notion_database_id", "your_database_id")},
            properties={
                "Title": {
                    "title": [
                        {
                            "text": {
                                "content": metadata["filename"]
                            }
                        }
                    ]
                },
                "Date": {
                    "date": {
                        "start": metadata["date"]
                    }
                },
                "Transcription": {
                    "rich_text": [
                        {
                            "text": {
                                "content": text
                            }
                        }
                    ]
                },
                "Audio Link": {
                    "url": f"/uploads/{metadata['filename']}"
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
