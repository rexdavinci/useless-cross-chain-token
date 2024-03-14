// SPDX-License-Identifier: MIT
pragma solidity  ^0.8.24;


interface IERC20 {
	function balanceOf(address account) external view returns (uint256);
	function transfer(address recipient, uint256 amount) external returns (bool);
	function transferFrom(
		address sender,
		address recipient,
		uint256 amount
	) external returns (bool);
}

contract UselessPurseBSC {
    address immutable owner;
    event Deposit(address bscSender, uint256 amount, string solReceiver);
    event Unblocked(address token, uint256 amount);
    event Undeposit(string solSender, uint256 amount, address bscReceiver);
    IERC20 useless = IERC20(0x84109ff145Df1F2f3df12AD57BC104d96E034f58);
    constructor() {
        owner = msg.sender;
    }

    /// @notice Deposit `useless` tokens to receive solana equivalent
    /// @param amount The amount of tokens to be deposited
    /// @param receiver The solana address where the solana equivalent will be sent
    function deposit(uint256 amount, string memory receiver) external {
        useless.transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount, receiver);
    }

    /// @notice fail-safe function to remove any potentially stuck tokens
    /// @param token The token address of the stuck token
    /// @param to The receiving address of the stuck token
    /// @param amount The amount of the stuck token to be removed
    function removeBlocked(IERC20 token, address to, uint256 amount) external {
        require(msg.sender == owner);
        token.transfer(to, amount);
        emit Unblocked(address(token), amount);
    }
}

