//Credit: https://github.com/alchemyplatform/hello-world-part-four-tutorial

export const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const obj = {
          status: "🦊 Connected.",
          address: addressArray[0],
          isConnected: true
        };
        return obj;
      } catch (err) {
        return {
          address: "",
          status: "❌ " + err.message  + " Please try again.",
          isConnected: false
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
        isConnected: false
      };
    }
  };
  
  export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (addressArray.length > 0) {
          return {
            address: addressArray[0],
            status: "🦊 Connected.",
            isConnected: true
          };
        } else {
          return {
            address: "",
            status: "🦊 Connect to Metamask wallet.",
            isConnected: false
          };
        }
      } catch (err) {
        return {
          address: "",
          status: "❌ " + err.message + " Please try again.",
          isConnected: false
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
                You must install Metamask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
        isConnected: false
      };
    }
  };
  