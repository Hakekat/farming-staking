import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useWeb3React } from "@web3-react/core";

import { bsc, injected } from "../walletConnect/connector";
import { isMobile, isBrowser } from "react-device-detect";
import { toast } from "react-toastify";

function Navbar() {
  const dispatch = useDispatch();
  let authState = useSelector((state) => state.auth);
  // var { isConnected } = authState;

  const { activate, account, deactivate } = useWeb3React();

  const connectWallet = async (providerType) => {
    if (providerType === "metaMask") {
      if (isMobile) {
        toast.error("Please install metaMask", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return;
      }
      await activate(injected);

      localStorage.setItem("isConnected", true);
      localStorage.setItem("providerType", "metaMask");
      // if (active) {
      dispatch({
        type: "WALLET_CONNECT",
        payload: {
          account: account,
          isConnected: localStorage.getItem("isConnected"),
          providerType: "metaMask",
        },
      });
      window.location.replace("/");
      // }
    } else if (providerType === "trustWallet") {
      if (isBrowser) {
        toast.error("not detect dapp browser", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return;
      }
      await activate(injected);

      localStorage.setItem("isConnected", true);
      localStorage.setItem("providerType", "trustWallet");
      // if (active) {
      dispatch({
        type: "WALLET_CONNECT",
        payload: {
          account: account,
          isConnected: localStorage.getItem("isConnected"),
          providerType: "trustWallet",
        },
      });
      window.location.replace("/");
    } else {
      if (isMobile || !window.BinanceChain) {
        toast.error("Please install Binance wallet", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return;
      }

      await activate(bsc);
      localStorage.setItem("isConnected", true);
      localStorage.setItem("providerType", "BSC");
      // const iscon = localStorage.getItem("isConnected", true);

      // if (active) {
      dispatch({
        type: "WALLET_CONNECT",
        payload: {
          account: account,
          isConnected: true,
          providerType: "BSC",
        },
      });
      window.location.replace("/");
      // }
    }
  };

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

  return (
    <div>
      <nav className="navbar navbar-default navbar-trans navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand text-brand" to="/">
            <img style={{
                              height: "50px",
                              width: "50px",
                            }}  src="images/logo.png" alt="" />
          </Link>
          <div
            className="navbar-collapse collapse justify-content-left"
            id="navbarDefault"
          >
            <ul className="navbar-nav">
             <li className="nav-item">
                <a
                  className="nav-link"
                  target="_blank"
                  href="https://pancakeswap.finance/swap?outputCurrency=0x0106591B1372BbCcB9D2a5A1fe7f421c2D149C07"
                  title="Trade"
                >
                  {" "}
                  Trade{" "}
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link"
                  href="https://ordochain.com/"
                  target="_blank"
                  title="Audit"
                >
                  {" "}
                  Project{" "}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="https://ordochain.com/"
                  target="_blank"
                  title="Analytics"
                >
                  {" "}
                  Features{" "}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="https://ordochain.com/"
                  target="_blank"
                  title="Event"
                >
                  {" "}
                  Whitepaper{" "}
                </a>
              </li>
            </ul>
          </div>

          <div className="right-side">
            <ul>
             <li className="nav-item dropdown">
                {" "}
                <a
                  className="nav-link dropdown-toggle down-arrow"
                  href="#"
                  title="Kala
            Project"
                  id="navbarDropdown"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  style={{ color: "#fff" }}
                >
                  Eng/USD
                </a>
                <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <a className="dropdown-item" href="/#" title="">
                    CHN/USD
                  </a>
                </div>
              </li>
              {authState.isConnected ? (
                <li>
                  {authState.account == null ? (
                    <li>
                      <a
                        href="#/"
                        className="sr-btn"
                        data-toggle="modal"
                        data-target="#myModal"
                      >
                        Connect Wallet
                      </a>

                      <div className="container">
                        <div className="row">
                          <div className="col-lg-12 col-sm-12 col-md-12 pr-md-6 align-self-center text-center  content">
                            <div className="modal" id="myModal">
                              <div className="modal-dialog">
                                <div className="modal-content">
                                  <div className="modal-body">
                                    <div className="connect-wallet">
                                      <h5>Connect Wallet</h5>
                                      <p>
                                        <a href="#/">What is a wallet?</a>
                                      </p>
                                      <div className="sr-btn-wrap1">
                                        <a
                                          href="#/"
                                          className="sr-btn"
                                          onClick={() =>
                                            connectWallet("trustWallet")
                                          }
                                        >
                                          Trust Wallet
                                          <img style={{
                              marginLeft: "35px",
                              height: "30px",
                              width: "30px",
                            }} src="images/trust.png" alt="" />
                                        </a>
                                        <a
                                          href="#/"
                                          className="sr-btn active"
                                          onClick={() =>
                                            connectWallet("metaMask")
                                          }
                                        >
                                          Metamask
                                          <img style={{
                              marginLeft: "50px",
                              height: "30px",
                              width: "30px",
                            }} src="images/meta.png" alt="" />
                                        </a>
                                        <a
                                          href="#/"
                                          className="sr-btn"
                                          onClick={() => connectWallet("BSC")}
                                        >
                                          Binance
                                          <img style={{
                              marginLeft: "70px",
                              height: "30px",
                              width: "30px",
                            }} src="images/stackbnb.png" alt="" />
                                        </a>
                                      </div>
                                      <h6>
                                        We do not own your private keys and
                                        cannot access
                                        <br /> your funds without your
                                        confirmation.
                                      </h6>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ) : (
                    <div className="btn">
                      <div className="icon">
                        <svg
                          viewBox="0 0 24 24"
                          color="primary"
                          width="24px"
                          xmlns="http://www.w3.org/2000/svg"
                          className="sc-bdnxRM ACFFk"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M17 4C18.5 4 19 4.5 19 6L19 8C20.1046 8 21 8.89543 21 10L21 17C21 19 20 20 17.999 20H6C4 20 3 19 3 17L3 7C3 5.5 4.5 4 6 4L17 4ZM5 7C5 6.44772 5.44772 6 6 6L19 6L19 8L6 8C5.44772 8 5 7.55229 5 7ZM17 16C18 16 19.001 15 19 14C18.999 13 18 12 17 12C16 12 15 13 15 14C15 15 16 16 17 16Z"
                          ></path>
                        </svg>
                      </div>
                      <div className="title">
                        {authState.account == null
                          ? ""
                          : authState.account
                              .slice(0, 2)
                              .concat(`...${authState.account.slice(-4)}`)}
                      </div>
                      <svg
                        viewBox="0 0 24 24"
                        color="text"
                        width="24px"
                        xmlns="http://www.w3.org/2000/svg"
                        className="sc-bdnxRM kDWlca"
                      >
                        <path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path>
                      </svg>
                      <div className="popover__content">
                        <div className="product-body">
                          <button
                            className="color"
                            onClick={() => disconnectWallet()}
                          >
                            <div className="left">Disconnect</div>
                            <div className="right">
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ) : (
                <li>
                  <a
                    href="#/"
                    className="sr-btn"
                    data-toggle="modal"
                    data-target="#myModal"
                  >
                    Connect Wallet
                  </a>

                  <div className="container">
                    <div className="row">
                      <div className="col-lg-12 col-sm-12 col-md-12 pr-md-6 align-self-center text-center  content">
                        <div className="modal" id="myModal">
                          <div className="modal-dialog">
                            <div className="modal-content">
                              <div className="modal-body">
                                <div className="connect-wallet">
                                  <h1>Connect Wallet</h1>
                                  <p>
                                    <a href="#/">What is a wallet?</a>
                                  </p>
                                  <div className="sr-btn-wrap1">
                                    <a
                                      href="#/"
                                      className="sr-btn"
                                      onClick={() => connectWallet("trustWallet")}
                                    >
                                      Trust Wallet
                                      <img style={{
                              marginLeft: "35px",
                              height: "30px",
                              width: "30px",
                            }} src="images/trust.png" alt="" />
                                    </a>
                                    <a
                                      href="#/"
                                      className="sr-btn active"
                                      onClick={() => connectWallet("metaMask")}
                                    >
                                      Metamask
                                      <img style={{
                              marginLeft: "50px",
                              height: "30px",
                              width: "30px",
                            }} src="images/meta.png" alt="" />
                                    </a>
                                    <a
                                      href="#/"
                                      className="sr-btn"
                                      onClick={() => connectWallet("BSC")}
                                    >
                                      Binance
                                      <img style={{
                              marginLeft: "70px",
                              height: "30px",
                              width: "30px",
                            }} src="images/stackbnb.png" alt="" />
                                    </a>
                                  </div>
                                  <h6>
                                    We do not own your private keys and cannot
                                    access
                                    <br /> your funds without your confirmation.
                                  </h6>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>

          <button
            className="navbar-toggler collapsed"
            type="button"
            data-toggle="collapse"
            data-target="#navbarDefault"
            aria-controls="navbarDefault"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
