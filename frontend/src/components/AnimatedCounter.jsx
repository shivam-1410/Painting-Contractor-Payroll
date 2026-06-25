import { useEffect, useState, useRef } from "react";

const AnimatedCounter = ({ value, duration = 600, formatter = (v) => v.toLocaleString("en-IN") }) => {
  const [count, setCount] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = Number(value) || 0;
    if (startValue === endValue) return;

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Easing out quad
      const easeProgress = progress * (2 - progress);
      const currentValue = startValue + (endValue - startValue) * easeProgress;
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
        prevValueRef.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{formatter(Math.round(count))}</span>;
};

export default AnimatedCounter;
