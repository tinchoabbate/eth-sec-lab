// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Proposal } from "./FirstProposal.sol";

contract ProposalFactory {
    address public owner;
    address public proposal;

    event OwnershipTransferred(address indexed user, address indexed newOwner);

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function create(bytes memory code) external {
        require(msg.sender == owner);
        address deploymentAddress;
        assembly {
            deploymentAddress := create(0, add(code, 0x20), mload(code))
        }
        require(deploymentAddress != address(0));
        proposal = deploymentAddress;
    }

    function emergencyStop() external {
        require(msg.sender == owner);
        Proposal(proposal).emergencyStop();
        selfdestruct(payable(0));
    }
}
