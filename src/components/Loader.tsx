import React from "react";
import { Spinner } from "react-bootstrap";

const Loader = () => (
    <div className="d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status" className="opacity-25 m-5">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>
);

export default Loader;
