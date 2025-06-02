"use client";

import { useMounted } from "@/lib/hooks/useMounted";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}) => {
  const mounted = useMounted();
  const interactiveRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);

  // Animate pointer movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCurX((prevX) => prevX + (tgX - prevX) / 20);
      setCurY((prevY) => prevY + (tgY - prevY) / 20);
      if (interactiveRef.current) {
        interactiveRef.current.style.transform = `translate(${Math.round(
          curX
        )}px, ${Math.round(curY)}px)`;
      }
    }, 16); // roughly 60fps

    return () => clearInterval(interval);
  }, [tgX, tgY, curX, curY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setTgX(event.clientX - rect.left);
      setTgY(event.clientY - rect.top);
    }
  };

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      setIsSafari(/^((?!chrome|android).)*safari/i.test(ua));
    }
  }, []);

  // Styles scoped to wrapper
  const styleVars = {
    "--gradient-background-start": gradientBackgroundStart,
    "--gradient-background-end": gradientBackgroundEnd,
    "--first-color": firstColor,
    "--second-color": secondColor,
    "--third-color": thirdColor,
    "--fourth-color": fourthColor,
    "--fifth-color": fifthColor,
    "--pointer-color": pointerColor,
    "--size": size,
    "--blending-value": blendingValue,
  } as React.CSSProperties;

  if (!mounted) return null;

  return (
    <div
      ref={wrapperRef}
      style={styleVars}
      onMouseMove={handleMouseMove}
      className={cn(
        "w-full h-full absolute overflow-hidden top-0 left-0",
        "bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className={cn("", className)}>{children}</div>

      <div
        className={cn(
          "gradients-container h-full w-full blur-lg",
          isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]"
        )}
      >
        {/* Gradient blobs */}
        {[
          {
            color: "--first-color",
            anim: "first",
            origin: "center center",
            opacity: "opacity-100",
          },
          {
            color: "--second-color",
            anim: "second",
            origin: "calc(50%-400px)",
            opacity: "opacity-100",
          },
          {
            color: "--third-color",
            anim: "third",
            origin: "calc(50%+400px)",
            opacity: "opacity-100",
          },
          {
            color: "--fourth-color",
            anim: "fourth",
            origin: "calc(50%-200px)",
            opacity: "opacity-70",
          },
          {
            color: "--fifth-color",
            anim: "fifth",
            origin: "calc(50%-800px) calc(50%+800px)",
            opacity: "opacity-100",
          },
        ].map((blob, i) => (
          <div
            key={i}
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(${blob.color}),_0.8)_0,_rgba(var(${blob.color}),_0)_50%)],
              "[mix-blend-mode:var(--blending-value)]",
              "w-[var(--size)] h-[var(--size)]",
              "top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]",
              [transform-origin:${blob.origin}],
              animate-${blob.anim}`,
              blob.opacity
            )}
          ></div>
        ))}

        {interactive && (
          <div
            ref={interactiveRef}
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)]`,
              "[mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2",
              "opacity-70"
            )}
          ></div>
        )}
      </div>
    </div>
  );
};
