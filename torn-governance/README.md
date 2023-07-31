# TORN Governance

This is an educational proof-of-concept sandbox to learn about an attack in [TORN Governance](https://rekt.news/tornado-gov-rekt/).

The code does not attempt to reproduce the real exploiting transactions. Instead, it showcases a much simpler case to learn about the CREATE & CREATE2 patterns used to trick the system.

## Requirements

- [Foundry](https://book.getfoundry.sh)

## Run

`forge test -vvv`

## Resources

- [Rekt.news article](https://rekt.news/tornado-gov-rekt/)
- [First deployment transaction](https://openchain.xyz/trace/ethereum/0x3e93ee75ffeb019f1d841b84695538571946fd9477dcd3ecf0790851f48fbd1a)
- [Selfdestruction transaction](https://openchain.xyz/trace/ethereum/0xd3a570af795405e141988c48527a595434665089117473bc0389e83091391adb)
- [Redeployment transaction](https://openchain.xyz/trace/ethereum/0xa7d20ccdbc2365578a106093e82cc9f6ec5d03043bb6a00114c0ad5d03620122)
