const config = {
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      version: 'v1',
      endpoints: {
        directions: '/routes/directions',
        autocomplete: '/routes/autocomplete?search=',
        attractions: '/routes/directions/:id/points-of-interest',
      },
    },
  };
  
  export default config;