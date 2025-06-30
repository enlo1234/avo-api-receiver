# Avo Event Schema Receiver

A simple React application for fetching event schemas from Avo's API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:5173

## Usage

1. Enter your Avo API endpoint:
   ```
   https://api.avo.app/workspaces/YOUR_WORKSPACE_ID/branches/YOUR_BRANCH_ID/export/v1
   ```

2. Add your service account credentials if needed:
   - Username: your service account name
   - Password: your service account secret

3. Click "Fetch Schema"

## Finding Your IDs

- **Workspace ID**: Found in your Avo dashboard URL after `/workspaces/`
- **Branch ID**: Found in your Avo dashboard URL after `/branches/` (usually `main` or `master`)