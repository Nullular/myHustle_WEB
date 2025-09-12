"use client";
import React from 'react';
import styled from 'styled-components';

interface ShareButtonProps {
  onClick: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ onClick }) => {
  return (
    <StyledWrapper onClick={onClick}>
      <div className="tooltip-container">
        <span className="tooltip">share</span>
        <span className="text">@</span>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .tooltip-container {
    height: 23px;
    width: 37px;
    border-radius: 2px;
    background-color: #fff;
    background-image: linear-gradient(
      to left bottom,
      #f2f5f8,
      #ecf1f2,
      #e7eceb,
      #e3e7e4,
      #e1e2de
    );
    border: 1px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0px 3px 3px rgba(0, 0, 0, 0.151);
    position: relative;
    transition: transform 0.3s ease;
    z-index: 1;
  }

  .tooltip-container::before {
    position: absolute;
    content: "";
    top: -50%;
    clip-path: polygon(50% 0, 0 100%, 100% 100%);
    border-radius: 2px;
    background-color: fff;
    background-image: linear-gradient(
      to left bottom,
      #1288ff,
      #e4eaec,
      #d8dfde,
      #cdd3cf,
      #c5c7c1
    );
    width: 100%;
    height: 50%;
    transform-style: preserve-3d;
    transform: perspective(333px) rotateX(-150deg) translateY(-110%);
    transition: transform 0.3s ease;
    z-index: -1;
  }

  .tooltip-container .text {
    color: rgb(32, 30, 30);
    font-weight: bold;
    font-size: 13px;
  }

  .tooltip {
    position: absolute;
    top: -7px;
    opacity: 0;
    background: linear-gradient(-90deg, rgba(0, 0, 0, 0.05) 1px, white 1px),
      linear-gradient(rgba(0, 0, 0, 0.05) 1px, white 1px),
      linear-gradient(-90deg, rgba(0, 0, 0, 0.04) 1px, white 1px),
      linear-gradient(rgba(0, 0, 0, 0.04) 1px, white 1px),
      linear-gradient(white 3px, #f2f2f2 3px, #f2f2f2 26px, white 26px),
      linear-gradient(-90deg, #aaa 1px, white 1px),
      linear-gradient(-90deg, white 3px, #f2f2f2 3px, #f2f2f2 26px, white 26px),
      linear-gradient(#aaa 1px, white 1px), #f2f2f2;
    background-size: 4px 4px, 4px 4px, 27px 27px, 27px 27px, 27px 27px, 27px 27px,
      27px 27px, 27px 27px;
    padding: 2px 3px;
    border: 1px solid rgb(206, 204, 204);

    height: 23px;
    width: 37px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition-duration: 0.2s;
    pointer-events: none;
    letter-spacing: 0.5px;
    font-size: 6px;
    font-weight: 600;
    text-shadow: 10px salmon;
    z-index: 2;
  }
  .tooltip-container:hover {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  .tooltip-container:hover::before {
    transform: rotateY(0);
    background-image: none;
    background-color: white;
  }

  .tooltip-container:hover .tooltip {
    top: -90px;
    opacity: 1;
    transition-duration: 0.3s;
  }
`;

export default ShareButton;
