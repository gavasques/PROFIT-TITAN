// Utility function to get user ID from request, compatible with both production and development modes
export function getUserId(req: any): string | null {
  if (process.env.SKIP_AUTH === 'true') {
    return 'dev-user-123'; // Fixed dev user ID for debugging only
  }
  
  // JWT auth: user is set by authenticateToken middleware
  return req.user?.userId || null;
}