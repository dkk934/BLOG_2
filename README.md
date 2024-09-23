# Blog Platform

This project is a web application built with **Node.js** and **Express**, allowing users to register, authenticate, and create blog posts. It features both local and Google OAuth authentication, PostgreSQL database for user management, and Axios for API calls.

## Features
- User registration with password encryption (bcrypt)
- Local and Google OAuth authentication (Passport.js)
- Blog post creation, editing, and deletion
- Database integration with PostgreSQL
- Sessions for persistent user authentication
- Error handling and data validation

## Installation

### Clone the repository:
```bash
git clone https://github.com/dkk934/BLOG_2.git
cd BLOG_2
```
### Install dependencies:
```bash
npm install
```
### Set up environment variables:
Create a `.env` file with the following keys: 
```bash 
PORT=3000 API_URL=http://localhost:4000
user=<your_postgres_user> host=<your_postgres_host>
database=<your_postgres_database>
password=<your_postgres_password>
port_DB=<your_postgres_port>
SESSION_SECRET=<your_secret>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
```
### Start the server: 
```bash
npm start
```
###Usage
Go to `http://localhost:3000/` to access the home page. Users can register, log in, and view posts on the `/blog` page. 

##API Endpoints
### Authentication 
- `GET /auth/google`: Redirect to Google for authentication. 
- `GET /auth/google/blog`: Callback for Google login. 
- `POST /login`: Local authentication using Passport. 
- `GET /logout`: Log out the user.
### Blog
- `GET /blog`: View blog posts (authentication required).
- `GET /new`: Create a new blog post (authentication required).
- `POST /api/posts`: Submit a new blog post.
- ]`GET /edit/:id`: Edit an existing blog post (authentication required).
- `POST /api/posts/:id`: Update a blog post.
- `GET /api/posts/delete/:id`: Delete a blog post.
### Tables 
- `GET /api/table`: Get all available tables.
- `POST /api/table`: Create a new table.

### License 
This project is licensed under the MIT License.


