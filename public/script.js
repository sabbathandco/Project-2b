// Function to generate and display a DALL-E image
async function generateAndDisplayImage(panelId, dialogue) {
    try {
        const response = await fetch('/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dialogue }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const imageElement = document.getElementById(`${panelId}-image`);
        // Displaying the image on the webpage
        imageElement.innerHTML = `<img src="${data.imageUrl}" alt="Generated Image for ${panelId}" />`;
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Function to generate dialogue for a comic panel
async function generateDialogue(panelId) {
    let userInput;
    if (panelId === 'beginning') {
        userInput = document.getElementById('userInput').value;
    } else if (panelId === 'middle') {
        userInput = document.getElementById('middleInput').value;
    } else if (panelId === 'end') {
        userInput = document.getElementById('endInput').value;
    }

    const panel = document.getElementById(panelId);

    let previousDialogues = {};
    if (panelId === 'middle') {
        previousDialogues.beginningDialogue = document.getElementById('userInput').value;
    } else if (panelId === 'end') {
        previousDialogues.beginningDialogue = document.getElementById('userInput').value;
        previousDialogues.middleDialogue = document.getElementById('middleInput').value;
    }

    try {
        const response = await fetch('/create-dialogue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                panel: panelId,
                content: userInput,
                ...previousDialogues
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        const dialogueElement = panel.querySelector('.dialogue');
        if (dialogueElement) {
            dialogueElement.textContent = data.dialogue;
        } else {
            const newDialogue = document.createElement('p');
            newDialogue.classList.add('dialogue');
            newDialogue.textContent = data.dialogue;
            panel.appendChild(newDialogue);
        }

        // When the dialogue has been generated, generate the corresponding image
        generateAndDisplayImage(panelId, data.dialogue);
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }
}