import React, { useState } from "react";

export default function Contact() {
  const [msg, setMsg] = useState("");

  return (
    <div className="page">
      <div className="page-title">
        <span className="eyebrow">WE'RE HERE TO HELP</span>
        <h1>Contact Us</h1>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <h2>Get in touch</h2>
          <p>📞 +92 300 1234567</p>
          <p>✉ info@healthpharmacy.pk</p>
          <p>📍 123 Main Road, Faisalabad, Pakistan</p>
          <p>🕘 Mon–Sat, 9 AM – 9 PM</p>
        </div>

        <form
          className="form-card"
          onSubmit={(e) => {
            e.preventDefault();
            setMsg("Thanks! Your message has been received.");
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="w-full">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                required
                className="block w-full h-11 px-3 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="w-full">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="block w-full h-11 px-3 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="w-full md:col-span-2">
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Message
              </label>
              <textarea
                rows="5"
                placeholder="Write your message..."
                required
                className="block w-full min-h-[120px] px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 outline-none resize-y focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="w-full md:col-span-2">
              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Send Message
              </button>
            </div>

            {msg && (
              <div className="w-full md:col-span-2 notice">
                {msg}
              </div>
            )}

          </div>
        </form>
      </div>
    </div>
  );
}