# SpeechSynthesisUtterance: How It Works

`SpeechSynthesisUtterance` is part of the Web Speech API that enables text-to-speech functionality in web browsers. Here's a comprehensive explanation of how it works:

## Basic Usage

```javascript
// Create a new utterance
const utterance = new SpeechSynthesisUtterance('Hello, world!');

// Speak the text
speechSynthesis.speak(utterance);
```

## Core Properties You Can Configure

### 1. **text** - The content to be spoken
```javascript
const utterance = new SpeechSynthesisUtterance();
utterance.text = 'This is the text that will be spoken aloud.';
```

### 2. **rate** - Speech speed (0.1 to 10)
```javascript
utterance.rate = 0.8;  // Slow speech
utterance.rate = 1.0;  // Normal speed (default)
utterance.rate = 1.5;  // Fast speech
```

### 3. **pitch** - Voice pitch (0 to 2)
```javascript
utterance.pitch = 0.5;  // Low pitch
utterance.pitch = 1.0;  // Normal pitch (default)
utterance.pitch = 2.0;  // High pitch
```

### 4. **volume** - Loudness (0 to 1)
```javascript
utterance.volume = 0.5;  // Half volume
utterance.volume = 1.0;  // Full volume (default)
```

### 5. **lang** - Language and accent
```javascript
utterance.lang = 'en-US';    // US English
utterance.lang = 'en-GB';    // British English
utterance.lang = 'es-ES';    // Spanish
utterance.lang = 'fr-FR';    // French
```

### 6. **voice** - Specific voice selection
```javascript
// Get available voices and select one
speechSynthesis.getVoices().then(voices => {
    const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Samantha')
    );
    utterance.voice = femaleVoice;
});
```

## Event Handlers

`SpeechSynthesisUtterance` provides several events you can listen to:

```javascript
const utterance = new SpeechSynthesisUtterance('Hello world');

// When speech starts
utterance.onstart = (event) => {
    console.log('Speech started');
};

// When speech ends
utterance.onend = (event) => {
    console.log('Speech completed');
};

// When speech is paused
utterance.onpause = (event) => {
    console.log('Speech paused');
};

// When speech is resumed
utterance.onresume = (event) => {
    console.log('Speech resumed');
};

// When an error occurs
utterance.onerror = (event) => {
    console.error('Speech error:', event.error);
};

// When boundaries are reached (word/sentence)
utterance.onboundary = (event) => {
    console.log(`Reached boundary at ${event.charIndex} characters`);
};
```

## Controlling Speech Synthesis

### Starting and Stopping
```javascript
const synthesis = window.speechSynthesis;

// Start speaking
synthesis.speak(utterance);

// Pause speech
synthesis.pause();

// Resume paused speech
synthesis.resume();

// Cancel completely
synthesis.cancel();
```

### Checking Status
```javascript
const synthesis = window.speechSynthesis;

console.log(synthesis.speaking);    // true if currently speaking
console.log(synthesis.paused);      // true if paused
console.log(synthesis.pending);     // true if utterances queued
```

## Complete Example with Error Handling

```javascript
function speakText(text, options = {}) {
    return new Promise((resolve, reject) => {
        // Check if speech synthesis is supported
        if (!('speechSynthesis' in window)) {
            reject(new Error('Speech synthesis not supported'));
            return;
        }
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply options
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;
        utterance.lang = options.lang || 'en-US';
        
        // Set up event handlers
        utterance.onend = () => {
            resolve('Speech completed successfully');
        };
        
        utterance.onerror = (event) => {
            reject(new Error(`Speech error: ${event.error}`));
        };
        
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        // Start speaking
        speechSynthesis.speak(utterance);
    });
}

// Usage
speakText('Hello, welcome to our application!', {
    rate: 0.8,
    pitch: 1.2,
    volume: 0.7
})
.then(message => console.log(message))
.catch(error => console.error(error));
```

## Browser-Specific Considerations

### 1. **Voice Loading** (Important!)
Voices load asynchronously, so you often need to wait for them:

```javascript
let voices = [];

function loadVoices() {
    return new Promise((resolve) => {
        voices = speechSynthesis.getVoices();
        if (voices.length) {
            resolve(voices);
        } else {
            speechSynthesis.onvoiceschanged = () => {
                voices = speechSynthesis.getVoices();
                resolve(voices);
            };
        }
    });
}

// Usage
loadVoices().then(availableVoices => {
    console.log('Voices loaded:', availableVoices);
});
```

### 2. **Mobile Device Limitations**
- Some mobile browsers restrict autoplay
- User interaction is often required to start speech
- Battery consumption considerations

### 3. **Browser Support**
- Chrome: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support
- Internet Explorer: No support

## Practical Implementation in Our App

Here's how we implemented it in the touch typing app:

```javascript
document.getElementById('readAloud').addEventListener('click', function() {
    const activeSection = document.querySelector('.section.active');
    const textToRead = activeSection.innerText;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // Configure for better accessibility
    utterance.rate = 0.8;  // Slower for comprehension
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume
    utterance.lang = 'en-US'; // Set language
    
    // Stop any current speech before starting new one
    speechSynthesis.cancel();
    
    // Start speaking
    speechSynthesis.speak(utterance);
});
```

## Best Practices

1. **Always provide a way to stop speech**
2. **Handle errors gracefully**
3. **Consider user preferences for speed/pitch**
4. **Don't auto-play without user consent**
5. **Provide visual feedback when speech is active**
6. **Respect user's motion sensitivities**

## Common Issues and Solutions

### Issue: Voices not loading
**Solution:** Use the `voiceschanged` event
```javascript
speechSynthesis.onvoiceschanged = function() {
    const voices = speechSynthesis.getVoices();
    // Now voices are available
};
```

### Issue: Speech not starting on mobile
**Solution:** Trigger from user interaction
```javascript
// This will work:
button.addEventListener('click', () => {
    speechSynthesis.speak(utterance);
});

// This might not work:
window.addEventListener('load', () => {
    speechSynthesis.speak(utterance); // May be blocked
});
```

`SpeechSynthesisUtterance` is a powerful tool for creating accessible web applications, especially beneficial for users with visual impairments or those who prefer auditory learning.

