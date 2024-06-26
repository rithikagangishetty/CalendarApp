
import axios from 'axios';
import * as React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import styled from 'styled-components';
import { Logout } from './Modal';

/**
 * Styled container for the Home component.
 */
const StyledDiv = styled.div`
  text-align: center;
`;

/**
 * Container for buttons.
 */
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

/**
 * Container for the main content of the Home component.
 */
const ConnectionContainer = styled.div`
  padding-top: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  justify-content: flex-start;
`;

/**
 * Styled button component.
 */
const Button = styled.button`
  margin: 0px 10px;
    width : auto;
  padding: 10px 20px;
  background-color: floralwhite;
  color: black;
   @media (max-width: 768px) {
    
    width: auto; 
  }
`;



/**
 * Home component.
 */
function Home() {
    const params = useParams();
    const id = params.id;
    const navigate = useNavigate();
    const [EmailId, setEmailId] = React.useState<string>("");
    const baseUrl = process.env.REACT_APP_URL;

    /**
     * Go back to the previous page.
     */
    function goBack() {
        navigate(`/`);
    }

    /**
     * Navigate to the Connections Page.
     */
    function connect() {
        navigate(`/Home/Connections/${id}`);
    }

    /**
     * Navigate to the Calendar Page.
     */
    function calendar() {
        navigate(`/Home/Calendar/${id}`);
    }

    /**
     * Get the email ID of the user.
     */
    function GetEmail() {
        axios.get(`${baseUrl}/Connection/GetUser/`, { params: { id: id } }).then((response) => {
            setEmailId(response.data.emailId);
        }).catch((error) => { alert(error); });
    }

    React.useEffect(() => {
        GetEmail();
    }, []);

    return (
        <div>
            <Logout />
            <ConnectionContainer className="connections-container">
                <StyledDiv>
                    <h2>Welcome to the Home Page, {EmailId}!</h2>
                </StyledDiv>
                <br />
                <ButtonContainer>
                    <Button className="btn-primary mt-4" onClick={connect}>
                        Connections Page
                    </Button>
                    <Button className="btn-primary mt-4" onClick={calendar}>
                        Calendar Page
                    </Button>
                </ButtonContainer>
                <div>
                    <button className="back-button" onClick={goBack}>
                        Back
                    </button>

                </div>
            </ConnectionContainer>
        </div>
    );
}

export default Home;

