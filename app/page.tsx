'use client';

import { useRef, useState } from 'react';

interface Response {
  message: string;
  response: string;
  imageUrl?: string;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState<Response[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tempImageUrl = image ? URL.createObjectURL(image) : undefined;
    const newResponse: Response = { message, response: 'Loading...', imageUrl: tempImageUrl };
    setResponses([...responses, newResponse]);

    const formData = new FormData();
    formData.append('message', message);
    if (image) {
      formData.append('image', image);
    }

    setMessage('');
    setImage(null);
    setImagePreview(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Update the last response with the actual AI response
      setResponses((prevResponses) => {
        const updatedResponses = [...prevResponses];
        updatedResponses[updatedResponses.length - 1] = {
          ...newResponse,
          response: data.response,
        };
        return updatedResponses;
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Chat AI</h1>
      <div className="w-full max-w-md bg-white rounded shadow p-4 mb-4 overflow-auto" style={{ maxHeight: '60vh' }}>
        {responses.map((res, index) => (
          <div key={index} className="mb-4 p-2 border-b border-gray-200">
            <p className="text-sm text-gray-600"><strong>You:</strong> {res.message}</p>
            {res.imageUrl && <img src={res.imageUrl} alt="Uploaded" className="mt-2 max-w-full h-auto" />}
            <p className="text-sm text-gray-600 mt-2"><strong>AI:</strong> {res.response}</p>
          </div>
        ))}
      </div>
      {isLoading && (
        <div className="mb-4 w-full max-w-md bg-white rounded shadow p-4 flex justify-center items-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded shadow p-4 fixed bottom-0 left-0 right-0 mx-auto mb-4">
        <div
          className="w-full p-2 border rounded mb-2 bg-gray-50"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ minHeight: '100px', border: '2px dashed #ccc' }}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-auto rounded" />
          ) : (
            <p className="text-center text-gray-500">Drag and drop an image here</p>
          )}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          required
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="file"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImage(e.target.files[0]);
              setImagePreview(URL.createObjectURL(e.target.files[0]));
            }
          }}
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200">Send</button>
      </form>
    </div>
  );
}
