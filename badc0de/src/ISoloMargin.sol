pragma solidity ^0.8.0;

interface ISoloMargin {
    enum ActionType {
        Deposit,
        Withdraw,
        Transfer,
        Buy,
        Sell,
        Trade,
        Liquidate,
        Vaporize,
        Call
    }

    enum AssetDenomination {Wei}

    enum AssetReference {Delta}

    struct AssetAmount {
        bool sign;
        AssetDenomination denomination;
        AssetReference ref;
        uint256 value;
    }

    struct ActionArgs {
        ActionType actionType;
        uint256 accountId;
        AssetAmount amount;
        uint256 primaryMarketId;
        uint256 secondaryMarketId;
        address otherAddress;
        uint256 otherAccountId;
        bytes data;
    }

    struct AccountInfo {
        address owner;
        uint256 number;
    }

    struct Wei {
        bool sign;
        uint256 value;
    }

    function operate(AccountInfo[] memory, ActionArgs[] memory) external;
}
