import { ethers } from 'hardhat';
import fs from 'fs-extra';
import path from 'path';
import * as ecc from 'tiny-secp256k1';
import axios from "axios";
import {ECPairAPI, ECPairFactory} from "ecpair";
import {payments,crypto,Psbt,script,opcodes} from "bitcoinjs-lib";
import {testnet} from "ecpair/src/networks";
import bitcoin from 'bitcoinjs-lib'

const signerPath = path.resolve(__dirname, '../artifacts/contracts/BTCSigner.sol/BTCSigner.json');
let signerJson = JSON.parse(fs.readFileSync(signerPath,'utf-8'));
const signerAbi = signerJson.abi;

const provider = new ethers.JsonRpcProvider("https://testnet.sapphire.oasis.dev");
async function main(){
    await doTest()
    await btcTransationTest()
}

// 0x43613C170e690fFE313ae026edef71a66f75B450
async function doTest(){
    const contract = new ethers.Contract("0xe97103cB3d42B207260fCe287B99Bd5B80008F6F", signerAbi, provider);
    let signature = await contract.signBTCTransaction("0x7a9321ddd1f9ed7433fa6fddf03601d5e4541669319ee76a48280b65f74510e9")
    console.log('签名信息',signature)

    let verify = await contract.verifySignature("0x7a9321ddd1f9ed7433fa6fddf03601d5e4541669319ee76a48280b65f74510e9",signature)
    console.log('验证结果',verify)

    let result = await contract.getPublicKey()
    console.log('结果',result)
}

const toAddress = 'tb1qdv7e2750ctsfewrgzqhahzwsfps025yl7vhhlm';
async function btcTransationTest(){
    const contract = new ethers.Contract("0xe97103cB3d42B207260fCe287B99Bd5B80008F6F", signerAbi, provider);
    let result = await contract.getPublicKey()
    console.log('结果',result)


    let address = payments.p2wpkh({
        pubkey:Buffer.from("02d25e77015ca9c68b159c44e56aaa2d4c585268ee12bf1c3c070b4340a1f1c46e",'hex'),
        network:testnet
    })
    console.log('address',address.address)

    let pair = ECPairFactory(ecc).fromPrivateKey(Buffer.from(result[1].slice(2),'hex'))
    console.log("pub",pair.publicKey.toString('hex'))
    // 获取utxo
    const response = await axios.get(`https://api.blockcypher.com/v1/btc/test3/addrs/${address.address}?unspentOnly=true`)
    // let data = JSON.parse(response.data)
    let utxos = response.data.txrefs
    //
    // 发送数量
    let amountToSend = 10000

    let utxo = null
    for(let ux of utxos){
        if(ux.value >= amountToSend){
            utxo = ux
            break
        }
    }

    // const transaction = new TransactionBuilder(testnet)
    // transaction.addInput(utxo.tx_hash,utxo.tx_output_n)
    // transaction.addOutput(toAddress,80000)
    //
    // const unsignedTransaction = transaction.buildIncomplete();
    //
    // const unsignedTransactionHex = unsignedTransaction.toHex();
    //
    // // 计算整个交易的 SHA-256 摘要
    // const sha256Buffer = bitcoin.crypto.sha256(Buffer.from(unsignedTransactionHex, 'hex'));
    // const sha256Digest = sha256Buffer.toString('hex')
    // console.log('digest',sha256Digest)

    // 构建 Psbt 对象
    const psbt = new Psbt({network:testnet});
    psbt.addInput({
        hash: "05540e7e8811800ab1dfb2893e71b764987a7834a43280076395a083be493766",
        index: 0,
        witnessUtxo: {
            script:Buffer.from("0014f781e3c21bfc76b5c0ed91b4ea2f3e5c18400d87",'hex'),
            value: 100000,
        },
    });
    psbt.addOutput({
        address: toAddress,
        value: amountToSend,
    });

    psbt.addOutput({
        script: script.compile([opcodes.OP_RETURN, Buffer.from('8e5Fb6Fd49a3bb77E8b930e28FeDeEED34bF42d8','hex')]),
        value: 0,
    });

    // let sha256 = crypto.sha256(psbt.data.getTransaction())
    // let sha256Digest = sha256.toString('hex')
    // console.log('digest',sha256Digest)
    //
    // let signature = await contract.signBTCTransaction("0x"+sha256Digest)
    // console.log('signature',signature)

    let psbtHex = psbt.toHex()
    console.log('psbtHex ==> ',psbtHex)

    psbt.signInput(0,pair)
    psbt.finalizeAllInputs()
    const broadcastHex = psbt.extractTransaction().toHex()
    console.log('broadcast',broadcastHex)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});