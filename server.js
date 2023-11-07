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

// Endpoint to create dialogue using the OpenAI GPT model
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

// Endpoint to generate images using DALL-E 3
app.post('/generate-image', async (req, res) => {
  const { dialogue } = req.body;

  // Construct the prompt for image generation
  const prompt = `An illustration for the following dialogue: "${dialogue}"`;

  try {
    // Call the OpenAI DALL-E 3 API for image generation
    const imageResponse = await openai.createImage({
      model: "dall-e-3", // Use DALL-E 3 for image generation
      prompt: prompt,
      n: 1,
      size: "1024x1024", // Requested image resolution
      quality: "standard" // Can be "standard" or "hd" for high detail
    });
    // Extract the URL of the generated image
    const imageUrl = imageResponse.data.data[0].url;
    res.json({ imageUrl: imageUrl });
  } catch (error) {
    console.error('Failed to generate DALL-E image:', error);
    // Log the full error response if it's an API error for more details
    if (error.response) {
      console.error('API response error:', error.response.data);
    }
    res.status(500).send('Error in image generation');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});