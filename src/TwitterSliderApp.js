import React, { useState } from 'react';
import OpenAI from 'openai';
import './TwitterSliderApp.css';
import { sliderConfig } from './sliderConfig';
import { generatePrompt } from './promptGenerator';
import Slider from './components/Slider';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const TwitterSliderApp = () => {
  const [inputText, setInputText] = useState('');
  const [finalTweet, setFinalTweet] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [sliderValues, setSliderValues] = useState({
    formality: 50,
    complexity: 50,
    emotionalIntensity: 50,
    seriousness: 50,
    temporalStyle: 50,
    colloquialness: 50,
    clarity: 50,
    credibility: 50
  });

  const generateTweet = async (text) => {
    if (!text.trim()) return;
    
    try {
      setError('');
      setLoading(true);
      setFinalTweet('');
      
      const prompt = generatePrompt(text, sliderValues);
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are a tweet generator specialized in precise style control. Generate concise tweets (max 280 characters) that EXACTLY match the requested style parameters. When a style value is at 0% or 100%, you MUST generate content that extremely emphasizes that style choice.' 
          },
          { role: 'user', content: prompt },
        ],
      });
      
      const generatedTweet = completion.choices[0].message.content.trim();
      setFinalTweet(generatedTweet);
    } catch (error) {
      console.error('Error generating tweet:', error);
      setError(error.message || 'Failed to generate tweet.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newText = e.target.value;
    setInputText(newText);
    if (newText.trim()) {
      generateTweet(newText);
    } else {
      setFinalTweet('');
    }
  };

  const handleSliderChange = (key) => (e) => {
    const value = parseInt(e.target.value);
    setSliderValues(prev => ({
      ...prev,
      [key]: value
    }));
    if (inputText.trim()) {
      generateTweet(inputText);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalTweet);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="twitter-slider-app">
      <div className="header-section">
        <div className="header-content">
          <h1>Tweet Style Generator</h1>
          <p className="subtitle">Transform your content into the perfect tweet</p>
        </div>
      </div>
      
      <div className="content-wrapper">
        <div className="left-column">
          <div className="input-section">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Enter any text, news article, or message to transform into a tweet..."
            />
          </div>
          
          <div className="output-section">
            <div className="status-container">
              {loading && <div className="loading-message">Generating tweet...</div>}
              {error && <div className="error-message">{error}</div>}
            </div>
            {finalTweet && (
              <button 
                className={`copy-button ${isCopied ? 'copied' : ''}`} 
                onClick={handleCopy}
                title="Copy tweet"
              />
            )}
            <div className="tweet-container">
              <div className="tweet-display">{finalTweet}</div>
            </div>
          </div>
        </div>
        
        <div className="right-column">
          <div className="sliders-section">
            <h3>Style Controls</h3>
            <div className="sliders-grid">
              {Object.entries(sliderConfig).map(([key, info]) => (
                <Slider
                  key={key}
                  info={info}
                  value={sliderValues[key]}
                  onChange={handleSliderChange(key)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwitterSliderApp;
