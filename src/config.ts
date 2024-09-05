const config = {
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      version: 'v1',
      endpoints: {
        planTrip: '/trips/plan',
      },
    },
  };
  
  export default config;