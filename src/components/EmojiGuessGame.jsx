import React, { useState } from 'react';
import axios from 'axios';

const topics = ['food', 'place', 'song', 'famous personality'];

const EmojiGuessGame = () => {
  const [selectedTopic, setSelectedTopic] = useState('food');
  const [word, setWord] = useState('');
  const [emojiHint, setEmojiHint] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generateWordAndEmojis = async () => {
    setResult('');
    setEmojiHint('');
    setWord('');
    setUserGuess('');
    setLoading(true);

    try {
      // Step 1: Generate the famous word
      const wordRes = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{ parts: [{ text: `Give me a random famous ${selectedTopic} name which can be easily described using 3 to 5 emojis. Only return the name.` }] }]
        },
        { params: { key: import.meta.env.VITE_GEMINI_API_KEY } }
      );

      const generatedWord = wordRes.data.candidates[0]?.content?.parts[0]?.text.trim();
      setWord(generatedWord);

      // Step 2: Generate the emojis
      const emojiRes = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [{ parts: [{ text: `Give me only and only 3 to 5 emojis to describe "${generatedWord}" without using any words. DO NOT USE ANY WORD` }] }]
        },
        { params: { key: import.meta.env.VITE_GEMINI_API_KEY } }
      );

      const emoji = emojiRes.data.candidates[0]?.content?.parts[0]?.text.trim();
      setEmojiHint(emoji);
    } catch (error) {
      console.error(error);
      setEmojiHint('❌ Failed to fetch from Gemini AI');
    }
    setLoading(false);
  };

  const checkAnswer = () => {
    if (userGuess.trim().toLowerCase() === word.trim().toLowerCase()) {
      setResult('✅ Correct!');
    } else {
      setResult(`❌ Wrong! The correct answer was: ${word}`);
    }
  };

  return (
    <div className="game-container">
      <h2>🎯 Emoji Guess Game</h2>

      <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
        {topics.map((topic, idx) => (
          <option key={idx} value={topic}>{topic.charAt(0).toUpperCase() + topic.slice(1)}</option>
        ))}
      </select>

      <button onClick={generateWordAndEmojis} disabled={loading}>
        {loading ? 'Loading...' : 'Generate Challenge'}
      </button>

      {emojiHint && (
        <div className="emoji-section">
          <h3>Guess the Word:</h3>
          <p style={{ fontSize: '2rem' }}>{emojiHint}</p>
        </div>
      )}

      {emojiHint && (
        <div className="guess-section">
          <input
            type="text"
            placeholder="Enter your guess here..."
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
          />
          <button onClick={checkAnswer}>Check Answer</button>
        </div>
      )}

      {result && <h3 className="result">{result}</h3>}
    </div>
  );
};

export default EmojiGuessGame;
