// src/components/layout/Footer.jsx
import React from 'react';
import { Heart } from 'lucide-react';

export const Footer = () => {
  const footerLinks = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Contact Support', href: '#' }
  ];

  const handleLinkClick = (linkLabel) => {
    console.log(`Navigate to: ${linkLabel}`);
    // In a real app, you'd implement actual navigation here
  };

  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex justify-center items-center mb-4">
          <Heart className="w-6 h-6 text-red-400 mr-2" />
          <span className="text-xl font-semibold">MedRoute</span>
        </div>
        <p className="text-gray-400 mb-4">
          Intelligent hospital navigation and scheduling for better healthcare outcomes
        </p>
        <div className="flex justify-center space-x-6 text-sm">
          {footerLinks.map((link, index) => (
            <button
              key={index}
              className="hover:text-blue-400 transition-colors"
              onClick={() => handleLinkClick(link.label)}
            >
              {link.label}
            </button>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          © 2025 MedRoute. All rights reserved. | Powered by AI-driven healthcare technology
        </div>
      </div>
    </footer>
  );
};