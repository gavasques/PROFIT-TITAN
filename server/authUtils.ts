// Utility function to get user ID from request, compatible with both production and development modes
export function getUserId(req: any): string | null {
  if (process.env.SKIP_AUTH === 'true') {
    // In SKIP_AUTH mode, get ID from session user (from Replit Auth)
    return req.user?.id || 'dev-user-123';
  }
  
  // JWT auth: user is set by authenticateToken middleware
  return req.user?.userId || req.user?.sub || null;
}