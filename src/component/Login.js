import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { connect, loadUser } from "../store/actions/walletAction";
// import detectEthereumProvider from "@metamask/detect-provider";
// import { BscConnector } from "@binance-chain/bsc-connector";
import { useNavigate } from "react-router-dom";

import { useWeb3React } from "@web3-react/core";
import { bsc, injected } from "../walletConnect/connector";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let authState = useSelector((state) => state.auth);
  var { isConnected } = authState;

  const { activate, account, active } = useWeb3React();

  const connectWallet = async (providerType) => {
    console.log('========')
    if (providerType === "metaMask") {
      await activate(injected);

      localStorage.setItem("isConnected", true);
      localStorage.setItem("providerType", "metaMask");
      if (active) {

        dispatch({
          type: "WALLET_CONNECT",
          payload: {
            account: account,
            isConnected: localStorage.getItem("isConnected"),
            providerType: "metaMask",
          },
        });
      }
    } else {
      await activate(bsc);
      localStorage.setItem("isConnected", true);
      localStorage.setItem("providerType", "BSC");
      const iscon = localStorage.getItem("isConnected", true);
      console.log('iscon', iscon)
      if (active) {
        console.log('this is runnig')

        dispatch({
          type: "WALLET_CONNECT",
          payload: {
            account: account,
            isConnected: true,
            providerType: "BSC",
          },
        });
      }
    }
  };

  // async function fetchData() {
  //   metaMaskProvide = await detectEthereumProvider();
  //   bscProvider = await new BscConnector({
  //     supportedChainIds: [56], // later on 1 ethereum mainnet and 3 ethereum ropsten will be supported
  //   });
  // }

  useEffect(() => {
    console.log('isConnected', isConnected)
    console.log('active', active)
    if (localStorage.getItem("isConnected") && active) {
      window.location.replace("/");
    }
  }, [active, isConnected]);
  return (

    <div className="container">
      <div className="row">
        <div className="col-lg-12 col-sm-12 col-md-12 pr-md-6 align-self-center text-center  content">
          <div className="modal" id="myModal">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-body">

                  <div className="connect-wallet">
                    <h1>Please Connect Your Wallet</h1>
                    <p>
                      Sign in with one of available wallet providers or
                      <br /> create a new wallet. <a href="#">
                        What is a wallet?
                      </a>
                    </p>
                    <div className="sr-btn-wrap1">
                      <a href="#" className="sr-btn" onClick={() => connectWallet("metaMask")}>
                        Trust Wallet
                      </a>
                      <a href="#" className="sr-btn active" onClick={() => connectWallet("metaMask")}>
                        Metamask
                      </a>
                      <a href="#" className="sr-btn" onClick={() => connectWallet("BSC")}>
                        Binance
                      </a>
                    </div>
                    <h6>
                      We do not own your private keys and cannot access
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

  );
}

export default Login;
