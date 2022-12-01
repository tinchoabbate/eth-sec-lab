pragma solidity ^0.8.0;

/**
 * @title ArbSysMock
 * @notice Simplified version of Arbitrum's ArbSys precompile. Intended to mock the precompile in a local devnet.
 */
contract ArbSysMock {
    event L2ToL1Tx(address sender, address target, bytes data);

    function sendTxToL1(address target, bytes calldata data) external {
        emit L2ToL1Tx(msg.sender, target, data);
    }
}
