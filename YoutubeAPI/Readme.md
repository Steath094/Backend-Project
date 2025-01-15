
# Video Hosting Website Backend

## Overview

The **Video Hosting Website Backend** is a complete backend solution built from scratch for a video hosting platform, similar to YouTube. It includes features like user authentication, video uploads, likes, dislikes, comments, subscriptions, playlists, and much more.

This backend is built using **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, **JWT**, and **bcrypt**, following industry-standard practices for secure authentication and efficient data management. The project also utilizes **Multer** for handling file uploads on the server and **Cloudinary** for storing images and videos.

## Features

- **User Authentication**: 
  - Sign-up and login using **JWT** and **bcrypt** for password hashing.
  - **Access Tokens** and **Refresh Tokens** for secure sessions.
  
- **Video Management**:
  - Upload videos with associated metadata like title, description, and thumbnail.
  - Fetch video details, update, or delete videos.
  - Toggle video publish status.
  
- **User Interaction**:
  - Like and dislike videos.
  - Post, edit, and delete comments.
  - Reply to comments.
  
- **Subscription System**:
  - Subscribe and unsubscribe to channels.
  - View channel subscribers and subscriptions.
  
- **Playlist Management**:
  - Create, update, delete playlists.
  - Add/remove videos to/from playlists.
  
- **Secure Practices**:
  - JWT-based authentication for secure API access.
  - Use of **bcrypt** for password encryption.

- **File Upload and Storage**:
  - **Multer** is used to handle file uploads on the server, including videos and images (thumbnails, avatars, cover images).
  - **Cloudinary** is integrated to store images and videos in the cloud, providing scalability and easier management.

## Technologies Used

- **Node.js**: Backend runtime environment.
- **Express.js**: Web framework to handle routing and middleware.
- **MongoDB**: NoSQL database for storing videos, users, comments, etc.
- **Mongoose**: ODM to interact with MongoDB.
- **JWT**: Secure user authentication and session management.
- **bcrypt**: Password hashing for security.
- **Multer**: Middleware for handling file uploads on the server.
- **Cloudinary**: Cloud service for storing images and videos.

## Getting Started

### Prerequisites

- **Node.js** (version >= 14.0.0)
- **npm** (version >= 6.0.0)
- **MongoDB**: Either local MongoDB or MongoDB Atlas.
- **Cloudinary Account**: You need a Cloudinary account for storing media files. Make sure to set up the account and get the **Cloudinary credentials**.

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Steath094/Backend-Project.git
    cd Backend-Project/YoutubeAPI
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables in a `.env` file:

    ```bash
    PORT=8000
    CORS_ORIGIN=<set-CORS>
    ACCESS_TOKEN_SECRET=<your-jwt-secret>
    ACCESS_TOKEN_EXPIRY=<your-choice>
    REFRESH_TOKEN_SECRET=<your-refresh-jwt-secret>
    REFRESH_TOKEN_EXPIRY=<your-choice>
    MONGODB_URI=<your-mongodb-uri>
    CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
    CLOUDINARY_API_KEY=<your-cloudinary-api-key>
    CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
    ```

4. Start the server:

    ```bash
    npm start
    ```

    The backend will be available at `http://localhost:8000`.

## API Endpoints

### /videos

- **GET /api/v1/videos**: Get all videos.
- **POST /api/v1/videos**: Upload a new video (requires video file and thumbnail). Files are uploaded using **Multer** and stored in **Cloudinary**.
- **GET /api/v1/videos/:videoId**: Get video details by ID.
- **DELETE /api/v1/videos/:videoId**: Delete a video by ID.
- **PATCH /api/v1/videos/:videoId**: Update a video (thumbnail).
- **PATCH /api/v1/videos/toggle/publish/:videoId**: Toggle the publish status of a video.

### /users

- **POST /api/v1/users/register**: Register a new user (requires avatar and cover image). Files are uploaded using **Multer** and stored in **Cloudinary**.
- **POST /api/v1/users/login**: Login a user and return JWT tokens.
- **POST /api/v1/users/logout**: Logout the user.
- **POST /api/v1/users/refresh-token**: Refresh the user's access token using the refresh token.
- **POST /api/v1/users/change-password**: Change the user's password.
- **GET /api/v1/users/current-user**: Get the current authenticated user.
- **PATCH /api/v1/users/update-account**: Update account details.
- **PATCH /api/v1/users/update-avatar**: Update user avatar (requires avatar file).
- **PATCH /api/v1/users/update-coverimage**: Update user cover image (requires cover image file).
- **GET /api/v1/users/c/:userName**: Get user channel profile.
- **GET /api/v1/users/history**: Get the user's watch history.

### /tweets

- **POST /api/v1/tweets**: Create a tweet.
- **GET /api/v1/tweets/user/:userId**: Get tweets from a specific user.
- **PATCH /api/v1/tweets/:tweetId**: Update a tweet.
- **DELETE /api/v1/tweets/:tweetId**: Delete a tweet.

### /subscriptions

- **GET /api/v1/subscriptions/c/:channelId**: Get subscribers of a channel.
- **POST /api/v1/subscriptions/c/:channelId**: Subscribe/unsubscribe to a channel.
- **GET /api/v1/subscriptions/u/:subscriberId**: Get the channels the user is subscribed to.

### /playlist

- **POST /api/v1/playlist**: Create a new playlist.
- **GET /api/v1/playlist/:playlistId**: Get playlist details by ID.
- **PATCH /api/v1/playlist/:playlistId**: Update a playlist.
- **DELETE /api/v1/playlist/:playlistId**: Delete a playlist.
- **PATCH /api/v1/playlist/add/:videoId/:playlistId**: Add a video to a playlist.
- **PATCH /api/v1/playlist/remove/:videoId/:playlistId**: Remove a video from a playlist.
- **GET /api/v1/playlist/user/:userId**: Get playlists of a specific user.

### /likes

- **POST /api/v1/likes/toggle/v/:videoId**: Like/dislike a video.
- **POST /api/v1/likes/toggle/c/:commentId**: Like/dislike a comment.
- **POST /api/v1/likes/toggle/t/:tweetId**: Like/dislike a tweet.
- **GET /api/v1/likes/videos**: Get all liked videos by the user.

### /dashboard

- **GET /api/v1/dashboard/stats**: Get channel statistics.
- **GET /api/v1/dashboard/videos**: Get all videos in the channel.

### /comments

- **GET /api/v1/comments/:videoId**: Get comments on a video.
- **POST /api/v1/comments/:videoId**: Add a comment to a video.
- **DELETE /api/v1/comments/c/:commentId**: Delete a comment.
- **PATCH /api/v1/comments/c/:commentId**: Update a comment.

## Contributing

Feel free to fork the repository and contribute. Please submit a pull request for any changes.

## License

This project is a personal learning project and is not licensed under any open-source license.

