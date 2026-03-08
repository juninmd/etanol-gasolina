export interface FuelPriceResponse {
  stationId: number;
  priceGas: number;
  priceEthanol: number;
  isPromo: boolean;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Mock API Service simulating fetching real-time fuel prices from a backend.
 */
export const fetchLivePrices = async (stationIds: number[]): Promise<FuelPriceResponse[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updates: FuelPriceResponse[] = stationIds.map((id) => {
        // Simulating 30% chance of price update per station
        const willUpdate = Math.random() > 0.7;
        let change = 0;
        let trend: 'up' | 'down' | 'stable' = 'stable';

        if (willUpdate) {
          change = (Math.random() - 0.5) * 0.15; // +/- 0.075 change
          if (change > 0.02) trend = 'up';
          else if (change < -0.02) trend = 'down';
        }

        return {
          stationId: id,
          priceGas: change, // Sending relative change for simulation, or could send absolute if we stored baseline
          priceEthanol: change * 0.7,
          isPromo: change < -0.05, // If price drops significantly, it's a promo
          trend,
        };
      });
      resolve(updates);
    }, 1500); // 1.5s simulated network delay
  });
};
