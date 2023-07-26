pragma solidity ^0.8.0;

interface IEToken {
    function deposit(uint256 subAccountId, uint256 amount) external;
    function mint(uint256 subAccountId, uint256 amount) external;
    function donateToReserves(uint256 subAccountId, uint256 amount) external;
    function withdraw(uint256 subAccountId, uint256 amount) external;
    function balanceOf(address) external returns (uint256);
    function decimals() external returns (uint256);
}
