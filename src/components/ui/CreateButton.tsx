"use client";
import React from 'react';
import styled from 'styled-components';

interface CreateButtonProps {
    onClick: () => void;
    text?: string;
    disabled?: boolean;
}

const CreateButton: React.FC<CreateButtonProps> = ({ onClick, text = "Create", disabled = false }) => {
  return (
    <StyledButton onClick={onClick} disabled={disabled}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
          <path d="M12 19v-7m0 0V5m0 7H5m7 0h7" />
        </svg>
        {text}
    </StyledButton>
  );
}

const StyledButton = styled.button`
    cursor: pointer;
    font-size: 1rem;
    line-height: 1.5rem;
    padding: 0.625rem 1rem;
    color: rgb(242 242 242);
    background-color: rgb(79 70 229);
    background: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
    font-weight: 600;
    border-radius: 0.5rem;
    border-style: none;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.35s linear;

  &:hover:not(:disabled) {
    box-shadow: inset 0 5px 25px 0 #af40ff, inset 0 10px 15px 0px #5b42f3,
      inset 0 5px 25px 0px #00ddeb;
  }

  &:disabled {
    cursor: not-allowed;
    background: #ccc;
    box-shadow: none;
    color: #888;
  }
`;

export default CreateButton;
