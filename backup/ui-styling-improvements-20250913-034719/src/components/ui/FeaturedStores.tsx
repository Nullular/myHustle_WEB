"use client";
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Shop } from '@/types';
import FeaturedStoreCard from './FeaturedStoreCard';
import Link from 'next/link';

interface FeaturedStoresProps {
  shops: Shop[];
}

const FeaturedStores: React.FC<FeaturedStoresProps> = ({ shops }) => {
  // Duplicate shops to create a seamless loop
  const extendedShops = [...shops, ...shops];

  return (
    <Wrapper>
      <h2 className="featured-title">Featured Stores</h2>
      <div className="scroller">
        <div className="scroller-inner">
          {extendedShops.map((shop, index) => (
            <Link href={`/store/${shop.id}`} key={`${shop.id}-${index}`}>
              <FeaturedStoreCard shop={shop} />
            </Link>
          ))}
        </div>
      </div>
    </Wrapper>
  );
};

const scroll = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
`;

const Wrapper = styled.div`
  .featured-title {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
    text-align: center;
    margin-bottom: 1rem;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  }

  .scroller {
    max-width: 100%;
    overflow: hidden;
    -webkit-mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent);
    mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent);
  }

  .scroller-inner {
    display: flex;
    animation: ${scroll} 40s linear infinite;
  }
`;

export default FeaturedStores;
