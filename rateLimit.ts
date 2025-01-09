export function rateLimit(maxRequests: number, timeWindow: number) {
  const requests: number[] = [];

  return {
    tryRequest: (): boolean => {
      const now = Date.now();
      
      // Remove expired timestamps
      const validRequests = requests.filter(
        timestamp => now - timestamp < timeWindow
      );
      
      if (validRequests.length >= maxRequests) {
        return false;
      }
      
      validRequests.push(now);
      requests.length = 0;
      requests.push(...validRequests);
      
      return true;
    }
  };
}