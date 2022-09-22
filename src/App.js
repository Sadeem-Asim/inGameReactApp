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
    { name: '_amount', type: 'uint256' },
    { name: '_sigTime', type: 'uint256' },
  ],
};
// change this url
const BASE_URL = 'https://ingameapi77.herokuapp.com/'

function App() {
  // const chainId = 80001;
  const _verifyingContract = '0x82e95174F2Ac92A4969F8957C36992ec88007E16';
  const [whitelistData, setWhitelistData] = useState([]);
  const [checked, setChecked] = useState(false);
  const handleClick = () => setChecked(!checked);
  // const _amount = 2
  // const _sigTime = 4555

  useEffect(() => {
    fetch();
  }, [checked]);
  const fetch = () => {
    //todo integrate with apis
    axios.get(BASE_URL + 'records'
).then((response, ) => {
      setWhitelistData(response.data)
    })
  };
  const click = (_claimId,_sender, _amount, _sigTime) => {
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

      const chainId  = window.ethereum.networkVersion
      console.log('chain id:', chainId);
      // console.log(chainId, _sender, _amount, _sigTime);
      const data = createTypeData(
        { name: TypeName, version: TypeVersion, chainId: chainId, verifyingContract: _verifyingContract },
        TypeName,
        { _sender, _claimId, _amount, _sigTime },
        Types
      );

      window.ethereum
        .request({
          jsonrpc: '2.0',
          method: 'eth_signTypedData_v4',
          params: [res[0], JSON.stringify(data)],
          id: new Date().getTime(),
        })
        .then((sig) => {

          console.log('signature', sig);
          console.log('_amount', _amount);
          const params = {user:_sender,amount: _amount, sigTime:_sigTime,sig: sig}
          axios.put(BASE_URL + 'records/' + _claimId,  params
          ).then(response => {
            alert("Signature generated successfully")
            console.log(response)
          }).catch((err) => {
            console.log(err)
          })
          // console.log(res)
        });
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
                  <th scope="col">address</th>
                  <th scope="col">Amount</th>
                  <th scope="col">sigTime</th>
                  <th scope="col">signature</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {whitelistData.map((item) => (
                  <tr
                    key={item.id}
                    style={{ display: checked ? (item.sig === '' ? 'block' : 'none') : 'block' }}
                  >
                    <td>{item.user}</td>
                    <td>{item.amount}</td>
                    <td>{item.sigTime}</td>
                    {item.sig === '' || item.sig === undefined ? (
                      <td>
                        <MDBBtn onClick={() => click(item.id, item.user, item.amount, item.sigTime)}>Sign in</MDBBtn>
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
