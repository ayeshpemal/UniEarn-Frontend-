import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Uni Earn. All Rights Reserved.</p>
        <nav className="flex space-x-4 mt-2 md:mt-0">
          {/* <a href="/privacy" className="hover:text-gray-400 transition">Privacy Policy</a>
          <a href="/terms" className="hover:text-gray-400 transition">Terms of Service</a> */}
          <a href="/contact-us" className="hover:text-gray-400 transition">Contact Us</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
