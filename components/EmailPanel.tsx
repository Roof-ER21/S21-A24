import React, { useState } from 'react';
import { generateEmail } from '../services/geminiService';
import Spinner from './Spinner';
import '../src/sa21-chat.css';

const EmailPanel: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const canGenerate = recipient.trim() && subject.trim() && keyPoints.trim() && !isLoading;

  const handleGenerateEmail = async () => {
    if (!canGenerate) return;

    setIsLoading(true);
    setError('');
    setGeneratedEmail('');
    setCopySuccess('');

    try {
      const emailDraft = await generateEmail(recipient, subject, keyPoints);
      setGeneratedEmail(emailDraft);
    } catch (err) {
      console.error('Error generating email:', err);
      setError('Failed to generate email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(generatedEmail).then(
      () => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      },
      (err) => {
        console.error('Failed to copy text: ', err);
        setCopySuccess('Failed to copy.');
        setTimeout(() => setCopySuccess(''), 2000);
      }
    );
  };

  return (
    <div className="sa21-root">
      <div className="sa21-header" style={{ position: 'relative' }}>
        <div className="sa21-logo-row">
          <div className="sa21-logo">ROOF ER</div>
          <div className="sa21-title">S21 FIELD // Email</div>
        </div>
        <div className="sa21-actions-bar">
          <a className="sa21-topbtn" href="#chat">Chat</a>
          <a className="sa21-topbtn" href="#image">Image</a>
          <a className="sa21-topbtn" href="#maps">Maps</a>
        </div>
      </div>
      <div className="sa21-main">
        <aside className="sa21-quick">
          <h3>Quick Actions</h3>
          <button className="qa-btn" onClick={() => setKeyPoints('- Confirm meeting for Friday at 2 PM.\n- Request agenda from their team.\n- Mention our Q3 report is attached.')}>Follow-up bullets</button>
          <button className="qa-btn" onClick={() => setSubject('Adjuster photo request')}>Photo request subject</button>
        </aside>
        <section className="sa21-chat">
          <div className="sa21-chat-header">Email Generator</div>
          <div className="sa21-page-body flex flex-col md:flex-row gap-4">
            {/* Left Side: Inputs */}
            <div className="md:w-1/2 flex flex-col space-y-4">
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient's Email"
                className="w-full p-2 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--s21-secondary)]/40 text-white"
              />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject Line"
                className="w-full p-2 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--s21-secondary)]/40 text-white"
              />
              <textarea
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="Enter key points, topics, or instructions for the email body... (e.g., - Confirm meeting for Friday at 2 PM. - Request agenda from their team. - Mention our Q3 report is attached.)"
                className="w-full p-2 bg-transparent border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--s21-secondary)]/40 text-white flex-1 resize-none"
              />
              <button
                onClick={handleGenerateEmail}
                disabled={!canGenerate}
                className="w-full sa21-btn send flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Spinner />}
                {isLoading ? 'Generating...' : 'Generate Email'}
              </button>
            </div>

            {/* Right Side: Result */}
            <div className="md:w-1/2 flex flex-col">
              <div className="flex-1 bg-white/5 rounded-lg p-4 overflow-y-auto border border-white/15 relative">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-zinc-300">Generated Draft</h3>
                  {generatedEmail && (
                    <button
                      onClick={handleCopyToClipboard}
                      className="text-sm sa21-topbtn"
                    >
                      {copySuccess || 'Copy'}
                    </button>
                  )}
                </div>
                {error && <p className="text-red-400">{error}</p>}
                {generatedEmail ? (
                  <p className="whitespace-pre-wrap text-zinc-200">{generatedEmail}</p>
                ) : (
                  !isLoading && <p className="text-zinc-500">Email draft will appear here.</p>
                )}
                {isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center text-zinc-400">
                      <Spinner /> Drafting email...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmailPanel;
