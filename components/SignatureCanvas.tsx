import React, { useRef, useEffect } from 'react';

interface SignatureCanvasProps {
  label: string;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ label }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#D4AF37'; // Gold
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
     const canvas = canvasRef.current;
     if (!canvas) return { x: 0, y: 0 };
     const rect = canvas.getBoundingClientRect();
     let clientX, clientY;
     if ('touches' in e) {
         clientX = e.touches[0].clientX;
         clientY = e.touches[0].clientY;
     } else {
         clientX = (e as React.MouseEvent).clientX;
         clientY = (e as React.MouseEvent).clientY;
     }
     return {
         x: clientX - rect.left,
         y: clientY - rect.top
     };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="relative border border-gold/30 bg-black w-64 h-32 cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={256}
          height={128}
          className="absolute inset-0 w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="absolute bottom-2 right-2 text-[10px] text-gray-600 pointer-events-none">
            FIRMA_DIGITAL
        </div>
      </div>
      <div className="text-[10px] text-gold uppercase tracking-widest border-t border-gold/50 pt-1 inline-block">
        {label}
      </div>
    </div>
  );
};

export default SignatureCanvas;