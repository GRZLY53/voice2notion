# Use an official Node.js runtime as a parent image
FROM node:14-slim

# Install Python for API interactions
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Copy package.json and install Node.js dependencies
COPY package.json /app/
RUN npm install

# Install Python dependencies
COPY requirements.txt /app/
RUN pip3 install --no-cache-dir -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# Set environment variables for API keys
ENV NOTION_API_KEY=your_notion_api_key
ENV GOOGLE_SPEECH_API_KEY=your_google_api_key

# Run the application
CMD ["npm", "start"]
