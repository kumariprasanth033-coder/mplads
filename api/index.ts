import app from '../server/app.js';

export default function handler(req: any, res: any) {
  // Ensure the URL starts with /api so Express routes match regardless of Vercel rewrite configuration
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return app(req, res);
}
