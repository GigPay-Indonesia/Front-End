export default async function handler(req, res) {
  // Mini Apps can POST to this endpoint. We’re not using notifications yet,
  // but Base preview expects the URL to exist and respond successfully.
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ ok: true }));
}

