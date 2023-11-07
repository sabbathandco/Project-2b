const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.json());
app.use(express.static('public'));

app.post('/create-dialogue', async (req, res) => {
  const { panel, content, beginningDialogue, middleDialogue } = req.body;
  const prompt = `Create dialogue for the ${panel} of a comic strip: ${content}`;
  let previousDialogues = [];
  if (panel === 'middle') {
    previousDialogues.push({ role: "system", content: beginningDialogue });
  } else if (panel === 'end') {
    previousDialogues.push({ role: "system", content: beginningDialogue });
    previousDialogues.push({ role: "system", content: middleDialogue });
  }

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: previousDialogues.concat([{
        role: "user",
        content: prompt
      }]),
      max_tokens: 150,
    });

    res.json({ dialogue: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    res.status(500).send('Error generating dialogue.');
  }
});

app.post('/generate-image', async (req, res) => {
  const { dialogue } = req.body;
  const prompt = `Generate an image for a comic strip with dialogue: ${dialogue}`;

  try {
    // Call to DALL-E API (Placeholder comment as the actual API syntax may vary)
    // const response = await openai.createImage({ ... });

    // Simulate obtaining the image URL from the response
    const imageUrl = 'URL_FROM_DALL-E_RESPONSE';

    res.json({ imageUrl });
  } catch (error) {
    console.error('Error calling OpenAI for image generation:', error);
    res.status(500).send('Error generating image.');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});