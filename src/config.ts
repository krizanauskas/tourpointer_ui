const config = {
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      version: 'v1',
      endpoints: {
        points: '/points',
        autocomplete: '/routes/autocomplete?search=',
      },
    },
  };
  
  export default config;