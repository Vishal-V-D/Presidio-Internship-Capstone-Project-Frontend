import React, { useState,  type ChangeEvent, type FormEvent } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

interface FormData {
  name: string;
  email: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-theme-primary px-6 py-16 animate-fade-in-slide-up">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 bg-theme-secondary rounded-2xl shadow-3xl overflow-hidden">
        
      
        <div className="p-10 flex flex-col justify-center bg-cyan-600 text-white">
          <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
          <p className="text-white/90 mb-6 leading-relaxed">
            We'd love to hear from you! Whether you have a question, feedback, or partnership idea — our team is ready to connect.
          </p>

          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-xl" /> support@smartlearn.com
            </li>
            <li className="flex items-center gap-3">
              <FaPhone className="text-xl" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-xl" /> Chennai, India
            </li>
          </ul>
        </div>

        <div className="p-10">
          <h2 className="text-2xl font-bold text-theme-primary mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium text-theme-secondary">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full border border-theme rounded-lg px-4 py-3 bg-theme-primary text-theme-primary focus:outline-none focus:border-theme-accent transition"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-theme-secondary">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-theme rounded-lg px-4 py-3 bg-theme-primary text-theme-primary focus:outline-none focus:border-theme-accent transition"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-theme-secondary">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                rows={4}
                className="w-full border border-theme rounded-lg px-4 py-3 bg-theme-primary text-theme-primary focus:outline-none focus:border-theme-accent transition resize-none"
              />
            </div>

            <button
              type="submit"
              className="button-theme w-full mt-3"
            >
              {submitted ? "Message Sent " : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
