import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6879257849097afd3f7a2d91", 
  requiresAuth: true // Ensure authentication is required for all operations
});
