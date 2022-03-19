const initialState = {
  account: null,
  isConnected: localStorage.getItem("isConnected"),
  providerType: localStorage.getItem("providerType"),
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOAD_USER":
      return {
        ...initialState,
        account: action.payload.account,
        isConnected: action.payload.isConnected,
        providerType: action.payload.providerType,
      };
    case "WALLET_CONNECT":
      return {
        ...initialState,
        account: action.payload.account,
        isConnected: action.payload.isConnected,
        providerType: action.payload.providerType,
      };
    case "WALLET_DISCONNECT":
      localStorage.removeItem("isConnected");
      localStorage.removeItem("providerType");
      return {
        ...initialState,
        account: action.payload.account,
        isConnected: action.payload.isConnected,
        providerType: action.payload.providerType,
      };
    default:
      return state;
  }
};

export default reducer;