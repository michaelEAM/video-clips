import React from 'react';

function Marker({ clip, duration, onClick }) {
  const left = `${(clip.start / duration) * 100}%`;

  return (
    <div
      onClick={onClick}
      title={clip.name}
      style={{
        position: 'absolute',
        left,
        top: 0,
        width: '2px',
        height: '100%',
        backgroundColor: 'red',
        cursor: 'pointer',
      }}
    />
  );
}

export default Marker;