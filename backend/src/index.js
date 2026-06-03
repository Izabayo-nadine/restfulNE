/**
 * @deprecated Monolith entry point — use microservices instead:
 *   npm run dev   (starts gateway + all services)
 */
console.error(`
The FEMS backend is now a microservices architecture.
Run from backend folder:

  npm install
  npm run dev

API Gateway: http://localhost:5000
`);
process.exit(1);
