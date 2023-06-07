- [string vs bytes](#string-vs-bytes)
  - [tuples](#tuples)
  - [Function modifiers](#function-modifiers)
    - [Implicit function return](#implicit-function-return)
    - [Return multiple vals](#return-multiple-vals)
  - [Function overloading](#function-overloading)
  - [Params modifiers](#params-modifiers)
  - [Async await, chained promises](#async-await-chained-promises)
  - [`this` Contract](#this-contract)
  - [Ways to revert a tx](#ways-to-revert-a-tx)
  - [Contract call Contract func w/Call](#contract-call-contract-func-wcall)
  - [Create calldata](#create-calldata)
    - [What if the callback data doesn't matcha func?](#what-if-the-callback-data-doesnt-matcha-func)

## Get Contract balance

address(this).balance

## Solidity types

- boolean: declared as bool
- string: declared as string
- integers: declared as either uint or int
- bytes: decalred as bytes
- enums
- arrays
- mappings
- tuples
- structs

## Global variables when calling a function

1. Message Context (msg)
   msg.sender - returns the current transaction sender address
   msg.value - returns the value property of the current transaction
2. Transaction Context (tx)
   tx.gasLimit - returns the gasLimit property of the current tx
3. Block Context (block)
   block.number - returns the current block number
   block.timestamp - returns the current block timestamp

# string vs bytes

For small strings use bytes:
the lenght would be something like this

```c#
bytes32 msg1 = "cccccccccccccccccccccccccccccccc";
bytes32 msg2 = "ćććććććććććććććć";
```

## tuples

```c#
function getValues() public pure returns (int, bool) {
    return (49, true);
}

// &
(bool x, bool y) = (true, false);
```

## Function modifiers

- public: everyone can use it
- external: only external contracts & EOAs(humans) can call it
- private: can only be used withing the contract itself, not called externally
- view: cannot change state, but can use it
- pure: cannot see nor change state

### Implicit function return

```c#
function add(uint x, uint y) external pure returns(uint z) {
    z = x + y;
}
```

### Return multiple vals

```c#
   function mathTime(uint sum, uint product) external pure returns(uint, uint) {
        uint sum = x + y;
        uint product = x * y;

        return (sum, product);
    }
```

## Function overloading

- Same as TS/JS

```c#
function add(uint x, uint y) external pure returns(uint) {
    return x + y;
}
function add(uint x, uint y, uint z) external pure returns(uint) {
    return x + y + z;
}
```

## Params modifiers

- memory: need it when working whit non-primitive datatypes (arrays & structs)
- calldata: same but cheaper

## Async await, chained promises

**JS**

```js
// createUsers.js
async function createUsers(
  contract: ethers.Contract,
  signers: ethers.types.Signer
) {
  for (let i = 0; i < signers.length; i++) {
    await contract.connect(signers[i]).createUser();
  }
}
```

**SOL**

```c#
contract Contract {
    address owner;
    string public message;

    constructor() {
        owner = msg.sender;
    }

    function modify(string calldata _message) external {
        require(msg.sender != owner, "Owner cannot modify the message!");
        message = _message;
    }
}
```

## `this` Contract

```c#
import "hardhat/console.sol";
contract Contract {
	constructor() {
		console.log( address(this) ); // 0x7c2c195cd6d34b8f845992d380aadb2730bb9c6f
		console.log( address(this).balance ); // 0
	}
}
```

## Ways to revert a tx

**The EVM gives us a few ways to stop a transaction and roll-back any state changes and emitted events**

- revert
- require
- assert

## Contract call Contract func w/Call

**Do it properly whit a variable of type contract B**[here](https://solidity-by-example.org/calling-contract/)
or [using an inteface](https://solidity-by-example.org/interface/)

```c#
contract A {
    function setValueOnB(address b) external {
        // same was done whit ethers/wagmi
        (bool s, ) = b.call(abi.encodeWithSignature("storeValue(uint256)", 22));
        require(s);
    }
}

contract B {
    uint x;

    function storeValue(uint256 _x) external {
        x = _x;
        console.log(x); // 22
    }
}
```

## Create calldata

- Hash the function data name(params types) EX: `approve(uint256)`
- Grab the 4 last digits of it `0xb759f954`
- Hex of the value we will pass as uint256, pad it to be equal to uin256 EX: `0xf` => `15` => `000000000000000000000000000000000000000000000000000000000000000f`
- Combine it whit the las 4 digits of the hash EX: `0xb759f954000000000000000000000000000000000000000000000000000000000000000f`

**Full example**

```c#
contract Hero {
    bool public alerted;

    function alert() external {
        alerted = true;
    }
}

contract Sidekick {
    function sendAlert(address hero) external {
        // bytes4 aint as expensive as bytes, thus doesn't need the memory keyword
        bytes4 signature = bytes4(keccak256("alert()"));
        // OR
        bytes memory signature = abi.encodeWithSignature("alert()");


        (bool success, ) = hero.call(abi.encodePacked(signature));

        require(success);
    }
}
```

### What if the callback data doesn't matcha func?

**This func will be triggeres**

```c#
contract Hero {
  fallback() external {
        lastContact = block.timestamp;
    }
}
```

```

```

```

```
