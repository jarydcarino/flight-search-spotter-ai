# Quick Start Guide

Get your Flight Search Engine up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Amadeus API Credentials

1. Visit [https://developers.amadeus.com/](https://developers.amadeus.com/)
2. Sign up for a free account
3. Go to "My Self-Service" → "Create New App"
4. Copy your **Client ID** and **Client Secret**

## Step 3: Create Environment File

Create a `.env` file in the root directory:

```env
VITE_AMADEUS_CLIENT_ID=your_client_id_here
VITE_AMADEUS_CLIENT_SECRET=your_client_secret_here
```

Replace `your_client_id_here` and `your_client_secret_here` with your actual credentials.

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Step 5: Test the Application

1. Enter an origin airport (e.g., "JFK" or "New York")
2. Enter a destination airport (e.g., "LAX" or "Los Angeles")
3. Select departure date (and optionally return date)
4. Click "Search Flights"
5. Apply filters and watch the price graph update in real-time!

## Troubleshooting

### "Amadeus API credentials not configured" Error
- Make sure your `.env` file is in the root directory
- Verify the variable names start with `VITE_`
- Restart the development server after creating/modifying `.env`

### No Flight Results
- The Amadeus test API has limited data
- Try popular routes like:
  - JFK → LAX
  - NYC → LON
  - SFO → NYC
- Check the browser console for API errors

### Date Picker Not Working
- Make sure all dependencies are installed: `npm install`
- If issues persist, check that `@mui/x-date-pickers` is properly installed

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy your app
- Customize the UI and add your own features!

## Need Help?

- Check the [Amadeus API Documentation](https://developers.amadeus.com/self-service)
- Review the code comments in the source files
- Check browser console for detailed error messages
