pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../../src/Coordinator.sol";

contract EulerHackUSDCTest is Test {
    uint256 mainnetFork;

    EulerHackUSDC public coordinator;

    function setUp() public {
        console.log("[*] Forking chain before the attack at block %d", 16_817_995);
        mainnetFork = vm.createFork("eth", 16_817_995);

        vm.selectFork(mainnetFork);

        // Deploy coordinator contract
        coordinator = new EulerHackUSDC();
    }

    function test_attack() public {
        coordinator.initiateAttack();
    }
}
