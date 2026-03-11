import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Custom hook for fetching OpenF1 data
const useOpenF1 = (endpoint, options = {}) => {
  return useQuery({
    queryKey: ['openf1', endpoint],
    queryFn: async () => {
      const response = await axios.get(`https://api.openf1.org/v1/${endpoint}`);
      return response.data;
    },
    ...options,
  });
};

export default useOpenF1;
