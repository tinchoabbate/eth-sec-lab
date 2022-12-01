pragma solidity ^0.8.0;

interface IBridge {
    function executeCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external returns (bool success, bytes memory returnData);
}

/**
 * @title SimpleOutbox
 * @notice A simplified version of Arbitrum's `Outbox` contract for PoC purposes on local devnets.
 *         Forwards all messages to the `Bridge` without validating proofs nor setting call context.
 *         Notably, the way the bridge is called is left unmodified.
 */
contract SimpleOutbox {
    IBridge public bridge;
    mapping(bytes32 => bool) public spent;

    error BridgeCallFailed();

    constructor(address _bridge) {
        bridge = IBridge(_bridge);
    }

    /**
     * Simplified version of `Outbox::executeTransaction`
     * See https://github.com/OffchainLabs/nitro/blob/99ecb32f40eba6817bdf8242f3ed9cf4155747c1/contracts/src/bridge/Outbox.sol#L123
     */
    function executeTransaction(
        // bytes32[] calldata proof,
        // uint256 index,
        address l2Sender,
        address to,
        // uint256 l2Block,
        // uint256 l1Block,
        // uint256 l2Timestamp,
        uint256 value,
        bytes calldata data
    ) external {
        bytes32 id = keccak256(abi.encode(msg.sender, block.timestamp, l2Sender, to, value, data));
        spent[id] = true;
        _executeBridgeCall(to, value, data);
    }

    /**
     * Copied as is from Arbitrum's `Outbox::executeBridgeCall`
     * See https://github.com/OffchainLabs/nitro/blob/99ecb32f40eba6817bdf8242f3ed9cf4155747c1/contracts/src/bridge/Outbox.sol#L237-L254
     */
    function _executeBridgeCall(
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        (bool success, bytes memory returndata) = bridge.executeCall(to, value, data);
        if (!success) {
            if (returndata.length > 0) {
                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert BridgeCallFailed();
            }
        }
    }
}
