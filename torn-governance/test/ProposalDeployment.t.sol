// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import "../src/Deployer.sol";
import "../src/ProposalFactory.sol";

contract ProposalDeploymentTest is Test {
    
    address attacker = 0x592340957eBC9e4Afb0E9Af221d06fDDDF789de9;
    Deployer deployerContract;

    function setUp() public {
        // Attacker uses nonce 5 in first deployment tx (0x3e93ee75ffeb019f1d841b84695538571946fd9477dcd3ecf0790851f48fbd1a)
        vm.setNonce(attacker, 5);
    }

    function testDeployments() public {
        vm.startPrank(attacker);
        deployerContract = new Deployer();

        address factoryAddress = deployerContract.created();
        address proposalAddress = ProposalFactory(factoryAddress).proposal();

        // Destroy factory and proposal contracts
        deployerContract.emergencyStop();

        // The SELFDESTRUCTs have no effect during this test (see https://github.com/foundry-rs/foundry/issues/1543),
        // so we need to call `destroyAccount` to mimic its behavior 
        destroyAccount(factoryAddress, address(0));
        destroyAccount(proposalAddress, address(0));

        deployerContract.redeploy();

        address newFactoryAddress = deployerContract.created();
        address newProposalAddress = ProposalFactory(newFactoryAddress).proposal();

        assertEq(factoryAddress, newFactoryAddress, "New factory deployed at wrong address");
        assertEq(proposalAddress, newProposalAddress, "New proposal deployed at wrong address");

        vm.stopPrank();
    }
}
