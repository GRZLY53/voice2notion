from flask import Flask, request, render_template
import speech_recognition as sr
from notion_client import Client

app = Flask(__name__)

# Initialize Notion client
notion = Client(auth="your_notion_integration_token")

@app.route('/record', methods=['POST'])
def record_audio():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Recording...")
        audio = recognizer.listen(source)
        print("Recording complete.")

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
        return "Notion page created successfully!", 200
    except Exception as e:
        return str(e), 400

@app.route('/')
def index():
    return render_template('index.html')
    app.run(host='0.0.0.0', port=80)
