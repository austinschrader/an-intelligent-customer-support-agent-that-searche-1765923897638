export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider, apiKey, messages } = req.body;

    if (!provider || !apiKey || !messages) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let response;

    if (provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2048,
          messages: messages
        })
      });
    } else if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages
        })
      });
    } else {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error Response:', JSON.stringify(error, null, 2));
      const errorMessage = error.error?.message || error.message || JSON.stringify(error);
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();

    // Return normalized response
    if (provider === 'anthropic') {
      return res.status(200).json({ content: data.content[0].text });
    } else {
      return res.status(200).json({ content: data.choices[0].message.content });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
