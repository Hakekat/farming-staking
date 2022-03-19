import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useWeb3React } from "@web3-react/core";
import { Link } from "react-router-dom";

import STACK_ABI from "../abi/stack.json";
import WBNB from "../abi/WBNB.json";
import moment from "moment";

import { useSelector, useDispatch } from "react-redux";

function Firstsection() {
  var Router = "0x7e691A30454D8633C6215dac51063C8e35C7D929";
  let authState = useSelector((state) => state.auth);
  var { isConnected } = authState;
  const { library, account } = useWeb3React();
  const web3Obj = library;

  const [dipositAmount, setDipositAmount] = useState("");
  const [timeperiod, setTimeperiod] = useState(0);
  const [timeperiodDate, setTimeperiodDate] = useState(
    moment().add(30, "days").format("DD/MM/YYYY h:mm A")
  );
  //   const [withdrawAmount, setWithdrawAmount] = useState("");
  const [balance, setBalance] = useState(0);

  const { deactivate } = useWeb3React();
  const dispatch = useDispatch();
  const disconnectWallet = () => {
    deactivate();
    dispatch({
      type: "WALLET_DISCONNECT",
      payload: {
        account: "",
        isConnected: false,
        providerType: "",
      },
    });
  };

  const [stackContractInfo, setStackContractInfo] = useState({
    totalStakers: 0,
    totalStakedToken: 0,
  });
  const [stakersInfo, setStakersInfo] = useState({
    totalStakedTokenUser: 0,
    totalUnstakedTokenUser: 0,
    totalClaimedRewardTokenUser: 0,
    currentStaked: 0,
    realtimeReward: 0,
    stakeCount: 0,
    alreadyExists: false,
  });
  const [stakersRecord, setStakersRecord] = useState([]);

  //   const [toggleModal, setToggleModal] = useState(false);
  //   const [withdrawModal, setWithdrawModal] = useState(false);

  //   const [errorMsg, setErrorMsg] = useState("");
  //   const [isError, setIsError] = useState(false);

  const [isAllowance, setIsAllowance] = useState(false);
  //   const [isStaked, setIsStaked] = useState(true);
  const [loading, setLoadding] = useState(false);

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

  const checkAllowance = async (tokenAddress) => {
    try {
      setLoadding(true);

      var tokenContract = new web3Obj.eth.Contract(WBNB, tokenAddress);
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
      if (dipositAmount > 0) {
        var amount = dipositAmount * pow;
        if (allowance < amount) {
          setIsAllowance(true);
        }
      }
      setLoadding(false);
    } catch (err) {
      setLoadding(false);
    }
  };

  const approve = async (tokenAddress) => {
    setLoadding(true);
    try {
      var contract = new web3Obj.eth.Contract(WBNB, tokenAddress);

      var amountIn = 10 ** 69;
      amountIn = amountIn.toLocaleString("fullwide", { useGrouping: false });
      //   var amountIn = new web3Obj.utils.BigNumber("10").pow(69);

      await contract.methods
        .approve(Router, amountIn.toString())
        .send({ from: account })
        .then(() => {
          setIsAllowance(false);
          // checkAllowance("0x5f7b680de12D3Da8eAB7C6309b5336cA1EF04172");
          setLoadding(false);
        });
    } catch (err) {
      console.log(err);
      setLoadding(false);
      notify(true, err.message);
    }
  };

  const stake = async (tokenAddress) => {
    if (isNaN(parseFloat(dipositAmount)) || parseFloat(dipositAmount) <= 0) {
      notify(true, "Error! please enter amount");
      return;
    }
    await checkAllowance(tokenAddress);
    setLoadding(true);
    try {
      var tokenContract = new web3Obj.eth.Contract(WBNB, tokenAddress);
      const decimals = await tokenContract.methods.decimals().call();

      var contract = new web3Obj.eth.Contract(STACK_ABI, Router);

      var pow = 10 ** decimals;
      var amountIn = dipositAmount * pow;
      // var amountInNew = `${new ethers.utils.BigNumber(amountIn.toString())}`;
      amountIn = amountIn.toLocaleString("fullwide", { useGrouping: false });

      await contract.methods
        .stake(amountIn.toString(), timeperiod.toString())
        .send({ from: account })
        .then((err) => {
          getStackerInfo("0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4");
          setLoadding(false);
          notify(false, "Staking process complete.");
        });
    } catch (err) {
      setLoadding(false);
      notify(true, err.message);
    }
  };

  const unstake = async (index) => {
    setLoadding(true);
    try {
      var contract = new web3Obj.eth.Contract(STACK_ABI, Router);
      await contract.methods
        .unstake(index.toString())
        .send({ from: account })
        .then((result) => {
          getStackerInfo("0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4");
          setLoadding(false);
          notify(false, "successfully unstake");
          // withdrawModal();
        });
    } catch (err) {
      setLoadding(false);
      notify(true, "unstake fail");
    }
  };

  const harvest = async (index) => {
    setLoadding(true);
    try {
      var contract = new web3Obj.eth.Contract(STACK_ABI, Router);
      await contract.methods
        .harvest(index.toString())
        .send({ from: account })
        .then((err) => {
          getStackerInfo("0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4");
          setLoadding(false);
          checkAllowance("0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4");
          notify(false, "Reward successfully harvested");
        });
    } catch (err) {
      console.log(err);
      setLoadding(false);
      notify(true, err.message);
    }
  };

  const getStackerInfo = async (tokenAddress) => {
    setLoadding(true);
    try {
      var tokenContract = new web3Obj.eth.Contract(WBNB, tokenAddress);
      var decimals = await tokenContract.methods.decimals().call();
      var getBalance = await tokenContract.methods
        .balanceOf(account.toString())
        .call();
      var pow = 10 ** decimals;
      var balanceInEth = getBalance / pow;
      setBalance(balanceInEth);

      var contract = new web3Obj.eth.Contract(STACK_ABI, Router);
      var totalStakedToken = await contract.methods.totalStakedToken
        .call()
        .call();
      var totalStakers = await contract.methods.totalStakers.call().call();
      var realtimeReward = await contract.methods
        .realtimeReward(account)
        .call();
      var Stakers = await contract.methods.Stakers(account).call();

      var totalStakedTokenUser = Stakers.totalStakedTokenUser / pow;
      var totalUnstakedTokenUser = Stakers.totalUnstakedTokenUser / pow;
      var currentStaked = totalStakedTokenUser - totalUnstakedTokenUser;

      Stakers.totalStakedTokenUser = totalStakedTokenUser;
      Stakers.totalUnstakedTokenUser = totalUnstakedTokenUser;
      Stakers.currentStaked = currentStaked;
      Stakers.realtimeReward = realtimeReward / 10 ** 18;
      Stakers.totalClaimedRewardTokenUser =
        Stakers.totalClaimedRewardTokenUser / 10 ** 18;
      var stakersRecord = [];
      for (var i = 0; i < parseInt(Stakers.stakeCount); i++) {
        var stakersRecordData = await contract.methods
          .stakersRecord(account, i)
          .call();
        var realtimeRewardPerBlock = await contract.methods
          .realtimeRewardPerBlock(account, i.toString())
          .call();

        stakersRecordData.realtimeRewardPerBlock =
          realtimeRewardPerBlock / 10 ** 18;

        stakersRecordData.unstaketime = moment
          .unix(stakersRecordData.unstaketime)
          .format("DD/MM/YYYY");
        stakersRecordData.staketime = moment
          .unix(stakersRecordData.staketime)
          .format("DD/MM/YYYY");
        stakersRecord.push(stakersRecordData);
      }
      setStakersInfo(Stakers);
      setStakersRecord(stakersRecord);
      setStackContractInfo({
        totalStakers: totalStakers,
        totalStakedToken: totalStakedToken / pow,
      });
      setLoadding(false);
    } catch (err) {
      console.log(err);
      setLoadding(false);
      setStakersInfo({
        totalStakedTokenUser: 0,
        totalUnstakedTokenUser: 0,
        totalClaimedRewardTokenUser: 0,
        currentStaked: 0,
        realtimeReward: 0,
        stakeCount: 0,
        alreadyExists: false,
      });
      setStackContractInfo({
        totalStakers: 0,
        totalStakedToken: 0,
      });
      setStakersRecord([]);
      setBalance(0);
    }
  };

  const setMaxWithdrawal = async () => {
    var tokenAddress = "0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4";

    var tokenContract = new web3Obj.eth.Contract(WBNB, tokenAddress);
    var decimals = await tokenContract.methods.decimals().call();
    var getBalance = await tokenContract.methods
      .balanceOf(account.toString())
      .call();
    var pow = 10 ** decimals;
    var balanceInEth = getBalance / pow;
    setDipositAmount(balanceInEth.toFixed(5));
    // setWithdrawAmount(userInfo.staked);
  };

  useEffect(() => {
    if (isConnected) {
      checkAllowance("0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4");
      getStackerInfo("0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4");
    } else {
      getStackerInfo("0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4");
    }
  }, [isConnected, account]);

  return (
    <>
      <div>
        <div className="container">
          <div className="row">
           
          </div>
        </div>
      </div>

      <div>
        <div className="stack-section">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12 col-xl-12">
                <div className="row">


                 <div className="col-lg-6 col-md-6 col-sm-6 col-xl-7">
                    <div className="stack-box">
                      <div className="stack-header">
                        <div className="float">
                          <div className="logo">
                            <img src="images/logo.png" alt="" />
                          </div>
                          <div className="title1">
                            <p>Powered by BSC</p>
                            <h3>ORDO - BUSD</h3>
                          </div>
                        </div>
                        <div className="right-side">
                          <div className="sr-btn-wrap">
                            <img src="images/stackbusd.png" alt="" />
                          </div>
                        </div>
                      </div>
                      <div className="text-box">
                      <p style={{marginLeft: "25px",}}>Balance 
                            <span style={{ color: "#fff", marginLeft: "10px",}}>
                               {balance.toFixed(5)} ORDO</span>
                            </p>
                        <form className="newsletter">
                          <input style={{borderRadius: "10px", color: "#2bd67b",}}
                            placeholder="1.000.000"
                            type="text"
                            value={dipositAmount}
                            onChange={(e) => setDipositAmount(e.target.value)}
                          />
                          <button style={{
                                      background: "#1bda7a",
                                      borderRadius: "30px",
                                      padding: "2px 10px 2px 13px",
                                      position: "absolute",
                                      marginTop: "10px",
                                      height: "40px",
                                      width: "60px",
                                      color: "#000",
                                    }}
                            type="button"
                            onClick={() => setMaxWithdrawal()}
                          >
                            max
                          </button>
                        </form>
                      </div>
                      <div className="btn-section">
                      <p style={{fontSize: "14px", color: "#fff", fontWeight:"200", marginBottom: "0px",}}>Staking Lock Period. </p>
                        <button 
                          type="button" style={{fontSize: "14px", color: "#fff", padding: "8px 8px", borderRadius: "50px", backgroundColor: "#111c44",}}
                          onClick={async () => {
                            setTimeperiod(0);
                            setTimeperiodDate(
                              moment()
                                .add(30, "days")
                                .format("DD/MM/YYYY h:mm A")
                            );
                          }}
                          className={
                            timeperiod === 0
                              ? "button-word active"
                              : "button-word"
                          }
                        >
                          30 days
                        </button>
                        <button
                          type="button" style={{fontSize: "14px", color: "#fff", padding: "8px 8px", borderRadius: "50px", backgroundColor: "#111c44",}}
                          onClick={async () => {
                            setTimeperiod(1);
                            setTimeperiodDate(
                              moment()
                                .add(60, "days")
                                .format("DD/MM/YYYY h:mm A")
                            );
                          }}
                          className={
                            timeperiod === 1
                              ? "button-word active"
                              : "button-word"
                          }
                        >
                          60 days
                        </button>
                        <button
                          type="button" style={{fontSize: "14px", color: "#fff", padding: "8px 8px", borderRadius: "50px", backgroundColor: "#111c44",}}
                          onClick={async () => {
                            setTimeperiod(2);
                            setTimeperiodDate(
                              moment()
                                .add(90, "days")
                                .format("DD/MM/YYYY h:mm A")
                            );
                          }}
                          className={
                            timeperiod === 2
                              ? "button-word active"
                              : "button-word"
                          }
                        >
                          90 days
                        </button>
                        <button
                          type="button" style={{fontSize: "14px", color: "#fff", padding: "8px 8px", borderRadius: "50px", backgroundColor: "#111c44",}}
                          onClick={async () => {
                            setTimeperiod(3);
                            setTimeperiodDate(
                              moment()
                                .add(180, "days")
                                .format("DD/MM/YYYY h:mm A")
                            );
                          }}
                          className={
                            timeperiod === 3
                              ? "button-word active"
                              : "button-word"
                          }
                        >
                          180 days
                        </button>
                         <button
                          type="button" style={{fontSize: "14px", color: "#fff", padding: "8px 8px", borderRadius: "50px", backgroundColor: "#111c44",}}
                          onClick={async () => {
                            setTimeperiod(3);
                            setTimeperiodDate(
                              moment()
                                .add(180, "days")
                                .format("DD/MM/YYYY h:mm A")
                            );
                          }}
                          className={
                            timeperiod === 3
                              ? "button-word active"
                              : "button-word"
                          }
                        >
                          360 days
                        </button>
                         <button
                          type="button" style={{fontSize: "14px", color: "#fff", padding: "8px 8px", borderRadius: "50px", backgroundColor: "#111c44",}}
                          onClick={async () => {
                            setTimeperiod(3);
                            setTimeperiodDate(
                              moment()
                                .add(180, "days")
                                .format("DD/MM/YYYY h:mm A")
                            );
                          }}
                          className={
                            timeperiod === 3
                              ? "button-word active"
                              : "button-word"
                          }
                        >
                          545 days
                        </button>
                        <p style={{fontSize: "14px", color: "#fff", fontWeight:"200"}}>
                          {timeperiod === 0
                            ? "Upto 6% Returns on 30 Days. Locked Until " +
                              timeperiodDate
                            : timeperiod === 1
                            ? "Upto 13% Returns on 60 Days. Locked Until " +
                              timeperiodDate
                            : timeperiod === 2
                            ? "Upto 20% Returns on 90 Days. Locked Until " +
                              timeperiodDate
                            : timeperiod === 3
                            ? "Upto 45% Returns on 180 Days. Locked Until " +
                              timeperiodDate
                            : "Upto 50% Returns on 360 Days. Locked Until " +
                              timeperiodDate}
                        </p>
                        {isConnected ? (
                          isAllowance ? (
                            <button
                              onClick={() =>
                                approve(
                                  "0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4"
                                )
                              }
                              disabled={loading}
                              className="btn btn-danger-1"
                            >
                              {loading ? "Please wait, Loading.." : "Enable"}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                stake(
                                  "0x19bB77FD24fc09Dd0C3E8Ea8b3781172479791E4"
                                )
                              }
                              disabled={loading}
                              className="btn btn-danger-1"
                            >
                              {loading
                                ? "Please wait, Loading.."
                                : "Staking"}
                            </button>
                          )
                        ) : (
                          <a href="#/"
                                        className="btn-danger-1"
                                        data-toggle="modal"
                                        data-target="#myModal">
                            Connect Wallet
                          </a>
                        )}
                      </div>
     
                    </div>
                  </div>



                   <div className="col-lg-6 col-md-6 col-sm-6 col-xl-5">
                    <div className="stack-box">
                      <div className="stack-header">
                        <div className="float">
                          <div className="title1">
                            <p>Powered by BSC</p>
                          </div>
                        </div>
                        <div className="right-side">
                          <div className="sr-btn-wrap">
                            <a href="/#" className="sr-btn">
                              BUSD
                            </a>
                          </div>
                        </div>

                      </div>
                      <div className="balance">
                      <div className="logo">
                            <img style={{display: "block", marginLeft: "auto", marginRight: "auto", width: "200px", marginTop: "76px", marginBottom: "77px",}} src="images/stackbusd.png" alt="" />
                          </div>
                        <div className="first-block">
                          <p>Bidding Balance</p>
                          <h3>{stackContractInfo.totalStakedToken} ORDO</h3>
                        </div>
                        <div className="second-block">
                          <p >Bidding Stakers</p>
                          <h3> {stackContractInfo.totalStakers}</h3>
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



      <div className="table-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
              <div
                className="rounded-tbl"
                style={{ overflowX: "auto", whiteSpace: "nowrap" }}
              >
                <table className="table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th scope="col"></th>
                      <th scope="col"></th>
                      <th scope="col">Staked Amount</th>
                      <th scope="col">Stake Date</th>
                      <th scope="col">Unstake Date</th>
                      <th scope="col">Earn Reward</th>
                      <th scope="col">Harvest</th>
                    </tr>
                  </thead>
                  <tbody>





                    {stakersRecord.length > 0 ? (
                      stakersRecord.map((row, index) => {
                        return (
                          <tr>


                            <td>
                              {moment(row.unstaketime) <= moment() ? (
                                <button
                                  disabled={true}
                                  className="sr-btn"
                                  style={{ backgroundColor: "transparent" }}
                                >
                                  Unstaked
                                </button>
                              ) : (
                                <button
                                  disabled={loading}
                                  onClick={() => unstake(index)}
                                  className="sr-btn"
                                  style={{ backgroundColor: "transparent" }}
                                >
                                  Unstake
                                </button>
                              )}
                            </td>
                            <td>
                              {row.withdrawan ? (
                                <button
                                  disabled={true}
                                  className="sr-btn-6"
                                  style={{ backgroundColor: "transparent", marginLeft: "-30px", }}
                                >
                                  Harversted
                                </button>
                              ) : (
                                <button
                                  disabled={loading}
                                  onClick={() => harvest(index)}
                                  className="sr-btn-6"
                                  style={{ backgroundColor: "transparent", marginLeft: "-30px", }}
                                >
                                  Harvest
                                </button>
                              )}
                            </td>


                            <td style={{ color: "#2bd67b" }}>
                              {parseFloat(row.amount) / 10 ** 9}
                            </td>
                            <td>{row.staketime}</td>
                            <td>{row.unstaketime}</td>
                            <td>BUSD</td>
                            <td>
                              {" "}
                              {parseFloat(row.realtimeRewardPerBlock).toFixed(
                                3
                              )}
                            </td>



                             


                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center">
                          You have no stake record yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Firstsection;
