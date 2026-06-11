// Development Configuration
// Set these to true to bypass external API requirements during development

interface DevConfig {
  BYPASS_MAPS: boolean;
  BYPASS_PAYMENT: boolean;
}

export const DEV_CONFIG: DevConfig = {
  BYPASS_MAPS: true,    // Bypasses Google Maps Autocomplete requirements
  BYPASS_PAYMENT: true, // Bypasses Razorpay payment flow
};
