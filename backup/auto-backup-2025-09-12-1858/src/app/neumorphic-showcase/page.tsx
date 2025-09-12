"use client";

import { useState } from 'react';

export default function NeumorphicShowcase() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const components = [
    {
      name: "button1",
      title: "Basic Neumorphic Button",
      description: "Standard button with neumorphic shadow effects"
    },
    {
      name: "toggle1", 
      title: "Neumorphic Toggle Switch",
      description: "Animated toggle with inset shadows"
    },
    {
      name: "deepteethfield",
      title: "Input Field",
      description: "Text input with inset neumorphic effect"
    },
    {
      name: "pressedcard1",
      title: "Pressed Card",
      description: "Card with inset shadow (pressed state)"
    },
    {
      name: "hoverbutton1",
      title: "Hover Button",
      description: "Interactive button with hover animations"
    },
    {
      name: "punchcard1",
      title: "Raised Card",
      description: "Card with raised neumorphic effect"
    },
    {
      name: "boarderanimatedcard",
      title: "Animated Border Card",
      description: "Card with animated colored border effect"
    },
    {
      name: "sociallink1",
      title: "Social Link Button",
      description: "Icon button for social media links"
    },
    {
      name: "beatinglike",
      title: "Beating Heart Button",
      description: "Animated like button with heart effect"
    },
    {
      name: "dynamichovercard",
      title: "Dynamic Hover Card",
      description: "Card with dynamic hover interactions"
    },
    {
      name: "dynamichoverprof",
      title: "Dynamic Profile Card",
      description: "Profile card with hover effects"
    },
    {
      name: "titlecard1",
      title: "Title Card",
      description: "Card designed for titles and headers"
    },
    {
      name: "animatedbuttonbig",
      title: "Large Animated Button",
      description: "Big button with complex animations"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            MyHustle Neumorphic Design System
          </h1>
          <p className="text-xl text-gray-600">
            Visual reference for all neumorphic UI components
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {components.map((component) => (
            <div
              key={component.name}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200"
              onClick={() => setSelectedComponent(selectedComponent === component.name ? null : component.name)}
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {component.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {component.description}
                </p>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-6 min-h-[120px] flex items-center justify-center">
                <ComponentPreview componentName={component.name} />
              </div>
              
              <div className="mt-4 text-center">
                <span className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">
                  {component.name}
                </span>
              </div>
              
              {selectedComponent === component.name && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-700 mb-2 font-semibold">Usage:</p>
                  <p className="text-xs text-gray-600">
                    Copy the CSS and HTML from the neumorphic file for implementation.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Implementation Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Color Palette</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-200 rounded border"></div>
                  <span className="text-sm">#e0e0e0 - Base background</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-300 rounded border"></div>
                  <span className="text-sm">#bebebe - Shadow dark</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white rounded border"></div>
                  <span className="text-sm">#ffffff - Shadow light</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Key Properties</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Dual shadows: dark bottom-right, light top-left</li>
                <li>• Subtle border-radius for soft edges</li>
                <li>• Inset shadows for pressed states</li>
                <li>• Smooth transitions for interactions</li>
                <li>• Consistent color temperature</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentPreview({ componentName }: { componentName: string }) {
  const previewStyles = `
    /* button1 */
    .neu-button1 {
      color: #090909;
      padding: 0.7em 1.7em;
      font-size: 14px;
      border-radius: 0.5em;
      background: #e8e8e8;
      cursor: pointer;
      border: 1px solid #e8e8e8;
      transition: all 0.3s;
      box-shadow: 6px 6px 12px #c5c5c5, -6px -6px 12px #ffffff;
    }
    .neu-button1:hover {
      border: 1px solid white;
      box-shadow: 4px 4px 12px #c5c5c5, -4px -4px 12px #ffffff;
    }

    /* toggle1 */
    .neu-switch {
      font-size: 14px;
      position: relative;
      display: inline-block;
      width: 3.5em;
      height: 2em;
    }
    .neu-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .neu-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      box-shadow: inset 2px 5px 10px rgba(0,0,0,0.3);
      transition: .4s;
      border-radius: 5px;
    }
    .neu-slider:before {
      position: absolute;
      content: "";
      height: 1.4em;
      width: 0.1em;
      border-radius: 0px;
      left: 0.3em;
      bottom: 0.3em;
      background-color: white;
      transition: .4s;
    }

    /* deepteethfield */
    .neu-input {
      border: none;
      outline: none;
      border-radius: 15px;
      padding: 1em;
      background-color: #ccc;
      box-shadow: inset 2px 5px 10px rgba(0,0,0,0.3);
      transition: 300ms ease-in-out;
      font-size: 12px;
      width: 140px;
    }

    /* pressedcard1 */
    .neu-pressed-card {
      width: 80px;
      height: 100px;
      border-radius: 20px;
      background: lightgrey;
      box-shadow: rgba(50, 50, 93, 0.25) 0px 20px 30px -8px inset, rgba(0, 0, 0, 0.3) 0px 12px 18px -12px inset;
    }

    /* hoverbutton1 */
    .neu-hover-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-family: inherit;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #7e97b8;
      background-color: #e0e8ef;
      border: 2px solid rgba(255, 255, 255, 0.333);
      border-radius: 20px;
      padding: 12px 16px;
      transition: 0.2s;
      box-shadow: -3px -1px 12px 0px #ffffff, 3px 1px 12px 0px rgb(95 157 231 / 48%);
    }

    /* punchcard1 */
    .neu-punch-card {
      width: 80px;
      height: 100px;
      border-radius: 20px;
      background: #e0e0e0;
      box-shadow: 10px 10px 20px #bebebe, -10px -10px 20px #ffffff;
    }

    /* boarderanimatedcard */
    .neu-animated-card {
      position: relative;
      width: 80px;
      height: 100px;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 15px 15px 40px #bebebe, -15px -15px 40px #ffffff;
      background: rgba(255, 255, 255, .95);
    }

    /* sociallink1 */
    .neu-social-btn {
      display: grid;
      place-items: center;
      background: #e3edf7;
      padding: 1em;
      border-radius: 10px;
      box-shadow: 4px 4px 8px -1px rgba(0,0,0,0.15), -4px -4px 8px -1px rgba(255,255,255,0.7);
      border: 1px solid rgba(0,0,0,0);
      cursor: pointer;
      transition: transform 0.5s;
      width: 50px;
      height: 50px;
    }

    /* General card styles */
    .neu-title-card {
      width: 80px;
      height: 60px;
      border-radius: 15px;
      background: #e0e0e0;
      box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #666;
    }

    .neu-big-button {
      padding: 1em 2em;
      font-size: 12px;
      border-radius: 15px;
      background: #e0e0e0;
      box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
      border: none;
      cursor: pointer;
      transition: all 0.3s;
      color: #333;
    }
  `;

  const getPreviewComponent = () => {
    switch (componentName) {
      case "button1":
        return <button className="neu-button1">Button</button>;
      
      case "toggle1":
        return (
          <label className="neu-switch">
            <input type="checkbox" />
            <span className="neu-slider"></span>
          </label>
        );
      
      case "deepteethfield":
        return <input type="text" className="neu-input" placeholder="Username" />;
      
      case "pressedcard1":
        return <div className="neu-pressed-card"></div>;
      
      case "hoverbutton1":
        return (
          <button className="neu-hover-button">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            Explore
          </button>
        );
      
      case "punchcard1":
        return <div className="neu-punch-card"></div>;
      
      case "boarderanimatedcard":
        return <div className="neu-animated-card"></div>;
      
      case "sociallink1":
        return (
          <button className="neu-social-btn">
            <svg width="24" height="24" fill="#0092E4" viewBox="0 0 24 24">
              <path d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z"></path>
            </svg>
          </button>
        );
      
      case "beatinglike":
        return (
          <button className="neu-big-button">
            ❤️ Like
          </button>
        );
      
      case "titlecard1":
        return <div className="neu-title-card">Title</div>;
      
      case "animatedbuttonbig":
        return <button className="neu-big-button">Big Button</button>;
      
      default:
        return <div className="neu-title-card">Preview</div>;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      {getPreviewComponent()}
    </>
  );
}