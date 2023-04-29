import React, { useState, useEffect, useCallback } from 'react'; // react componet
import { useSelector } from 'react-redux';
import styled, { createGlobalStyle } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import Modal from 'react-modal';
import Reveal from 'react-awesome-reveal';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import IconButton from '@mui/material/IconButton';
import ReactLoading from "react-loading";
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import Clock from '../components/Presale/Clock';
import SelectCoin from '../components/Presale/SelectCoin';
import * as selectors from '../store/selectors';
import { fadeIn, fadeInUp, getUTCNow, getUTCDate, numberWithCommas, LoadingSkeleton, isEmpty } from '../components/utils';
import {
  getTotalPresaleAmount,
  getpTokenPriceForUSDT,
  getBUSDForBNB,
  getBNBPrice,
  getUserPaidUSDT,
  getStartPresaleTime,
  getEndPresaleTime,
  buy_pToken,
  approveTokens,
  getBalanceOfAccount,
  getWethPrice,
  getWbtcPrice
} from '../core/web3';

import { TOKEN_NAME, TOKEN_CONTRACT_ADDRESS, config, def_config } from '../core/config';
import Swal from 'sweetalert2';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginLight: '-50%',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '80%',
    cursor: 'pointer',
    backgroundColor: '#2e2568',
    borderRadius: '15px',
    color: '#FFFFFF',
    maxHeight: '70vh'
  },
  overlay: {
    backgroundColor: 'transparent',
    cursor: 'pointer',
  }
};

const GlobalStyles = createGlobalStyle`
  .ico-container {
    display: flex;
    align-items: center;
    justify-content: start;
    flex-direction: column;
    background-size: 100% !important;
    background-position-x: center !important;
    .ico-header {
      max-width: 900px;
      padding: 20px;
      .ico-title {
        font-size: 36px;
        font-family: "Montserrat", Sans-serif;
      }
      .ico-desc {
        font-size: 20px;
      }
    }
    @media only screen and (max-width: 1400px) {
      flex-direction: column;
    }
    @media only screen and (max-width: 768px) {
      padding: 10px;
      .ico-header {
        padding: 20px;
        .ico-title {
          font-size: 28px;
        }
        .ico-desc {
          font-size: 18px;
        }
      }
    }
  }

  .input-token-panel {
    display: flex;
    background-color: transparent;
    flex-direction: column;
    text-align: left;
    gap: 10px;
    width: 45%;
    .input-box {
      border: solid 1px white;
      border-radius: 8px;
      @media only screen and (max-width: 576px) {
        span {
          font-size: 15px !important;
        }
      }
    }
    @media only screen and (max-width: 768px) {
      width: 100%;
    }
  }

  .input-token {
    width: 50%;
    background: transparent;
    outline: none;
    padding: 10px;
    font-size: 20px;
    font-weight: bold;
    color: white;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    span {
      font-size: 18px;
      font-weight: normal;
    }
  }

  .email_input {
    max-width: 300px;
  }

  .select-coin {
    font-family: IBM Plex Sans,sans-serif;
    font-size: 1.2rem;
    box-sizing: border-box;
    min-height: calc(1.5em + 22px);
    background: transparent;
    border: none;
    padding: 10px;
    text-align: left;
    line-height: 1.5;
    color: white;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    width: 140px;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .presale-content {
    max-width: 900px;
    padding: 0;
    background: rgba(103, 58, 58, 0.15);
    border-radius: 20px;
    @media only screen and (max-width: 768px) {
      max-width: 100%;
    }
  }

  .presale-inner {
    border-radius: 12px;
    padding: 10px 60px 40px;
    position: relative;
    background: transparent;
    min-height: 200px;
    h3 {
      line-height: 2;
      margin-bottom: 0;
    }
    @media only screen and (max-width: 1024px) {
      padding: 60px 40px 40px;
    }
    @media only screen and (max-width: 768px) {
      padding: 0px 10px 40px;
    }
  }

  .presale-bg {
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 76px;
  }

  .end-content {
    background: #2d81e2;
    padding: 16px;
    border-radius: 40px;
    width: 80%;
    margin: auto;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .buy_content {
    padding: 22px;
    border: solid 1.5px #5a5196;
    border-radius: 20px;
  }

  .progress-bg {
    @media only screen and (max-width: 576px) {
      width: 60%;
    }
  }

  .inverstors {
    width: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 25px;
  }

  .amount_bar_text {
    display: flex;
    justify-content: space-between;
  }

  .progress {
    height: 1.5rem;
    background-color: #a9a9a9;
  }

  .progress-bar {
    background-color: #7621ff;
  }

  .MuiLoadingButton-root {
    transition: all 0.5s ease;
  }

  .MuiLoadingButton-loading {
    padding-right: 40px;
    background: linear-gradient(90deg, #aa2d78 -3.88%, #a657ae 100%);
    color: rgb(255 255 255 / 50%) !important;
    transition: all 0.5s ease;
  }
  .swal2-popup {
    border-radius: 20px;
    background: #2f2179;
    color: white;
  }
  .swal2-styled.swal2-confirm {
    padding-left: 2rem;
    padding-right: 2rem;
  }
  .backdrop-loading {
  }
  
  .btn-change {
    width: 40px;
    height: 40px;
    background-color: #8b86a4 !important;
    border-radius: 50%;
    margin-bottom: 8px !important;
    color: white !important;
    &:hover {
      background-color: #8b86a4 !important;
    }
  }

  .presale-input {
    align-items: end;
    @media only screen and (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
    }
  }

  .add-token-metamask {
    width: 222px;
    margin: 0 auto;
  }

  .clock-widget {
    margin: 0 auto;
    margin-top: 30px;
  }

  .font-weight-bold {
    font-weight: bold;
  }
`;

const Loading = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 15px;
`;

const help_style = {
  padding: "10px",
  paddingLeft: "20px",
  paddingRight: "20px",
  borderRadius: "30px",
  border: "1px solid"
}

function CapBackGradientSVG() {
  const gradientTransform = `rotate(0)`;
  return (
    <svg style={{ height: 0 }}>
      <defs>
        <linearGradient id={"capBack"} gradientTransform={gradientTransform}>
          <stop offset="0%" stopColor="rgba(236, 0, 140, 0.5)" />
          <stop offset="90%" stopColor="rgba(252, 103, 103, 0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function CapGradientSVG() {
  const gradientTransform = `rotate(0)`;
  return (
    <svg style={{ height: 0 }}>
      <defs>
        <linearGradient id={"cap"} gradientTransform={gradientTransform}>
          <stop offset="0%" stopColor="#EC008C" />
          <stop offset="100%" stopColor="#FC6767" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function AmountBackGradientSVG() {
  const gradientTransform = `rotate(0)`;
  return (
    <svg style={{ height: 0 }}>
      <defs>
        <linearGradient id={"amountBack"} gradientTransform={gradientTransform}>
          <stop offset="0%" stopColor="rgba(5, 117, 230, 0)" />
          <stop offset="90%" stopColor="rgba(2, 242, 149, 0.61)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function AmountGradientSVG() {
  const gradientTransform = `rotate(0)`;
  return (
    <svg style={{ height: 0 }}>
      <defs>
        <linearGradient id={"amount"} gradientTransform={gradientTransform}>
          <stop offset="0" stopColor="#00F260" />
          <stop offset="23.1%" stopColor="#01D97B" />
          <stop offset="73.02%" stopColor="#0581a0" />
          <stop offset="99.02" stopColor="#0575E6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
/**
 * @author arsinoe
 * @abstract presale main frontend
 */
const TokenICO = (props) => {
  const max_token_amount = def_config.MAX_PRESALE_AMOUNT;                  // Presale Max Amount
  const balance = useSelector(selectors.userBalance);             // user wallet balance
  const ethApproveState = useSelector(selectors.userETHApproveState);     //  
  const usdtApproveState = useSelector(selectors.userUSDTApproveState);    // 
  const busdApproveState = useSelector(selectors.userBUSDApproveState);    // 
  const btcbApproveState = useSelector(selectors.userBTCBApproveState);    // 
  const wallet = useSelector(selectors.userWallet);              // user wallet
  const web3 = useSelector(selectors.web3State);               // 

  const isMobile = useMediaQuery({ maxWidth: '768px' });           // responsive mobile

  const [amountPercent, setAmountPercent] = useState(0);                // sale percent
  const [curPresale, setCurPresale] = useState('');
  const [capPercent, setCapPercent] = useState('');
  const [usdtPrice, setusdTPrice] = useState('');
  const [maxCap, setMaxCap] = useState(0);                // USD
  const [minCap, setMinCap] = useState(0);                // USDT
  const [maxTotalCap, setMaxTotalCap] = useState('');               // USDT
  const [leftCap, setLeftCap] = useState('');               // 
  const [paidUSDT, setPaidUSDT] = useState(0);                // paid USDT
  const [pFiziAmount, setPFiziAmount] = useState();
  const [toBNBPrice, settoBNBPrice] = useState(0);
  const [maxBNBCap, setmaxBNBCap] = useState('');
  const [coinType, setCoinType] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  const [fiziBalance, setFiziBalance] = useState(0);                // balance of TOKEN
  const [bnbBalance, setBnbBalance] = useState(0);                  // balance of BNB
  const [busdBalance, setBusdBalance] = useState(0);                // balance of BUSD
  const [usdtBalance, setUsdtBalance] = useState(0);                // balance of USDT
  const [wethBalance, setWethBalance] = useState(0);                // balance of WETH
  const [wbtcBalance, setWbtcBalance] = useState(0);                // balance of WBTC

  const [tokenAmountA, setTokenAmountA] = useState('');
  const [fromBalance, setFromBalance] = useState(0);
  const [toBalance, setToBalance] = useState(0);
  const [ended, setEnded] = useState(false);
  const [started, setStarted] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  /* ******************************************* INIT ******************************************* */
  const getInitAmount = useCallback(async () => {
    // console.log('[Wallet] = ', wallet);
    if (!web3) { return; }

    setLoading(true); // loading

    let tempusdtPrice = 0;
    let totalMaxCap = 0;
    let tempPaidUSDT = 0;
    let tempCurPresale = 0;
    let tempLeftCap = 0;
    let result = null;
    /* ******************************************* GET PRESALE START TIME ******************************************* */
    result = await getStartPresaleTime(); // get presale start time from smart contract
    if (result.success) {
      setStartTime(Number(result.start_time));

      if (result.start_time < (getUTCNow() / 1000))
        setStarted(true);
      else
        setStarted(false);
    } else {
      return;
    }
    /* ******************************************* GET PRESALE END TIME ******************************************* */
    result = await getEndPresaleTime(); // get presale end time from smart contract

    if (result.success) {
      setEndTime(Number(result.end_time));
    }
    /* ******************************************* GET USDT TOKEN PRICE ******************************************* */
    result = await getpTokenPriceForUSDT();
    if (result.success) {
      setusdTPrice(result.usdtPrice);
      tempusdtPrice = Number(result.usdtPrice);
    }
    /* ******************************************* GET TOTAL PRESALE AMOUNT ******************************************* */
    result = await getTotalPresaleAmount();
    if (result.success) {
      const percent = ((max_token_amount - Number(50000)) * 100) / max_token_amount; // sale percent
      setAmountPercent(percent);
      tempCurPresale = (max_token_amount - Number(50000)) * tempusdtPrice;
      setCurPresale(tempCurPresale);
      tempLeftCap = max_token_amount * tempusdtPrice - tempCurPresale;
      setLeftCap(tempLeftCap);
    }
    /* *******************************************  ******************************************* */
    result = await getUserPaidUSDT();
    if (result.success) {
      tempPaidUSDT = Number(result.paidUSDT);
      setPaidUSDT(tempPaidUSDT);
    }
    /* ******************************************* BALANCE OF ACCOUNT ******************************************* */
    result = await getBalanceOfAccount();

    if (result.success) {
      let fiziBalance = Number(result.fiziBalance);
      let bnbBalance = Number(result.bnbBalance);
      let busdBalance = Number(result.busdBalance);
      let usdtBalance = Number(result.usdtBalance);
      let wethBalance = Number(result.wethBalance);
      let wbtcBalance = Number(result.wbtcBalance);

      setFiziBalance(fiziBalance);
      setBnbBalance(bnbBalance);
      setBusdBalance(busdBalance);
      setUsdtBalance(usdtBalance);
      setWethBalance(wethBalance);
      setWbtcBalance(wbtcBalance);
    }

    if (totalMaxCap <= tempPaidUSDT || tempLeftCap <= 0) {
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [web3, max_token_amount, wallet]);

  let subtitle;
  const openModal = () => {
    setIsOpen(true);
  }
  const afterOpenModal = () => {
    // subtitle.style.color = '#f00';	
  }
  const closeModal = () => {
    setIsOpen(false);
  }
  // arsinoe
  const handleSelectCoin = async (value) => {
    setCoinType(value);

    const fromToken = Number(tokenAmountA);

    if (fromToken === 0) {
      return;
    }

    if (value === 0) { // BNB
      const result = await getBNBPrice();

      if (result.success) {
        let bnbPrice = result.bnbPrice / 10 ** 8
        setPFiziAmount(bnbPrice * fromToken / usdtPrice);
      }
      // const result = await getBUSDForBNB(fromToken);
      // if (result.success) {
      //   settoBNBPrice(result.value);
      //   console.log("result.value :", result.value);
      //   setPFiziAmount(Number(result.value) / usdtPrice);
      // }
    } else if (value === 1 || value === 2) { // BUSD, USDT
      setPFiziAmount(fromToken / usdtPrice);
    } else if (value === 3) { // WETH
      const result = await getWethPrice();

      if (result.success) {
        let wethPrice = result.wethPrice / 10 ** 8
        setPFiziAmount(wethPrice * fromToken / usdtPrice);
      }
    } else { // WBTC
      const result = await getWbtcPrice();
      if (result.success) {
        let wbtcPrice = result.wbtcPrice / 10 ** 8
        setPFiziAmount(wbtcPrice * fromToken / usdtPrice);
      }
    }
  }

  const handleChange = async (event) => {
    const value = Number(event.target.value);

    setTokenAmountA(event.target.value);

    if (value === 0) {
      setPFiziAmount(0);
      settoBNBPrice(0);
      return;
    }

    if (coinType === 0) {
      const result = await getBNBPrice();

      if (result.success) {
        let bnbPrice = result.bnbPrice / 10 ** 8;
        setPFiziAmount(bnbPrice * value / usdtPrice);
      }

    } else if (coinType === 1 || coinType === 2) {
      setPFiziAmount(value / usdtPrice);
    } else if (coinType === 3) {
      const result = await getWethPrice();

      if (result.success) {
        let wethPrice = result.wethPrice / 10 ** 8;
        setPFiziAmount(wethPrice * value / usdtPrice);
      }
    } else {
      const result = await getWbtcPrice();

      if (result.success) {
        let wbtcPrice = result.wbtcPrice / 10 ** 8;
        setPFiziAmount(wbtcPrice * value / usdtPrice);
      }
    }
  }

  const handleChangeToken = async (event) => {
    const value = Number(event.target.value);
    setPFiziAmount(event.target.value);

    if (value === 0) {
      setTokenAmountA(0);
      return;
    }

    if (coinType === 0) {
      const result = await getBNBPrice();

      if (result.success) {
        let bnbPrice = result.bnbPrice / 10 ** 8;
        setTokenAmountA((usdtPrice * value) / bnbPrice);
      }      
    } else if (coinType === 1 || coinType === 2) {
      setTokenAmountA(value * usdtPrice);
    } else if (coinType === 3) {
      const result = await getWethPrice();

      if (result.success) {
        let wethPrice = result.wethPrice / 10 ** 8;
        setTokenAmountA((usdtPrice * value) / wethPrice);
      }
    } else {
      const result = await getWbtcPrice();

      if (result.success) {
        let wbtcPrice = result.wbtcPrice / 10 ** 8;
        setTokenAmountA((usdtPrice * value) / wbtcPrice);
      }
    }
  }

  const validate = () => {

    if (isEmpty(tokenAmountA) || Number(tokenAmountA) === 0) {
      toast.error("Please enter a valid amount for purchase.");
      return;
    }

    // if ((coinType === 0 && Number(toBNBPrice) < Number(minCap)) || (coinType === 1 && Number(tokenAmountA) < Number(minCap))) {
    //   toast.error('Please enter a valid amount for purchase. The minimum amount you can buy is $100 and the maximum is $4,000 during Presale.');
    //   return;
    // }

    // if ((coinType === 0 && Number(toBNBPrice) > Number(maxCap)) || (coinType === 1 && Number(tokenAmountA) > Number(maxCap))) {
    //   toast.error('Please enter a valid amount for purchase. The minimum amount you can buy is $100 and the maximum is $4,000 during Presale.');
    //   return;
    // }

    if ((coinType === 0 && Number(balance.bnbBalance) < Number(tokenAmountA)) ||
      (coinType === 1 && Number(balance.busdBalance) < Number(tokenAmountA)) ||
      (coinType === 2 && Number(balance.usdtBalance) < Number(tokenAmountA)) ||
      (coinType === 3 && Number(balance.wetgBalance) < Number(tokenAmountA)) ||
      (coinType === 4 && Number(balance.wbtcBalance) < Number(tokenAmountA))) {
      toast.error("You have insufficient amount to buy Staik.");
      return false;
    }
    if (Number(startTime) * 1000 > getUTCNow()) {
      toast.error("Presale has not started yet.");
      return false;
    } else if (Number(endTime) * 1000 < getUTCNow()) {
      toast.error("Presale has ended.");
      return false;
    }
    return true;
  }

  const handleMax = async () => {
    // const value = coinType === 0 ? Number(balance.bnbBalance).toFixed(5) : Number(balance.usdtBalance).toFixed(5);
    let value = 0;

    if (coinType === 0) {
      value = Number(balance.bnbBalance).toFixed(5);
    } else if (coinType === 1) {
      value = Number(balance.busdBalance).toFixed(5);
    } else if (coinType === 2) {
      value = Number(balance.usdtBalance).toFixed(5);
    } else if (coinType === 3) {
      value = Number(balance.wethBalance).toFixed(5);
    } else {
      value = Number(balance.wbtcBalance).toFixed(5);
    }

    setTokenAmountA(value);
    if (value === 0) {
      setPFiziAmount(0);
      settoBNBPrice(0);
      return;
    }
    if (coinType === 0) {
      const result = await getBNBPrice();

      if (result.success) {
        let bnbPrice = result.bnbPrice / 10 ** 8
        setPFiziAmount(bnbPrice * value / usdtPrice);
      }

      // const result = await getBUSDForBNB(value);
      // if (result.success) {
      //   settoBNBPrice(result.value);
      //   setPFiziAmount(Number(result.value) / usdtPrice);
      // }
    } else if (coinType === 1 || coinType === 2) { // BUSD, USDT
      setPFiziAmount(value / usdtPrice);
    } else if (coinType === 3) { // WETH
      const result = await getWethPrice();

      if (result.success) {
        let wethPrice = result.wethPrice / 10 ** 8
        setPFiziAmount(wethPrice * value / usdtPrice);
      }
    } else { // WBTC
      const result = await getWbtcPrice();

      if (result.success) {
        let wbtcPrice = result.wbtcPrice / 10 ** 8
        setPFiziAmount(wbtcPrice * value / usdtPrice);
      }
    }
  }

  const handleBuy = async () => {
    if (!validate()) return;
    setPending(true);
    try {
      const coinAmount = tokenAmountA;
      const result = await buy_pToken(coinAmount, coinType);
      if (result.success) {
        getInitAmount();

        setTokenAmountA('');
        setPFiziAmount();

        Swal.fire({
          icon: 'success',
          title: ' Success',
          text: 'You have successfully purchased ' + TOKEN_NAME + ' from the presale.'
        });
      } else {
        toast.error("Transaction has been failed. " + result.error);
      }
    } catch (error) {
      toast.error("Transaction has been failed. " + error);
    } finally {
      setPending(false);
    }
  }

  const handleApprove = async () => {
    const coinName = {
      1: "BUSD",
      2: "USDT",
      3: "ETH",
      4: "BTCB"
    }
    setPending(true);
    try {
      const result = await approveTokens(coinType);
      if (result.success) {
        getInitAmount();
        toast.success("Your transaction has been successful.");
      } else {
        toast.error("Your Transaction has been failed. " + result.error);
      }
    } catch (error) {
      toast.error("Your Transaction has been failed. " + error);
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, []);

  useEffect(() => {
    getInitAmount();
  }, [getInitAmount]);

  useEffect(() => {
    const checkCoinType = async () => {
      if (coinType === 0) {
        setFromBalance(balance.bnbBalance);
      } else if (coinType === 1) {
        setFromBalance(balance.busdBalance);
      } else if (coinType === 2) {
        setFromBalance(balance.usdtBalance);
      } else if (coinType === 3) {
        setFromBalance(balance.wethBalance);
      } else {
        setFromBalance(balance.wbtcBalance);
      }
      setToBalance(balance.astroBalance);
    }
    checkCoinType();
  }, [balance, coinType]);

  // useEffect(() => {
  //   const myBalance = coinType === 0 ? Number(balance.bnbBalance) : Number(balance.usdtBalance);
  //   if (isEmpty(tokenAmountA) || Number(tokenAmountA) <= 0 || Number(tokenAmountA) > Number(myBalance)) {
  //     setDisabled(true);
  //   } else {
  //     setDisabled(false);
  //   }
  // }, [coinType, tokenAmountA]);

  useEffect(() => {
    const checkEndPresale = async () => {
      const result = await getEndPresaleTime();
      if (result.success) {
        setEndTime(result.end_time);
      }
    }
    if (ended) {
      checkEndPresale();
    }
  }, [ended]);

  useEffect(() => {
    const checkStartPresale = async () => {
      const result = await getStartPresaleTime();
      if (result.success) {
        if (result.start_time < (getUTCNow() / 1000))
          setStarted(true);
        else
          setStarted(false);
      }
    }
    if (started) {
      checkStartPresale();
    }
  }, [started]);

  const addTokenCallback = useCallback(async () => {
    const tokenAddress = config.FiziAddress;
    const tokenSymbol = 'Staik';
    const tokenDecimals = 18;
    const tokenImage = `https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/logos/${config.AstroAddress}/logo.png`;

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });

      if (wasAdded) {
        console.log('Adding Staik token');
      } else {
        console.log('Staik token has been added to you wallet!')
      }
    } catch (error) {
      console.log(error);
    }
  }, [])

  return (
    <div className='page-container text-center ico-container'>
      <GlobalStyles />
      <div className='ico-header' style={{ width: "100%" }}>
        <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
          <p className='ico-title'>Welcome to the {TOKEN_NAME} Presale</p>
        </Reveal>
        <Reveal className='onStep' keyframes={fadeInUp} delay={300} duration={600} triggerOnce>
          {/* <p className="ico-desc">
            Presale term - { getUTCDate(startTime) } - { getUTCDate(endTime) } <br /> You can participate using BNB, BUSD, USDT, ETH and BTCB.
          </p> */}
        </Reveal>
        <Reveal className='onStep' keyframes={fadeInUp} delay={600} duration={600} triggerOnce>
          <p className="ico-desc">
            This is our {TOKEN_NAME} token address
          </p>
          <p>
            <a style={{ color: '#00ffd9', overflowWrap: "anywhere", fontFamily: "Lato, Sans-serif", fontSize: "18px", fontWeight: "400" }} href={`https://bscscan.com/address/${TOKEN_CONTRACT_ADDRESS}`} target="_blank">
              {TOKEN_CONTRACT_ADDRESS}
            </a>
          </p>
          <button onClick={openModal} style={help_style}>&#10068;&nbsp;&nbsp;How To Use</button>
          {/* <div style={{ overflow: 'scroll', maxHeight: '70vh' }}> */}
          <Modal
            isOpen={modalIsOpen}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
            id="howtouse"
          >
            <h2 style={{ fontSize: 31 }} ref={(_subtitle) => (subtitle = _subtitle)}>How to buy on Mobile App</h2>
            <button onClick={closeModal} style={{ float: "right", marginTop: "-44px" }} >&#10006;</button>
            <div style={{ marginTop: 30 }}>
              <p><span className='font-weight-bold'>Step 1</span>: Open the MetaMask mobile app</p>
              <p><span className='font-weight-bold'>Step 2</span>: Click on the "Browser" button at the bottom of the screen</p>
              <p><span className='font-weight-bold'>Step 3</span>: Type in the URL of the web3 platform</p>
              <p><span className='font-weight-bold'>Step 4</span>: Click on the "Connect" button to allow access to your MetaMask wallet</p>
              <p><span className='font-weight-bold'>Step 5</span>: Sign the transaction to connect your wallet to the platform</p>
              <p><span className='font-weight-bold'>Step 6</span>: Confirm the transaction</p>
              <p>You will now be connected to the web3 platform and can start using its features.</p>
            </div>
          </Modal>
          {/* </div> */}
        </Reveal>
      </div>
      {loading ? (
        <div className='backdrop-loading'>
          <Loading className='loading'>
            <ReactLoading type={'spinningBubbles'} color="#fff" />
          </Loading>
        </div>
      ) : (
        <>
          <Reveal className='onStep' keyframes={fadeIn} delay={800} duration={800} triggerOnce>
            <section className='presale-content'>
              <div className='presale-inner pt-3 pb-4'>
                <div className="row">
                  <div className="flex justify-content-between mb-3">
                    <div className='flex flex-column flex-md-row gap-2 '>
                      <span>Start Time: </span>
                      <span>{startTime === 0 ? <LoadingSkeleton /> : getUTCDate(startTime)}</span>
                    </div>
                    <div className='flex flex-column flex-md-row gap-2'>
                      <span>End Time: </span>
                      <span>{endTime === 0 ? <LoadingSkeleton /> : getUTCDate(endTime)}</span>
                    </div>
                  </div>
                  {(
                    <>
                      {getUTCNow() / 1000 >= endTime ? (
                        <>
                          <div className='end-content'>
                            <span className='fs-20 fw-bold'>PRESALE HAS ENDED</span>
                          </div>
                          {/* <p className='fs-20 fw-bold mt-3 mb-1 text-gray'>Your Holdings (Staik): <span className='text-white'>{paidUSDT === '' ? <LoadingSkeleton /> : numberWithCommas(paidUSDT / Number(usdtPrice))}</span></p> */}
                          <p className='fs-20 fw-bold mt-3 mb-1 text-gray'>Your Holdings ({TOKEN_NAME}): <span className='text-white'>{paidUSDT === '' ? <LoadingSkeleton /> : numberWithCommas(balance.fiziBalance)}</span></p>
                        </>
                      ) : (
                        <>
                          {getUTCNow() / 1000 <= startTime ? (
                            <>
                              <div className='end-content'>
                                <span className='fs-20 fw-bold'>TIME REMAINING TO START PRESALE</span>
                              </div>
                              <div className="col-md-8 clock-widget align-self-center">
                                <Clock deadline={startTime * 1000} setStarted={(value) => setStarted(value)} />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className='col-md-4 align-self-center'>
                                <h3>TIME REMAINING TO PARTICIPATE IN PRESALE</h3>
                              </div>
                              <div className="col-md-8 align-self-center">
                                <Clock deadline={endTime * 1000} setEnded={(value) => setEnded(value)} />
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>
          </Reveal>
          {/* {getUTCNow() / 1000 <= startTime && (
            <Reveal className='presale-content main mt-3 onStep' keyframes={fadeIn} delay={800} duration={800} triggerOnce>
              <div className='end-content'>
                <span className='fs-20 fw-bold'>TIME REMAINING TO START PRESALE</span>
              </div>
              <div className="col-md-8 align-self-center">
                <Clock deadline={startTime * 1000} setEnded={(value) => setEnded(value)} />
              </div>
            </Reveal>
          )} */}
          {getUTCNow() / 1000 <= endTime && (
            <Reveal className='presale-content main mt-3 onStep' keyframes={fadeIn} delay={800} duration={800} triggerOnce>
              <div className='presale-inner'>
                <div className="row justify-center">
                  {/* <div className="col-md-6 col-sm-6 mt-5">
                    <div className="amount_bar px-3">
                      <h3>Presale Amount received</h3>
                      <div className='progress-bg m-auto'>
                        <AmountBackGradientSVG />
                        <AmountGradientSVG />
                        <CircularProgressbar
                          value={amountPercent}
                          text={`${numberWithCommas(amountPercent, 2)}%`}
                          styles={buildStyles({
                            pathColor: `url(#amount)`,
                            textColor: '#00DB8B',
                            strokeLinecap: "butt",
                            trailColor: `url(#amountBack)`
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-sm-6 mt-5">
                    <div className="amount_bar px-3">
                      <h3>Your Hard Cap Amount</h3>
                      <div className='progress-bg m-auto'>
                        <CapBackGradientSVG />
                        <CapGradientSVG />
                        <CircularProgressbar
                          value={capPercent}
                          text={`${numberWithCommas(capPercent, 2)}%`}
                          styles={buildStyles({
                            pathColor: `url(#cap)`,
                            textColor: '#EF1485',
                            strokeLinecap: "butt",
                            trailColor: `url(#capBack)`
                          })}
                        />
                      </div>
                    </div>
                  </div> */}
                  <div className='col-md-12 mt-3'>
                    {isMobile ? (
                      <>
                        {/* <p className='fs-20 mb-1'>Presale Amount received <br /><strong>{curPresale === '' ? <LoadingSkeleton /> : '$' + numberWithCommas(curPresale) + ' USDT'}</strong></p>
                        <p className='fs-20 mb-1'>Maximum Presale Amount Allocated <br /><strong>{usdtPrice === '' ? <LoadingSkeleton /> : '$' + numberWithCommas(max_token_amount * Number(usdtPrice)) + ' USDT'}</strong></p> */}
                        <p className='fs-20 mb-1'>{TOKEN_NAME} Price <br /><strong>{usdtPrice === '' ? <LoadingSkeleton /> : '$' + numberWithCommas(Number(usdtPrice))}</strong></p>
                      </>
                    ) : (
                      <>
                        {/* <p className='fs-20 mb-1'>Presale Amount received : <strong>{curPresale === '' ? <LoadingSkeleton /> : '$' + numberWithCommas(curPresale) + ' USDT'}</strong></p>
                        <p className='fs-20 mb-1'>Maximum Presale Amount Allocated : <strong>{usdtPrice === '' ? <LoadingSkeleton /> : '$' + numberWithCommas(max_token_amount * Number(usdtPrice)) + ' USDT'}</strong></p> */}
                        <p className='fs-20 mb-1'>{TOKEN_NAME} Price : <strong>{usdtPrice === '' ? <LoadingSkeleton /> : '$' + numberWithCommas(Number(usdtPrice))}</strong></p>
                      </>
                    )}
                  </div>
                  {(/*startPresale && */leftCap > 0) && (
                    <>
                      {maxTotalCap <= paidUSDT && false ? (
                        <div className='buy_content'>
                          <p className='fs-20 mb-1'>You have got the maximum {TOKEN_NAME} on presale.</p>
                          <p className='fs-20 mb-1'>Your Holdings (Staik): {paidUSDT === '' ? <LoadingSkeleton /> : numberWithCommas(paidUSDT / Number(usdtPrice))}</p>
                        </div>
                      ) : (
                        <div className='col-md-12 mt-3'>
                          <div className='buy_content'>
                            <div className='row'>
                              <div className='col-md-12'>
                                <p className='fs-20'>Please enter the {TOKEN_NAME} amount you'd like to purchase</p>
                                <div className='presale-input flex'>
                                  <div className="input-token-panel">
                                    <div className='flex justify-between'>
                                      <label className="fs-20">From</label>
                                      <span className='fs-20'>Balance: {numberWithCommas(Number(fromBalance))}</span>
                                    </div>
                                    <div className="d-flex justify-content-between input-box">
                                      <input type="number" className="input-token" name="input_from" placeholder='0.0' value={tokenAmountA} onChange={handleChange}></input>
                                      <button className='btn-max swap-color' onClick={handleMax}>MAX</button>
                                      <SelectCoin className='select-coin' value={coinType} onChange={handleSelectCoin} />
                                    </div>
                                  </div>
                                  <IconButton component="span" className="btn-change mx-auto">
                                    {isMobile ? (
                                      <i className="fa-solid fa-arrow-down"></i>
                                    ) : (
                                      <i className="fa-solid fa-arrow-right"></i>
                                    )}
                                  </IconButton>
                                  <div className="input-token-panel">
                                    <div className='flex justify-between'>
                                      <label className="fs-20">To</label>
                                      <span className='fs-20'>Balance: {numberWithCommas(Number(fiziBalance))}</span>
                                    </div>
                                    <div className="d-flex justify-content-between input-box">
                                      <input type="number" className="input-token" name="input_from" placeholder='0.0' value={pFiziAmount} onChange={handleChangeToken}></input>
                                      {/* <p className="input-token mb-0">{numberWithCommas(pFiziAmount, 1)}&nbsp;
                                        {coinType === 0 && (
                                          <span>{toBNBPrice === 0 ? '' : ' ($' + numberWithCommas(Number(toBNBPrice), 2) + ')'}</span>
                                          // <span>{toBNBPrice === 0 ? '' : numberWithCommas(Number(toBNBPrice), 2)}</span>
                                        )}
                                      </p> */}
                                      <div className='flex align-items-center gap-2' style={{ padding: '10px' }}>
                                        <img
                                          loading="lazy"
                                          width="35"
                                          height="35"
                                          src="/img/icons/token_icon.png"
                                          alt={`Coin of ${TOKEN_NAME}`}
                                        />
                                        <span className='fs-20'>{TOKEN_NAME}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className='col-md-12 mt-3'>
                                {((coinType === 0) || (busdApproveState && coinType === 1) || (usdtApproveState && coinType === 2) || (ethApproveState && coinType === 3) || (btcbApproveState && coinType === 4)) ?
                                  <LoadingButton
                                    onClick={handleBuy}
                                    endIcon={<></>}
                                    loading={pending}
                                    loadingPosition="end"
                                    variant="contained"
                                    className="btn-buy btn-main btn6 m-auto fs-20 sm:p-1"
                                    disabled={!started}
                                  >
                                    BUY {TOKEN_NAME}
                                  </LoadingButton> :
                                  <LoadingButton
                                    onClick={handleApprove}
                                    endIcon={<></>}
                                    loading={pending}
                                    loadingPosition="end"
                                    variant="contained"
                                    className="btn-buy btn-main btn6 m-auto fs-20"
                                    disabled={!started}
                                  >
                                    Approve
                                  </LoadingButton>}
                              </div>
                              <div className='flex justify-center align-items-center gap-3 mt-3 cursor-pointer add-token-metamask' onClick={addTokenCallback}>
                                <img src="/img/icons/metamask.png" alt="" width="30"></img>
                                <span style={{ whiteSpace: 'nowrap' }}> Add {TOKEN_NAME} to MetaMask</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </>
      )}
    </div >
  );
};

export default TokenICO;    