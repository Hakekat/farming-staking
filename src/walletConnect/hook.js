import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { useSelector } from "react-redux";
import { bsc, injected } from "../walletConnect/connector";

export function useEagerConnect() {
  let authState = useSelector((state) => state.auth);
  var { providerType, isConnected } = authState;
  const { activate, active } = useWeb3React();

  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (providerType === "metaMask") {
      injected.isAuthorized().then((isAuthorized) => {
        if (isAuthorized) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      });
    } else if (providerType === "trustWallet") {
      injected.isAuthorized().then((isAuthorized) => {
        if (isAuthorized || isConnected) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      });
    } else if (providerType === "BSC") {
      bsc.isAuthorized().then((isAuthorized) => {
        if (isAuthorized) {
          activate(bsc, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      });
    } else {
    }
  }, []);

  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}

