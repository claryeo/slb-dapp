import React from "react";

import { FaTimesCircle, FaCheckCircle } from "react-icons/fa";

export const KPIButtonGood = () => {
return(
     <FaCheckCircle fontSize="2.0em" style={{ fill: 'green' }}/>
);
};

export const KPIButtonBad = () => {
    return(
        <FaTimesCircle fontSize="2.0em" style={{ fill: 'red' }}/>
    );
};
