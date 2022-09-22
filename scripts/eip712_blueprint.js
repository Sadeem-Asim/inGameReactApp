import { createTypeData, signTypedData } from './eip712';
const TypeName = 'BlueprintPresale';
const TypeVersion = '1.0.0';
const Types = {
  [TypeName]: [
    { name: '_user', type: 'address' },
    { name: '_numberOfNft', type: 'uint256' },
    { name: '_timestamp', type: 'uint256' },
  ],
};

async function sign(_web3, _validator, _user, _numberOfNft, _timestamp, _verifyingContract) {
  const chainId = Number(await _web3.eth.getChainId());
  const data = createTypeData(
    { name: TypeName, version: TypeVersion, chainId: chainId, verifyingContract: _verifyingContract },
    TypeName,
    { _user, _numberOfNft, _timestamp },
    Types
  );
  return (await signTypedData(_web3, _validator, data)).sig;
}


function getTypeData(_chainId, _user, _numberOfNft, _timestamp, _verifyingContract) {
  // const chainId = Number(await _web3.eth.getChainId());
  // console.log('Chain id', chainId);
  const data = createTypeData(
    { name: TypeName, version: TypeVersion, chainId: _chainId, verifyingContract: _verifyingContract },
    TypeName,
    { _user, _numberOfNft, _timestamp },
    Types
  );

  return data
}
module.exports = { sign, getTypeData };
