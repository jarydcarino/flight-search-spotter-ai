# Flight Search Engine

A modern, responsive flight search engine built with React, TypeScript, and Material UI. This application allows users to search for flights, view real-time price trends, and apply complex filters to find the best deals.

## Features

- ✈️ **Flight Search**: Search flights by origin, destination, dates, and number of passengers
- 📊 **Live Price Graph**: Real-time price trends visualization using Recharts
- 🔍 **Complex Filtering**: Simultaneous filters for stops, price range, and airlines
- 📱 **Responsive Design**: Fully functional on both mobile and desktop devices
- 🎨 **Modern UI**: Built with Material UI for a polished, professional look

## Tech Stack

- **React 18** with TypeScript
- **Material UI (MUI)** for components and styling
- **Recharts** for data visualization
- **Vite** for fast development and building
- **Amadeus Self-Service API** for flight data
- **Axios** for API requests
- **date-fns** for date manipulation

## Prerequisites

- Node.js 18+ and npm
- Amadeus API credentials (Client ID and Client Secret)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Amadeus API Credentials

1. Sign up for a free Amadeus Self-Service account at [https://developers.amadeus.com/](https://developers.amadeus.com/)
2. Create a new app to get your API credentials
3. Create a `.env` file in the root directory:

```env
VITE_AMADEUS_CLIENT_ID=your_client_id_here
VITE_AMADEUS_CLIENT_SECRET=your_client_secret_here
```

**Note**: The Amadeus API uses a test environment by default. Make sure you're using the test credentials.

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchForm.tsx  # Flight search form
│   ├── FlightResults.tsx # Flight results list
│   ├── PriceGraph.tsx  # Price trends graph
│   └── Filters.tsx     # Filter controls
├── services/           # API services
│   └── amadeusApi.ts   # Amadeus API integration
├── types/              # TypeScript types
│   └── flight.ts       # Flight-related types
├── utils/              # Utility functions
│   └── flightUtils.ts  # Flight data processing
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Key Features Explained

### Search & Results
- Autocomplete airport search with IATA code suggestions
- Support for one-way and round-trip flights
- Date pickers with validation
- Passenger count selection

### Live Price Graph
- Real-time updates as filters are applied
- Shows average price per date
- Displays number of flights per date
- Responsive design for mobile and desktop

### Complex Filtering
- **Stops**: Filter by non-stop, 1 stop, 2+ stops, or any
- **Price Range**: Slider to set maximum price
- **Airlines**: Multi-select dropdown to filter by specific airlines
- All filters work simultaneously and update results instantly

### Responsive Design
- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-friendly controls
- Optimized graph display for mobile devices

## API Integration

This application uses the Amadeus Self-Service API (Test Environment). The API provides:

- Flight search capabilities
- Airport/airline data
- Real-time pricing information

**Important**: 
- The API uses OAuth 2.0 client credentials flow
- Access tokens are automatically managed and refreshed
- The test environment has rate limits and limited data availability

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify

1. Push your code to GitHub
2. Create a new site in Netlify
3. Connect your repository
4. Add environment variables
5. Set build command: `npm run build`
6. Set publish directory: `dist`
7. Deploy

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_AMADEUS_CLIENT_ID` | Your Amadeus API Client ID |
| `VITE_AMADEUS_CLIENT_SECRET` | Your Amadeus API Client Secret |

## Known Limitations

- The Amadeus test API has limited data availability
- Some routes may not return results in the test environment
- API rate limits apply (typically 10 requests per second)

## Future Enhancements

- [ ] Add return flight search
- [ ] Implement flight comparison feature
- [ ] Add saved searches
- [ ] Include airline logos
- [ ] Add sorting options (price, duration, departure time)
- [ ] Implement pagination for large result sets

## License

This project is created for assessment purposes.

## Author

Built for initial assessment - Flight Search Engine
