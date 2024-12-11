const getStyleDescription = (value, envKey) => {
  // Extract the base key (e.g., REACT_APP_PROMPT_FORMALITY -> FORMALITY)
  const baseKey = envKey.replace('REACT_APP_PROMPT_', '');
  // Get both high and low descriptions to interpolate between them
  const highKey = `REACT_APP_STYLE_${baseKey}_HIGH`;
  const lowKey = `REACT_APP_STYLE_${baseKey}_LOW`;
  return value > 50 ? process.env[highKey] : process.env[lowKey];
};

const formatPrompt = (value, envKey) => {
  const promptTemplate = process.env[envKey];
  if (!promptTemplate) return '';
  
  const styleDescription = getStyleDescription(value, envKey);
  
  // Add appropriate emphasis based on value
  let emphasis = '';
  if (value === 0 || value === 100) {
    emphasis = ' This is an ABSOLUTE REQUIREMENT at the MAXIMUM/MINIMUM level and MUST be extremely evident in the output.';
  } else if (value <= 10 || value >= 90) {
    emphasis = ' It is CRUCIAL to follow this requirement at this extreme level.';
  }
  
  return promptTemplate.replace(/%d/g, value).replace(/%s/, styleDescription) + emphasis;
};

export const generatePrompt = (text, sliderValues) => {
  // Import sliderConfig to get the environment key mappings
  const { sliderConfig } = require('./sliderConfig');
  
  const instructions = Object.entries(sliderValues)
    .map(([key, value]) => {
      const envKey = sliderConfig[key]?.envKey;
      if (!envKey) return '';
      
      // Add stronger emphasis for values at 0 or 100
      if (value === 0) {
        return `EXTREMELY IMPORTANT - MINIMUM LEVEL: ${formatPrompt(value, envKey)}`;
      } else if (value === 100) {
        return `EXTREMELY IMPORTANT - MAXIMUM LEVEL: ${formatPrompt(value, envKey)}`;
      }
      return formatPrompt(value, envKey);
    })
    .filter(instruction => instruction !== '');

  let prompt = `Generate a tweet based on this text: "${text}".\n\n`;
  prompt += "Critical style requirements that MUST ALL be followed:\n";
  prompt += instructions.join('\n');
  prompt += "\n\nIt is ABSOLUTELY ESSENTIAL that the generated tweet simultaneously satisfies ALL of these style requirements. Pay EXTRA SPECIAL attention to any requirements marked as EXTREMELY IMPORTANT - these represent style values at their absolute minimum (0%) or maximum (100%) and must be reflected very strongly in the output.";
  
  return prompt;
};
