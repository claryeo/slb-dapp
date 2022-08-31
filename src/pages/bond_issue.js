import React from "react";
import { useLocation } from "react-router-dom";
import {useState} from 'react';
import Web3 from 'web3';

import Button from 'react-bootstrap/Button';
// import Toast from 'react-bootstrap/Toast';
// import ToastContainer from 'react-bootstrap/ToastContainer';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';

import NavBarHome from '../components/NavBarHome';
import {IssuerButton} from '../components/BackButton';
import { Formik } from 'formik';
import * as yup from 'yup';

const BondIssue = (props) => {

  const location = useLocation();

  const [isConnected, setConnected] = useState(false);
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  // const [showAlert, setShowAlert] = useState(false);
  // const toggleShowAlert = () => setShowAlert(!showAlert);

  // const [notif, setNotif] = useState(" "); 

  // const [message, setMessage] = useState(" "); //default message

  const web3 = new Web3(new Web3.providers.HttpProvider("https://babel-api.testnet.iotex.io"));

  const contractABI = location.state.selectedBondABI; 

  const contractAddress = location.state.selectedBondAddress;
  
  const bondContract = new web3.eth.Contract(
    contractABI,
    contractAddress 
  );

  const schema = yup.object().shape({
    description: yup.string().required(),
    KPI1: yup.string().required(), //update with oneOf options
    KPI2: yup.string(),
    KPI3: yup.string(),
    bondPrice: yup.number().required().positive().integer(),
    numberOfPeriods: yup.number().required().positive().integer(),
    numberOfBonds: yup.number().required().positive().integer(),
    couponRate: yup.number().required().positive(),
    interestPenalty: yup.number().required().positive(),
    activeDate: yup.date().required().min(new Date(), 'Date and time must be later than current.'), 
    maturityDate: yup.date().required().when(
      'activeDate',
      (activeDate, schema) => (activeDate && schema.min(activeDate, 'Maturity date must be greater than active date')),
    ), 
    redemptionDate: yup.date().required().when(
      'maturityDate',
      (maturityDate, schema) => (maturityDate && schema.min(maturityDate, 'Redemption date must be greater than maturity date')),
    ), 
    terms: yup.bool().required().oneOf([true], 'Please check'),
  });

  const issueBond= (async (values) => {
    const iotexChainID = await web3.eth.net.getId();

    const transactionParameters = {
      to: contractAddress,
      from: walletAddress, 
      data: bondContract.methods.setBond(values.description, 
            [convertToKPI(values.KPI1), convertToKPI(values.KPI2), convertToKPI(values.KPI3)],
            web3.utils.toWei(values.bondPrice), values.numberOfPeriods, 
            web3.utils.toWei(values.couponRate), 
            web3.utils.toWei(values.interestPenalty), 
            values.numberOfBonds,
            Math.floor(new Date(values.activeDate).getTime() / 1000), 
            Math.floor(new Date(values.maturityDate).getTime() / 1000), 
            Math.floor(new Date(values.redemptionDate).getTime() / 1000)).encodeABI(),
      // gasPrice: "1000000000000",
      // gas: "85000",
      chainId: iotexChainID
    };

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

  })

  // const issueBond = (values) =>{
  //   alert(values.KPI1);
  // }

  const convertToKPI = (value) =>{
    if(value === "None"){
      return 0;
    }
    else if(value === "Greenhouse gas emissions (CO2)"){
      return 1;
    }
    else if(value === "Volume of recycled materials"){
      return 2;
    }
    else if(value === "Diversity ratio"){
      return 3;
    }
    else{
      return 0;
    }
  }

  return (
    <>
    
      <NavBarHome
          isConnected={isConnected}                        // props
          setConnected = {setConnected}                  // props
          walletAddress = {walletAddress}
          setWallet = {setWallet}
          status = {status}
          setStatus = {setStatus}
        />
    
    {/* <br></br> */}

    {/* <Row>
        <Col md={5} className="mb-6">
        <ToastContainer className="p-3" position= 'top-start'>
        <Toast show={showAlert} onClose={toggleShowAlert}>
            <Toast.Header>
            <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body>{notif}</Toast.Body>
        </Toast>
        </ToastContainer>
        </Col>
    </Row>
       */}

      <Container>
      <Row>
        <Col xs={6} className = "text-start"> 
          <IssuerButton/>
        </Col>
      </Row>
      </Container>

      <div className="content-container-sub">

        <h1 className="fw-bold">Bond issuance</h1>

      
      <br></br>

      <Formik
      validationSchema={schema}
      onSubmit={(values) => {
        issueBond(values);
      }} //update this
      initialValues={{
        description: '',
        KPI1: 'None',
        KPI2: 'None',
        KPI3: 'None',
        bondPrice: 0,
        numberOfPeriods: 0,
        numberOfBonds: 0,
        couponRate: 0,
        interestPenalty: 0,
        activeDate: '',
        maturityDate: '',
        redemptionDate: '',
        terms: false,
      }}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        touched,
        isValid,
        errors,
      }) => (
     <Form noValidate onSubmit = {handleSubmit}>

     <Form.Group className="mb-3" controlId="formGridDescription">
        <Form.Label>Description</Form.Label>
        <Form.Control 
          as = "textarea" 
          placeholder="Purpose of bond, KPIs, Targets" 
          rows={2}
          name = "description"
          value = {values.description}
          onChange = {handleChange}
          isInvalid={touched.description && errors.description}/>
        
        <Form.Control.Feedback type="invalid">
          {errors.description}
        </Form.Control.Feedback>
      </Form.Group>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridKPI1">
          <Form.Label>KPI 1</Form.Label>
          <Form.Select 
            // defaultValue="None"
            name = "KPI1"
            value = {values.KPI1}
            onChange = {handleChange}
            isValid = {touched.KPI1 && !errors.KPI1}
            isInvalid = {touched.KPI1 && errors.KPI1}>

            <option>None</option>
            <option>Greenhouse gas emissions (CO2)</option>
            <option>Volume of recycled materials</option>
            <option>Diversity ratio</option>

          </Form.Select>

          <Form.Control.Feedback type="invalid">
            {errors.KPI1}
          </Form.Control.Feedback>

        </Form.Group>

        <Form.Group as={Col} controlId="formGridKPI2">
          <Form.Label>KPI 2</Form.Label>
          <Form.Select defaultValue="None">
            <option>None</option>
            <option>Greenhouse gas emissions (CO2)</option>
            <option>Volume of recycled materials</option>
            <option>Diversity ratio</option>
          </Form.Select>
        </Form.Group>

        <Form.Group as={Col} controlId="formGridKPI3">
          <Form.Label>KPI 3</Form.Label>
          <Form.Select defaultValue="None">
            <option>None</option>
            <option>Greenhouse gas emissions (CO2)</option>
            <option>Volume of recycled materials</option>
            <option>Diversity ratio</option>
          </Form.Select>
        </Form.Group>
      </Row>

      <Row className="mb-3">

        <Form.Group as={Col} controlId="formGridBondPrice">
          <Form.Label>Bond price per unit (IOTX)</Form.Label>
          <Form.Control 
            placeholder="Enter amount" 
            name = "bondPrice"
            value = {values.bondPrice}
            onChange = {handleChange}
            isInvalid={touched.bondPrice && errors.bondPrice}/>
        
            <Form.Control.Feedback type="invalid">
              {errors.bondPrice}
            </Form.Control.Feedback>
 
        </Form.Group>

        <Form.Group as={Col} controlId="formGridPeriods">
          <Form.Label>Number of periods</Form.Label>
          <Form.Control 
            placeholder="Enter number"             
            name = "numberOfPeriods"
            value = {values.numberOfPeriods}
            onChange = {handleChange}
            isInvalid={touched.numberOfPeriods && errors.numberOfPeriods}/>
        
            <Form.Control.Feedback type="invalid">
              {errors.numberOfPeriods}
            </Form.Control.Feedback>
        </Form.Group>

        <Form.Group as={Col} controlId="formGridPeriods">
          <Form.Label>Number of bond units</Form.Label>
          <Form.Control 
            placeholder="Enter number"             
            name = "numberOfBonds"
            value = {values.numberOfBonds}
            onChange = {handleChange}
            isInvalid={touched.numberOfBonds && errors.numberOfBonds}/>
        
            <Form.Control.Feedback type="invalid">
              {errors.numberOfBonds}
            </Form.Control.Feedback>
        </Form.Group>

      </Row>

      <Row className="mb-3">

        <Form.Group as={Col} controlId="formGridCoupon">
          <Form.Label>Base coupon amount (IOTX)</Form.Label>
          <Form.Control 
            placeholder="Enter amount"           
            name = "couponRate"
            value = {values.couponRate}
            onChange = {handleChange}
            isInvalid={touched.couponRate && errors.couponRate}/>

          <Form.Control.Feedback type="invalid">
              {errors.couponRate}
          </Form.Control.Feedback>

        </Form.Group>

        <Form.Group as={Col} controlId="formGridPenalty">
          <Form.Label>Interest penalty (IOTX)</Form.Label>
          <Form.Control placeholder="Enter amount"             
            name = "interestPenalty"
            value = {values.interestPenalty}
            onChange = {handleChange}
            isInvalid={touched.interestPenalty && errors.interestPenalty}/>

          <Form.Control.Feedback type="invalid">
              {errors.interestPenalty}
          </Form.Control.Feedback>

        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formGridActiveDate">
          <Form.Label>Active date</Form.Label>
          <Form.Control type = "datetime-local"             
            name = "activeDate"
            value = {values.activeDate}
            onChange = {handleChange}
            isInvalid={touched.activeDate && errors.activeDate}/>

          <Form.Control.Feedback type="invalid">
              {errors.activeDate}
          </Form.Control.Feedback>
          
        </Form.Group>

        <Form.Group as={Col} controlId="formGridMaturityDate">
          <Form.Label>Maturity date</Form.Label>
          <Form.Control type = "datetime-local"             
            name = "maturityDate"
            value = {values.maturityDate}
            onChange = {handleChange}
            isInvalid={touched.maturityDate && errors.maturityDate}/>

          <Form.Control.Feedback type="invalid">
              {errors.maturityDate}
          </Form.Control.Feedback>

        </Form.Group>

        <Form.Group as={Col} controlId="formGridRedemptionDate">
          <Form.Label>Redemption date</Form.Label>
          <Form.Control type = "datetime-local"            
            name = "redemptionDate"
            value = {values.redemptionDate}
            onChange = {handleChange}
            isInvalid={touched.redemptionDate && errors.redemptionDate}/>

          <Form.Control.Feedback type="invalid">
              {errors.redemptionDate}
          </Form.Control.Feedback>

        </Form.Group>
      </Row>

      <Form.Group className="mb-3" id="formGridCheckbox">
        <Form.Check
          required 
          type="checkbox" 
          label="I confirm that the details above are accurate"  
          name="terms"
          onChange={handleChange}
          isInvalid={touched.terms && errors.terms}
          feedback={errors.terms}
          feedbackType="invalid"/>
      </Form.Group>

      <Button className="cta-button search-button" variant="success" type="submit">
        Submit
      </Button>
    </Form>

    )}

    </Formik>

    <br></br>
    <br></br>
      
    </div>
      
    </>
  );
};
  

export default BondIssue;

  
  


