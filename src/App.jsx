import React, { useState } from 'react';
import { MdAttachFile } from 'react-icons/md';
import { RiDeleteBinLine } from 'react-icons/ri';
import axios from 'axios';
import './App.css'; // Import the CSS file

const FileUploadIcon = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [progress, setProgress] = useState({});

  async function waitFor(seconds) {
    for (let i = 1; i <= seconds; i++) {
        console.log(`Waiting for ${i} second(s)...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async function sendRequests() {
    try {
        console.log("Sending request to run the script...");
        const runResponse = await axios.get('https://main-tool-code2.onrender.com/run-script');
        console.log("Response from run-script:", runResponse.data);

        await waitFor(20);

        console.log("Sending request to get the result...");
        let getResultResponse = await axios.get('https://main-tool-code2.onrender.com/get-result');
        console.log("Response from get-result:", getResultResponse.data);

        let data = getResultResponse.data;

        await waitFor(30);

        getResultResponse = await axios.get('https://main-tool-code2.onrender.com/get-result');
        console.log("Response from second get-result:", getResultResponse.data);

        await waitFor(20);

        getResultResponse = await axios.get('https://main-tool-code2.onrender.com/get-result');
        console.log("Response from third get-result:", getResultResponse.data);

        await waitFor(20);

        getResultResponse = await axios.get('https://main-tool-code2.onrender.com/get-result');
        console.log("Response from fourth get-result:", getResultResponse.data);

        const final_formData = getResultResponse.data.Batch_data_to_be_filled;
        const final_formDataArray = getResultResponse?.data?.Batch_data_to_be_filled || [];
        
        setFormData(prevData => ({ ...prevData, ...final_formData }));
        setFormData(prevData => ({ ...prevData, ...final_formDataArray }));

    } catch (error) {
        console.error("Error occurred:", error);
    }
  }

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length + selectedFiles.length > 6) {
      alert('You can only upload a maximum of 6 files.');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    
    files.forEach((_, index) => {
      let uploadProgress = 0;
      const progressIndex = newFiles.length - files.length + index;
      
      const intervalId = setInterval(() => {
        if (uploadProgress < 100) {
          uploadProgress += 30;
          setProgress(prev => ({
            ...prev,
            [progressIndex]: Math.min(uploadProgress, 100)
          }));
        } else {
          clearInterval(intervalId);
        }
      }, 1000);

      setTimeout(() => {
        setProgress(prev => ({
          ...prev,
          [progressIndex]: 100
        }));
      }, (files.length * 1000) + 2000);
    });
  };

  const removeFile = (indexToRemove) => {
    const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(updatedFiles);
    setProgress(prev => {
      const updatedProgress = { ...prev };
      Object.keys(updatedProgress).forEach(key => {
        if (parseInt(key) > indexToRemove) {
          delete updatedProgress[key];
        }
      });
      return updatedProgress;
    });
  };

  const allFilesUploaded = selectedFiles.length > 0 && Object.values(progress).every(p => p === 100);

  const truncateFileName = (name) => {
    return name.length > 15 ? name.slice(0, 6) + '...' : name;
  };

  const handleUploadClick = async () => {
    if (selectedFiles.length > 0) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFiles[0]);

        const response = await fetch('https://main-tool-code2.onrender.com/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload');
        }

        const result = await response.json();
        console.log('Upload successful:', result);

        setTimeout(() => {
          sendRequests();
        }, 10000);
      } catch (error) {
        console.error('Error uploading files:', error);
      } 
    } else {
      console.log("Please select some files");
    }
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-icon">
        <MdAttachFile className="attach-icon" />
        <input 
          type="file" 
          className="file-input" 
          onChange={handleFileChange} 
          multiple 
          accept="*/*"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="file-upload-details">
          <div className="file-count">{selectedFiles.length} file(s) selected:</div>
          <ul className="file-list">
            {selectedFiles.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-name">{truncateFileName(file.name)}</span>
                <button 
                  className="remove-file-button"
                  onClick={() => removeFile(index)}
                >
                  <RiDeleteBinLine className="remove-icon" />
                </button>
                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar ${progress[index] === 100 ? 'complete' : 'in-progress'}`} 
                    style={{ width: `${progress[index] || 0}%` }}
                  >
                    {progress[index] && progress[index] < 100 && (
                      <span className="progress-text">
                        {progress[index]}%
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUploadClick}
            className={`upload-button ${allFilesUploaded ? 'active' : 'disabled'}`}
            disabled={!allFilesUploaded}
          >
            Start
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploadIcon;
