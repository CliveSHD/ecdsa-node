import server from "./server";
import { useState } from "react";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  signature,
  setSignature,
}) {
  const [privateKey, setPrivateKey] = useState("");

  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const address = toHex(secp.getPublicKey(privateKey));
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  // TODO Use private key to generate a signature
  async function generateSignature(privateKey) {
    setSignature(await secp.sign("messageHash", privateKey));
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input
          placeholder="Type in your private key..."
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <div className="balance">Address: {address.slice(0, 10)}...</div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
