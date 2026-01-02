# Deployment Guide

This Photo Booth application is a full-stack app (React Frontend + Node/Express Backend) with a local SQLite database. Because it uses a persistent server and local database file, the best deployment strategy is using **Docker**.

## Option 1: Render.com (Recommended)

Render is the easiest place to deploy this containerized application.

### Steps:
1.  **Push your code** to a GitHub repository.
2.  Log in to [Render.com](https://render.com).
3.  Click **New +** and select **Web Service**.
4.  Connect your GitHub repository.
5.  **Configure the service**:
    *   **Name:** `photo-booth` (or whatever you like)
    *   **Runtime:** Select **Docker**.
    *   **Region:** Choose one close to you.
    *   **Instance Type:** Free (or Starter).
6.  Click **Create Web Service**.

Render will build the Docker image (using the `Dockerfile` in the repo) and deploy it.

### Important Note on Data Persistence
By default, Render's web services have an **ephemeral filesystem**. This means:
*   The `dev.db` (database) and `server/uploads` (photos) will be **reset/deleted** every time you redeploy or the server restarts.
*   **For permanent storage:** You need to either:
    1.  Upgrade to a paid Render plan and attach a **Persistent Disk** mounted to `/app/server/uploads` and `/app/server/prisma`.
    2.  (Recommended for Production) Switch the database provider to a cloud Postgres (like Render's managed PostgreSQL) and use a cloud storage service (like AWS S3) for the images.

## Option 2: Vercel

**Vercel is NOT recommended** for this specific version of the app without changes.

### Why?
Vercel is designed for Serverless functions.
1.  **Database:** Vercel functions cannot write to a local `sqlite.db` file reliably (it's read-only or ephemeral). You would need to switch to a cloud database like **Neon** or **Turso**.
2.  **Uploads:** You cannot save files to the local disk (`server/uploads`) on Vercel. You would need to upload files to **AWS S3** or **Vercel Blob**.

If you must use Vercel, you need to refactor the backend to use external storage services instead of the local filesystem.
