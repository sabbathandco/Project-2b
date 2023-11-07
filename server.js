const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables from .env file
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI API configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static('public'));

// Route to handle dialogue creation requests
app.post('/create-dialogue', async (req, res) => {
  // Extract the panel and content from the request body
  const { panel, content, beginningDialogue, middleDialogue } = req.body;

  // Initialize the prompt based on the panel provided
  const prompt = `Create a dialog among two characters for the ${panel} of a three-frame comic book. The user of the comic book creation website will be responding to this prompt.\n\n${content}`;
  
  // Initialize the previousDialogues array based on the panel
  let previousDialogues = [];
  if (panel === 'middle') {
    previousDialogues.push({
      role: "assistant",
      content: beginningDialogue
    });
  } else if (panel === 'end') {
    previousDialogues.push({
      role: "assistant",
      content: beginningDialogue
    }, {
      role: "assistant",
      content: middleDialogue
    });
  }
  // Route to handle image generation requests
app.post('/generate-image', async (req, res) => {
  const { dialogue } = req.body;

  // Construct the prompt for image generation
  const prompt = `An illustration for the following dialogue: "${dialogue}"`;

  try {
    // Call the OpenAI API for image generation
    // (adjust parameters as needed for your specific use case)
    const response = await openai.createImage({
      prompt: prompt,
      n: 1, // Number of images to generate
      size: "1024x1024" // Image resolution
    });

    // Suppose the response contains data with the image URL
    // Send the generated image URL back in the response
    res.json({ imageUrl: response.data.data[0].url });
  } catch (error) {
    console.error('Error calling the OpenAI API:', error);
    res.status(500).send('An error occurred while generating the image.');
  }
});
  
  try {
    // Call the OpenAI API with the constructed messages array
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: previousDialogues.concat([{
        role: "system",
        content: `You are a comic book writer. You write three-frame comic books that are entertaining, make people want to check out your next comic, and make people laugh.`
      }, {
        role: "user",
        content: "I am a user of your comic book creation website."
      }, {
        role: "assistant",
        content: prompt
      }]),
      temperature: 0.7, // Adjusted for creativity but not too random
      max_tokens: 150, // Adjusted based on expected length of dialogue
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Send the generated dialogue back in the response
    res.json({ dialogue: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error calling the OpenAI API:', error);
    res.status(500).send('An error occurred while generating the dialogue.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
