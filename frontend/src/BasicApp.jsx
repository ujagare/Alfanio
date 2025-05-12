import React from 'react';

function BasicApp() {
  return (
    <div style={{ 
      textAlign: 'center', 
      marginTop: '50px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333' }}>Alfanio LTD</h1>
      <p style={{ fontSize: '18px' }}>Welcome to our website!</p>
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '0 auto',
        marginTop: '20px'
      }}>
        <h2 style={{ color: '#555' }}>Basic React App is Working!</h2>
        <p>This is a simple React application to test if the setup is working correctly.</p>
        <button 
          style={{
            backgroundColor: '#4CAF50',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '16px',
            margin: '10px',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
          onClick={() => alert('Button clicked!')}
        >
          Click Me
        </button>
      </div>
    </div>
  );
}

export default BasicApp;
