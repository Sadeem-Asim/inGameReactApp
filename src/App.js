/* eslint-disable react-hooks/exhaustive-deps */
// import logo from './logo.svg';
import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

import {
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBCheckbox,
  MDBContainer,
  MDBRow,
  MDBCol,
} from 'mdb-react-ui-kit';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
// import {sign, getTypeData} from './scripts/eip712_blueprint';
const DOMAIN_TYPE = [
  {
    type: 'string',
    name: 'name',
  },
  {
    type: 'string',
    name: 'version',
  },
  {
    type: 'uint256',
    name: 'chainId',
  },
  {
    type: 'address',
    name: 'verifyingContract',
  },
];
const TypeName = 'InGameReward';
const TypeVersion = '1.0.0';
const Types = {
  [TypeName]: [
    { name: '_sender', type: 'address' },
    { name: '_claimId', type: 'uint256' },
    { name: '_reward', type: 'uint256' },
    { name: '_cost', type: 'uint256' },
    { name: '_sigTime', type: 'uint256' },
  ],
};
// change this url
const BASE_URL = 'https://players-dragon.herokuapp.com/api/v1/claimReward/'

function App() {
  // const chainId = 80001;

  const _verifyingContract = '0xb12F56320009EE202a50A49abE4B2f2C26058356';
  const [whitelistData, setWhitelistData] = useState([]);
  const [update, setUpdate] = useState();

  const [checked, setChecked] = useState(false);
  const handleClick = () => setChecked(!checked);
  // const _amount = 2
  // const _sigTime = 4555

  useEffect(() => {
    fetch();
  }, [checked,update]);
  const fetch = () => {
    //todo integrate with apis
    let url;
    if(checked){
      url = BASE_URL + 'getWithoutSig';
    }else{
      url = BASE_URL + 'get';
    }

    axios.get(url
).then((response, ) => {
  console.log(response);
      setWhitelistData(response.data.claimIds)
    })
  };
  const click = (_claimId,_sender, _reward, _cost, _sigTime) => {
    window.ethereum.request({ method: 'eth_requestAccounts' }).then((res) => {
      // Return the address of the wallet
      const createTypeData = function (domainData, primaryType, message, types) {
        return {
          types: Object.assign(
            {
              EIP712Domain: DOMAIN_TYPE,
            },
            types
            ),
            domain: domainData,
            primaryType: primaryType,
            message: message,
          };
        };

      const chainId  = window.ethereum.networkVersion;
      console.log('chain id:', chainId);
      console.log(chainId, _sender, _reward, _cost, _sigTime);
      const data = createTypeData(
        { name: TypeName, version: TypeVersion, chainId: chainId, verifyingContract: _verifyingContract },
        TypeName,
        { _sender, _claimId, _reward, _cost, _sigTime },
        Types
      );
console.log("Hi");
      window.ethereum
        .request({
          jsonrpc: '2.0',
          method: 'eth_signTypedData_v4',
          params: [res[0], JSON.stringify(data)],
          id: new Date().getTime(),
        })
        .then((sig) => {
          console.log('signature', sig);
          console.log('_amount', _reward);
          const params = {user:_sender, reward:_reward, cost:_cost, sigTime:_sigTime,sig: sig}
          console.log(params);
          const updateUrl = BASE_URL + 'updateSig/' + _claimId;
          console.log(updateUrl)
          const signature = params.sig;
          const options = {
            url: updateUrl,
            method: 'PUT',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json;charset=UTF-8'
            },
            data: {
              signature:signature
            }
          };
          axios(options
          ).then(response => {
            setUpdate(n => n+1);
            console.log(response)
          }).catch((err) => {
            console.log(err)
          })
        }).catch(err =>console.log);
    });
  };

  return (
    <div className="App">
      <br />
      <MDBContainer>
        <MDBRow>
          <MDBCol size="md">Game Whitelist Signature Utility</MDBCol>
          <MDBCol size="md">
            <MDBCheckbox
              onChange={handleClick}
              checked={checked}
              name="flexCheck"
              value=""
              id="flexCheckDefault"
              label="Show only sign in"
            />
          </MDBCol>
          <MDBCol size="md"></MDBCol>
          <MDBCol size="md"></MDBCol>
        </MDBRow>
        <MDBRow>
          <MDBCol size="md">
            <MDBTable striped>
              <MDBTableHead>
                <tr>
                  <th scope="col">Claim Id</th>
                  <th scope="col">Address</th>
                  <th scope="col">Reward</th>
                  <th scope="col">Cost</th>
                  <th scope="col">Sig Time</th>
                  <th scope="col">Signature</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {whitelistData.map((item , i) => (
                  <tr
                    key={i}
                  >
                    <td>{item.claimId}</td>
                    <td>{item.address}</td>
                    <td>{item.reward}</td>
                    <td>{item.cost}</td>
                    <td>{item.sigTime}</td>
                    {item.signature === '' || item.signature === undefined ? (
                      <td>
                        <MDBBtn onClick={() => click(item.claimId, item.address, item.reward,  item.cost, item.sigTime)}>Sign in</MDBBtn>
                      </td>
                    ) : (
                      <td>Already generated</td>
                    )}
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>
          </MDBCol>
        </MDBRow>
      </MDBContainer>

      <br />
    </div>
  );
}

export default App;
