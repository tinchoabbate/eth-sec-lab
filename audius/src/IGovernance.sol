pragma solidity ^0.8.0;

interface IGovernance {
    function initialize(
        address _registryAddress,
        uint256 _votingPeriod,
        uint256 _executionDelay,
        uint256 _votingQuorumPercent,
        uint16 _maxInProgressProposals,
        address _guardianAddress
    )
        external;

    function guardianExecuteTransaction(
        bytes32 _targetContractRegistryKey,
        uint256 _callValue,
        string calldata _functionSignature,
        bytes calldata _callData
    )
        external;

    function getGuardianAddress() external view returns (address);
    function getRegistryAddress() external view returns (address);
}
