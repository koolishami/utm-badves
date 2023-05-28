import React from 'react';
import { Button } from "react-bootstrap";

interface Props {
  name: string,
  coverImg: string,
  backgroundImage: string,
  login: Function,
}

const Cover: React.FC<Props> = ({ name, coverImg, backgroundImage, login }) => {
  if (name) {
    return (
      <div
        className="d-flex justify-content-center flex-column text-center "
        style={{ backgroundImage: `url(${backgroundImage})`, 
                minHeight: "100vh",
                backgroundSize: "cover" }}
      >
        <div className="mt-auto text-light mb-5">
          <h1>{name}</h1>
          <Button
            onClick={() => login().catch((e: Error) => console.log(e))}
            variant="outline-light"
            className="rounded-pill px-3 mt-3"
          >
            Connect Wallet
          </Button>
        </div>

        <p className="mt-auto text-secondary">Powered by Algorand</p>
      </div>
    );
  }

  return null;
};

export default Cover;
