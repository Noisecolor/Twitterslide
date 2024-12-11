import React from 'react';

const Slider = ({ info, value, onChange }) => (
  <div className="slider-container">
    <div className="slider-label">
      <span className="slider-name">{info.label}</span>
      <span className="slider-value">{value}%</span>
    </div>
    <div className="slider-description">{info.description}</div>
    <input 
      className="slider"
      type="range" 
      min="0" 
      max="100" 
      step="10" 
      value={value} 
      onChange={onChange}
      aria-label={info.label}
    />
  </div>
);

export default Slider;
