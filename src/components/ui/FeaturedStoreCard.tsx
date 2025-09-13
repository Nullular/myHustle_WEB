"use client";
import React from 'react';
import styled from 'styled-components';
import { Shop } from '@/types';

interface FeaturedStoreCardProps {
  shop: Shop;
}

const FeaturedStoreCard: React.FC<FeaturedStoreCardProps> = ({ shop }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="icon">
          <img 
            src={shop.logoUrl || '/file.svg'} 
            alt={`${shop.name} logo`} 
            className="icon-img" 
          />
        </div>
        <div className="content">
          <h3>{shop.name}</h3>
          <p>{shop.description}</p>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 190px;
    height: 120px;
    background-color: #eee;
    text-align: center;
    border: 10px solid #eee;
    border-radius: 20px;
    box-shadow: inset 5px 5px 10px #bbb, inset -5px -5px 10px #fff;
    transition: 0.5s;
    margin: 0 10px;
  }

  .card:hover {
    height: 254px;
  }

  .icon {
    width: 60px;
    height: 60px;
    background-color: #eee;
    margin: 20px auto;
    padding: 5px;
    border-radius: 50%;
    box-shadow: 8px 8px 10px #ddd, -8px -8px 10px #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .icon-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .content {
    color: #999;
    background-color: #eee;
    padding: 10px;
    margin: 5px 20px;
    border-radius: 8px;
    box-shadow: 8px 8px 10px #ddd, -8px -8px 10px #fff;
    transform: translateY(-80px) scale(0);
    transition: all 0.5s;
  }

  .card:hover .content {
    transform: translateY(0) scale(1)
  }

  .content h3 {
    text-shadow: 2px 2px 0px #fff;
    color: #333;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .content p {
    font-size: 0.8em;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default FeaturedStoreCard;
