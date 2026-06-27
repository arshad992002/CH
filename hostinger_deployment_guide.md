# Hostinger Deployment Guide
This guide outlines the steps to deploy the Caring Hands Charitable Trust web application onto Hostinger.

## Application Architecture
The application is designed as a **unified project**:
- **Frontend (React)**: Already built into static files situated inside `backend/public/`.
- **Backend (Express)**: Serves the static React build and handles API requests (admin portal, forms, image uploads, donations, events, gallery, and the new homepage banner slideshow).

You only need to deploy the **contents of the backend folder** (which has been bundled into `deploy.zip` in your root workspace).

---

## Option 1: Hostinger Shared Hosting (Recommended & Easiest)
If you are using Hostinger’s Business or Cloud shared hosting plans, you can use the built-in **Node.js App Selector**.

### Step 1: Upload the Application
1. Log in to your **Hostinger hPanel**.
2. Go to **Websites** -> **Manage** -> **File Manager**.
3. Navigate to your domain's directory (typically `public_html` or a subfolder if using a subdomain like `darkgrey-dogfish-982505.hostingersite.com`).
4. Upload `deploy.zip` (located in your local workspace folder).
5. Right-click `deploy.zip` in File Manager and select **Extract**. Extract all files into your target folder.

### Step 2: Configure Node.js Application
1. In Hostinger hPanel, search for **Node.js** in the sidebar search bar.
2. Click **Create Application** and fill out the fields:
   - **Node.js Version**: Select `18.x` or `20.x`.
   - **Application Mode**: Select `Production`.
   - **Application Root**: Select the folder where you extracted the files (e.g. `public_html`).
   - **Application URL**: Your domain name.
   - **Startup File**: `server.js`
3. Click **Save**.

### Step 3: Install Dependencies
1. Once the application is configured, you will see a section for **NPM Packages / Scripts**.
2. Click the **NPM Install** button. Hostinger will scan `package.json` and download `express`, `cors`, and `@supabase/supabase-js`.

### Step 4: Environment Variables (Optional)
If you want to use Supabase Cloud Database instead of local JSON database storage:
1. In the Node.js application management page, look for the **Environment Variables** section.
2. Add the following variables:
   - `SUPABASE_URL` = *(Your Supabase Project URL)*
   - `SUPABASE_KEY` = *(Your Supabase Service/Anon Key)*
   - `JWT_SECRET` = *(Any secure password for signing admin logins)*
   - `PORT` = `3000` (or leave empty to let Hostinger assign a port automatically)

### Step 5: Start the App
1. Click **Start App** at the top right of the Node.js panel.
2. Visit your domain URL to verify that everything works!

---

## Option 2: Hostinger VPS Hosting (For Dedicated VPS Plans)
If you are deploying to a Hostinger Linux VPS, you will use SSH, PM2, and Nginx.

### Step 1: Transfer Files & Extract
1. Open your terminal/SFTP client and upload `deploy.zip` to the VPS (e.g., to `/var/www/charity`).
2. SSH into your VPS:
   ```bash
   ssh root@your_vps_ip
   ```
3. Navigate to the folder, install unzip, and extract:
   ```bash
   cd /var/www/charity
   apt update && apt install unzip -y
   unzip deploy.zip
   ```

### Step 2: Install Node.js & Dependencies
1. Install Node.js (v18 or v20):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs
   ```
2. Install npm dependencies:
   ```bash
   npm install --production
   ```

### Step 3: Configure PM2 (Process Manager)
PM2 keeps your Node.js application running in the background and restarts it if the VPS reboots.
1. Install PM2 globally:
   ```bash
   npm install pm2 -g
   ```
2. Start the Express server:
   ```bash
   pm2 start server.js --name "charity-trust"
   ```
3. Set PM2 to launch on startup:
   ```bash
   pm2 startup
   # Copy and execute the command printed by the output
   pm2 save
   ```

### Step 4: Nginx Reverse Proxy
To map your domain (port 80/443) directly to the Express server running on port 5000:
1. Install Nginx:
   ```bash
   apt install nginx -y
   ```
2. Create/edit Nginx server configuration:
   ```bash
   nano /etc/nginx/sites-available/default
   ```
3. Update the `location /` block:
   ```nginx
   server {
       listen 80;
       server_name darkgrey-dogfish-982505.hostingersite.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
4. Test and restart Nginx:
   ```bash
    nginx -t
    systemctl restart nginx
    ```

---

## Option 3: GitHub Deployment (Automated Git Sync)
If you prefer deploying by linking a GitHub repository to Hostinger, you can set it up to auto-deploy every time you push changes to your GitHub main branch.

### Step 1: Push Your Project to GitHub
1. Open your terminal in the project root directory and initialize Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Caring Hands workspace"
   ```
2. Create a new repository on [GitHub](https://github.com) (keep it private if you want to protect your server config and credentials).
3. Link your local project to GitHub and push your codebase:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
   *(Note: The root-level `.gitignore` will ensure that bulky `node_modules` folders and local test ZIPs are not uploaded to GitHub).*

### Step 2: Configure Hostinger Git Deployment
1. Log in to your **Hostinger hPanel**.
2. Go to **Websites** -> **Manage** -> **Advanced** -> **Git**.
3. Under the **Deploy** form, specify:
   - **Repository URL**: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git`
   - **Branch**: `main`
   - **Directory**: `public_html` (or your target folder/subdomain folder)
4. Click **Create** to clone the repository.
5. Setup the Webhook URL displayed in Hostinger on your GitHub Repository settings page (`Settings -> Webhooks -> Add Webhook`) so that code pushes auto-trigger a fresh deployment.

### Step 3: Run Node.js Application
1. In Hostinger hPanel, search for **Node.js**.
2. Create or edit your application settings:
   - **Node.js Version**: `18.x` or `20.x`
   - **Application Mode**: `Production`
   - **Application Root**: `public_html` (the folder containing your cloned code)
   - **Startup File**: `backend/server.js`
3. Click **Save**.
4. Click **NPM Install**. Since we configured the root-level `package.json`, Hostinger will automatically run our custom `postinstall` script, which installs the backend packages, installs frontend packages, and compiles the React application on the fly.
5. Click **Start App**.

---

## 🗄️ Database & Upload Persistence (Fixing Overwritten Data/Images)
By default, the application runs on a local JSON database inside `backend/data/` and saves uploaded images to `backend/images/`.
* **The Problem**: Whenever you deploy a new folder (via GitHub push or extracting a new ZIP), the server files are overwritten, which resets the local database files and deletes your uploaded images!
* **The Solution**: Configure **Supabase Cloud Database & Storage**. This keeps all your content, credentials, and image uploads securely in the cloud, completely unaffected by local code changes or server deployments.

### Step 1: Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and log in.
2. Click **New Project** and select your organization. Choose a database password and region, then click **Create New Project**.

### Step 2: Create the Database Table
1. In your Supabase dashboard, click **SQL Editor** in the left navigation sidebar.
2. Click **New Query** and run the following command to create the data synchronization table:
   ```sql
   create table charity_store (
     key_name text primary key,
     data_content jsonb not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```
3. Click **Run** to execute the query.

### Step 3: Create the Storage Bucket (for Images)
To store uploaded images permanently in the cloud:
1. Click **Storage** in the left sidebar of your Supabase dashboard.
2. Click **New Bucket**.
3. Set the **Bucket Name** to exactly: `images`
4. Toggle the **Public** option to **Enabled** (so visitors can read images without access tokens).
5. Click **Save**.

### Step 4: Add Environment Variables in Hostinger
To link your Hostinger Node.js app with Supabase:
1. In Supabase, go to **Project Settings** (gear icon) -> **API**.
2. Copy your **Project URL** and the **anon/public Key**.
3. Log in to your **Hostinger hPanel** -> search for **Node.js** -> manage your application.
4. Under **Environment Variables**, add:
   * `SUPABASE_URL` = *(Your Supabase Project URL)*
   * `SUPABASE_KEY` = *(Your Supabase Anon/Public Key)*
5. Restart your Node.js application.

The app will now dynamically sync all settings, users, and menus with Supabase database, and upload all new files securely to Supabase Storage, completely protecting them from deletion!
