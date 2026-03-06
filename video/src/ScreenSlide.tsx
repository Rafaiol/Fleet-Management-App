import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Img, staticFile } from 'remotion';

export const ScreenSlide: React.FC<{
  imageSrc: string;
  title: string;
  description: string;
  width: number;
  height: number;
}> = ({ imageSrc, title, description, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
    from: 1,
    to: 1.1,
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ flex: 1, backgroundColor: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
      <Img
        src={staticFile(imageSrc)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `scale(${scale})`,
        }}
      />

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: '10%',
        right: '10%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '24px 40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        opacity,
        direction: 'rtl',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '32px' }}>{title}</h2>
        <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '20px' }}>{description}</p>
      </div>
    </div>
  );
};
