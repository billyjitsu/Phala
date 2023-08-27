// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WrappedETH is ERC20, Ownable {
    constructor() ERC20("Wrapped ETH", "WETH") {}

    function mint() public{
        _mint(msg.sender, 50e18);
    }
}