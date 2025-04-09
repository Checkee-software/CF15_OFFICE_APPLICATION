import axios from 'axios';
//import SignalService from "./SignalService.jsx"

const backendURL = 'http://cf15officeservice.checkee.vn';

const signIn = async userAccount => {
    return await axios
        .post(`${backendURL}/login/sign-in`, userAccount)
        .then(function (response) {
            //SignalService.startSignalRConnection(response.data.tokenDTO.token)
            return response;
        })
        .catch(function (error) {
            return error.response;
        });

    // const response = await axios.post(`${backendURL}/login/sign-in`,
    //     userAccount,
    //   );
    //   return response;
};

export {signIn};
