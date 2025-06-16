import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) =>{
      const url = new URL(tabs[0].url);
      const hostname = url.hostname.replace('www.', '');
      const brand = hostname.split(".")[0];

      try{
        const res = await fetch(`http://localhost:3000/brand/${brand}`);
        const data = await res.json();
        if (data.error){
          setError(data.error);
        }else{
          setInfo(data);
        }
      }catch{
        setError("Could not fetch brand data. Please try again later.");
      }
    });
  }, [])

  return (
    <div className = 'p-4 font-sans'>
      <h1 className = 'text-lg font-bold mb-2'>🛍️ Ethical Brand Checker</h1>
      {error &&(
        <p className = "text-red-500"><strong>Error: </strong> {error}</p>
      )}
      
      {info && !error &&(
        <div>
          <p><strong>Brand: </strong>{info.brand}</p>
          <p><strong>Rating: </strong>{info.rating}</p>
          <p><strong>Summary: </strong></p>
          <p className = "text-sm mb-2">{info.summary}</p>
          <a href={info.link} target = "_blank" rel = "noopener noreferrer" className = "text-blue-500 underline">
            View Full Good On You rating! </a>
        </div>
      )}
      {!info && !error && <p>Loading brand data...</p>}
    </div>
  );
}

export default App;
