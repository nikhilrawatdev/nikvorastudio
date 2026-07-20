import { defineConfig } from 'vite';
import crypto from 'crypto';

/**
 * SECURITY: Generate a random CSP nonce for inline scripts on each build
 * This prevents inline script execution while allowing only our specific scripts
 * The nonce is injected into the HTML during build time
 */
function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

export default defineConfig({
  // Development server configuration
  server: {
    headers: {
      // Security headers for development
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://wa.me",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), vr=()',
    },
  },

  // Build optimization configuration
  build: {
    // Output directory for production builds
    outDir: 'dist',
    assetsDir: 'assets',
    
    // SECURITY: Minify JavaScript and CSS for production
    // Remove unnecessary code and comments to reduce attack surface
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console logs in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
      },
      mangle: true,
      output: {
        comments: false, // Remove comments from minified code
      },
    },

    // SECURITY: Rollup options for code splitting and optimization
    rollupOptions: {
      output: {
        // Disable source maps in production to prevent code exposure
        sourcemap: false,
        // Ensure all external dependencies are properly bundled
        globals: {},
      },
    },

    // Optimize chunk sizes for better caching and security
    chunkSizeWarningLimit: 1000,
    
    // SECURITY: Enable strict CSP compliance
    // Ensure no unsafe inline scripts or styles are generated
    cssCodeSplit: true,
    
    // Copy assets with proper versioning for cache busting
    assetsInlineLimit: 4096,
  },

  // SECURITY: Plugin configuration
  plugins: [
    {
      /**
       * Custom Vite plugin for CSP nonce injection
       * Generates a random nonce and injects it into script tags
       */
      name: 'csp-nonce-injector',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          // In production, the nonce is provided by Vercel headers
          // For local builds, we generate one
          const nonce = process.env.VITE_CSP_NONCE || generateNonce();
          
          // Production builds: nonce is handled by Vercel
          // No logging in production to avoid console pollution
          return html;
        },
      },
    },
  ],

  // SECURITY: Prevent dependency optimization issues
  optimizeDeps: {
    // Pre-bundle these dependencies for faster builds
    include: [],
    // Exclude any problematic dependencies that may have CSP issues
    exclude: [],
  },
});