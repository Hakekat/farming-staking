import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ethers } from "ethers";

import STACK_ABI from "../abi/stack.json";
import WBNB from "../abi/WBNB.json";
import moment from "moment";
import { useWeb3React } from "@web3-react/core";

import { useSelector } from "react-redux";

function Stake() {
  var Router = "0x9012e8C5B283e13a83D666c74C49C2b0407a2873";
  var RLQ = "0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4";

  let authState = useSelector((state) => state.auth);
  var { isConnected } = authState;

  const { library, account, active } = useWeb3React();
  const web3Obj = library;

  const [balance, setBalance] = useState(0);
  const [dipositAmount, setDipositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [isAllowance, setIsAllowance] = useState(false);
  const [loading, setLoadding] = useState(false);

  const [dipositModal, setDipositModal] = useState(false);
  const [dipositPercentage, setDipositPercentage] = useState(0);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawPercentage, setWithdrawPercentage] = useState(0);

  const [totalStake, setTotalStake] = useState(0);
  const [pendingReward, setPendingReward] = useState(0);

  const toggleWithdrawModal = () => {
    if (withdrawModal) {
      setWithdrawModal(false);
    } else {
      setWithdrawModal(true);
    }
  };

  const toggleDipositModal = () => {
    if (dipositModal) {
      setDipositModal(false);
    } else {
      setDipositModal(true);
    }
  };

  const notify = (isError, msg) => {
    if (isError) {
      toast.error(msg, {
        position: toast.POSITION.TOP_RIGHT,
      });
    } else {
      toast.success(msg, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const checkAllowance = async () => {
    try {
      setLoadding(true);

      var tokenContract = new web3Obj.eth.Contract(WBNB, RLQ);
      var decimals = await tokenContract.methods.decimals().call();
      var getBalance = await tokenContract.methods.balanceOf(account).call();

      var pow = 10 ** decimals;
      var balanceInEth = getBalance / pow;
      setBalance(balanceInEth);
      var allowance = await tokenContract.methods
        .allowance(account, Router)
        .call();

      if (allowance <= 2) {
        setIsAllowance(true);
      }
      // if (dipositAmount > 0) {
      //   var amount = dipositAmount * pow;
      //   if (allowance < amount) {
      //     setIsAllowance(true);
      //   }
      // }
      setLoadding(false);
    } catch (err) {
      setLoadding(false);
    }
  };

  const approve = async () => {
    setLoadding(true);
    try {
      var contract = new web3Obj.eth.Contract(WBNB, RLQ);
      var amountIn = 10 ** 69;
      amountIn = amountIn.toLocaleString("fullwide", { useGrouping: false });

      await contract.methods
        .approve(Router, amountIn.toString())
        .send({ from: account })
        .then(() => {
          setIsAllowance(false);
          // checkAllowance("0x5f7b680de12D3Da8eAB7C6309b5336cA1EF04172");
          setLoadding(false);
        });
    } catch (err) {
      setLoadding(false);
      notify(true, err.message);
    }
  };

  const dipositStake = async () => {
    setLoadding(true);
    try {
      var rqlContract = new web3Obj.eth.Contract(WBNB, RLQ);
      var decimals = await rqlContract.methods.decimals().call();
      var pow = Math.pow(10, decimals);
      var BN = web3Obj.utils.BN;
      var amount = dipositAmount * pow;
      var amountIn = new BN(amount.toString());

      console.log(amountIn.toString());
      var contract = new web3Obj.eth.Contract(STACK_ABI, Router);

      await contract.methods
        .deposit(amountIn.toString())
        .send({ from: account })
        .then((result) => {
          getUserInfo();
          setLoadding(false);
          notify(false, "successfully diposit RLQ");
          setDipositModal(false);
        });
    } catch (err) {
      console.log(err);
      setLoadding(false);
      notify(true, "diposit fail");
    }
  };

  const maxDiposit = async (percentage) => {
    setLoadding(true);
    try {
      var rqlContract = new web3Obj.eth.Contract(WBNB, RLQ);
      var decimals = await rqlContract.methods.decimals().call();
      var pow = Math.pow(10, decimals);

      var getBalance = await rqlContract.methods
        .balanceOf(account.toString())
        .call();
      var balanceInEth = getBalance / pow;
      balanceInEth = balanceInEth * percentage;
      setDipositAmount(balanceInEth.toFixed(10));
      setDipositPercentage(percentage);
      setLoadding(false);
    } catch (err) {
      setLoadding(false);
      notify(true, "maxDiposit fail");
    }
  };

  const withdrawStake = async () => {
    setLoadding(true);
    try {
      var rqlContract = new web3Obj.eth.Contract(WBNB, RLQ);
      var decimals = await rqlContract.methods.decimals().call();
      var pow = Math.pow(10, decimals);
      var BN = web3Obj.utils.BN;
      var amount = withdrawAmount * pow;
      var amountIn = new BN(amount.toString());

      var contract = new web3Obj.eth.Contract(STACK_ABI, Router);
      await contract.methods
        .withdraw(amountIn.toString())
        .send({ from: account })
        .then((result) => {
          getUserInfo();
          setLoadding(false);
          notify(false, "successfully unstake");
          //   withdrawModal();
        });
    } catch (err) {
      setLoadding(false);
      notify(true, "unstake fail");
    }
  };

  const maxWithdraw = async (percentage) => {
    setLoadding(true);
    try {
      var rqlContract = new web3Obj.eth.Contract(WBNB, RLQ);
      var decimals = rqlContract.methods.decimals().call();
      var pow = Math.pow(10, decimals);

      var getBalance = await rqlContract.methods
        .balanceOf(account.toString())
        .call();
      var balanceInEth = getBalance / pow;
      setBalance(balanceInEth);

      var contract = new web3Obj.eth.Contract(STACK_ABI, Router);
      var userInfo = await contract.methods.userInfo(account).call();

      if (parseFloat(userInfo.amount) === 0) {
        var totalStakedAmount = userInfo.amount;
      } else {
        var totalStakedAmount = parseFloat(userInfo.amount) / pow;
      }
      totalStakedAmount = totalStakedAmount * percentage;
      setWithdrawAmount(totalStakedAmount);
      setWithdrawPercentage(percentage);
      setLoadding(false);
    } catch (err) {
      setLoadding(false);
      notify(true, "maxWithdraw fail");
    }
  };

  const harvest = async () => {
    setLoadding(true);
    try {
      var contract = new web3Obj.eth.Contract(STACK_ABI, Router);
      await contract.methods
        .deposit(0)
        .send({ from: account })
        .then((err) => {
          getUserInfo();
          setLoadding(false);
          notify(false, "Reward successfully harvested");
        });
    } catch (err) {
      console.log(err);
      setLoadding(false);
      notify(true, err.message);
    }
  };

  const getUserInfo = async () => {
    setLoadding(true);
    try {
      
      var contract = new web3Obj.eth.Contract(STACK_ABI, Router);
      var userInfo = await contract.methods.userInfo(account).call();
      var pendingReward = await contract.methods.pendingReward(account).call();

      var rqlContract = new web3Obj.eth.Contract(WBNB, RLQ);
      var decimals = await rqlContract.methods.decimals().call();
      var rlq_pow = Math.pow(10, decimals);

      if (parseFloat(pendingReward) === 0) {
        var totalStakedAmount = pendingReward;
      } else {
        var totalStakedAmount = parseFloat(pendingReward) / rlq_pow;
      }
      setPendingReward(totalStakedAmount);

      if (parseFloat(userInfo.amount) === 0) {
        var totalStakedAmount = userInfo.amount;
      } else {
        var totalStakedAmount = parseFloat(userInfo.amount) / rlq_pow;
      }
      setTotalStake(totalStakedAmount);
    } catch (err) {
      console.log(err);
      setLoadding(false);
      // notify(true, "diposit fail");
    }
  };

  useEffect(() => {
    if (isConnected) {
      checkAllowance();
      getUserInfo();
    } else {
    }
  }, [isConnected, account]);

  return (
    <>
      <div>
        <div>
          <div className="stack-section">
            <div className="container">
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12 col-xl-12">
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12 col-xl-6">
                      <div className="stack-box">
                        <div className="stack-header">
                          <div className="float">
                            <div className="logo">
                              <img src="images/stack-logo.png" alt="" />
                            </div>
                            <div className="title1">
                              <p>Earn BUSD</p>
                              <span style={{ fontSize: "15px!important" }}>
                                Stack your Reallix{" "}
                              </span>
                            </div>
                          </div>
                          <div className="right-side">
                            <div className="sr-btn-wrap">
                              <a href="#/" className="sr-btn">
                                BUSD
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="balance">
                          <div className="first-block">
                            <h5>APR</h5>
                            <p>Start Earning</p>

                            <h5 style={{ marginTop: "15px", fontSize: "18px" }}>
                              BUSD Earned
                            </h5>
                            <p> {parseFloat(pendingReward).toFixed(10)}</p>
                          </div>
                          <div className="second-block">
                            <p>
                              63.39% <i className="fa fa-calculator"></i>
                            </p>
                            <h3>10</h3>
                          </div>

                          {isConnected ? (
                            isAllowance ? (
                              <div className="btn-section mb-0">
                                <button
                                  onClick={() => approve()}
                                  disabled={loading}
                                  className="btn btn-danger-1"
                                >
                                  {loading
                                    ? "Please wait, Loading.."
                                    : "Enable"}
                                </button>
                              </div>
                            ) : (
                              <div className="small-btn">
                                <div className="sr-btn-wrap">
                                  <button
                                    onClick={() => harvest()}
                                    disabled={loading}
                                    className="sr-btn"
                                  >
                                    Harvest
                                  </button>
                                  <button
                                    className="small"
                                    onClick={() => toggleDipositModal()}
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() => toggleWithdrawModal()}
                                    className="small"
                                  >
                                    -
                                  </button>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="btn-section">
                              <a
                                href="#/"
                                className="btn btn-danger-1"
                                data-toggle="modal"
                                data-target="#myModal"
                              >
                                Connect Wallet
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="reallix-section">
                          <div className="first-section">
                            <span>Total Stacked</span>
                            <p>{parseFloat(totalStake).toFixed(10)}</p>
                          </div>
                          <div className="second-section">
                            <div className="sr-btn-wrap">
                              <a href="/#" className="sr-btn">
                                Manual
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="reallix-section">
                          <div className="first-section">
                            <span>Ends In :</span>
                            <p>1.718.627 Blocks</p>
                          </div>
                          <div className="second-section">
                            <a href="/#">Token Info</a>
                            <a href="/#">Project Site</a>
                          </div>
                        </div>
                        <div className="reallix-section">
                          <div className="first-section">
                            <span>Max Staked / User</span>
                            <p>3000 Reallix</p>
                          </div>
                          <div className="second-section">
                            <a href="">View Contract</a>
                            <a href="">Add to Metamask</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="stack-section">
          <div className="stack-box">
            <div
              className={`modal ${dipositModal ? "show" : ""}`}
              id="dipositModal"
              style={{
                display: `${dipositModal ? "block" : "none"}`,
              }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title">Stake in Pool</h4>
                    <button
                      type="button"
                      className="close"
                      onClick={() => toggleDipositModal()}
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="add-liquidity">
                      <div className="balence">
                        <h5>Stake</h5>
                        <h6>RLQ - BUSD</h6>
                      </div>
                      <div className="form-row">
                        <div className="pt-3 d-flex col-md-12 col-sm-12">
                          <input
                            type="text"
                            className="form-control"
                            id="firstname"
                            name="firstname"
                            placeholder="0000.00"
                            value={dipositAmount}
                            onChange={(e) => setDipositAmount(e.target.value)}
                          />
                          <button
                            className="input-button"
                            onClick={() => maxDiposit(0.99)}
                          >
                            Max
                          </button>
                        </div>
                      </div>
                      <h5>Balance : {parseFloat(balance).toFixed(10)}</h5>
                    </div>
                    <div className="btn-section">
                      <button
                        type="button"
                        onClick={() => maxDiposit(0.25)}
                        className={
                          dipositPercentage === 0.25
                            ? "button-word active"
                            : "button-word"
                        }
                      >
                        25%
                      </button>
                      <button
                        type="button"
                        onClick={() => maxDiposit(0.5)}
                        className={
                          dipositPercentage === 0.5
                            ? "button-word active"
                            : "button-word"
                        }
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => maxDiposit(0.75)}
                        className={
                          dipositPercentage === 0.75
                            ? "button-word active"
                            : "button-word"
                        }
                      >
                        75%
                      </button>
                      <button
                        type="button"
                        onClick={() => maxDiposit(0.99)}
                        className={
                          dipositPercentage === 0.99
                            ? "button-word active"
                            : "button-word"
                        }
                      >
                        99%
                      </button>

                      <button
                        onClick={() => dipositStake()}
                        disabled={loading}
                        className="btn btn-danger-1"
                      >
                        {loading ? "Please wait, Loading.." : "Confirm"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`modal ${withdrawModal ? "show" : ""}`}
              id="dipositModal"
              style={{
                display: `${withdrawModal ? "block" : "none"}`,
              }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title">unStake</h4>
                    <button
                      type="button"
                      className="close"
                      onClick={() => toggleWithdrawModal()}
                    >
                      ×
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="add-liquidity">
                      <div className="balence">
                        <h5>unStake</h5>
                        <h6>RLQ - BUSD</h6>
                      </div>
                      <div className="form-row">
                        <div className="pt-3 d-flex col-md-12 col-sm-12">
                          <input
                            type="text"
                            className="form-control"
                            id="firstname"
                            name="firstname"
                            placeholder="0000.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                          <button
                            className="input-button"
                            onClick={() => maxWithdraw(0.99)}
                          >
                            Max
                          </button>
                        </div>
                      </div>
                      <h5>Balance : {parseFloat(totalStake).toFixed(10)}</h5>
                    </div>
                    <div className="btn-section">
                      <button
                        type="button"
                        onClick={() => maxWithdraw(0.25)}
                        className={
                          withdrawPercentage === 0.25
                            ? "button-word active"
                            : "button-word"
                        }
                      >
                        25%
                      </button>
                      <button
                        type="button"
                        onClick={() => maxWithdraw(0.5)}
                        className={
                          withdrawPercentage === 0.5
                            ? "button-word active"
                            : "button-word"
                        }
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => maxWithdraw(0.75)}
                        className={
                          withdrawPercentage === 0.75
                            ? "button-word active"
                            : "button-word"
                        }
                      >
                        75%
                      </button>
                      <button
                        type="button"
                        onClick={() => maxWithdraw(0.99)}
                        className={
                          withdrawPercentage === 0.99
                            ? "button-word active"
                            : "button-word"
                        }
                      >
                        99%
                      </button>

                      <button
                        onClick={() => withdrawStake()}
                        disabled={loading}
                        className="btn btn-danger-1"
                      >
                        {loading ? "Please wait, Loading.." : "Confirm"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}

export default Stake;
