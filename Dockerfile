# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app

# Make port 80 available to the world outside this container
EXPOSE 80

# Set environment variables for API keys
ENV NOTION_API_KEY=your_notion_api_key
ENV GOOGLE_SPEECH_API_KEY=your_google_api_key

# Run the application
CMD ["python", "app.py"]
