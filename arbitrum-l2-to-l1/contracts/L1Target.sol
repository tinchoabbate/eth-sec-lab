pragma solidity ^0.8.0;

contract L1Target {
    address private immutable root = msg.sender;
    uint256 private size;

    constructor(uint256 _size) {
        size = _size;
    }

    function setSize(uint256 _size) external {
        require(msg.sender == root);
        size = _size;
    }

    fallback() external {
        assembly { return(0, sload(size.slot)) }
    }
}
