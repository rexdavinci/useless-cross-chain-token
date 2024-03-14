// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract UselessToken is ERC20, ERC20Permit {
    constructor() ERC20("Useless Token", "Useless") ERC20Permit("UselssToken") {
        _mint(msg.sender, 100000000 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 9;
}
}
