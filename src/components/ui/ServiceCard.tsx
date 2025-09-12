import React from 'react';
import styled from 'styled-components';
import { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  imageUrl: string | null;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, imageUrl }) => {
  return (
    <StyledWrapper>
      <article className="card">
        <div className="card-img">
          <div className="card-imgs pv delete" style={{backgroundImage: `url(${imageUrl || '/placeholder.svg'})`}}/>
        </div>
        <div className="project-info">
          <div className="flex">
            <div className="project-title">{service.name}</div>
            <span className="tag">R{service.basePrice.toFixed(2)}</span>
          </div>
          <span className="lighter">{service.description}</span>
        </div>
      </article>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .project-info {
    padding: 60px 20px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: relative;
    top: -40px;
    height: 100%;
  }

  .project-title {
    font-weight: 500;
    font-size: 1.2em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: black;
  }

  .lighter {
    font-size: 0.8em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tag {
    font-weight: lighter;
    color: grey;
  }

  .card {
    background-color: white;
    color: black;
    width: 210px; /* 30% smaller than 300px */
    height: 231px; /* 30% smaller than 330px */
    border-radius: 8px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
      rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
  }

  .card-img {
    position: relative;
    top: -14px; /* Adjusted for new size */
    height: 70px; /* Adjusted for new size */
    display: flex;
    justify-content: center;
  }

  .card-img .card-imgs {
    height: 105px; /* Adjusted for new size */
    width: 90%;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    transition: all 0.5s;
  }
`;

export default ServiceCard;
