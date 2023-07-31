// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Proposal {
    address public owner;

    event OwnershipTransferred(address indexed user, address indexed newOwner);

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function executeProposal() external {
        // do something
    }

    function emergencyStop() external {
        require(msg.sender == owner);
        selfdestruct(payable(0));
    }
}