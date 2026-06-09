import React, { useState } from 'react';
import { Search, Star, Copy, Check, Paperclip, Image as ImageIcon, Send } from 'lucide-react';

// Mock chat messages
const initialMessages = [
  {
    id: 1,
    sender: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    subject: 'Issue with lawn mowing service',
    message: "The worker didn't show up for the scheduled appointment and I haven't received any communication about the delay.",
    time: '2 hours ago',
    role: 'Customer',
    unread: true,
    active: true
  },
  {
    id: 2,
    sender: 'Mike Rodriguez',
    email: 'mike.rodriguez@email.com',
    subject: 'Payment processing delay',
    message: "I completed a job 3 days ago but haven't received payment yet. Can you help check the status?",
    time: '5 hours ago',
    role: 'Worker',
    unread: false
  }
  // Add more chat messages as needed
];

const Support = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [reply, setReply] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(messages[0]);
  const [markedAsRead, setMarkedAsRead] = useState(false);
  const [markedAsResolved, setMarkedAsResolved] = useState(false);
  const [file, setFile] = useState(null);  // For holding the uploaded file
  const [image, setImage] = useState(null);  // For holding the uploaded image preview

  const getRoleBadgeColor = (role) => {
    return role === 'Customer' ? 'bg-blue-500' : 'bg-green-500';
  };

  // Function to handle sending a reply message
  const handleSendReply = () => {
    if (reply.trim() !== '') {
      const newMessage = {
        id: messages.length + 1,
        sender: 'Support Team',
        email: 'support@yardpro.com',
        subject: `Re: ${selectedMessage.subject}`,
        message: reply,
        time: 'Just now',
        role: 'Support Team',
        unread: true,
        active: true,
        file: file ? URL.createObjectURL(file) : null,  // Attach file if present
        image: image ? URL.createObjectURL(image) : null  // Attach image if present
      };
      setMessages([...messages, newMessage]);  // Add new reply message to the list
      setReply('');  // Clear the reply field
      setFile(null);  // Clear file after sending
      setImage(null);  // Clear image after sending
    }
  };

  // Function to handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Function to handle image selection (only image files)
  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage && selectedImage.type.startsWith('image/')) {
      setImage(selectedImage);
    } else {
      alert('Please select a valid image file.');
    }
  };

  return (
    <div className="flex h-screen mt-20 bg-gray-50 dark:bg-[#13131F] transition-colors duration-300">
      {/* Left Sidebar - Messages List */}
      <div className="flex flex-col bg-white dark:bg-[#1E1E2D] border-r border-gray-200 dark:border-gray-800 w-96 transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#1A1A4B] dark:text-white transition-colors">Messages</h2>
            <span className="px-2 py-1 text-xs text-white bg-gray-900 dark:bg-indigo-600 rounded-full">{messages.filter(msg => msg.unread).length} unread</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full py-2 pr-4 text-sm bg-white dark:bg-[#2D2D3F] border border-gray-300 dark:border-gray-700 rounded-lg pl-9 text-[#1A1A4B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>


        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedMessage(message)}
              className={`p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2D2D3F] transition-colors ${
                selectedMessage?.id === message.id ? 'bg-blue-50 dark:bg-indigo-600/10' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`${getRoleBadgeColor(message.role)} text-white text-xs px-2 py-1 rounded font-medium`}>
                  {message.role}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#1A1A4B] dark:text-white transition-colors">{message.sender}</span>
                      {message.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                  <div className="mb-1 text-xs text-gray-500">{message.email}</div>
                  <div className="mb-1 text-sm font-medium text-[#1A1A4B] dark:text-gray-200 transition-colors">{message.subject}</div>
                  <div className="text-xs text-gray-500 truncate">{message.message}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Message Detail */}
      <div className="flex flex-col flex-1 bg-white dark:bg-[#1E1E2D] transition-colors">
        {/* Message Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`${getRoleBadgeColor(selectedMessage.role)} text-white text-xs px-3 py-1 rounded font-medium`}>
                {selectedMessage.role}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A4B] dark:text-white transition-colors">{selectedMessage.sender}</h3>
                <div className="text-sm text-gray-500">
                  {selectedMessage.email}
                  <span className="mx-2">•</span>
                  Received {selectedMessage.time}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-[#2D2D3F]">
                <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-[#2D2D3F]">
                <Star className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <h2 className="mb-4 text-xl font-semibold text-[#1A1A4B] dark:text-white transition-colors">{selectedMessage.subject}</h2>


          <div className="flex gap-3">
            <button
              onClick={() => setMarkedAsRead(!markedAsRead)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                markedAsRead
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 dark:bg-[#2D2D3F] text-white hover:bg-gray-800 dark:hover:bg-[#3D3D4F]'
              }`}
            >
              <Check className="w-4 h-4" />
              Mark as Read
            </button>
            <button
              onClick={() => setMarkedAsResolved(!markedAsResolved)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                markedAsResolved
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-600 dark:bg-[#2D2D3F] text-white hover:bg-gray-700 dark:hover:bg-[#3D3D4F]'
              }`}
            >
              <Check className="w-4 h-4" />
              Mark as Resolved
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2D2D3F] transition-colors border border-gray-300 dark:border-gray-700 rounded-lg text-[#1A1A4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3D3D4F]">
              <Copy className="w-4 h-4" />
              Copy Contact
            </button>
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl">
            <p className="mb-4 text-gray-700 dark:text-gray-300 transition-colors">Hi YardPro Support Team,</p>
            <p className="mb-4 text-gray-700 dark:text-gray-300 transition-colors">{selectedMessage.message}</p>
            <p className="mb-1 text-gray-700 dark:text-gray-300 transition-colors">Best regards,</p>
            <p className="font-medium text-gray-700 dark:text-white transition-colors">{selectedMessage.sender}</p>
          </div>
        </div>

        {/* Reply Section */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 transition-colors">
          <h3 className="mb-4 font-semibold text-[#1A1A4B] dark:text-white transition-colors">Send Reply</h3>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your response..."
            className="w-full h-32 p-4 bg-white dark:bg-[#2D2D3F] border border-gray-300 dark:border-gray-700 rounded-lg resize-none text-[#1A1A4B] dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />


          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="imageInput"
              />
              <label htmlFor="imageInput" className="p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2D2D3F]">
                <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2D2D3F]">
                <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white dark:bg-[#2D2D3F] transition-colors border border-gray-300 dark:border-gray-700 rounded-lg text-[#1A1A4B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3D3D4F]">
                Save Draft
              </button>
              <button
                onClick={handleSendReply}
                className="flex items-center gap-2 px-6 py-2 text-white transition-colors bg-green-700 dark:bg-indigo-600 rounded-lg hover:bg-green-800 dark:hover:bg-indigo-700"
              >
                Send Reply
              </button>
            </div>
          </div>


          {/* Preview Section for Image/File */}
          {image && (
            <div className="mt-4">
              <p className="text-sm text-gray-700">Preview Image:</p>
              <img src={URL.createObjectURL(image)} alt="Preview" className="max-w-full mt-2" />
            </div>
          )}
          {file && (
            <div className="mt-4">
              <p className="text-sm text-gray-700">File attached: {file.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;
