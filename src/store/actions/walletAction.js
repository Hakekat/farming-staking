import { useWeb3React } from "@web3-react/core";
import { bsc, injected } from "../../walletConnect/connector";

export const Connect = async (providerType) => {
  const { active, account, connector, activate, deactivate } = useWeb3React();
  const web3React = useWeb3React();
  console.log(web3React);
  if (providerType === "MetaMask") {
    await activate(injected);
  } else {
    await activate(bsc);
  }

  return async (dispatch) => {
    if (active) {
      localStorage.setItem("isConnected", true);
      localStorage.setItem("providerType", providerType);
      dispatch({
        type: "WALLET_CONNECT",
        payload: {
          account: account,
          isConnected: true,
          providerType: providerType,
        },
      });
    } else {
      dispatch({
        type: "WALLET_CONNECT",
        payload: {
          account: "",
          isConnected: false,
          providerType: "",
        },
      });
    }
  };
};

export const loadUser = () => {
  return (dispatch, getState) => {
    const account = getState().auth.account;
    const isConnected = getState().auth.isConnected;
    const providerType = getState().auth.providerType;
    if (account && providerType && isConnected) {
      dispatch({
        type: "LOAD_USER",
        payload: {
          account: account,
          isConnected: isConnected,
          providerType: providerType,
        },
      });
    } else return null;
  };
};

export const Disconnect = () => {
  const { deactivate } = useWeb3React();
  return (dispatch) => {
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
};