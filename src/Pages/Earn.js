import React, { useState, useEffect } from "react";
import Navbar from "../component/Navbar";
import Stake from "./Stake";
import { ToastContainer, toast } from "react-toastify";

import { useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";

import STACK_ABI from "../abi/stack.json";
import WBNB from "../abi/WBNB.json";
import Firstsection from "../Pages/Firstsection";
import Exchange from "../Pages/Exchange";


export const Earn = () => {
  var Router = "0x2d2C213558e3acbd30a5B6E49967eb49eE93Ca8e";
  var ORDO = "0x0106591B1372BbCcB9D2a5A1fe7f421c2D149C07";

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

      var tokenContract = new web3Obj.eth.Contract(WBNB, ORDO);
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
      var contract = new web3Obj.eth.Contract(WBNB, ORDO);
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
      var ordoContract = new web3Obj.eth.Contract(WBNB, ORDO);
      var decimals = await ordoContract.methods.decimals().call();
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
          notify(false, "successfully diposit ORDO");
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
      var ordoContract = new web3Obj.eth.Contract(WBNB, ORDO);
      var decimals = await ordoContract.methods.decimals().call();
      var pow = Math.pow(10, decimals);

      var getBalance = await ordoContract.methods
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
      var ordoContract = new web3Obj.eth.Contract(WBNB, ORDO);
      var decimals = await ordoContract.methods.decimals().call();
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
      var ordoContract = new web3Obj.eth.Contract(WBNB, ORDO);
      var decimals = ordoContract.methods.decimals().call();
      var pow = Math.pow(10, decimals);

      var getBalance = await ordoContract.methods
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
      totalStakedAmount = totalStakedAmount * 1;
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

      var ordoContract = new web3Obj.eth.Contract(WBNB, ORDO);
      var decimals = await ordoContract.methods.decimals().call();
      var ORDO_pow = Math.pow(10, decimals);

      if (parseFloat(pendingReward) === 0) {
        var totalStakedAmount = pendingReward;
      } else {
        var totalStakedAmount = parseFloat(pendingReward) / (ORDO_pow * 1000000000);
      }
      setPendingReward(totalStakedAmount);

      if (parseFloat(userInfo.amount) === 0) {
        var totalStakedAmount = userInfo.amount;
      } else {
        var totalStakedAmount = parseFloat(userInfo.amount) / ORDO_pow;
      }
      setTotalStake(totalStakedAmount);
    } catch (err) {
      console.log(err);
      setLoadding(false);
      // notify(true, "diposit fail");
    }
  };

  useEffect(() => {
    if (isConnected && active) {
      checkAllowance();
      getUserInfo();
    }
  }, [isConnected, account]);

  return (
    <>
      <Navbar />
      <div>
        <section className="product-description-review-section">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12 xl-12">


                {/*<ul
                  id="myTab1"
                  role="tablist"
                  className="nav nav-tabs nav-pills"
                >
                  <li className="nav-item">
                    <a
                      id="description-tab"
                      data-toggle="tab"
                      href="#description"
                      role="tab"
                      aria-controls="description"
                      aria-selected="false"
                      className="nav-link border-1 active show"
                    >
                      Farming
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      id="review-tab"
                      data-toggle="tab"
                      href="#review"
                      role="tab"
                      aria-controls="review"
                      aria-selected="true"
                      className="nav-link border-1 "
                    >
                      Staking
                    </a>
                  </li>

                  <li className="nav-item">
                    <a
                      id="review-tab"
                      data-toggle="tab"
                      href="#reviews"
                      role="tab"
                      aria-controls="review"
                      aria-selected="true"
                      className="nav-link border-1 "
                    >
                      Swap
                    </a>
                  </li>

       
                 
                </ul> */}





                <div id="myTab1Content" className="tab-content">
                  <div
                    id="description"
                    role="tabpanel"
                    aria-labelledby="description-tab"
                    className="tab-pane fade active show"
                  >
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xl-12">
                      <div className="slider">
                      </div>
                    </div>



                    <div className="row">
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="add-liquidity" style={{
                                      background: "#0c153c",
                                      borderRadius: "20px",
                                      padding: "10px 10px 20px 17px",
                                      width: "100%",
                                      marginBottom: "20px",
                                    }}>
                                  <div className="form-row">
                                    <div className="wizard-form-input">
                                      <p>Your Balance</p>
                                      <h2>
                                    {parseFloat(balance).toFixed(2)} <span style={{
                                      background: "#1bda7a",
                                      borderRadius: "30px",
                                      padding: "2px 13px 2px 13px",
                                      position: "absolute",
                                      marginLeft: "25px",
                                    }}>ORDO</span>
                                  </h2>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="add-liquidity" style={{
                                      background: "#0c153c",
                                      borderRadius: "20px",
                                      padding: "10px 10px 20px 17px",
                                      width: "100%",
                                      marginBottom: "20px",
                                    }}>
                                  <div className="form-row">
                                    <div className="wizard-form-input">
                                      <p>Total Staked</p>
                                      <h2>
                                    {parseFloat(totalStake).toFixed(2)} <span style={{
                                      background: "#1bda7a",
                                      borderRadius: "30px",
                                      padding: "2px 13px 2px 13px",
                                      position: "absolute",
                                      marginLeft: "25px",
                                    }}>ORDO</span>
                                  </h2>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="add-liquidity" style={{
                                      background: "#0c153c",
                                      borderRadius: "20px",
                                      padding: "10px 10px 20px 17px",
                                      width: "100%",
                                      marginBottom: "20px",
                                    }}>
                                  <div className="form-row">
                                    <div className="wizard-form-input">
                                      <p>Total Unstaked</p>
                                      <h2>
                                    {parseFloat(balance).toFixed(2)} <span style={{
                                      background: "#1bda7a",
                                      borderRadius: "30px",
                                      padding: "2px 13px 2px 13px",
                                      position: "absolute",
                                      marginLeft: "25px",
                                    }}>ORDO</span>
                                  </h2>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>


                            <div className="col-lg-12 col-md-12 col-sm-12 col-xl-12">
                      <div className="slider">
                      <p style={{marginTop: "50px"}}>powerded by BSC</p>
                        <h3 style={{marginTop: "-12px", marginBottom: "50px"}}>
                  Stake Your Ordo
                </h3>
                      </div>
                    </div>


                    <div>
                    </div>

                    <div
                      className="panel-group"
                      id="accordion"
                      role="tablist"
                      aria-multiselectable="true"
                    >
                     

                      <div className="panel panel-default">
                        <div
                          className="panel-heading"
                          role="tab"
                          id="headingOne"
                        >
                          <h4 className="panel-title">
                            <a
                              role="button"
                              data-toggle="collapse"
                              data-parent="#accordion"
                              href="#collapseOne"
                              aria-expanded="true"
                              aria-controls="collapseOne"
                              style={{ marginTop: "0px" }}
                            >
                              <div className="left-section">
                                <div className="img-section">
                                  <img src="images/logo3.png" alt="" />
                                </div>
                                <div className="img-section">
                                  <img src="images/usdt.png" alt="" />
                                </div>
                                <p>ORDO - USDT</p>

                              </div>
                              <div className="right-section">
                                <div className="paragraph">
                                  <p>Earned</p>
                                  <h6>
                                    {parseFloat(pendingReward).toFixed(5)} USDT
                                  </h6>
                                </div>
                                <div className="paragraph">
                                  <p>APY</p>
                                  <h6>500%</h6>
                                </div>
                                <div className="paragraph">
                                  <p>Vesting</p>
                                  <h6>None</h6>
                                </div>



                              </div>
                            </a>
                          </h4>
                        </div>
                        <div
                          id="collapseOne"
                          className="panel-collapse collapse in"
                          role="tabpanel"
                          aria-labelledby="headingOne"
                        >
                          <div
                            className="panel-body"
                            style={{
                              background: "#0c153c",
                              padding: "15px",
                              borderRadius: "15px",
                              marginBottom: "30px",
                            }}
                          >
                            <div className="row">
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="add-liquidity">
                                  <div className="form-row">
                                    <div className="wizard-form-input">
                                      <p style={{
                                      fontSize: "14px",
                                    }}>ORDO Staked</p>
                                      <p>
                                        {parseFloat(totalStake).toFixed(10)}
                                      </p>
                                      {/* <input
                                        type="text"
                                        className="form-control"
                                        id="firstname"
                                        name="firstname"
                                        placeholder="0.000"
                                      /> */}
                                    </div>
                                  </div>

                                  {isConnected ? (
                                    isAllowance ? (
                                      <div className="btn-section">
                                        <button
                                          onClick={() => approve()}
                                          disabled={loading}
                                          className="btn-danger-1"
                                          style={{ width: "auto" }}
                                        >
                                          {loading
                                            ? "Please wait, Loading.."
                                            : "Approve"}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="btn-section">
                                        <button
                                          onClick={() => toggleWithdrawModal()}
                                          className="btn-danger-1"
                                          style={{ width: "auto" }}
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            fill="#fff"
                                            color="primary"
                                            width="24px"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path d="M18 13H6C5.45 13 5 12.55 5 12C5 11.45 5.45 11 6 11H18C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13Z"></path>
                                          </svg>
                                        </button>
                                        <button
                                          onClick={() => toggleDipositModal()}
                                          className="btn-danger-1"
                                          style={{ width: "auto" }}
                                        >
                                          <svg
                                            viewBox="0 0 24 24"
                                            color="primary"
                                            fill="#fff"
                                            width="24px"
                                            height="24px"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path d="M18 13H13V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V13H6C5.45 13 5 12.55 5 12C5 11.45 5.45 11 6 11H11V6C11 5.45 11.45 5 12 5C12.55 5 13 5.45 13 6V11H18C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13Z"></path>
                                          </svg>
                                        </button>
                                      </div>
                                    )
                                  ) : (
                                    <div className="btn-section">
                                      <button
                                        href="#/"
                                        className="btn-danger-1"
                                        data-toggle="modal"
                                        data-target="#myModal"
                                      >
                                        Connect Wallet
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <span>
                                </span>
                              </div>
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="add-liquidity">
                                  <div className="form-row">
                                    <div className="wizard-form-input">
                                      <p style={{
                                      fontSize: "14px",
                                    }}>USDT Earned</p>
                                      <p>
                                        {parseFloat(pendingReward).toFixed(10)}
                                      </p>
                                      {/* <input
                                        type="text"
                                        className="form-control"
                                        id="firstname"
                                        name="firstname"
                                        placeholder="1.231"
                                      /> */}
                                    </div>
                                  </div>

                                  <div className="btn-section">
                                    <button
                                      onClick={() => harvest()}
                                      disabled={loading}
                                      className="btn-danger-1"
                                      style={{ width: "auto" }}
                                    >
                                      Harvest
                                    </button>
                                  </div>

                                  <div
                                    className={`modal ${
                                      dipositModal ? "show" : ""
                                    }`}
                                    id="dipositModal"
                                    style={{
                                      display: `${
                                        dipositModal ? "block" : "none"
                                      }`,
                                    }}
                                  >
                                    <div className="modal-dialog">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h4 className="modal-title">
                                            Staked ORDO
                                          </h4>
                                          <button
                                            type="button"
                                            className="close"
                                            onClick={() => toggleDipositModal()}
                                          >
                                            ×
                                          </button>
                                        </div>
                                        <div className="modal-body">
                                          <div className="add-liquidity mb-3">
                                            <div className="row">
                                              <div className="col-6 text-label" style={{ color: "#ffffff", }}>Stake</div>
                                              <div className="col-6 text-right" style={{ color: "#ffffff", }}>ORDO</div>
                                            </div>
                                            <div className="form-row">
                                              <div className="d-flex col-md-12 col-sm-12 col-12 my-2">
                                                <input
                                                  type="text"
                                                  className="form-control text-white"
                                                  id="firstname"
                                                  name="firstname"
                                                  placeholder="0000.00"
                                                  value={dipositAmount}
                                                  onChange={(e) =>
                                                    setDipositAmount(
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                                <button
                                                  className="input-button"
                                                  onClick={() => maxDiposit(0.99)}
                                                >
                                                  Max
                                                </button>
                                              </div>
                                              <div className="d-flex col-md-12 col-sm-12" style={{ color: "#ffffff", }}>
                                                Balance :{" "}
                                                {parseFloat(balance).toFixed(10)}
                                              </div>
                                            </div>
                                            
                                          </div>
                                          <div className="row mb-3">
                                            <div className="col-6">
                                              <button
                                                className="btn btn-danger-2 active text-white btn-block"
                                                onClick={() => dipositStake()}
                                                disabled={loading}
                                              >
                                                {loading
                                                  ? "Loading.."
                                                  : "Confirm"}
                                              </button>
                                            </div>
                                            <div className="col-6">
                                              <button
                                                onClick={() =>
                                                  toggleDipositModal()
                                                }
                                                className="btn btn-danger-2 text-white  btn-block"
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className={`modal ${
                                      withdrawModal ? "show" : ""
                                    }`}
                                    id="withDrawalModal"
                                    style={{
                                      display: `${
                                        withdrawModal ? "block" : "none"
                                      }`,
                                    }}
                                  >
                                    <div className="modal-dialog">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h4 className="modal-title">
                                            Unstaked ORDO
                                          </h4>
                                          <button
                                            type="button"
                                            className="close"
                                            onClick={() =>
                                              toggleWithdrawModal()
                                            }
                                          >
                                            ×
                                          </button>
                                        </div>
                                          <div className="modal-body">
                                          <div className="add-liquidity mb-3">
                                            <div className="row">
                                              <div className="col-6 text-label" style={{ color: "#ffffff", }}>unstake</div>
                                              <div className="col-6 text-right" style={{ color: "#ffffff", }}>ORDO</div>
                                            </div>
                                            <div className="form-row">
                                              <div className="d-flex col-md-12 col-sm-12 col-12 my-2">
                                                <input
                                                  type="text"
                                                  className="form-control text-white"
                                                  id="firstname"
                                                  name="firstname"
                                                  placeholder="0000.00"
                                                  value={withdrawAmount}
                                                  onChange={(e) =>
                                                    setWithdrawAmount(
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                                <button
                                                  className="input-button"
                                                  onClick={() => maxWithdraw(1.0)}
                                                >
                                                  Max
                                                </button>
                                              </div>
                                              <div className="d-flex col-md-12 col-sm-12" style={{ color: "#ffffff", }}>
                                                Staked :{" "}
                                                {parseFloat(totalStake).toFixed(
                                                  10
                                                )}
                                              </div>
                                            </div>
                                            
                                          </div>
                                          <div className="row mb-3">
                                            <div className="col-6">
                                            <button
                                              className="btn btn-danger-2 active text-white btn-block"
                                              onClick={() => withdrawStake()}
                                              disabled={loading}
                                            >
                                              Confirm
                                            </button>
                                            </div>
                                            <div className="col-6">
                                            <button
                                              onClick={() =>
                                                toggleWithdrawModal()
                                              }
                                              className="btn btn-danger-2 text-white  btn-block"
                                            >
                                              Cancel
                                            </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="balance">
                                  <div className="first-block">
                                  </div>
                                  <div className="second-block">
                                  </div>
                                </div>
                                <div className="balance">
                                  <div className="first-block">
                                    <p>ORDO Staked</p>
                                    <h3> {parseFloat(totalStake).toFixed(2)} ORDO</h3>
                                  </div>
                                  <div className="second-block">
                                    <p>APR</p>
                                    <h3>73%</h3>
                                  </div>
                                </div>
                                <div className="token">
                                  <div className="line">
                                    <a
                                      target="_blank"
                                      href={`https://bscscan.com/address/${ORDO}`}
                                    >
                                      Token Info
                                    </a>
                                  </div>
                                  <div className="second-line">
                                    <a
                                      target="_blank"
                                      href={`https://pancakeswap.finance/swap?outputCurrency=${ORDO}`}
                                    >
                                      Get ORDO
                                    </a>
                                  </div>
                                </div>
                                <div className="token">
                                  <div className="line">
                                    <a
                                      target="_blank"
                                      href={`https://ordochain.com/`}
                                    >
                                      Project Site{" "}
                                    </a>
                                  </div>
                                  <div className="second-line">
                                    <a
                                      target="_blank"
                                      href={`https://bscscan.com/address/${Router}`}
                                    >
                                      View Contract
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
     

                    <div className="panel panel-default">
                        <div
                          className="panel-heading"
                          role="tab"
                          id="headingThree"
                        >
                          <h4 className="panel-title">
                            <a
                              role="button"
                              data-toggle="collapse"
                              data-parent="#accordion"
                              href="#collapseThree"
                              aria-expanded="true"
                              aria-controls="collapseThree"
                              style={{ marginTop: "0px" }}
                            >
                              <div className="left-section">
                                <div className="img-section">
                                  <img src="images/logo3.png" alt="" />
                                </div>
                                <div className="img-section">
                                  <img src="images/logo3.png" alt="" />
                                </div>
                                <p>ORDO - ORDO <h2 style={{
                                      color: "#f1f7f5",
                                      fontSize: "14px",
                                    }} >Coming Soon</h2></p>
                              </div>
                              <div className="right-section">
                                <div className="paragraph">
                                  <p>Earned</p>
                                  <h6>
                                  0.00000 ORDO
                                  </h6>
                                </div>
                                <div className="paragraph">
                                  <p>APY</p>
                                  <h6>500%</h6>
                                </div>
                                <div className="paragraph">
                                  <p>Vesting</p>
                                  <h6>None</h6>
                                </div>
                              </div>
                            </a>
                          </h4>
                        </div>
                        <div
                          id="collapseThree"
                          className="panel-collapse collapse in"
                          role="tabpanel"
                          aria-labelledby="headingThree"
                        >
                          <div
                            className="panel-body"
                            style={{
                              background: "#0c153c",
                              padding: "15px",
                              borderRadius: "15px",
                              marginBottom: "30px",
                            }}
                          >
                            <div className="row">
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="add-liquidity">
                                  <div className="form-row">
                                    <div className="wizard-form-input">
                                      <p style={{
                                      fontSize: "14px",
                                    }}>ORDO Staked</p>
                                      <p>
                                        0.00000
                                      </p>
                                      {/* <input
                                        type="text"
                                        className="form-control"
                                        id="firstname"
                                        name="firstname"
                                        placeholder="0.000"
                                      /> */}
                                    </div>
                                  </div>

                                    <div className="btn-section">
                                    <a href="" className="btn-danger-1">
                                      Approve
                                    </a>
                                  </div>
                                </div>
                                <span>
                                </span>
                              </div>
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="add-liquidity">
                                  <div className="form-row">
                                    <div className="wizard-form-input">
                                      <p style={{
                                      fontSize: "14px",
                                    }}>ORDO Earned</p>
                                      <p>
                                        0.00000
                                      </p>
                                      {/* <input
                                        type="text"
                                        className="form-control"
                                        id="firstname"
                                        name="firstname"
                                        placeholder="1.231"
                                      /> */}
                                    </div>
                                  </div>

                                  <div className="btn-section">
                                    <a
                                      href=""
                                      className="btn-danger-1"
                                      data-toggle="modal"
                                      data-target="#myModal-2"
                                    >
                                      Harvest
                                    </a>
                                  </div>

                                  <div
                                    className={`modal ${
                                      dipositModal ? "show" : ""
                                    }`}
                                    id="dipositModal"
                                    style={{
                                      display: `${
                                        dipositModal ? "block" : "none"
                                      }`,
                                    }}
                                  >
                                    <div className="modal-dialog">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h4 className="modal-title">
                                            Staked ORDO
                                          </h4>
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
                                              <h6>ORDO</h6>
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
                                                  onChange={(e) =>
                                                    setDipositAmount(
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                                <button
                                                  className="input-button"
                                                  onClick={() => maxDiposit(0.99)}
                                                >
                                                  Max
                                                </button>
                                              </div>
                                            </div>
                                            <h5>
                                              Balance :{" "}
                                              {parseFloat(balance).toFixed(10)}
                                            </h5>
                                          </div>
                                          <div className="danger">
                                            <button
                                              className="btn btn-danger-2 active"
                                              style={{ width: "auto" }}
                                              onClick={() => dipositStake()}
                                              disabled={loading}
                                            >
                                              {loading
                                                ? "Loading.."
                                                : "Confirm"}
                                            </button>
                                            <button
                                              onClick={() =>
                                                toggleDipositModal()
                                              }
                                              style={{ width: "auto" }}
                                              className="btn btn-danger-2"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className={`modal ${
                                      withdrawModal ? "show" : ""
                                    }`}
                                    id="withDrawalModal"
                                    style={{
                                      display: `${
                                        withdrawModal ? "block" : "none"
                                      }`,
                                    }}
                                  >
                                    <div className="modal-dialog">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h4 className="modal-title">
                                            Unstaked ORDO
                                          </h4>
                                          <button
                                            type="button"
                                            className="close"
                                            onClick={() =>
                                              toggleWithdrawModal()
                                            }
                                          >
                                            ×
                                          </button>
                                        </div>
                                        <div className="modal-body">
                                          <div className="add-liquidity">
                                            <div className="balence">
                                              <h5>unstake</h5>
                                              <h6>ORDO</h6>
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
                                                  onChange={(e) =>
                                                    setWithdrawAmount(
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                                <button
                                                  className="input-button"
                                                  onClick={() => maxWithdraw(1)}
                                                >
                                                  Max
                                                </button>
                                              </div>
                                            </div>
                                            <h5>
                                              Staked :{" "}
                                              {parseFloat(totalStake).toFixed(
                                                10
                                              )}
                                            </h5>
                                          </div>
                                          <div className="danger">
                                            <button
                                              className="btn btn-danger-2 active"
                                              style={{ width: "auto" }}
                                              onClick={() => withdrawStake()}
                                              disabled={loading}
                                            >
                                              Confirm
                                            </button>
                                            <button
                                              onClick={() =>
                                                toggleWithdrawModal()
                                              }
                                              className="btn btn-danger-2"
                                              style={{ width: "auto" }}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="balance">
                                  <div className="first-block">
                                  </div>
                                  <div className="second-block">
                                  </div>
                                </div>
                                <div className="balance">
                                  <div className="first-block">
                                    <p>ORDO Staked</p>
                                    <h3> 0.00 ORDO</h3>
                                  </div>
                                  <div className="second-block">
                                    <p>APR</p>
                                    <h3>73%</h3>
                                  </div>
                                </div>
                                <div className="token">
                                  <div className="line">
                                    <a
                                      target="_blank"
                                      href={`https://bscscan.com/address/${ORDO}`}
                                    >
                                      Token Info
                                    </a>
                                  </div>
                                  <div className="second-line">
                                    <a
                                      target="_blank"
                                      href={`https://pancakeswap.finance/swap?outputCurrency=0x0106591B1372BbCcB9D2a5A1fe7f421c2D149C07`}
                                    >
                                      Get ORDO
                                    </a>
                                  </div>
                                </div>
                                <div className="token">
                                  <div className="line">
                                    <a
                                      target="_blank"
                                      href={`https://ordochain.com/`}
                                    >
                                      Project Site{" "}
                                    </a>
                                  </div>
                                  <div className="second-line">
                                    <a
                                      target="_blank"
                                      href={`https://bscscan.com/address/${Router}`}
                                    >
                                      View Contract
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>



                      <div className="panel panel-default">
                        <div
                          className="panel-heading"
                          role="tab"
                          id="headingTwo"
                        >
                          <h4 className="panel-title">
                            <a
                              role="button"
                              data-toggle="collapse"
                              data-parent="#accordion"
                              href="#collapseTwo"
                              aria-expanded="true"
                              aria-controls="collapseTwo"
                              style={{ marginTop: "0px" }}
                            >
                              <div className="left-section">
                                <div className="img-section">
                                  <img src="images/logo3.png" alt="" />
                                </div>
                                <div className="img-section">
                                  <img src="images/xrp.png" alt="" />
                                </div>
                                <p>ORDO - XRP <h2 style={{
                                      color: "#f1f7f5",
                                      fontSize: "14px",
                                    }} >Coming Soon</h2></p>
                              </div>
                              <div className="right-section">
                                <div className="paragraph">
                                  <p>Earned</p>
                                  <h6>
                                    0.00000 ORDO
                                  </h6>
                                </div>
                                <div className="paragraph">
                                  <p>APY</p>
                                  <h6>500%</h6>
                                </div>
                                <div className="paragraph">
                                  <p>Vesting</p>
                                  <h6>None</h6>
                                </div>
                              </div>
                            </a>
                          </h4>
                        </div>
                        <div
                          id="collapseTwo"
                          className="panel-collapse collapse in"
                          role="tabpanel"
                          aria-labelledby="headingTwo"
                        >
                          <div
                            className="panel-body"
                            style={{
                              background: "#0c153c",
                              padding: "15px",
                              borderRadius: "15px",
                              marginBottom: "30px",
                            }}
                          >
                            <div className="row">
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="add-liquidity">
                                  <div className="form-row">
                                    <div className="wizard-form-input">
                                      <p style={{
                                      fontSize: "14px",
                                    }}>ORDO Staked</p>
                                      <p>0.00000
                                      </p>
                                      {/* <input
                                        type="text"
                                        className="form-control"
                                        id="firstname"
                                        name="firstname"
                                        placeholder="0.000"
                                      /> */}
                                    </div>
                                  </div>


                                  <div className="btn-section">
                                    <a href="" className="btn-danger-1">
                                      Approve
                                    </a>
                                  </div>
                                </div>
                                <span>
                                </span>
                              </div>
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="add-liquidity">
                                  <div className="form-row">
                                    <div className="wizard-form-input">
                                      <p style={{
                                      fontSize: "14px",
                                    }}>ORDO Earned</p>
                                      <p>
                                        0.00000
                                      </p>
                                      {/* <input
                                        type="text"
                                        className="form-control"
                                        id="firstname"
                                        name="firstname"
                                        placeholder="1.231"
                                      /> */}
                                    </div>
                                  </div>

                                  <div className="btn-section">
                                    <a
                                      href=""
                                      className="btn-danger-1"
                                      data-toggle="modal"
                                      data-target="#myModal-2"
                                    >
                                      Harvest
                                    </a>
                                  </div>

                                  <div
                                    className={`modal ${
                                      dipositModal ? "show" : ""
                                    }`}
                                    id="dipositModal"
                                    style={{
                                      display: `${
                                        dipositModal ? "block" : "none"
                                      }`,
                                    }}
                                  >
                                    <div className="modal-dialog">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h4 className="modal-title">
                                            Staked ORDO
                                          </h4>
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
                                              <h6>ORDO</h6>
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
                                                  onChange={(e) =>
                                                    setDipositAmount(
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                                <button
                                                  className="input-button"
                                                  onClick={() => maxDiposit(0.99)}
                                                >
                                                  Max
                                                </button>
                                              </div>
                                            </div>
                                            <h5>
                                              Balance :{" "}
                                              {parseFloat(balance).toFixed(10)}
                                            </h5>
                                          </div>
                                          <div className="danger">
                                            <button
                                              className="btn btn-danger-2 active"
                                              style={{ width: "auto" }}
                                              onClick={() => dipositStake()}
                                              disabled={loading}
                                            >
                                              {loading
                                                ? "Loading.."
                                                : "Confirm"}
                                            </button>
                                            <button
                                              onClick={() =>
                                                toggleDipositModal()
                                              }
                                              style={{ width: "auto" }}
                                              className="btn btn-danger-2"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className={`modal ${
                                      withdrawModal ? "show" : ""
                                    }`}
                                    id="withDrawalModal"
                                    style={{
                                      display: `${
                                        withdrawModal ? "block" : "none"
                                      }`,
                                    }}
                                  >
                                    <div className="modal-dialog">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h4 className="modal-title">
                                            Unstaked ORDO
                                          </h4>
                                          <button
                                            type="button"
                                            className="close"
                                            onClick={() =>
                                              toggleWithdrawModal()
                                            }
                                          >
                                            ×
                                          </button>
                                        </div>
                                        <div className="modal-body">
                                          <div className="add-liquidity">
                                            <div className="balence">
                                              <h5>unstake</h5>
                                              <h6>ORDO</h6>
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
                                                  onChange={(e) =>
                                                    setWithdrawAmount(
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                                <button
                                                  className="input-button"
                                                  onClick={() => maxWithdraw(1)}
                                                >
                                                  Max
                                                </button>
                                              </div>
                                            </div>
                                            <h5>
                                              Staked :{" "}
                                              {parseFloat(totalStake).toFixed(
                                                10
                                              )}
                                            </h5>
                                          </div>
                                          <div className="danger">
                                            <button
                                              className="btn btn-danger-2 active"
                                              style={{ width: "auto" }}
                                              onClick={() => withdrawStake()}
                                              disabled={loading}
                                            >
                                              Confirm
                                            </button>
                                            <button
                                              onClick={() =>
                                                toggleWithdrawModal()
                                              }
                                              className="btn btn-danger-2"
                                              style={{ width: "auto" }}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col-lg-4 col-md-4 col-sm-12 col-xl-4">
                                <div className="balance">
                                  <div className="first-block">
                                  </div>
                                  <div className="second-block">
                                  </div>
                                </div>
                                <div className="balance">
                                  <div className="first-block">
                                    <p>ORDO Staked</p>
                                    <h3> 0.00 ORDO</h3>
                                  </div>
                                  <div className="second-block">
                                    <p>APR</p>
                                    <h3>73%</h3>
                                  </div>
                                </div>
                                <div className="token">
                                  <div className="line">
                                    <a
                                      target="_blank"
                                      href={`https://bscscan.com/address/${ORDO}`}
                                    >
                                      Token Info
                                    </a>
                                  </div>
                                  <div className="second-line">
                                    <a
                                      target="_blank"
                                      href={`https://pancakeswap.finance/swap?outputCurrency=${ORDO}`}
                                    >
                                      Get ORDO
                                    </a>
                                  </div>
                                </div>
                                <div className="token">
                                  <div className="line">
                                    <a
                                      target="_blank"
                                      href={`https://ordochain.com/`}
                                    >
                                      Project Site{" "}
                                    </a>
                                  </div>
                                  <div className="second-line">
                                    <a
                                      target="_blank"
                                      href={`https://bscscan.com/address/${Router}`}
                                    >
                                      View Contract
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>


                    
                  </div>
                  <div
                    id="review"
                    role="tabpanel"
                    aria-labelledby="review-tab"
                    className="tab-pane fade "
                  >
                    <Firstsection />

                  </div>


                    <div
                    id="reviews"
                    role="tabpanels"
                    aria-labelledby="review-tab"
                    className="tab-pane fade "
                  >
                    <Exchange />



                </div>
              </div>
            </div>
          </div>
          </div>
        </section>
      </div>

      <ToastContainer />
    </>
  );
};
