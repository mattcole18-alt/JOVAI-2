// Vercel Serverless Function: /api/health

export default function handler(req, res) {
  res.json({
    status: "ok",
    amadeus: !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET),
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  });
}
