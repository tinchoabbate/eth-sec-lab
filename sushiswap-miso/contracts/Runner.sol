// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface ITarget {
    function batch(bytes[] calldata calls, bool revertOnFail) external payable returns (bool[] memory successes, bytes[] memory results);
}

/**
    @notice Interface to get a flashloan callback from AAVE v2
 */
interface IFlashLoanReceiver {
  function executeOperation(
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata premiums,
    address initiator,
    bytes calldata params
  ) external returns (bool);
}

interface IFlashLoanable {
    function flashLoan(
    address receiverAddress,
    address[] calldata assets,
    uint256[] calldata amounts,
    uint256[] calldata modes,
    address onBehalfOf,
    bytes calldata params,
    uint16 referralCode
  ) external;
}

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function balanceOf(address who) external returns (uint256);
    function approve(address who, uint256 amount) external returns (bool);
}

contract Runner is IFlashLoanReceiver {

    address immutable private owner;
    IWETH immutable private weth = IWETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    // Address of AAVE's Lending Pool
    address immutable private lendingPool = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9; 

    constructor() {
        owner = msg.sender;
    }

    function run(address target, uint256 amount, bytes[] calldata calls) external {
        require(msg.sender == owner);

        address[] memory assets = new address[](1);
        assets[0] = address(weth);

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        // encode payload to later receive it in `executeOperation` (thus avoiding use of storage)
        bytes memory payload = abi.encode(target, calls);

        console.log("- Requesting flashloan");
        IFlashLoanable(lendingPool).flashLoan(
            address(this),
            assets,
            amounts,
            modes,
            address(this),
            payload,
            0
        );        
    }

    function executeOperation(
        address[] calldata,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata payload
    ) external override returns (bool) {
        require(initiator == address(this));
        require(msg.sender == lendingPool);

        // decode payload
        (address targetAddress, bytes[] memory calls) = abi.decode(payload, (address, bytes[]));

        // WETH --> ETH
        weth.withdraw(weth.balanceOf(address(this)));
        
        console.log("- Calling batch function");
        ITarget(targetAddress).batch{value: address(this).balance}(calls, true);

        // ETH --> WETH
        weth.deposit{value: amounts[0] + premiums[0]}();

        // Approve lending pool so it can pull the appropiate amount of tokens to repay flashloan
        weth.approve(lendingPool, amounts[0] + premiums[0]);

        console.log("- Sending funds back to caller");
        payable(owner).transfer(address(this).balance);

        return true;
    }

    receive() external payable {}
}
