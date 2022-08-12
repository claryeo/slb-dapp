import React from "react";
import { useNavigate} from "react-router-dom";
import Button from 'react-bootstrap/Button';

export const InvestorButton = () => {
    const navigate = useNavigate()
    return (
    <Button onClick={() => navigate("/investor")} className = "text-light" variant = "outline" >  
        ⬅ Investor dashboard 
    </Button> 
    )
}

export const IssuerButton = () => {
    const navigate = useNavigate()
    return (
    <Button onClick={() => navigate("/issuer")} className = "text-light" variant = "outline" >  
        ⬅ Issuer dashboard 
    </Button> 
    )
}

export const VerifierButton = () => {
    const navigate = useNavigate()
    return (
    <Button onClick={() => navigate("/verifier")} className = "text-light" variant = "outline" >  
        ⬅ Verifier dashboard 
    </Button> 
    )
}

export const RegulatorButton = () => {
        const navigate = useNavigate()
    return (
    <Button onClick={() => navigate("/regulator")} className = "text-light" variant = "outline" >  
        ⬅ Regulator dashboard 
    </Button> 
    )
}

