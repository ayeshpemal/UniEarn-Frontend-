import React from 'react';
import { GraduationCap } from 'lucide-react';
import { renderToString } from 'react-dom/server';

const GenerateFavicon = () => {
  // Render the GraduationCap icon to SVG string
  const iconSvg = renderToString(
    <GraduationCap color="#ffffff" fill="#3b82f6" size={32} />
  );
  
  // Create a data URL
  const dataUrl = `data:image/svg+xml;base64,${btoa(iconSvg)}`;
  
  return (
    <div className="p-4">
      <h1>Favicon Generator</h1>
      <p>Right-click on the icon below and select "Save Image As..." to save it as favicon.ico</p>
      <div className="bg-gray-900 p-4 inline-block rounded">
        <img src={dataUrl} alt="Favicon" width="64" height="64" />
      </div>
      <p>Place the file in your public folder</p>
    </div>
  );
};

export default GenerateFavicon;