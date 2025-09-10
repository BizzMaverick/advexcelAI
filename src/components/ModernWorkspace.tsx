import { useState, useRef, useEffect } from 'react';
import { DataDetectionService } from '../services/dataDetectionService';
import { EnhancedAiService } from '../services/enhancedAiService';
import bedrockService from '../services/bedrockService';
import ChartComponent from './ChartComponent';
import emailjs from '@emailjs/browser';

import * as XLSX from 'xlsx';

interface User {
  email: string;
  name: string;
}

interface ModernWorkspaceProps {
  user: User;
  onLogout: () => void;
}

export default function ModernWorkspace({ user, onLogout }: ModernWorkspaceProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<any[][]>([]);
  const [dataStructure, setDataStructure] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [pivotTables, setPivotTables] = useState<any[]>([]);
  const [selectedPivot, setSelectedPivot] = useState<number | null>(null);
  const [showPivotDropdown, setShowPivotDropdown] = useState(false);
  const [pivotFilters, setPivotFilters] = useState<{[key: string]: string}>({});
  const [showAdvancedPivot, setShowAdvancedPivot] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [scheduledReports, setScheduledReports] = useState<any[]>([]);
  const [pivotPrompt, setPivotPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiResultData, setAiResultData] = useState<any[][] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'heatmap'>('bar');
  const [sortColumn, setSortColumn] = useState<number>(-1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'url("/basic-bg.gif") center center / cover no-repeat fixed',
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1
      }} />
      
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(120, 219, 255, 0.3)',
        padding: window.innerWidth <= 768 ? '15px 20px' : '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #78dbff 0%, #ff77c6 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '700',
            color: '#000',
            boxShadow: '0 0 30px rgba(120, 219, 255, 0.5)'
          }}>
            AI
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #78dbff 0%, #ff77c6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>AdvExcel AI</h1>
            <p style={{ 
              margin: 0, 
              fontSize: '12px', 
              opacity: 0.7,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: '500'
            }}>Advanced Data Analytics</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            User: {user.name}
          </div>
          <button
            onClick={() => {
              localStorage.setItem('use_new_interface', 'false');
              window.location.reload();
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(120, 219, 255, 0.2) 0%, rgba(255, 119, 198, 0.2) 100%)',
              border: '1px solid rgba(120, 219, 255, 0.5)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Classic Mode
          </button>
          <button
            onClick={onLogout}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 77, 77, 0.2) 0%, rgba(255, 119, 198, 0.2) 100%)',
              border: '1px solid rgba(255, 77, 77, 0.5)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: window.innerWidth <= 768 ? '20px' : '20px 40px', position: 'relative', zIndex: 100 }}>
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          marginBottom: '24px',
          maxWidth: '1600px',
          margin: '0 auto 24px auto'
        }}>
          
          {/* File Upload */}
          <div style={{ 
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <input
              ref={fileInputRef}
              type="file" 
              accept=".xlsx,.xls,.csv" 
              style={{ 
                width: '100%',
                padding: '12px', 
                border: '1px solid white', 
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* AI Input */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask AI about your data..."
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid white', 
                  borderRadius: '6px',
                  color: 'white',
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <button 
              disabled={aiLoading || !selectedFile || !prompt.trim()}
              style={{ 
                background: 'transparent',
                border: '1px solid white',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: aiLoading || !selectedFile || !prompt.trim() ? 'not-allowed' : 'pointer',
                opacity: aiLoading || !selectedFile || !prompt.trim() ? 0.5 : 1
              }}
            >
              {aiLoading ? 'Processing...' : 'Ask'}
            </button>
          </div>
        </div>

        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
          gap: '20px',
          width: '100%'
        }}>
          {/* Left Panel */}
          <div style={{
            width: window.innerWidth <= 768 ? '100%' : '280px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h4 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '12px', 
              fontWeight: '600',
              color: 'white'
            }}>
              🚀 Quick Actions
            </h4>
          </div>

          {/* Right Panel */}
          <div style={{
            flex: 1,
            minWidth: 0,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.3 }}>📈</div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600' }}>
                Ready for Analysis
              </h3>
              <p style={{ margin: 0, fontSize: '16px', opacity: 0.7, maxWidth: '300px' }}>
                Upload your Excel or CSV file to get started with AI-powered data insights
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer with Legal Pages */}
      <footer style={{
        background: 'transparent',
        color: '#ffffff',
        padding: '20px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <a onClick={() => {
            setLegalContent({ 
              title: 'About Us', 
              content: `About the Creator:

Yadunandan Katragadda is a full-stack developer and AI enthusiast passionate about creating intelligent solutions that simplify complex data analysis. With expertise in cloud technologies and machine learning, he built AdvExcel AI to democratize advanced data analytics for everyone.

As an AWS Solutions Architect and AI/ML Engineer, Yadunandan combines deep technical knowledge with a user-centric approach to deliver powerful yet accessible tools for data professionals and business users alike.

His vision is to make advanced data analytics as simple as having a conversation, enabling anyone to unlock insights from their data without requiring technical expertise.

About AdvExcel AI:

AdvExcel AI is an intelligent data analysis platform that transforms how you work with Excel and CSV files. Powered by Amazon Web Services and advanced AI, it brings enterprise-level analytics to your fingertips.

Our platform uses natural language processing to let you ask questions in plain English, get insights, create charts, and analyze patterns without complex formulas or technical expertise.

Built on AWS infrastructure for reliability, security, and scalability, AdvExcel AI processes your data securely and never permanently stores your sensitive information.

Key Features:
• AI-powered natural language processing for plain English queries
• Advanced pivot tables and statistical analysis
• Beautiful charts and data visualizations
• Predictive insights and trend analysis
• Data quality assessment and cleaning suggestions
• Multi-sheet Excel workbook support
• Secure cloud processing with AWS infrastructure

Our Mission:

To democratize advanced data analytics by making AI-powered insights accessible to everyone, regardless of technical background.

We believe that powerful data analysis shouldn't require years of training or expensive software. AdvExcel AI empowers businesses and individuals to make data-driven decisions effortlessly.

Technology Stack:
• Amazon Web Services (AWS) for cloud infrastructure
• AWS Bedrock for AI and machine learning capabilities
• React and TypeScript for the user interface
• AWS Cognito for secure user authentication
• Razorpay for secure payment processing

Contact Us:
Have questions or feedback? We'd love to hear from you! Contact us at contact@advexcel.online` 
            });
            setShowLegalModal(true);
          }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>About Us</a>
          <a onClick={() => window.location.href = '/payments'} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Pricing</a>
          <a onClick={() => {
            setLegalContent({ 
              title: 'Privacy Policy', 
              content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

What Information We Collect:
• Your name and email address when you create an account
• Excel/CSV files you upload for processing
• Usage data to improve our service

How We Use Your Information:
• Process your files to provide AI-powered analysis
• Maintain your account and authentication
• Improve our services and user experience

Data Security:
• We use Amazon Web Services (AWS) for secure processing
• Your data is encrypted and protected with industry standards
• Files are processed temporarily and not permanently stored
• Account data is kept secure until you delete your account

Data Sharing:
• We do not sell or share your personal information
• We only use AWS services (Cognito, Bedrock) for processing
• No third-party access to your data

Your Rights:
• Access, modify, or delete your personal information
• Request account deletion at any time
• Withdraw consent for data processing

Contact Us:
For privacy questions, email: contact@advexcel.online` 
            });
            setShowLegalModal(true);
          }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Privacy Policy</a>
          <a onClick={() => {
            setLegalContent({ 
              title: 'Terms of Service', 
              content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

By using Excel AI, you agree to these terms.

What Excel AI Does:
• AI-powered analysis of Excel and CSV files
• Data sorting, filtering, and mathematical calculations
• Duplicate detection and data manipulation
• Powered by Amazon Web Services

Your Responsibilities:
• Only upload files you have permission to process
• Don't upload sensitive personal data or confidential information
• Use the service legally and responsibly
• Keep your account credentials secure
• Don't attempt to hack or compromise the service

Prohibited Uses:
• Illegal, harmful, or malicious content
• Files with viruses or malware
• Unauthorized access attempts
• Commercial use without permission
• Violating applicable laws

Service Terms:
• Service provided "as-is" without warranties
• We may modify or discontinue service anytime
• No guarantee of uninterrupted access
• Limited liability for service issues

Changes:
• We may update these terms anytime
• Continued use means you accept changes

Contact: contact@advexcel.online` 
            });
            setShowLegalModal(true);
          }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Terms of Service</a>
          <a onClick={() => {
            setLegalContent({ 
              title: 'Cookie Policy', 
              content: `Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

What Are Cookies:
Small text files stored on your device to make websites work better.

How We Use Cookies:
• Keep you logged in (authentication)
• Remember your preferences
• Analyze usage to improve our service
• Ensure security and prevent fraud

Types of Cookies:

Essential Cookies (Required):
• AWS Cognito authentication cookies
• Security and session management
• Application functionality

Analytical Cookies (Optional):
• Usage analytics and performance monitoring
• Feature tracking to improve services

Third-Party Cookies:
• Amazon Web Services for authentication and security
• No other third-party cookies

Managing Cookies:
• Control cookies through your browser settings
• View, delete, or block cookies as needed
• Disabling essential cookies may break functionality
• Session cookies deleted when browser closes

Contact: contact@advexcel.online` 
            });
            setShowLegalModal(true);
          }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Cookie Policy</a>
          <a onClick={() => {
            setLegalContent({ 
              title: 'Support & Help', 
              content: `Getting Started:
• Create account with your email
• Upload Excel (.xlsx, .xls) or CSV files
• Use natural language commands
• Apply results or download new files

Supported Files:
• Excel files (.xlsx, .xls)
• CSV files (.csv)
• Large files truncated to 1000 rows

Key Features:
• Sort data by any column
• Find and remove duplicates
• Math operations (sum, average, count, min, max)
• Data filtering and search
• Text formatting (bold, italic, colors)
• Format painter and undo/redo

Common Commands:
• "Sort by column A"
• "Find duplicates"
• "Sum column B"
• "Show data for [item]"
• "Replace [old] with [new]"

Troubleshooting:
• Upload issues: Check file format, refresh page
• AI not responding: Upload file first, use clear commands
• Formatting issues: Select cells first, use Ctrl+click

Best Practices:
• Use descriptive column headers
• Keep reasonable file sizes
• Be specific in commands
• Review results before applying

Need Help:
• Use feedback button (👍) for quick questions
• Email: contact@advexcel.online
• Include browser type and specific issue details

System Requirements:
• Modern web browser
• Internet connection
• JavaScript and cookies enabled` 
            });
            setShowLegalModal(true);
          }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Support</a>
          <a onClick={() => {
            setLegalContent({ 
              title: 'Contact Us', 
              content: `Quick Support:
• Click the feedback button (👍) in bottom right corner
• Describe your issue or question
• We'll respond promptly

Email Contact:
• contact@advexcel.online
• Response time: 24-48 hours
• For all inquiries: technical support, questions, business, partnerships

Before Contacting:
• Try troubleshooting steps in Support section
• Note your browser type and version
• Describe specific steps that caused the issue
• Include any error messages

Feature Requests:
• Use feedback button with "Feature Request"
• Email with subject "Feature Request"
• Include detailed descriptions

Privacy & Security:
• Email with subject "Privacy/Security"
• Reference our Privacy Policy
• Report security issues responsibly

Business Hours:
• Monday-Friday, 9 AM - 6 PM EST
• Feedback monitored 24/7 for urgent issues
• Weekend response times may vary

About Us:
• Excel AI Development Team
• Powered by Amazon Web Services
• Cloud-based for global accessibility

We're committed to excellent support and continuous improvement based on your feedback!` 
            });
            setShowLegalModal(true);
          }} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Contact Us</a>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#cccccc' }}>
          © 2024 Excel AI. All rights reserved. | Powered by AWS
        </p>
      </footer>
      
      {/* Legal Modal */}
      {showLegalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'transparent',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '70vh',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', marginBottom: '16px', textAlign: 'center' }}>
              <h3 style={{ margin: 0, color: '#232f3e' }}>{legalContent.title}</h3>
              <button
                onClick={() => setShowLegalModal(false)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ color: 'white', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line', fontSize: '14px', maxHeight: 'calc(70vh - 120px)', overflowY: 'scroll', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>{legalContent.content}</div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setShowLegalModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Feedback Button */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        <div 
          onClick={() => setShowFeedbackBox(!showFeedbackBox)}
          style={{
            width: '80px',
            height: '80px',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            transition: 'all 0.3s ease',
            backgroundImage: 'url(/feedback.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          title="Give Feedback"
        >
        </div>
        
        {showFeedbackBox && (
          <div style={{
            position: 'absolute',
            bottom: '70px',
            right: '0',
            width: '300px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '16px' }}>Send Feedback</h4>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts about AdvExcel..."
              style={{
                width: '100%',
                height: '80px',
                border: '1px solid #d5d9d9',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '14px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={async () => {
                  if (feedbackText.trim()) {
                    try {
                      await emailjs.send(
                        'service_gyuegyb',
                        'template_16urb42',
                        {
                          user_email: user.email,
                          user_name: user.name,
                          message: feedbackText,
                          to_email: 'contact@advexcel.online'
                        },
                        '3xCIlXaFmm79QkBaB'
                      );
                      alert('Thank you for your feedback! We have received your message and will respond soon.');
                      setFeedbackText('');
                      setShowFeedbackBox(false);
                    } catch (error) {
                      console.error('Failed to send feedback:', error);
                      alert('Sorry, there was an error sending your feedback. Please try again or email us directly at contact@advexcel.online');
                    }
                  }
                }}
                style={{
                  background: 'white',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Send
              </button>
              <button
                onClick={() => {
                  setShowFeedbackBox(false);
                  setFeedbackText('');
                }}
                style={{
                  background: '#f5f5f5',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}