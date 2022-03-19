import Login from "./component/Login";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Home } from "./component/Home";
import { Earn } from "./Pages/Earn";

import { useWeb3React } from "@web3-react/core";
// import { bsc, injected } from "./walletConnect/connector";
import { useEagerConnect } from "./walletConnect/hook";

function App() {
  const { account, active } = useWeb3React();

  useEagerConnect();
  const dispatch = useDispatch();
  let authState = useSelector((state) => state.auth);
  const { isConnected, providerType } = authState;
  useEffect(() => {
    if (active) {
      dispatch({
        type: "WALLET_CONNECT",
        payload: {
          account: account,
          isConnected: true,
          providerType: providerType,
        },
      });
    }
  }, [active, isConnected]);

  return (
    <>
      <Routes>
        <Route path="/Home" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route index path="/" element={<Earn />}></Route>
      </Routes>
    </>
  );
}

export default App;
