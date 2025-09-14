"use client";
import React from 'react';
import styled from 'styled-components';

const GrandOpeningBanner = () => {
  return (
    <StyledWrapper>
      <div className="grand-opening-component">
        <div className="coupon">
          <div className="content">
            <h3>
              <span>G</span>
              <span>R</span>
              <span>A</span>
              <span>N</span>
              <span className="end">D </span>
              <span>O</span>
              <span>P</span>
              <span>E</span>
              <span>N</span>
              <span>I</span>
              <span>N</span>
              <span>G</span>
              <span>🎉</span>
            </h3>
            <p>
              Our grand opening is here! Check out the amazing deals.
            </p>
          </div>
        </div>
        <div className="timer">
          <div className="item">
            <div className="days">
              <div className="day">
                <span>00</span><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span><span>07</span><span>08</span><span>09</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span>
              </div>
            </div>
            <p>day</p>
          </div>
          <span className="colon">:</span>
          <div className="item">
            <div className="hours">
              <div className="hour">
                <span>00</span><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span><span>07</span><span>08</span><span>09</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span>
              </div>
            </div>
            <p>hour</p>
          </div>
          <span className="colon">:</span>
          <div className="item">
            <div className="minutes">
              <div className="min">
                <span>00</span><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span><span>07</span><span>08</span><span>09</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span><span>32</span><span>33</span><span>34</span><span>35</span><span>36</span><span>37</span><span>38</span><span>39</span><span>40</span><span>41</span><span>42</span><span>43</span><span>44</span><span>45</span><span>46</span><span>47</span><span>48</span><span>49</span><span>50</span><span>51</span><span>52</span><span>53</span><span>54</span><span>55</span><span>56</span><span>57</span><span>58</span><span>59</span><span>60</span>
              </div>
            </div>
            <p>min</p>
          </div>
          <span className="colon">:</span>
          <div className="item">
            <div className="seconds">
              <div className="sec">
                <span>00</span><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span><span>07</span><span>08</span><span>09</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span><span>32</span><span>33</span><span>34</span><span>35</span><span>36</span><span>37</span><span>38</span><span>39</span><span>40</span><span>41</span><span>42</span><span>43</span><span>44</span><span>45</span><span>46</span><span>47</span><span>48</span><span>49</span><span>50</span><span>51</span><span>52</span><span>53</span><span>54</span><span>55</span><span>56</span><span>57</span><span>58</span><span>59</span><span>60</span>
              </div>
            </div>
            <p>sec</p>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .grand-opening-component {
    --count: 0;
    --days: 31;
    --hours: 24;
    --minutes: 60;
    --seconds: 60;
    flex-direction: column;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    width: -moz-fit-content;
    width: fit-content;
    margin: auto;
    padding: 0 40px;
  }
  .grand-opening-component .coupon {
    border-radius: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #654bff;
    scale: 0.7;
    transform-origin: bottom center;
  }
  .grand-opening-component .coupon:hover .content h3 > span {
    animation: jump 0.15s ease-out 1 normal both;
  }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(1) { animation-delay: 0.03s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(2) { animation-delay: 0.06s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(3) { animation-delay: 0.09s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(4) { animation-delay: 0.12s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(5) { animation-delay: 0.15s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(6) { animation-delay: 0.18s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(7) { animation-delay: 0.21s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(8) { animation-delay: 0.24s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(9) { animation-delay: 0.27s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(10) { animation-delay: 0.3s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(11) { animation-delay: 0.33s; }
  .grand-opening-component .coupon:hover .content h3 > span:nth-of-type(12) { animation-delay: 0.36s; }

  .grand-opening-component .coupon .content {
    padding: 1rem;
    flex: 1;
    color: black;
    width: 330px;
    height: 100%;
  }
  .grand-opening-component .coupon .content h3 {
    font-weight: 600;
    font-size: 2rem;
    height: 34px;
    align-items: center;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 1rem;
    color: black;
  }
  .grand-opening-component .coupon .content h3 span.end {
    width: 30px;
  }
  .grand-opening-component .coupon .content p {
    font-weight: 400;
    font-style: normal;
    color: #333;
    font-size: 1rem;
    line-height: 1.25rem;
  }
  .grand-opening-component .timer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 0rem;
    overflow: hidden;
    width: calc(244px + 0rem);
    text-align: center;
  }
  .grand-opening-component .timer .colon {
    width: 8px;
    color: black;
    font-size: 2rem;
  }
  .grand-opening-component .timer .item {
    text-align: center;
    width: 55px;
    height: fit-content;
  }
  .grand-opening-component .timer .item .days,
  .grand-opening-component .timer .item .hours,
  .grand-opening-component .timer .item .minutes,
  .grand-opening-component .timer .item .seconds {
    text-align: center;
    width: 55px;
    overflow: hidden;
    height: 40px;
  }
  .grand-opening-component .timer .item .day,
  .grand-opening-component .timer .item .hour,
  .grand-opening-component .timer .item .min,
  .grand-opening-component .timer .item .sec {
    text-align: center;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
  .grand-opening-component .timer .item .day span,
  .grand-opening-component .timer .item .hour span,
  .grand-opening-component .timer .item .min span,
  .grand-opening-component .timer .item .sec span {
    height: 40px;
    color: black;
    font-size: 2rem;
    display: inline-block;
  }
  .grand-opening-component .timer .item .day {
    --count: var(--days);
    animation: slide calc(var(--count) * 86400s) ease-out 0s 31 normal both;
  }
  .grand-opening-component .timer .item .hour {
    --count: var(--hours);
    animation: slide calc(var(--count) * 3600s) steps(var(--count)) 0s 24 normal
      both;
  }
  .grand-opening-component .timer .item .min {
    --count: var(--minutes);
    animation: slide calc(var(--count) * 60s) steps(var(--count)) 0s 60 normal
      both;
  }
  .grand-opening-component .timer .item .sec {
    --count: var(--seconds);
    animation: slide calc(var(--count) * 1s) steps(var(--count)) 0s 60 normal both;
  }
  .grand-opening-component .timer .item p {
    text-align: center;
    color: black;
    font-size: 1.2rem;
    font-weight: 400;
  }

  @keyframes slide {
    0% {
      transform: translateY(calc(-40px * var(--count)));
    }
    99.6% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(calc(-40px * var(--count)));
    }
  }
  @keyframes jump {
    0% {
      transform: translateY(0);
      scale: 1;
    }
    50% {
      transform: translateY(-10px);
      scale: 1.1;
    }
    100% {
      transform: translateY(0);
      scale: 1;
    }
  }
`;

export default GrandOpeningBanner;
