import React, { useRef, useMemo, useEffect, useState } from "react";
import { Button } from "./ui/button";

const SCROLL_SENSITIVITY = 0.0005;
const MAX_ZOOM = 5;
const MIN_ZOOM = 0.1;

const ZoomImage = ({ image }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [draggind, setDragging] = useState(false);

  const touch = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const observer = useRef(null);
  const background = useMemo(() => new Image(), [image]);

  const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

  const handleWheel = (event) => {
    event.stopPropagation();
    const { deltaY } = event;
    if (!draggind) {
      setZoom((zoom) =>
        clamp(zoom + deltaY * SCROLL_SENSITIVITY * -1, MIN_ZOOM, MAX_ZOOM),
      );
    }
  };

  const handleMouseMove = (event) => {
    if (draggind) {
      const { x, y } = touch.current;
      const { clientX, clientY } = event;
      setOffset({
        x: offset.x + (x - clientX),
        y: offset.y + (y - clientY),
      });
      touch.current = { x: clientX, y: clientY };
    }
  };

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;
    touch.current = { x: clientX, y: clientY };
    setDragging(true);
  };

  const handleMouseUp = () => setDragging(false);

  const draw = () => {
    if (canvasRef.current && background.width && background.height) {
      const { width, height } = canvasRef.current;
      const context = canvasRef.current.getContext("2d");

      // Set canvas dimensions
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      // Clear canvas and scale it
      context.translate(-offset.x, -offset.y);
      context.scale(zoom, zoom);
      context.clearRect(0, 0, width, height);

      // Make sure we're zooming to the center
      const x = (context.canvas.width / zoom - background.width) / 2;
      const y = (context.canvas.height / zoom - background.height) / 2;

      // Draw image
      context.drawImage(background, x, y);
    }
  };

  const handleReset = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  useEffect(() => {
    observer.current = new ResizeObserver((entries) => {
      entries.forEach(({ target }) => {
        if (canvasRef.current) {
          const { width, height } = background;
          // If width of the container is smaller than image, scale image down
          if (target.clientWidth < width) {
            // Calculate scale
            const scale = target.clientWidth / width;

            // Redraw image
            console.log(canvasRef.current);
            canvasRef.current.width = width * scale;
            canvasRef.current.height = height * scale;
            canvasRef.current
              .getContext("2d")
              .drawImage(background, 0, 0, width * scale, height * scale);
          }
        }
      });
    });
    if (containerRef.current) {
      observer.current.observe(containerRef.current);
    }

    return () => {
      if (observer.current && containerRef.current) {
        observer.current.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (image) {
      background.src = image;

      if (canvasRef.current) {
        background.onload = () => {
          // Get the image dimensions
          const { width, height } = background;
          canvasRef.current.width = width;
          canvasRef.current.height = height;

          // Set image as background
          canvasRef.current.getContext("2d").drawImage(background, 0, 0);
        };
      }
    }
  }, [background]);

  useEffect(() => {
    draw();
  }, [zoom, offset]);

  return (
    <>
      <div
        className="flex flex-col items-center justify-center"
        ref={containerRef}
      >
        <canvas
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          ref={canvasRef}
          className="mt-14"
        />
        <Button className="mt-4" onClick={handleReset}>
          Reset size
        </Button>
      </div>
    </>
  );
};

export default ZoomImage;
