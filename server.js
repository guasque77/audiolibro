const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = '9c5f357baa053625294075b0904f520bad8b90fad213866d0cfa701aaccbedee';

app.post('/tts', async (req, res) => {
  const { text, voice_id = 'EXAVITQu4vr4xnSDxMaL', stability = 0.5, similarity_boost = 0.8 } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`, {
      method: 'POST',
      headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability, similarity_boost, style: 0.2, use_speaker_boost: true }
      })
    });
    if (!r.ok) {
      const err = await r.json();
      return res.status(r.status).json(err);
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    r.body.pipe(res);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Proxy running on port', PORT));
