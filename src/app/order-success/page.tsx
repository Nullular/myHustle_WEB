'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

// Pedestal Card Component
const PedestalCard = () => {
  return (
    <PedestalWrapper>
      <div className="card" />
    </PedestalWrapper>
  );
};

const PedestalWrapper = styled.div`
  .card {
    width: 370.5px; /* 285px * 1.3 */
    height: 495.3px; /* 381px * 1.3 */
    border-radius: 58.5px; /* 45px * 1.3 */
    background: #212121;
    box-shadow: 29.25px 29.25px 58.5px rgb(25, 25, 25), /* 22.5px * 1.3 */
                -29.25px -29.25px 58.5px rgb(60, 60, 60); /* -22.5px * 1.3 */
  }
`;

// Secret Beta Tester Card Component
const SecretCard = () => {
  return (
    <SecretWrapper>
      <div className="container noselect">
        <div className="canvas">
          <div className="tracker tr-1" />
          <div className="tracker tr-2" />
          <div className="tracker tr-3" />
          <div className="tracker tr-4" />
          <div className="tracker tr-5" />
          <div className="tracker tr-6" />
          <div className="tracker tr-7" />
          <div className="tracker tr-8" />
          <div className="tracker tr-9" />
          <div className="tracker tr-10" />
          <div className="tracker tr-11" />
          <div className="tracker tr-12" />
          <div className="tracker tr-13" />
          <div className="tracker tr-14" />
          <div className="tracker tr-15" />
          <div className="tracker tr-16" />
          <div className="tracker tr-17" />
          <div className="tracker tr-18" />
          <div className="tracker tr-19" />
          <div className="tracker tr-20" />
          <div className="tracker tr-21" />
          <div className="tracker tr-22" />
          <div className="tracker tr-23" />
          <div className="tracker tr-24" />
          <div className="tracker tr-25" />
          <div id="card">
            <div className="card-content">
              <div className="card-glare" />
              <div className="cyber-lines">
                <span /><span /><span /><span />
              </div>
              <div className="title">BETA<br />TESTER</div>
              <div className="glowing-elements">
                <div className="glow-1" />
                <div className="glow-2" />
                <div className="glow-3" />
              </div>
              <div className="subtitle">
                <span>SECRET</span>
                <span className="highlight">ACCESS</span>
              </div>
              <div className="card-particles">
                <span /><span /><span /> <span /><span /><span />
              </div>
              <div className="corner-elements">
                <span /><span /><span /><span />
              </div>
              <div className="scan-line" />
            </div>
          </div>
        </div>
      </div>
    </SecretWrapper>
  );
};

const SecretWrapper = styled.div`
  .container {
    position: relative;
    width: 285px; /* 190px * 1.5 */
    height: 381px; /* 254px * 1.5 */
    transition: 200ms;
  }

  .container:active {
    width: 270px; /* 180px * 1.5 */
    height: 367.5px; /* 245px * 1.5 */
  }

  #card {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 30px; /* 20px * 1.5 */
    transition: transform 350ms ease-out, filter 200ms ease-out; /* Separate transitions for smoother effect */
    background: linear-gradient(45deg, #1a1a1a, #262626);
    border: 3px solid rgba(255, 255, 255, 0.1); /* 2px * 1.5 */
    overflow: hidden;
    box-shadow:
      0 0 30px rgba(0, 0, 0, 0.3), /* 20px * 1.5 */
      inset 0 0 30px rgba(0, 0, 0, 0.2); /* 20px * 1.5 */
  }

  .card-content {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .title {
    opacity: 0;
    transition: 300ms ease-in-out;
    position: absolute;
    font-size: 42px; /* 28px * 1.5 */
    font-weight: 800;
    letter-spacing: 6px; /* 4px * 1.5 */
    text-align: center;
    width: 100%;
    padding-top: 30px; /* 20px * 1.5 */
    background: linear-gradient(45deg, #00ffaa, #00a2ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 22.5px rgba(0, 255, 170, 0.3)); /* 15px * 1.5 */
    text-shadow:
      0 0 15px rgba(92, 103, 255, 0.5), /* 10px * 1.5 */
      0 0 30px rgba(92, 103, 255, 0.3); /* 20px * 1.5 */
  }

  .subtitle {
    position: absolute;
    bottom: 60px; /* 40px * 1.5 */
    width: 100%;
    text-align: center;
    font-size: 18px; /* 12px * 1.5 */
    letter-spacing: 3px; /* 2px * 1.5 */
    transform: translateY(45px); /* 30px * 1.5 */
    color: rgba(255, 255, 255, 0.6);
  }

  .highlight {
    color: #00ffaa;
    margin-left: 7.5px; /* 5px * 1.5 */
    background: linear-gradient(90deg, #5c67ff, #ad51ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
  }

  .glowing-elements {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .glow-1,
  .glow-2,
  .glow-3 {
    position: absolute;
    width: 150px; /* 100px * 1.5 */
    height: 150px; /* 100px * 1.5 */
    border-radius: 50%;
    background: radial-gradient(
      circle at center,
      rgba(0, 255, 170, 0.3) 0%,
      rgba(0, 255, 170, 0) 70%
    );
    filter: blur(22.5px); /* 15px * 1.5 */
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .glow-1 {
    top: -30px; /* -20px * 1.5 */
    left: -30px; /* -20px * 1.5 */
  }
  .glow-2 {
    top: 50%;
    right: -45px; /* -30px * 1.5 */
    transform: translateY(-50%);
  }
  .glow-3 {
    bottom: -30px; /* -20px * 1.5 */
    left: 30%;
  }

  .card-particles span {
    position: absolute;
    width: 4.5px; /* 3px * 1.5 */
    height: 4.5px; /* 3px * 1.5 */
    background: #00ffaa;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  /* Hover effects */
  .tracker:hover ~ #card .title {
    opacity: 1;
    transform: translateY(-15px); /* -10px * 1.5 */
  }

  .tracker:hover ~ #card .glowing-elements div {
    opacity: 1;
  }

  .tracker:hover ~ #card .card-particles span {
    animation: particleFloat 2s infinite;
  }

  @keyframes particleFloat {
    0% {
      transform: translate(0, 0);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translate(calc(var(--x, 0) * 45px), calc(var(--y, 0) * 45px)); /* 30px * 1.5 */
      opacity: 0;
    }
  }

  /* Particle positions */
  .card-particles span:nth-child(1) {
    --x: 1;
    --y: -1;
    top: 40%;
    left: 20%;
  }
  .card-particles span:nth-child(2) {
    --x: -1;
    --y: -1;
    top: 60%;
    right: 20%;
  }
  .card-particles span:nth-child(3) {
    --x: 0.5;
    --y: 1;
    top: 20%;
    left: 40%;
  }
  .card-particles span:nth-child(4) {
    --x: -0.5;
    --y: 1;
    top: 80%;
    right: 40%;
  }
  .card-particles span:nth-child(5) {
    --x: 1;
    --y: 0.5;
    top: 30%;
    left: 60%;
  }
  .card-particles span:nth-child(6) {
    --x: -1;
    --y: 0.5;
    top: 70%;
    right: 60%;
  }

  #card::before {
    content: "";
    background: radial-gradient(
      circle at center,
      rgba(0, 255, 170, 0.1) 0%,
      rgba(0, 162, 255, 0.05) 50%,
      transparent 100%
    );
    filter: blur(30px); /* 20px * 1.5 */
    opacity: 0;
    width: 150%;
    height: 150%;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
  }

  .tracker:hover ~ #card::before {
    opacity: 1;
  }

  .tracker {
    position: absolute;
    z-index: 200;
    width: 100%;
    height: 100%;
  }

  .tracker:hover {
    cursor: pointer;
  }

  .tracker:hover ~ #card {
    transition: 200ms ease-out;
    filter: brightness(1.1);
  }

  .container:hover #card::before {
    transition: 200ms;
    content: "";
    opacity: 80%;
  }

  .canvas {
    perspective: 1200px; /* 800px * 1.5 */
    inset: 0;
    z-index: 200;
    position: absolute;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
    gap: 0px 0px;
    grid-template-areas:
      "tr-1 tr-2 tr-3 tr-4 tr-5"
      "tr-6 tr-7 tr-8 tr-9 tr-10"
      "tr-11 tr-12 tr-13 tr-14 tr-15"
      "tr-16 tr-17 tr-18 tr-19 tr-20"
      "tr-21 tr-22 tr-23 tr-24 tr-25";
  }

  .tr-1 { grid-area: tr-1; }
  .tr-2 { grid-area: tr-2; }
  .tr-3 { grid-area: tr-3; }
  .tr-4 { grid-area: tr-4; }
  .tr-5 { grid-area: tr-5; }
  .tr-6 { grid-area: tr-6; }
  .tr-7 { grid-area: tr-7; }
  .tr-8 { grid-area: tr-8; }
  .tr-9 { grid-area: tr-9; }
  .tr-10 { grid-area: tr-10; }
  .tr-11 { grid-area: tr-11; }
  .tr-12 { grid-area: tr-12; }
  .tr-13 { grid-area: tr-13; }
  .tr-14 { grid-area: tr-14; }
  .tr-15 { grid-area: tr-15; }
  .tr-16 { grid-area: tr-16; }
  .tr-17 { grid-area: tr-17; }
  .tr-18 { grid-area: tr-18; }
  .tr-19 { grid-area: tr-19; }
  .tr-20 { grid-area: tr-20; }
  .tr-21 { grid-area: tr-21; }
  .tr-22 { grid-area: tr-22; }
  .tr-23 { grid-area: tr-23; }
  .tr-24 { grid-area: tr-24; }
  .tr-25 { grid-area: tr-25; }

  .tr-1:hover ~ #card { transition: 250ms ease-out; transform: rotateX(20deg) rotateY(-10deg) rotateZ(0deg); }
  .tr-2:hover ~ #card { transition: 250ms ease-out; transform: rotateX(20deg) rotateY(-5deg) rotateZ(0deg); }
  .tr-3:hover ~ #card { transition: 250ms ease-out; transform: rotateX(20deg) rotateY(0deg) rotateZ(0deg); }
  .tr-4:hover ~ #card { transition: 250ms ease-out; transform: rotateX(20deg) rotateY(5deg) rotateZ(0deg); }
  .tr-5:hover ~ #card { transition: 250ms ease-out; transform: rotateX(20deg) rotateY(10deg) rotateZ(0deg); }
  .tr-6:hover ~ #card { transition: 250ms ease-out; transform: rotateX(10deg) rotateY(-10deg) rotateZ(0deg); }
  .tr-7:hover ~ #card { transition: 250ms ease-out; transform: rotateX(10deg) rotateY(-5deg) rotateZ(0deg); }
  .tr-8:hover ~ #card { transition: 250ms ease-out; transform: rotateX(10deg) rotateY(0deg) rotateZ(0deg); }
  .tr-9:hover ~ #card { transition: 250ms ease-out; transform: rotateX(10deg) rotateY(5deg) rotateZ(0deg); }
  .tr-10:hover ~ #card { transition: 250ms ease-out; transform: rotateX(10deg) rotateY(10deg) rotateZ(0deg); }
  .tr-11:hover ~ #card { transition: 250ms ease-out; transform: rotateX(0deg) rotateY(-10deg) rotateZ(0deg); }
  .tr-12:hover ~ #card { transition: 250ms ease-out; transform: rotateX(0deg) rotateY(-5deg) rotateZ(0deg); }
  .tr-13:hover ~ #card { transition: 250ms ease-out; transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
  .tr-14:hover ~ #card { transition: 250ms ease-out; transform: rotateX(0deg) rotateY(5deg) rotateZ(0deg); }
  .tr-15:hover ~ #card { transition: 250ms ease-out; transform: rotateX(0deg) rotateY(10deg) rotateZ(0deg); }
  .tr-16:hover ~ #card { transition: 250ms ease-out; transform: rotateX(-10deg) rotateY(-10deg) rotateZ(0deg); }
  .tr-17:hover ~ #card { transition: 250ms ease-out; transform: rotateX(-10deg) rotateY(-5deg) rotateZ(0deg); }
  .tr-18:hover ~ #card { transition: 250ms ease-out; transform: rotateX(-10deg) rotateY(0deg) rotateZ(0deg); }
  .tr-19:hover ~ #card { transition: 250ms ease-out; transform: rotateX(-10deg) rotateY(5deg) rotateZ(0deg); }
  .tr-20:hover ~ #card { transition: 250ms ease-out; transform: rotateX(-10deg) rotateY(10deg) rotateZ(0deg); }
  .tr-21:hover ~ #card { transition: 250ms ease-out; transform: rotateX(-20deg) rotateY(-10deg) rotateZ(0deg); }
  .tr-22:hover ~ #card { transition: 250ms ease-out; transform: rotateX(-20deg) rotateY(-5deg) rotateZ(0deg); }
  .tr-23:hover ~ #card { transition: 250ms ease-out; transform: rotateX(-20deg) rotateY(0deg) rotateZ(0deg); }
  .tr-24:hover ~ #card { transition: 250ms ease-out; transform: rotateX(-20deg) rotateY(5deg) rotateZ(0deg); }
  .tr-25:hover ~ #card { transition: 250ms ease-out; transform: rotateX(-20deg) rotateY(10deg) rotateZ(0deg); }

  .noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .card-glare {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      125deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.05) 45%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 55%,
      rgba(255, 255, 255, 0) 100%
    );
    opacity: 0;
    transition: opacity 300ms;
  }

  .cyber-lines span {
    position: absolute;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(92, 103, 255, 0.2),
      transparent
    );
  }

  .cyber-lines span:nth-child(1) {
    top: 20%;
    left: 0;
    width: 100%;
    height: 1.5px; /* 1px * 1.5 */
    transform: scaleX(0);
    transform-origin: left;
    animation: lineGrow 3s linear infinite;
  }

  .cyber-lines span:nth-child(2) {
    top: 40%;
    right: 0;
    width: 100%;
    height: 1.5px; /* 1px * 1.5 */
    transform: scaleX(0);
    transform-origin: right;
    animation: lineGrow 3s linear infinite 1s;
  }

  .cyber-lines span:nth-child(3) {
    top: 60%;
    left: 0;
    width: 100%;
    height: 1.5px; /* 1px * 1.5 */
    transform: scaleX(0);
    transform-origin: left;
    animation: lineGrow 3s linear infinite 2s;
  }

  .cyber-lines span:nth-child(4) {
    top: 80%;
    right: 0;
    width: 100%;
    height: 1.5px; /* 1px * 1.5 */
    transform: scaleX(0);
    transform-origin: right;
    animation: lineGrow 3s linear infinite 1.5s;
  }

  .corner-elements span {
    position: absolute;
    width: 22.5px; /* 15px * 1.5 */
    height: 22.5px; /* 15px * 1.5 */
    border: 3px solid rgba(92, 103, 255, 0.3); /* 2px * 1.5 */
  }

  .corner-elements span:nth-child(1) {
    top: 15px; /* 10px * 1.5 */
    left: 15px; /* 10px * 1.5 */
    border-right: 0;
    border-bottom: 0;
  }

  .corner-elements span:nth-child(2) {
    top: 15px; /* 10px * 1.5 */
    right: 15px; /* 10px * 1.5 */
    border-left: 0;
    border-bottom: 0;
  }

  .corner-elements span:nth-child(3) {
    bottom: 15px; /* 10px * 1.5 */
    left: 15px; /* 10px * 1.5 */
    border-right: 0;
    border-top: 0;
  }

  .corner-elements span:nth-child(4) {
    bottom: 15px; /* 10px * 1.5 */
    right: 15px; /* 10px * 1.5 */
    border-left: 0;
    border-top: 0;
  }

  .scan-line {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(92, 103, 255, 0.1),
      transparent
    );
    transform: translateY(-100%);
    animation: scanMove 2s linear infinite;
  }

  @keyframes lineGrow {
    0% { transform: scaleX(0); opacity: 0; }
    50% { transform: scaleX(1); opacity: 1; }
    100% { transform: scaleX(0); opacity: 0; }
  }

  @keyframes scanMove {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }

  #card:hover .card-glare {
    opacity: 1;
  }

  .corner-elements span {
    transition: all 0.3s ease;
  }

  #card:hover .corner-elements span {
    border-color: rgba(92, 103, 255, 0.8);
    box-shadow: 0 0 15px rgba(92, 103, 255, 0.5); /* 10px * 1.5 */
  }
`;

export default function OrderSuccessPage() {
  const router = useRouter();
  const [opacity, setOpacity] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);

  useEffect(() => {
    // Check if this is the user's first order
    const hasOrderedBefore = localStorage.getItem('myHustle_hasOrdered');
    const isFirst = !hasOrderedBefore;
    setIsFirstOrder(isFirst);

    // Mark that user has now ordered
    if (isFirst) {
      localStorage.setItem('myHustle_hasOrdered', 'true');
    }

    // Start fade in immediately
    setOpacity(1);
    
    // For first order: show special animation
    if (isFirst) {
      // Show the card after a short delay
      const cardTimer = setTimeout(() => {
        setShowCard(true);
      }, 1000);

      // After showing the cards for a while, fade to black
      const fadeTimer = setTimeout(() => {
        setFadeToBlack(true);
      }, 15000); // Show cards for 15 seconds

      // Then navigate to main screen
      const redirectTimer = setTimeout(() => {
        router.push('/');
      }, 17000); // 2 seconds for fade to black

      return () => {
        clearTimeout(cardTimer);
        clearTimeout(fadeTimer);
        clearTimeout(redirectTimer);
      };
    } else {
      // For subsequent orders: quick redirect to main screen
      const quickRedirectTimer = setTimeout(() => {
        router.push('/');
      }, 3000);

      return () => {
        clearTimeout(quickRedirectTimer);
      };
    }
  }, [router]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        background: fadeToBlack 
          ? '#000000' 
          : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        opacity: opacity,
        transition: fadeToBlack 
          ? 'background 2s ease-in-out' 
          : 'opacity 2s ease-in-out'
      }}
    >
      {isFirstOrder ? (
        <>
          {/* First Order: Special Animation */}
          {/* Pedestal */}
          <div className="relative">
            <PedestalCard />
            
            {/* Secret Card appears on top of pedestal */}
            {showCard && !fadeToBlack && (
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  animation: 'fadeInUp 1s ease-out'
                }}
              >
                <SecretCard />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Subsequent Orders: Simple Success Message */}
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-4">
              Order Confirmed! ✅
            </div>
            <div className="text-lg text-gray-300">
              Thank you for your order. Redirecting to main screen...
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}