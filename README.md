# react-social-media-backend

## Backend Setup and Initialization
This guide will help you set up and start the backend for your project. The backend is built using Node.js and MongoDB, and it requires some initial configuration.

## Prerequisites
Before you begin, make sure you have Node.js and npm (Node Package Manager) installed on your system. You can download them from nodejs.org.

## Installation
1. Open your terminal or command prompt.
2. Navigate to the backend directory of your project: cd path/to/your/backend
3. Install the required dependencies by running: npm install

## Configuration
1. Create a .env file in the backend directory.
2. Inside the .env file, add the following lines and replace placeholders with your actual values:
   PORT = 4000
  NODE_ENV = development
  
  ### MongoDb
  MONGO_URI = your_mongodb_uri_here
  
  ### Token
  JWT_SECRET_KEY = your_jwt_secret_key
  JWT_EXPIRE = 10d
  
  JWT_REFRESH_SECRET_KEY = your_jwt_refresh_secret_key
  JWT_REFRESH_EXPIRE = 1d
  
  ### Cookie
  JWT_COOKIE = 1000000
  
  ### Temp Token Expiry
  TEMP_TOKEN_EXPIRE = 36000000

## Starting the Backend
To start the backend server, follow these steps:

1. In your terminal, navigate to the backend directory.

2. Run the following command: npm run dev

This will start the backend server in development mode.

Congratulations! You've successfully set up and started the backend for your project. 
Feel free to customize the configuration and build upon this foundation to create your desired application.
