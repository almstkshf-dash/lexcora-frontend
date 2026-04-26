/**
 * Public routes that do NOT require authentication.
 * This must stay in sync with the `isPublicRoute` matcher in src/middleware.ts.
 *
 * Add any new public pages (register, forgot-password, etc.) here,
 * and they will automatically be excluded from the authenticated shell layout.
 */
export const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/**
 * Returns true when the given pathname is a public (unauthenticated) route.
 * @param {string} pathname - The current Next.js pathname
 * @returns {boolean}
 */
export const isPublicRoute = (pathname) =>
  PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
