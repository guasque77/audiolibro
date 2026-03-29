const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const EL_KEY = 'sk_de05628d39ae323cc2facce43cc1029293cfc3ce5912afd4';

app.get('/health', function(req, res) {
  res.json({ ok: true });
});

app.post('/tts', function(req, res) {
  var text = req.body.text;
  var voice = req.body.voice_id || 'EXAVITQu4vr4xnSDxMaL';
  var stability = req.body.stability || 0.5;
  if (!text) { res.status(400).json({ error: 'text required' }); return; }
  fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voice + '/stream', {
    method: 'POST',
    headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: stability, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true } })
  }).then(function(r) {
    if (!r.ok) { return r.json().then(function(e) { res.status(r.status).json(e); }); }
    res.setHeader('Content-Type', 'audio/mpeg');
    r.body.pipe(res);
  }).catch(function(e) { res.status(500).json({ error: e.message }); });
});

app.post('/analyze', function(req, res) {
  var text = req.body.text;
  if (!text) { res.status(400).json({ error: 'text required' }); return; }
  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': req.body.claude_key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: 'Analiza este documento y devuelve SOLO JSON sin markdown:\n{"titulo":"...","capitulos":[{"nombre":"...","buscar":"primeras 20 letras unicas de esa seccion"}]}\nMaximo 8 secciones. Si no hay capitulos usa inicio/medio/final.\nTexto:\n' + text.substring(0, 4000) }]
    })
  }).then(function(r) { return r.json(); }).then(function(d) {
    res.json({ result: d.content && d.content[0] && d.content[0].text });
  }).catch(function(e) { res.status(500).json({ error: e.message }); });
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() { console.log('running on port ' + PORT); });
