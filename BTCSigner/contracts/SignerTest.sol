// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {Sapphire} from '@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol';
import {SignatureRSV,EthereumUtils} from '@oasisprotocol/sapphire-contracts/contracts/EthereumUtils.sol';

contract SignerTest{
    uint256 private a;
    uint256 private b;

    constructor(uint256 _a, uint256 _b){
        a = _a;
        b = _b;
    }

    function calculate() public view returns(uint256)  {
        return a+b;
    }
}