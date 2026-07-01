import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { ArrowLeft } from 'lucide-react';

export default function PolicyPage() {
  const { type } = useParams();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    // Setup titles based on type
    if (type === 'privacy') setTitle('Privacy Policy');
    else if (type === 'terms') setTitle('Terms of Service');
    else if (type === 'refund') setTitle('Refund Policy');
    else setTitle('Policy');

    // Fetch the settings which contains policies
    const fetchPolicy = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get('/settings');
        if (res.data?.success && res.data?.data?.policies) {
          const policies = res.data.data.policies;
          if (type === 'privacy') setContent(policies.privacyPolicy || 'Privacy policy not found.');
          else if (type === 'terms') setContent(policies.termsAndConditions || 'Terms of service not found.');
          else if (type === 'refund') setContent(policies.refundPolicy || 'Refund policy not found.');
          else setContent('Policy not found.');
        }
      } catch (error) {
        console.error('Failed to fetch policies:', error);
        setContent('Error loading policies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPolicy();
  }, [type]);

  return (
    <div className="min-h-screen bg-[#030919] text-white py-12 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
        
        <div className="bg-[#0b1221] border border-[#1a2333] rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent opacity-50"></div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 pb-6 border-b border-[#1a2333]">
            {title}
          </h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-[#C89B3C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="prose prose-invert prose-lg max-w-none text-gray-300">
              {content.split('\n').map((paragraph, index) => (
                paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : <br key={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
