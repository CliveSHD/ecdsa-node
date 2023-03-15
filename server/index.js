const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  // Use Public Key as address
  "04a23d97521a9d1de01ff4d0bd7b92e1516b9a473c549aee1817ce3d9edbf98641fa9eacc975586e8e8c0601432853a3f8b86eb8f193ce9abac0d66228f9a16cc8": 100,
  // Private Key: 17fb8c94ca12b7ca3e3625397dfd6c2aa79111ab900b6496e3141f4fc5a421db
  "0452b241bd68063c6cac32f44b480f9660a0b0a434ebc947c955d8fa36934a77db8c5d6459caa2f041034c5e8b4d1f34559c0e84a15c0d713e254bcd8594c7b7ba": 50,
  // Private Key: 4b21091e1b1213dad4160368093acbd4f207cba30a8c2c87f2803a864469c08b
  "04dbac89ace71e5a734c2ae4cf7f8baa1159fdacba6e5342f2980d7997914dd8e0b16b8ec406a312afcf5dcf987d7ef4e966caa9b86654d162792fb99a19f58b21": 75,
  // Private Key: ed12b7b3e03ca03fbc6fbf4a878427056861c9a72f93f61a612db65501486764
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { message, msgHash, signature } = req.body;
  const sig = new Uint8Array(Object.values(signature[0]));
  const hash = new Uint8Array(Object.values(msgHash));

  setInitialBalance(message.sender);
  setInitialBalance(message.recipient);

  const publicKey = secp.recoverPublicKey(hash, sig, signature[1]);
  const verified = secp.verify(sig, hash, publicKey);

  if (balances[message.sender] < message.amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else if (toHex(publicKey) !== message.sender) {
    res.status(400).send({ message: "Not your account!" });
  } else if (!verified) {
    res.status(400).send({ message: "Not verified!" });
  } else {
    balances[message.sender] -= message.amount;
    balances[message.recipient] += message.amount;
    res.send({ balance: balances[message.sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
