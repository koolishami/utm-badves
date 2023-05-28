import React from "react";
import { Dropdown, Stack, Spinner } from "react-bootstrap";
import { microAlgosToString, truncateAddress } from '../utils/conversions';

interface Props {
  address: string,
  name: string,
  amount: number,
  symbol: string,
  disconnect: Function,
}

const Wallet: React.FC<Props> = ({ address, name, amount, symbol, disconnect }) => {
  if (!address) {
    return null;
  }
  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="light" id="dropdown-basic"
          className="d-flex align-items-center border rounded-pill py-1">
          {amount ? (
            <>
              {microAlgosToString(amount)}
              <span className="ms-1"> {symbol}</span>
            </>
          ) : (
            <Spinner animation="border" size="sm" className="opacity-25" />
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu className="shadow-lg border-0">
          <Dropdown.Item href={`https://testnet.algoexplorer.io/address/${address}`}
            target="_blank">
            <Stack direction="horizontal" gap={2}>
              <i className="bi bi-person-circle fs-4" />
              <div className="d-flex flex-column">
                {name && (<span className="font-monospace">{name}</span>)}
                <span className="font-monospace">{truncateAddress(address)}</span>
              </div>
            </Stack>
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item as="button" className="d-flex align-items-center" onClick={() => {
            disconnect();
          }}>
            <i className="bi bi-box-arrow-right me-2 fs-4" />
            Disconnect
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
};


export default Wallet;
