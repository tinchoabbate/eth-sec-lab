// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { ProposalFactory } from "./ProposalFactory.sol";
import { Proposal } from "./FirstProposal.sol";
import { Proposal as SecondProposal } from "./SecondProposal.sol";

contract Deployer {
    address public created;

    constructor() {
        ProposalFactory factory = new ProposalFactory{salt: 0}();
        factory.create(type(Proposal).creationCode);
        created = address(factory);
    }

    function emergencyStop() external {
        if(msg.sender == 0x592340957eBC9e4Afb0E9Af221d06fDDDF789de9) {
            ProposalFactory(created).emergencyStop();
        }
    }

    function redeploy() external {
        if(msg.sender == 0x592340957eBC9e4Afb0E9Af221d06fDDDF789de9) {
            ProposalFactory factory = new ProposalFactory{salt: 0}();
            factory.create(type(SecondProposal).creationCode);
            created = address(factory);
        }
    }
}
