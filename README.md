# Consent Location Share — real deployable starter

This is a real server-based starter, not a fake demo. It sends an SMS request through Twilio, and the recipient's browser asks for GPS permission. After Allow, coordinates are sent to the server and the requester can see them.

## Run
1. Install Node.js 18+.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Put your Twilio credentials and a public HTTPS `BASE_URL` in `.env`.
5. Run `npm start`.
6. Open `/requester.html`.

## Important
- Use HTTPS in production; browser geolocation generally requires a secure context.
- The recipient must explicitly grant browser location permission.
- This starter stores request state in memory; a production deployment should use a database, authentication, expiration, rate limiting, encrypted transport, and access controls.
- Twilio requires an account/number capable of sending SMS. Never put Twilio credentials in frontend JavaScript.
