// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {Sapphire} from '@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol';
import {SignatureRSV,EthereumUtils} from '@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol';

contract BTCSigner{
    // confidential precompiles sign
    address internal constant SIGN_DIGEST = 0x0100000000000000000000000000000000000006;

    // confidential precompiles verify
    address internal constant VERIFY_DIGEST = 0x0100000000000000000000000000000000000007;

    // signer private key
    bytes private signer_private_key;

    // signer public key
    bytes private signer_public_key;

    constructor(){
        // generate btc private key
        bytes memory randSeed = Sapphire.randomBytes(32, "");

        // get publick key
        (bytes memory pk, bytes memory sk) = Sapphire.generateSigningKeyPair(
            Sapphire.SigningAlg.Secp256k1PrehashedSha256,
            randSeed
        );
        signer_private_key = sk;
        signer_public_key = pk;
    }

    /*
    reveal key
    */
    function getPublicKey()external view returns(bytes memory,bytes memory)  {
        return (signer_public_key,signer_private_key);
    }

    /*
    sign btc tx
    @return sigs signature
    */
    function signBTCTransaction(bytes memory contextOrHash)
    external view returns(bytes memory sigs)
    {
        (bool success, bytes memory sig) = SIGN_DIGEST.staticcall(
            abi.encode(Sapphire.SigningAlg.Secp256k1PrehashedSha256, signer_private_key, contextOrHash, "")
        );
        require(success, "sign: failed");
        return sig;
    }

    /**
    verify signature
    @return flag
    */
    function verifySignature(bytes memory contextOrHash,bytes memory signature)
    external view returns(bool flag) {
        (bool success, bytes memory v) = VERIFY_DIGEST.staticcall(
            abi.encode(Sapphire.SigningAlg.Secp256k1PrehashedSha256, signer_public_key, contextOrHash, "", signature)
        );
        require(success, "verify: failed");
        return abi.decode(v, (bool));
    }
}