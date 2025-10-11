import React from 'react';
import { useSelector } from 'react-redux';

const AssignmentDebugger = () => {
  const assignements = useSelector((state) => state.assignements);
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      zIndex: 9999,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <h4>🔍 Assignment Debug</h4>
      <p><strong>Error:</strong> {assignements.error || 'None'}</p>
      <p><strong>Count:</strong> {assignements.assignements?.length || 0}</p>
      <details>
        <summary>Raw Data</summary>
        <pre style={{ fontSize: '10px', maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify(assignements, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default AssignmentDebugger;